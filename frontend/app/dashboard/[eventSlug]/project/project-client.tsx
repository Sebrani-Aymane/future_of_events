'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FolderOpen,
  ArrowLeft,
  Save,
  Send,
  Github,
  Globe,
  Youtube,
  FileText,
  Image,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Rocket,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Progress,
} from '@/components/ui';
import { DashboardLayout, Container } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Event, Team, Project } from '@/types';
import type { Database } from '@/types/database';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
import { format, isPast } from 'date-fns';

interface ProjectClientProps {
  eventSlug: string;
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'participant' | 'admin' | 'judge';
  };
  team: Team | null;
  project: Project | null;
  isTeamLeader: boolean;
}

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  tagline: z.string().max(200).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  problem_statement: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  github_url: z.string().url('Please enter a valid GitHub URL').regex(/github\.com/, 'Must be a GitHub URL'),
  demo_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  video_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  presentation_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tech_stack: z.array(z.string()).min(1, 'Select at least one technology'),
  challenges: z.string().max(2000).optional(),
  accomplishments: z.string().max(2000).optional(),
  learnings: z.string().max(2000).optional(),
  whats_next: z.string().max(2000).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const TECH_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'Node.js', 'Express', 'Django', 'FastAPI', 'Flask',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase', 'Supabase',
  'AWS', 'GCP', 'Azure', 'Vercel', 'Docker', 'Kubernetes',
  'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'GraphQL', 'REST API', 'WebSocket', 'gRPC',
  'Tailwind CSS', 'Sass', 'Figma', 'Three.js',
];

export default function ProjectClient({
  eventSlug,
  event,
  user,
  team,
  project,
  isTeamLeader,
}: ProjectClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>(project?.tech_stack || []);
  const [techSearch, setTechSearch] = useState('');

  const submissionDeadline = new Date(event.submission_deadline);
  const canSubmit = !isPast(submissionDeadline) && event.is_submission_open;
  const isSubmitted = project?.status === 'submitted';

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      tagline: project?.tagline || '',
      description: project?.description || '',
      problem_statement: project?.problem_statement || '',
      solution: project?.solution || '',
      github_url: project?.github_url || '',
      demo_url: project?.demo_url || '',
      video_url: project?.video_url || '',
      presentation_url: project?.presentation_url || '',
      tech_stack: project?.tech_stack || [],
      challenges: project?.challenges || '',
      accomplishments: project?.accomplishments || '',
      learnings: project?.learnings || '',
      whats_next: project?.whats_next || '',
    },
  });

  // Update tech_stack when selectedTech changes
  useEffect(() => {
    setValue('tech_stack', selectedTech);
  }, [selectedTech, setValue]);

  const filteredTech = TECH_OPTIONS.filter(tech => 
    tech.toLowerCase().includes(techSearch.toLowerCase()) &&
    !selectedTech.includes(tech)
  );

  const addTech = (tech: string) => {
    if (!selectedTech.includes(tech)) {
      setSelectedTech([...selectedTech, tech]);
    }
    setTechSearch('');
  };

  const removeTech = (tech: string) => {
    setSelectedTech(selectedTech.filter(t => t !== tech));
  };

  const saveProject = async (data: ProjectFormData, submit: boolean = false) => {
    if (!team) {
      toast.error('You need to be in a team to create a project');
      return;
    }

    const saving = submit ? setIsSubmitting : setIsSaving;
    saving(true);

    try {
      const projectData: ProjectInsert = {
        event_id: event.id,
        team_id: team.id,
        title: data.title,
        tagline: data.tagline || null,
        description: data.description,
        problem_statement: data.problem_statement || null,
        solution: data.solution || null,
        github_url: data.github_url,
        demo_url: data.demo_url || null,
        video_url: data.video_url || null,
        presentation_url: data.presentation_url || null,
        tech_stack: data.tech_stack,
        challenges: data.challenges || null,
        accomplishments: data.accomplishments || null,
        learnings: data.learnings || null,
        whats_next: data.whats_next || null,
        status: submit ? 'submitted' : 'draft',
        submitted_at: submit ? new Date().toISOString() : null,
      };

      if (project) {
        // Update existing project
        const projectUpdate: ProjectUpdate = {
          title: projectData.title,
          tagline: projectData.tagline,
          description: projectData.description,
          problem_statement: projectData.problem_statement,
          solution: projectData.solution,
          github_url: projectData.github_url,
          demo_url: projectData.demo_url,
          video_url: projectData.video_url,
          presentation_url: projectData.presentation_url,
          tech_stack: projectData.tech_stack,
          challenges: projectData.challenges,
          accomplishments: projectData.accomplishments,
          learnings: projectData.learnings,
          whats_next: projectData.whats_next,
          status: projectData.status,
          submitted_at: projectData.submitted_at,
        };

        const { error } = await supabase
          .from('projects')
          .update(projectUpdate)
          .eq('id', project.id);

        if (error) throw error;
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert(projectData);

        if (error) throw error;
      }

      if (submit) {
        toast.success('Project submitted successfully! 🎉');
      } else {
        toast.success('Project saved as draft');
      }
      
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save project';
      console.error('Save project error:', error);
      toast.error(message);
    } finally {
      saving(false);
    }
  };

  const onSave = handleSubmit((data) => saveProject(data, false));
  const onSubmit = handleSubmit((data) => saveProject(data, true));

  // Calculate completion percentage
  const watchedValues = watch();
  const completionItems = [
    !!watchedValues.title,
    !!watchedValues.description && watchedValues.description.length >= 50,
    !!watchedValues.github_url,
    selectedTech.length > 0,
    !!watchedValues.demo_url || !!watchedValues.video_url,
  ];
  const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  if (!team) {
    return (
      <DashboardLayout
        eventSlug={eventSlug}
        eventName={event.name}
        user={{
          name: user.name,
          email: user.email,
          avatar: user.avatar || undefined,
          role: user.role,
        }}
        notifications={0}
      >
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join a Team First</h2>
            <p className="text-muted-foreground mb-6">
              You need to be part of a team to create and submit a project.
            </p>
            <Button variant="gradient" asChild>
              <Link href={`/dashboard/${eventSlug}/team` as any}>
                Find a Team
              </Link>
            </Button>
          </motion.div>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      eventSlug={eventSlug}
      eventName={event.name}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        teamName: team?.name,
      }}
      notifications={0}
    >
      <Container size="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/dashboard/${eventSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                {project ? 'Edit Project' : 'Create Project'}
              </h1>
              <p className="text-muted-foreground">
                {isSubmitted 
                  ? 'Your project has been submitted. You can still make edits before the deadline.'
                  : 'Fill in the details about your project and submit before the deadline.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <Badge variant="success" className="text-sm py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submitted
                </Badge>
              ) : (
                <Badge variant="warning" className="text-sm py-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Draft
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Basic Information</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Title *</label>
                    <Input
                      placeholder="Give your project a catchy name"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tagline</label>
                    <Input
                      placeholder="A short description (max 200 chars)"
                      {...register('tagline')}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      placeholder="Describe what your project does, who it's for, and why it matters..."
                      rows={6}
                      {...register('description')}
                      error={errors.description?.message}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 50 characters
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Problem & Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Problem & Solution</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Problem Statement</label>
                    <Textarea
                      placeholder="What problem are you solving?"
                      rows={4}
                      {...register('problem_statement')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Solution</label>
                    <Textarea
                      placeholder="How does your project solve this problem?"
                      rows={4}
                      {...register('solution')}
                    />
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Links</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      <Github className="inline h-4 w-4 mr-2" />
                      GitHub Repository *
                    </label>
                    <Input
                      placeholder="https://github.com/username/repo"
                      {...register('github_url')}
                      error={errors.github_url?.message}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      <Globe className="inline h-4 w-4 mr-2" />
                      Live Demo URL
                    </label>
                    <Input
                      placeholder="https://your-demo.com"
                      {...register('demo_url')}
                      error={errors.demo_url?.message}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      <Youtube className="inline h-4 w-4 mr-2" />
                      Video URL
                    </label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      {...register('video_url')}
                      error={errors.video_url?.message}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      <FileText className="inline h-4 w-4 mr-2" />
                      Presentation/Slides URL
                    </label>
                    <Input
                      placeholder="https://docs.google.com/presentation/..."
                      {...register('presentation_url')}
                    />
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Tech Stack *</Card.Title>
                  <Card.Description>
                    Select the technologies used in your project
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  {/* Selected Technologies */}
                  {selectedTech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTech.map((tech) => (
                        <Badge key={tech} variant="primary" className="pr-1">
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTech(tech)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Input
                      placeholder="Search technologies..."
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                    />
                    {techSearch && filteredTech.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-charcoal border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredTech.slice(0, 10).map((tech) => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => addTech(tech)}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors"
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Add */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {TECH_OPTIONS.slice(0, 12)
                      .filter(t => !selectedTech.includes(t))
                      .map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => addTech(tech)}
                          className="px-3 py-1 text-sm rounded-full border border-white/10 hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          + {tech}
                        </button>
                      ))}
                  </div>

                  {errors.tech_stack && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.tech_stack.message}
                    </p>
                  )}
                </Card.Content>
              </Card>
            </motion.div>

            {/* Reflection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Reflection</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Challenges Faced</label>
                    <Textarea
                      placeholder="What obstacles did you encounter?"
                      rows={3}
                      {...register('challenges')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Accomplishments</label>
                    <Textarea
                      placeholder="What are you most proud of?"
                      rows={3}
                      {...register('accomplishments')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">What We Learned</label>
                    <Textarea
                      placeholder="What did you learn during this hackathon?"
                      rows={3}
                      {...register('learnings')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">What's Next</label>
                    <Textarea
                      placeholder="What are your plans for this project after the hackathon?"
                      rows={3}
                      {...register('whats_next')}
                    />
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass">
                <Card.Header>
                  <Card.Title>Completion</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} />
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Project title', done: !!watchedValues.title },
                      { label: 'Description (50+ chars)', done: watchedValues.description?.length >= 50 },
                      { label: 'GitHub repository', done: !!watchedValues.github_url },
                      { label: 'Tech stack', done: selectedTech.length > 0 },
                      { label: 'Demo or video', done: !!watchedValues.demo_url || !!watchedValues.video_url },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        {item.done ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-white/20" />
                        )}
                        <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Deadline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>
                    <Clock className="inline h-4 w-4 mr-2" />
                    Deadline
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className={`text-lg font-medium ${isPast(submissionDeadline) ? 'text-destructive' : ''}`}>
                    {format(submissionDeadline, 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(submissionDeadline, 'h:mm a')}
                  </p>
                  {isPast(submissionDeadline) && (
                    <Badge variant="destructive" className="mt-2">
                      Deadline Passed
                    </Badge>
                  )}
                </Card.Content>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={onSave}
                loading={isSaving}
                disabled={!isDirty && !!project}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              {canSubmit && (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={onSubmit}
                  loading={isSubmitting}
                  disabled={completionPercentage < 80}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {isSubmitted ? 'Update Submission' : 'Submit Project'}
                </Button>
              )}

              {!canSubmit && !isSubmitted && (
                <p className="text-sm text-muted-foreground text-center">
                  Submissions are currently closed
                </p>
              )}

              {project?.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="ghost" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </Container>
    </DashboardLayout>
  );
}
