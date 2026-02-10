'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FolderOpen,
  Search,
  CheckCircle,
  Clock,
  Star,
  ExternalLink,
  Github,
  Globe,
  Play,
  Eye,
  MoreVertical,
  Trophy,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  UserAvatar,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';
import { AdminLayout, Container } from '@/components/layouts';
import type { Event } from '@/types';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  status: string;
  github_url: string;
  demo_url: string | null;
  video_url: string | null;
  tech_stack: string[];
  submitted_at: string | null;
  created_at: string;
  team: {
    id: string;
    name: string;
    avatar_url: string | null;
    members: Array<{
      user: { id: string; full_name: string };
    }>;
  } | null;
  averageScore: number | null;
  judgeCount: number;
}

interface ProjectsClientProps {
  eventSlug: string;
  event: Event;
  admin: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  projects: Project[];
  counts: {
    total: number;
    draft: number;
    submitted: number;
  };
  currentFilter: string;
}

export default function ProjectsClient({
  eventSlug,
  event,
  admin,
  projects,
  counts,
  currentFilter,
}: ProjectsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateFilter = (status: string) => {
    if (status === 'all') {
      router.push(`/admin/${eventSlug}/projects` as any);
    } else {
      router.push(`/admin/${eventSlug}/projects?status=${status}` as any);
    }
  };

  // Filter projects by search
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.team?.name.toLowerCase().includes(query) ||
      project.tech_stack?.some(t => t.toLowerCase().includes(query))
    );
  });

  // Sort by score if submitted
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.averageScore === null && b.averageScore === null) return 0;
    if (a.averageScore === null) return 1;
    if (b.averageScore === null) return -1;
    return b.averageScore - a.averageScore;
  });

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
          <Link
            href={`/admin/${eventSlug}` as any}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Projects</h1>
              <p className="text-muted-foreground">
                View and manage all project submissions
              </p>
            </div>
            <Button variant="gradient" asChild>
              <Link href={`/admin/${eventSlug}/results` as any}>
                <Trophy className="h-4 w-4 mr-2" />
                View Results
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card 
            className={`cursor-pointer transition-all ${currentFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => updateFilter('all')}
          >
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold">{counts.total}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </Card.Content>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${currentFilter === 'draft' ? 'ring-2 ring-warning' : ''}`}
            onClick={() => updateFilter('draft')}
          >
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{counts.draft}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </Card.Content>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${currentFilter === 'submitted' ? 'ring-2 ring-success' : ''}`}
            onClick={() => updateFilter('submitted')}
          >
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{counts.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, team, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {sortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
            >
              <Card>
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant={project.status === 'submitted' ? 'success' : 'warning'}>
                          {project.status === 'submitted' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Draft</>
                          )}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        by {project.team?.name || 'Unknown Team'}
                        {project.team?.members && (
                          <span className="ml-2">
                            ({project.team.members.length} members)
                          </span>
                        )}
                      </p>

                      {project.tagline && (
                        <p className="text-muted-foreground mb-3">{project.tagline}</p>
                      )}

                      {/* Tech Stack */}
                      {project.tech_stack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.tech_stack.slice(0, 6).map((tech) => (
                            <Badge key={tech} variant="secondary" size="sm">
                              {tech}
                            </Badge>
                          ))}
                          {project.tech_stack.length > 6 && (
                            <Badge variant="secondary" size="sm">
                              +{project.tech_stack.length - 6} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex gap-2">
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Github className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {project.demo_url && (
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {project.video_url && (
                          <a href={project.video_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Score & Info */}
                    <div className="text-right">
                      {project.averageScore !== null ? (
                        <div className="mb-2">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="text-2xl font-bold">
                              {project.averageScore.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {project.judgeCount} judge{project.judgeCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : project.status === 'submitted' ? (
                        <Badge variant="secondary">Not judged</Badge>
                      ) : null}
                      
                      {project.submitted_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {format(new Date(project.submitted_at), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Description */}
                  {expandedId === project.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {expandedId === project.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))}

          {sortedProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No projects match your search' : 'No projects yet'}
              </p>
            </motion.div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
