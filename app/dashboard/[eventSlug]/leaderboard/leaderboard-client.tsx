'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Users,
  Clock,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  UserAvatar,
} from '@/components/ui';
import { DashboardLayout, Container } from '@/components/layouts';
import type { Event } from '@/types';
import { format } from 'date-fns';

interface ProjectWithScore {
  id: string;
  title: string;
  tagline: string | null;
  status: string;
  submitted_at: string | null;
  team: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  averageScore: number | null;
  judgeCount: number;
}

interface LeaderboardClientProps {
  eventSlug: string;
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'participant' | 'admin' | 'judge';
  };
  teamName?: string;
  userTeamId?: string;
  projects: ProjectWithScore[];
  isJudgingComplete: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-300" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return null;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
    default:
      return '';
  }
};

export default function LeaderboardClient({
  eventSlug,
  event,
  user,
  teamName,
  userTeamId,
  projects,
  isJudgingComplete,
}: LeaderboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScores, setShowScores] = useState(isJudgingComplete);

  // Filter projects by search
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.team?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find user's team project
  const userProject = projects.find(p => p.team?.id === userTeamId);
  const userRank = userProject 
    ? projects.findIndex(p => p.id === userProject.id) + 1 
    : null;

  return (
    <DashboardLayout
      eventSlug={eventSlug}
      eventName={event.name}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        teamName,
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
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground">
                {isJudgingComplete 
                  ? 'Final standings and scores'
                  : 'Project submissions ranked by judges'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isJudgingComplete && (
                <Badge variant="warning" className="text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Judging in Progress
                </Badge>
              )}
              {isJudgingComplete && (
                <Badge variant="success" className="text-sm">
                  <Trophy className="h-4 w-4 mr-1" />
                  Final Results
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* User's Position Card */}
        {userProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="gradient">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      #{userRank}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Team's Position</p>
                      <p className="font-semibold text-lg">{userProject.title}</p>
                    </div>
                  </div>
                  {showScores && userProject.averageScore !== null && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">
                        {userProject.averageScore.toFixed(1)}
                        <span className="text-sm text-muted-foreground">/10</span>
                      </p>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-96">
              <Input
                placeholder="Search projects or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}

              />
            </div>
            {isJudgingComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScores(!showScores)}
              >
                {showScores ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Scores
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Scores
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {filteredProjects.map((project, index) => {
            const rank = index + 1;
            const isUserTeam = project.team?.id === userTeamId;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
              >
                <Card 
                  className={`${getRankStyle(rank)} ${isUserTeam ? 'ring-2 ring-primary' : ''}`}
                >
                  <Card.Content className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(rank) || (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Team Avatar */}
                      <UserAvatar
                        src={project.team?.avatar_url || undefined}
                        name={project.team?.name || 'Team'}
                      />

                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {project.title}
                          </h3>
                          {isUserTeam && (
                            <Badge variant="success" size="sm">
                              Your Team
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {project.team?.name || 'Unknown Team'}
                          {project.tagline && (
                            <>
                              <span>•</span>
                              <span className="truncate">{project.tagline}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Score */}
                      {showScores && project.averageScore !== null ? (
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-xl font-bold">
                              {project.averageScore.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">/10</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {project.judgeCount} judge{project.judgeCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : showScores ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : null}

                      {/* Submission Time */}
                      {!showScores && project.submitted_at && (
                        <div className="text-right text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {format(new Date(project.submitted_at), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal flex items-center justify-center">
                <Trophy className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No projects match your search'
                  : 'No projects have been submitted yet. Be the first!'}
              </p>
              {!userProject && (
                <Button variant="gradient" className="mt-4" asChild>
                  <Link href={`/dashboard/${eventSlug}/project` as any}>
                    Submit Your Project
                  </Link>
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        {filteredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Showing {filteredProjects.length} of {projects.length} submitted projects
          </motion.div>
        )}
      </Container>
    </DashboardLayout>
  );
}
