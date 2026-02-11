'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  FolderOpen,
  Trophy,
  Clock,
  Bell,
  ArrowRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Zap,
  ExternalLink,
  Copy,
  Plus,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Progress,
} from '@/components/ui';
import { UserAvatar } from '@/components/ui/avatar';
import { DashboardLayout, Container } from '@/components/layouts';
import { toast } from 'sonner';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, isPast } from 'date-fns';
import type { Event, Team, Project, Registration, Announcement, ActivityFeedItem } from '@/types';

interface DashboardClientProps {
  eventSlug: string;
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'participant' | 'admin' | 'judge';
  };
  registration: Registration;
  team: Team | null;
  teamMembers: any[];
  project: Project | null;
  announcements: Announcement[];
  topProjects: any[];
  activities: ActivityFeedItem[];
}

// Countdown Hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function DashboardClient({
  eventSlug,
  event,
  user,
  registration,
  team,
  teamMembers,
  project,
  announcements,
  topProjects,
  activities,
}: DashboardClientProps) {
  const submissionDeadline = new Date(event.submission_deadline);
  const eventStart = new Date(event.start_date);
  const eventEnd = new Date(event.end_date);
  const now = new Date();

  const isLive = now >= eventStart && now <= eventEnd;
  const hasEnded = isPast(eventEnd);

  // Countdown to submission deadline during event, or event start before
  const countdownTarget = isLive ? submissionDeadline : eventStart;
  const timeLeft = useCountdown(countdownTarget);

  const copyJoinCode = () => {
    if (team?.join_code) {
      navigator.clipboard.writeText(team.join_code);
      toast.success('Join code copied to clipboard!');
    }
  };

  // Calculate project progress (mock for now, based on status)
  const projectProgress = project ? 
    (project.status === 'submitted' ? 100 :
     project.status === 'draft' ? 50 :
     project.github_url ? 30 : 10) : 0;

  // Find current team's rank
  const currentTeamRank = team ? topProjects.findIndex(p => p.team?.id === team.id) + 1 : null;

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
      notifications={announcements.length}
    >
      <Container size="full" padded={false}>
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            {isLive 
              ? "The hackathon is live! Keep building and don't forget to submit before the deadline."
              : hasEnded 
                ? "The event has ended. Thanks for participating!"
                : `Here's what's happening with your hackathon journey.`}
          </p>
        </motion.div>

        {/* Countdown Banner */}
        {!hasEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="gradient" className="overflow-hidden">
              <Card.Content className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <Badge variant={isLive ? 'success' : 'primary'} className="mb-3">
                      <Clock className="mr-1 h-3 w-3" />
                      {isLive ? 'Submission Deadline' : 'Event Starts In'}
                    </Badge>
                    <h2 className="text-xl md:text-2xl font-bold mb-1">
                      {isLive ? 'Time Remaining to Submit' : 'Countdown to Event'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {isLive 
                        ? 'Submit your project before the deadline' 
                        : format(eventStart, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {timeLeft.days > 0 && (
                      <>
                        <div className="text-center">
                          <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                            {timeLeft.days}
                          </div>
                          <div className="text-xs text-muted-foreground">Days</div>
                        </div>
                        <div className="text-2xl text-muted-foreground">:</div>
                      </>
                    )}
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-2xl text-muted-foreground">:</div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">Minutes</div>
                    </div>
                    {timeLeft.days === 0 && (
                      <>
                        <div className="text-2xl text-muted-foreground">:</div>
                        <div className="text-center">
                          <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                            {timeLeft.seconds.toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-muted-foreground">Seconds</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Team Members',
              value: team ? `${teamMembers.length}/${event.max_team_size}` : 'No Team',
              icon: Users,
              color: 'text-primary',
              href: `/dashboard/${eventSlug}/team`,
            },
            {
              label: 'Project Progress',
              value: project ? `${projectProgress}%` : 'Not Started',
              icon: FolderOpen,
              color: 'text-success',
              href: `/dashboard/${eventSlug}/project`,
            },
            {
              label: 'Current Rank',
              value: currentTeamRank ? `#${currentTeamRank}` : '-',
              icon: Trophy,
              color: 'text-gold',
              href: `/dashboard/${eventSlug}/leaderboard`,
            },
            {
              label: 'Announcements',
              value: announcements.length.toString(),
              icon: Bell,
              color: 'text-warning',
              href: `/dashboard/${eventSlug}/announcements`,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={stat.href as any}>
                <Card hover="lift" className="h-full">
                  <Card.Content className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card.Content>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview or Create Project CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {project ? (
                <Card>
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <Card.Title>Project: {project.title}</Card.Title>
                          <Card.Description>{project.tagline || project.description?.slice(0, 100)}</Card.Description>
                        </div>
                      </div>
                      <Badge
                        variant={project.status === 'submitted' ? 'success' : 'secondary'}
                      >
                        {project.status === 'submitted' ? 'Submitted' : 
                         project.status === 'draft' ? 'Draft' : 'In Progress'}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{projectProgress}%</span>
                      </div>
                      <Progress value={projectProgress} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/10">
                      <div className="text-center">
                        <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${project.title ? 'text-success' : 'text-muted-foreground'}`} />
                        <div className="text-xs text-muted-foreground">Idea</div>
                      </div>
                      <div className="text-center">
                        <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${project.github_url ? 'text-success' : 'text-muted-foreground'}`} />
                        <div className="text-xs text-muted-foreground">Code</div>
                      </div>
                      <div className="text-center">
                        {project.status === 'submitted' ? (
                          <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning mx-auto mb-1" />
                        )}
                        <div className="text-xs text-muted-foreground">Submitted</div>
                      </div>
                    </div>
                  </Card.Content>
                  <Card.Footer>
                    <Button variant="gradient" asChild className="w-full">
                      <Link href={`/dashboard/${eventSlug}/project` as any}>
                        {project.status === 'submitted' ? 'View Project' : 'Continue Working'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </Card.Footer>
                </Card>
              ) : (
                <Card variant="glass" className="border-dashed">
                  <Card.Content className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start Your Project</h3>
                    <p className="text-muted-foreground mb-6">
                      {team 
                        ? "Your team hasn't created a project yet. Start building something amazing!"
                        : "Join or create a team to start working on your project."}
                    </p>
                    <Button variant="gradient" asChild>
                      <Link href={(team ? `/dashboard/${eventSlug}/project` : `/dashboard/${eventSlug}/team`) as any}>
                        <Plus className="mr-2 h-4 w-4" />
                        {team ? 'Create Project' : 'Find a Team'}
                      </Link>
                    </Button>
                  </Card.Content>
                </Card>
              )}
            </motion.div>

            {/* Team Overview or Join/Create Team CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {team ? (
                <Card>
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <Card.Title>Team: {team.name}</Card.Title>
                          <Card.Description>
                            {teamMembers.length} of {event.max_team_size} members
                          </Card.Description>
                        </div>
                      </div>
                      <button
                        onClick={copyJoinCode}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal hover:bg-charcoal/80 transition-colors"
                      >
                        <span className="font-mono text-sm">{team.join_code}</span>
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-charcoal/50"
                        >
                          <div className="flex items-center gap-3">
                          <UserAvatar 
                              src={member.profile?.avatar_url} 
                              name={member.profile?.full_name || 'Member'} 
                              size="sm" 
                            />
                            <div>
                              <div className="font-medium text-sm">{member.profile?.full_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.role || member.profile?.skill_level || 'Team Member'}
                              </div>
                            </div>
                          </div>
                          {member.user_id === team.leader_id && (
                            <Badge variant="gold" size="sm">Lead</Badge>
                          )}
                        </div>
                      ))}

                      {teamMembers.length < event.max_team_size && (
                        <Link href={`/dashboard/${eventSlug}/team` as any}>
                          <button className="w-full p-3 rounded-lg border-2 border-dashed border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                            <span className="text-sm">+ Invite Member</span>
                          </button>
                        </Link>
                      )}
                    </div>
                  </Card.Content>
                  <Card.Footer>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/dashboard/${eventSlug}/team` as any}>
                        Manage Team
                      </Link>
                    </Button>
                  </Card.Footer>
                </Card>
              ) : (
                <Card variant="glass" className="border-dashed">
                  <Card.Content className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Join or Create a Team</h3>
                    <p className="text-muted-foreground mb-6">
                      Team up with other participants to build something amazing together!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="gradient" asChild>
                        <Link href={`/dashboard/${eventSlug}/team?action=create` as any}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Team
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/${eventSlug}/team?action=join` as any}>
                          Join with Code
                        </Link>
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/10 text-warning">
                        <Bell className="h-5 w-5" />
                      </div>
                      <Card.Title>Announcements</Card.Title>
                    </div>
                    {announcements.length > 0 && (
                      <Badge variant="primary" size="sm">{announcements.length} new</Badge>
                    )}
                  </div>
                </Card.Header>
                <Card.Content>
                  {announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.slice(0, 3).map((announcement) => (
                        <div
                          key={announcement.id}
                          className="p-3 rounded-lg bg-charcoal/50"
                        >
                          <div className="flex items-start gap-2 mb-1">
                            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="font-medium text-sm">
                              {announcement.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
                            {announcement.content}
                          </p>
                          <span className="text-xs text-muted-foreground ml-6">
                            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No announcements yet
                    </p>
                  )}
                </Card.Content>
                <Card.Footer>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href={`/dashboard/${eventSlug}/announcements` as any}>
                      View All Announcements
                    </Link>
                  </Button>
                </Card.Footer>
              </Card>
            </motion.div>

            {/* Leaderboard Preview */}
            {topProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <Card.Header>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gold/10 text-gold">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <Card.Title>Leaderboard</Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-2">
                      {topProjects.map((proj, index) => {
                        const isCurrentTeam = team && proj.team?.id === team.id;
                        return (
                          <div
                            key={proj.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isCurrentTeam
                                ? 'bg-primary/10 border border-primary/30'
                                : 'bg-charcoal/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? 'bg-gold text-deep-black'
                                    : index === 1
                                    ? 'bg-silver text-deep-black'
                                    : index === 2
                                    ? 'bg-bronze text-deep-black'
                                    : 'bg-charcoal text-muted-foreground'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isCurrentTeam ? 'text-primary' : ''
                                }`}
                              >
                                {proj.team?.name || 'Unknown Team'}
                              </span>
                              {isCurrentTeam && (
                                <Badge variant="primary" size="sm">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-4 w-4 text-success" />
                              <span>{proj.average_score?.toFixed(1) || '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card.Content>
                  <Card.Footer>
                    <Button variant="ghost" asChild className="w-full">
                      <Link href={`/dashboard/${eventSlug}/leaderboard` as any}>
                        View Full Leaderboard
                      </Link>
                    </Button>
                  </Card.Footer>
                </Card>
              </motion.div>
            )}

            {/* Recent Activity */}
            {activities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <Card.Header>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/10 text-success">
                        <Zap className="h-5 w-5" />
                      </div>
                      <Card.Title>Recent Activity</Card.Title>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <div>
                            <p className="text-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </Container>
    </DashboardLayout>
  );
}
