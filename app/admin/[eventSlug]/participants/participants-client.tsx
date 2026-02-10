'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  UserCheck,
  UserX,
  Download,
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
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Event } from '@/types';
import { format } from 'date-fns';

interface Registration {
  id: string;
  user_id: string;
  status: string;
  role: string;
  registered_at: string;
  team_id: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    skills: string[] | null;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
}

interface ParticipantsClientProps {
  eventSlug: string;
  event: Event;
  admin: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  registrations: Registration[];
  counts: {
    total: number;
    pending: number;
    approved: number;
  };
  filters: {
    status: string;
    role: string;
    search: string;
  };
}

export default function ParticipantsClient({
  eventSlug,
  event,
  admin,
  registrations,
  counts,
  filters,
}: ParticipantsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/${eventSlug}/participants?${params.toString()}` as any);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    router.push(`/admin/${eventSlug}/participants?${params.toString()}` as any);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === registrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(registrations.map(r => r.id)));
    }
  };

  const updateStatus = async (ids: string[], status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        // @ts-ignore - Supabase types not generated
        .update({ status })
        .in('id', ids);

      if (error) throw error;

      toast.success(`${ids.length} registration(s) ${status}`);
      setSelectedIds(new Set());
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update registrations');
    } finally {
      setIsProcessing(false);
    }
  };

  const approveSelected = () => updateStatus(Array.from(selectedIds), 'approved');
  const rejectSelected = () => updateStatus(Array.from(selectedIds), 'rejected');

  // Filter registrations by search
  const filteredRegistrations = registrations.filter(reg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.user?.full_name?.toLowerCase().includes(query) ||
      reg.user?.email?.toLowerCase().includes(query) ||
      reg.team?.name?.toLowerCase().includes(query)
    );
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
            href={`/admin/${eventSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Participants</h1>
              <p className="text-muted-foreground">
                Manage event registrations and participants
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
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
          <Card>
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold">{counts.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </Card.Content>
          </Card>
          <Card className={filters.status === 'pending' ? 'ring-2 ring-warning' : ''}>
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{counts.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </Card.Content>
          </Card>
          <Card className={filters.status === 'approved' ? 'ring-2 ring-success' : ''}>
            <Card.Content className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{counts.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card>
            <Card.Content className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name, email, or team..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.role}
                    onValueChange={(value) => updateFilter('role', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="judge">Judge</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="bg-primary/10 border-primary/30">
              <Card.Content className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={approveSelected}
                      loading={isProcessing}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={rejectSelected}
                      loading={isProcessing}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Participants Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === registrations.length && registrations.length > 0}
                        onChange={selectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Team</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Registered</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(reg.id)}
                          onChange={() => toggleSelect(reg.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={reg.user?.avatar_url || undefined}
                            name={reg.user?.full_name || 'User'}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{reg.user?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{reg.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {reg.team ? (
                          <Badge variant="secondary">{reg.team.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={reg.role === 'admin' ? 'destructive' : reg.role === 'judge' ? 'warning' : 'secondary'}
                        >
                          {reg.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            reg.status === 'approved' ? 'success' :
                            reg.status === 'pending' ? 'warning' : 'destructive'
                          }
                        >
                          {reg.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {reg.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {reg.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(reg.registered_at), 'MMM d, h:mm a')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {reg.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus([reg.id], 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus([reg.id], 'rejected')}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {reg.user?.email && (
                            <a href={`mailto:${reg.user.email}`}>
                              <Button size="sm" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {reg.user?.github_url && (
                            <a href={reg.user.github_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost">
                                <Github className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No participants found</p>
              </div>
            )}
          </Card>
        </motion.div>
      </Container>
    </AdminLayout>
  );
}
