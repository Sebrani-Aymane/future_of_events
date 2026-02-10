'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  FolderOpen,
  Trophy,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Gavel,
  BarChart3,
  UserPlus,
  Megaphone,
  Settings,
  FileText,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  UserAvatar,
  Progress,
} from '@/components/ui';
import { AdminLayout, Container } from '@/components/layouts';
import type { Event } from '@/types';
import { format, formatDistanceToNow, isPast, isFuture, isWithinInterval } from 'date-fns';

interface AdminDashboardClientProps {
  eventSlug: string;
  event: Event;
  admin: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  stats: {
    participants: number;
    teams: number;
    projects: number;
    submitted: number;
    judges: number;
    projectsJudged: number;
  };
  recentRegistrations: Array<{
    id: string;
    registered_at: string;
    status: string;
    role: string;
    user: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      email: string;
    } | null;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    submitted_at: string | null;
    team: { name: string } | null;
  }>;
  pendingRegistrations: number;
}

function getEventPhase(event: Event) {
  const now = new Date();
  const regStart = event.registration_open_date ? new Date(event.registration_open_date) : new Date(event.start_date);
  const regEnd = new Date(event.registration_deadline);
  const eventStart = new Date(event.start_date);
  const eventEnd = new Date(event.end_date);
  const submissionDeadline = new Date(event.submission_deadline);

  if (isFuture(regStart)) {
    return { phase: 'Upcoming', status: 'upcoming' };
  }
  if (isWithinInterval(now, { start: regStart, end: regEnd })) {
    return { phase: 'Registration', status: 'current' };
  }
  if (isFuture(eventStart)) {
    return { phase: 'Pre-Event', status: 'upcoming' };
  }
  if (isWithinInterval(now, { start: eventStart, end: submissionDeadline })) {
    return { phase: 'Hacking', status: 'current' };
  }
  if (isWithinInterval(now, { start: submissionDeadline, end: eventEnd })) {
    return { phase: 'Judging', status: 'current' };
  }
  if (isPast(eventEnd)) {
    return { phase: 'Completed', status: 'completed' };
  }
  return { phase: 'Unknown', status: 'unknown' };
}

export default function AdminDashboardClient({
  eventSlug,
  event,
  admin,
  stats,
  recentRegistrations,
  recentProjects,
  pendingRegistrations,
}: AdminDashboardClientProps) {
  const eventPhase = getEventPhase(event);
  const judgingProgress = stats.submitted > 0 
    ? Math.round((stats.projectsJudged / stats.submitted) * 100) 
    : 0;

  const quickActions = [
    { label: 'Manage Participants', href: `/admin/${eventSlug}/participants`, icon: Users },
    { label: 'Manage Teams', href: `/admin/${eventSlug}/teams`, icon: Users },
    { label: 'View Projects', href: `/admin/${eventSlug}/projects`, icon: FolderOpen },
    { label: 'Announcements', href: `/admin/${eventSlug}/announcements`, icon: Megaphone },
    { label: 'Event Settings', href: `/admin/${eventSlug}/settings`, icon: Settings },
    { label: 'View Results', href: `/admin/${eventSlug}/results`, icon: Trophy },
  ];

  return (
    <AdminLayout
      eventSlug={eventSlug}
      eventName={event.name}
      user={{
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar || undefined,
        role: 'admin',
      }}
    >
      <Container size="full" padded={false}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage {event.name}
              </p>
            </div>
            <Badge 
              variant={eventPhase.status === 'current' ? 'success' : eventPhase.status === 'completed' ? 'secondary' : 'warning'}
              className="text-sm py-2"
            >
              <Activity className="h-4 w-4 mr-2" />
              {eventPhase.phase}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: 'Participants', value: stats.participants, icon: Users, color: 'text-blue-400' },
            { label: 'Teams', value: stats.teams, icon: Users, color: 'text-purple-400' },
            { label: 'Projects', value: stats.projects, icon: FolderOpen, color: 'text-green-400' },
            { label: 'Submitted', value: stats.submitted, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Judges', value: stats.judges, icon: Gavel, color: 'text-orange-400' },
            { label: 'Judged', value: stats.projectsJudged, icon: BarChart3, color: 'text-yellow-400' },
          ].map((stat) => (
            <Card key={stat.label} variant="glass">
              <Card.Content className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Quick Actions</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                      <Link key={action.label} href={action.href as any}>
                        <Button variant="outline" className="w-full justify-start h-auto py-3">
                          <action.icon className="h-4 w-4 mr-2 shrink-0" />
                          <span className="text-sm truncate">{action.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Recent Registrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Recent Registrations
                    </Card.Title>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/${eventSlug}/participants` as any}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  {recentRegistrations.length > 0 ? (
                    <div className="space-y-3">
                      {recentRegistrations.map((reg) => (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={reg.user?.avatar_url || undefined}
                              name={reg.user?.full_name || 'User'}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium">{reg.user?.full_name || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reg.registered_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <Badge variant={reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'secondary'}>
                            {reg.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No registrations yet
                    </p>
                  )}
                </Card.Content>
              </Card>
            </motion.div>

            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      Recent Projects
                    </Card.Title>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/${eventSlug}/projects` as any}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card.Header>
                <Card.Content>
                  {recentProjects.length > 0 ? (
                    <div className="space-y-3">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-muted-foreground">
                              by {project.team?.name || 'Unknown Team'}
                            </p>
                          </div>
                          <Badge variant={project.status === 'submitted' ? 'success' : 'secondary'}>
                            {project.status === 'submitted' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Draft</>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No projects yet
                    </p>
                  )}
                </Card.Content>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Actions */}
            {pendingRegistrations > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-warning/30 bg-warning/5">
                  <Card.Header>
                    <Card.Title className="flex items-center gap-2 text-warning">
                      <AlertCircle className="h-5 w-5" />
                      Pending Actions
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <Link href={`/admin/${eventSlug}/participants?status=pending` as any}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <span>{pendingRegistrations} registrations pending approval</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </Card.Content>
                </Card>
              </motion.div>
            )}

            {/* Judging Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Judging Progress
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Projects Judged</span>
                        <span>{stats.projectsJudged} / {stats.submitted}</span>
                      </div>
                      <Progress value={judgingProgress} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold">{stats.judges}</p>
                        <p className="text-xs text-muted-foreground">Judges</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold">{judgingProgress}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Event Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Timeline
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {event.registration_open_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Registration Opens</span>
                        <span>{format(new Date(event.registration_open_date), 'MMM d')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registration Closes</span>
                      <span>{format(new Date(event.registration_deadline), 'MMM d')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Event Starts</span>
                      <span>{format(new Date(event.start_date), 'MMM d')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Submission Deadline</span>
                      <span>{format(new Date(event.submission_deadline), 'MMM d, h:mm a')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Event Ends</span>
                      <span>{format(new Date(event.end_date), 'MMM d')}</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
