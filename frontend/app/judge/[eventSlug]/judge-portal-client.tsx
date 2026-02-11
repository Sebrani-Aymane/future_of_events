'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  Play,
  Star,
  Users,
  Calendar,
  FileText,
  Send,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  UserAvatar,
  Progress,
  Textarea,
  Slider,
} from '@/components/ui';
import { JudgeLayout, Container } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Event } from '@/types';
import type { Database } from '@/types/database';
import { format } from 'date-fns';

interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  max_score: number;
  order: number;
}

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface Project {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  problem_statement: string | null;
  solution: string | null;
  github_url: string;
  demo_url: string | null;
  video_url: string | null;
  presentation_url: string | null;
  tech_stack: string[];
  challenges: string | null;
  accomplishments: string | null;
  submitted_at: string;
  team: {
    id: string;
    name: string;
    avatar_url: string | null;
    members: TeamMember[];
  } | null;
}

interface ExistingScore {
  id: string;
  project_id: string;
  total_score: number;
  comments: string | null;
  criteria_scores: {
    criteria_id: string;
    score: number;
  }[];
}

type ScoreInsert = Database['public']['Tables']['scores']['Insert'];
type ScoreUpdate = Database['public']['Tables']['scores']['Update'];
type ScoreDetailInsert = Database['public']['Tables']['score_details']['Insert'];

interface JudgePortalClientProps {
  eventSlug: string;
  event: Event;
  judge: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    specialty: string;
  };
  criteria: ScoringCriteria[];
  projects: Project[];
  existingScores: ExistingScore[];
  scoredProjectIds: string[];
}

export default function JudgePortalClient({
  eventSlug,
  event,
  judge,
  criteria,
  projects,
  existingScores,
  scoredProjectIds,
}: JudgePortalClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'scoring' | 'list'>('list');

  const currentProject = projects[currentIndex];
  const completedCount = scoredProjectIds.length;
  const totalCount = projects.length;

  // Initialize scores when project changes
  useEffect(() => {
    if (currentProject) {
      const existingScore = existingScores.find(s => s.project_id === currentProject.id);
      if (existingScore) {
        const criteriaScores: Record<string, number> = {};
        existingScore.criteria_scores?.forEach(cs => {
          criteriaScores[cs.criteria_id] = cs.score;
        });
        setScores(criteriaScores);
        setFeedback(existingScore.comments || '');
      } else {
        // Set default scores
        const defaultScores: Record<string, number> = {};
        criteria.forEach(c => {
          defaultScores[c.id] = Math.round(c.max_score / 2);
        });
        setScores(defaultScores);
        setFeedback('');
      }
    }
  }, [currentIndex, currentProject, existingScores, criteria]);

  const updateScore = (criteriaId: string, value: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: value }));
  };

  const calculateTotalScore = () => {
    if (criteria.length === 0) return 0;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    criteria.forEach(c => {
      const score = scores[c.id] || 0;
      const normalizedScore = (score / c.max_score) * 10; // Normalize to 0-10
      weightedSum += normalizedScore * c.weight;
      totalWeight += c.weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const handleSubmitScore = async () => {
    if (!currentProject) return;

    setIsSubmitting(true);

    try {
      const totalScore = calculateTotalScore();
      const existingScore = existingScores.find(s => s.project_id === currentProject.id);

      if (existingScore) {
        // Update existing score
        const scoreUpdate: ScoreUpdate = {
          total_score: totalScore,
          comments: feedback,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('scores')
          .update(scoreUpdate)
          .eq('id', existingScore.id);

        if (updateError) throw updateError;

        // Update criteria scores
        for (const c of criteria) {
          const detailUpsert: ScoreDetailInsert = {
            score_id: existingScore.id,
            criteria_id: c.id,
            score: scores[c.id] || 0,
          };

          await supabase
            .from('score_details')
            .upsert(detailUpsert, {
              onConflict: 'score_id,criteria_id',
            });
        }
      } else {
        // Create new score
        const scoreInsert: ScoreInsert = {
          project_id: currentProject.id,
          judge_id: judge.id,
          event_id: event.id,
          total_score: totalScore,
          comments: feedback,
        };

        const { data: newScoreData, error: insertError } = await supabase
          .from('scores')
          .insert(scoreInsert)
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert criteria scores
        const criteriaScores: ScoreDetailInsert[] = criteria.map(c => ({
          score_id: newScoreData.id,
          criteria_id: c.id,
          score: scores[c.id] || 0,
        }));

        const { error: detailsError } = await supabase
          .from('score_details')
          .insert(criteriaScores);

        if (detailsError) throw detailsError;
      }

      toast.success('Score submitted successfully!');
      
      // Move to next project if available
      if (currentIndex < projects.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success('You have scored all projects! 🎉');
        setViewMode('list');
      }
      
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit score';
      console.error('Submit score error:', error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < projects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const selectProject = (index: number) => {
    setCurrentIndex(index);
    setViewMode('scoring');
  };

  // Default criteria if none exist
  const displayCriteria = criteria.length > 0 ? criteria : [
    { id: 'innovation', name: 'Innovation', description: 'How novel and creative is the solution?', weight: 25, max_score: 10, order: 1 },
    { id: 'technical', name: 'Technical Complexity', description: 'How technically challenging?', weight: 25, max_score: 10, order: 2 },
    { id: 'design', name: 'Design & UX', description: 'How polished and user-friendly?', weight: 20, max_score: 10, order: 3 },
    { id: 'impact', name: 'Impact', description: 'How useful and impactful?', weight: 20, max_score: 10, order: 4 },
    { id: 'presentation', name: 'Presentation', description: 'How well presented?', weight: 10, max_score: 10, order: 5 },
  ];

  if (viewMode === 'list' || !currentProject) {
    return (
      <JudgeLayout
        eventSlug={eventSlug}
        eventName={event.name}
        judge={{
          name: judge.name,
          email: judge.email,
          avatar: judge.avatar || undefined,
          specialty: judge.specialty,
        }}
        progress={{ completed: completedCount, total: totalCount }}
      >
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold mb-2">Projects to Review</h1>
            <p className="text-muted-foreground">
              {completedCount} of {totalCount} projects reviewed
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="glass">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Your Progress</span>
                  <span className="font-medium">{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <Progress value={(completedCount / totalCount) * 100} />
              </Card.Content>
            </Card>
          </motion.div>

          {/* Project List */}
          <div className="grid gap-4">
            {projects.map((project, index) => {
              const isScored = scoredProjectIds.includes(project.id);
              const existingScore = existingScores.find(s => s.project_id === project.id);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <Card className={isScored ? 'border-success/30' : ''}>
                    <Card.Content className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={isScored ? 'success' : 'secondary'}>
                              {isScored ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Scored
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Project #{index + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {project.team?.name || 'Unknown Team'}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.tagline || project.description?.slice(0, 150)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {existingScore && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {existingScore.total_score.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">Your Score</div>
                            </div>
                          )}
                          <Button
                            variant={isScored ? 'outline' : 'gradient'}
                            onClick={() => selectProject(index)}
                          >
                            {isScored ? 'Edit Score' : 'Score Now'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              );
            })}

            {projects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal flex items-center justify-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground">
                  There are no submitted projects to review at this time.
                </p>
              </motion.div>
            )}
          </div>
        </Container>
      </JudgeLayout>
    );
  }

  return (
    <JudgeLayout
      eventSlug={eventSlug}
      eventName={event.name}
      judge={{
        name: judge.name,
        email: judge.email,
        avatar: judge.avatar || undefined,
        specialty: judge.specialty,
      }}
      progress={{ completed: completedCount, total: totalCount }}
      currentProject={{
        index: currentIndex + 1,
        total: totalCount,
        name: currentProject.title,
      }}
    >
      <Container size="full" padded={false}>
        {/* Back to List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project List
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass">
                <Card.Content className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <Badge variant="primary" className="mb-3">
                        Project #{currentIndex + 1} of {totalCount}
                      </Badge>
                      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                        {currentProject.title}
                      </h1>
                      <p className="text-muted-foreground">
                        by <span className="text-foreground">{currentProject.team?.name || 'Unknown Team'}</span>
                      </p>
                    </div>
                    <Badge variant="success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Submitted
                    </Badge>
                  </div>

                  {currentProject.tagline && (
                    <p className="text-lg text-muted-foreground italic mb-4">
                      "{currentProject.tagline}"
                    </p>
                  )}

                  <p className="text-muted-foreground mb-6">
                    {currentProject.description}
                  </p>

                  {/* Tech Stack */}
                  {currentProject.tech_stack?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-3">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.tech_stack.map((tech) => (
                          <Badge key={tech} variant="secondary" size="sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap gap-3">
                    {currentProject.demo_url && (
                      <Button variant="gradient" size="sm" asChild>
                        <a
                          href={currentProject.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {currentProject.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentProject.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="mr-2 h-4 w-4" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {currentProject.video_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentProject.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Demo Video
                        </a>
                      </Button>
                    )}
                    {currentProject.presentation_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentProject.presentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Presentation
                        </a>
                      </Button>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Problem & Solution */}
            {(currentProject.problem_statement || currentProject.solution) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <Card.Content className="p-6 space-y-4">
                    {currentProject.problem_statement && (
                      <div>
                        <h3 className="font-medium mb-2">Problem Statement</h3>
                        <p className="text-muted-foreground">{currentProject.problem_statement}</p>
                      </div>
                    )}
                    {currentProject.solution && (
                      <div>
                        <h3 className="font-medium mb-2">Solution</h3>
                        <p className="text-muted-foreground">{currentProject.solution}</p>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </motion.div>
            )}

            {/* Team */}
            {currentProject.team?.members && currentProject.team.members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <Card.Header>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent">
                        <Users className="h-5 w-5" />
                      </div>
                      <Card.Title>Team Members</Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid gap-3">
                      {currentProject.team.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <UserAvatar
                            src={member.user.avatar_url || undefined}
                            name={member.user.full_name || 'Member'}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{member.user.full_name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Scoring Panel - Right Column */}
          <div className="space-y-6">
            {/* Total Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="gradient">
                <Card.Content className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                  <div className="text-5xl font-bold mb-2">
                    {calculateTotalScore().toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">out of 10</p>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Scoring Criteria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Scoring Criteria</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-6">
                  {displayCriteria.map((criterion) => (
                    <div key={criterion.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {criterion.description}
                          </p>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {criterion.weight}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[scores[criterion.id] || 0]}
                          onValueChange={(value) => updateScore(criterion.id, value[0] ?? 0)}
                          max={criterion.max_score}
                          step={1}
                          className="flex-1"
                        />
                        <div className="w-12 text-center font-bold">
                          {scores[criterion.id] || 0}/{criterion.max_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Content>
              </Card>
            </motion.div>

            {/* Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Feedback (Optional)</Card.Title>
                </Card.Header>
                <Card.Content>
                  <Textarea
                    placeholder="Provide constructive feedback for the team..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </Card.Content>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleSubmitScore}
                loading={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {scoredProjectIds.includes(currentProject.id) ? 'Update Score' : 'Submit Score'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={goToNext}
                  disabled={currentIndex === projects.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </JudgeLayout>
  );
}
