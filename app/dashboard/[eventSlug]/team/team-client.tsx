'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Copy,
  UserPlus,
  LogOut,
  Crown,
  ArrowLeft,
  Search,
  Check,
  X,
  Shield,
  Github,
  Linkedin,
  Mail,
  Trash2,
  Settings,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  UserAvatar,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
} from '@/components/ui';
import { DashboardLayout, Container } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Event, Team, Registration } from '@/types';

interface TeamClientProps {
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
  openTeams: any[];
  isLeader: boolean;
}

// Generate random join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function TeamClient({
  eventSlug,
  event,
  user,
  registration,
  team,
  teamMembers,
  openTeams,
  isLeader,
}: TeamClientProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [lookingForSkills, setLookingForSkills] = useState<string[]>([]);
  const [joinCode, setJoinCode] = useState('');

  const copyJoinCode = () => {
    if (team?.join_code) {
      navigator.clipboard.writeText(team.join_code);
      toast.success('Join code copied to clipboard!');
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsCreating(true);
    try {
      const code = generateJoinCode();
      
      // Create team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          event_id: event.id,
          name: teamName.trim(),
          description: teamDescription.trim() || null,
          join_code: code,
          leader_id: user.id,
          max_members: event.max_team_size,
          is_open: true,
          looking_for_skills: lookingForSkills.length > 0 ? lookingForSkills : null,
        } as any)
        .select()
        .single();

      if (teamError) throw teamError;

      const createdTeam = newTeam as any;

      // Add leader as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: createdTeam.id,
          user_id: user.id,
          role: 'Team Lead',
          status: 'active',
        } as any);

      if (memberError) throw memberError;

      // Update registration with team_id
      const { error: regError } = await supabase
        .from('event_registrations')
        // @ts-ignore - Supabase types not generated
        .update({ team_id: createdTeam.id })
        .eq('id', registration.id as string);

      if (regError) throw regError;

      toast.success('Team created successfully! 🎉');
      setShowCreateDialog(false);
      router.refresh();
    } catch (error: any) {
      console.error('Create team error:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (teamId?: string) => {
    const code = teamId ? undefined : joinCode.trim().toUpperCase();
    
    if (!teamId && !code) {
      toast.error('Please enter a join code');
      return;
    }

    setIsJoining(true);
    try {
      let targetTeam: any;

      if (code) {
        // Find team by join code
        const { data: teamData, error: findError } = await supabase
          .from('teams')
          .select('*, members:team_members(id)')
          .eq('join_code', code as string)
          .eq('event_id', event.id as string)
          .single();

        if (findError || !teamData) {
          toast.error('Team not found. Please check the join code.');
          setIsJoining(false);
          return;
        }
        targetTeam = teamData as any;
      } else {
        // Direct join from browse
        const { data: teamData, error: findError } = await supabase
          .from('teams')
          .select('*, members:team_members(id)')
          .eq('id', teamId as string)
          .single();

        if (findError || !teamData) {
          toast.error('Team not found.');
          setIsJoining(false);
          return;
        }
        targetTeam = teamData as any;
      }

      // Check if team is full
      if ((targetTeam.members?.length || 0) >= (targetTeam.max_members || event.max_team_size)) {
        toast.error('This team is already full');
        setIsJoining(false);
        return;
      }

      // Add user as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: targetTeam.id,
          user_id: user.id,
          status: 'active',
        } as any);

      if (memberError) throw memberError;

      // Update registration with team_id
      const { error: regError } = await supabase
        .from('event_registrations')
        // @ts-ignore - Supabase types not generated
        .update({ team_id: targetTeam.id })
        .eq('id', registration.id as string);

      if (regError) throw regError;

      toast.success(`Successfully joined ${targetTeam.name}! 🎉`);
      setShowJoinDialog(false);
      setJoinCode('');
      router.refresh();
    } catch (error: any) {
      console.error('Join team error:', error);
      toast.error(error.message || 'Failed to join team');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;

    setIsJoining(true);
    try {
      // Remove from team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id as string)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Update registration to remove team_id
      const { error: regError } = await supabase
        .from('event_registrations')
        // @ts-ignore - Supabase types not generated
        .update({ team_id: null })
        .eq('id', registration.id as string);

      if (regError) throw regError;

      // If leader is leaving and there are other members, transfer leadership
      if (isLeader && teamMembers.length > 1) {
        const newLeader = teamMembers.find(m => m.user_id !== user.id);
        if (newLeader) {
          await supabase
            .from('teams')
            // @ts-ignore - Supabase types not generated
            .update({ leader_id: newLeader.user_id })
            .eq('id', team.id as string);
        }
      }

      // If last member, optionally delete the team
      if (teamMembers.length === 1) {
        await supabase.from('teams').delete().eq('id', team.id as string);
      }

      toast.success('You have left the team');
      setShowLeaveDialog(false);
      router.refresh();
    } catch (error: any) {
      console.error('Leave team error:', error);
      toast.error(error.message || 'Failed to leave team');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!team || !isLeader) return;

    try {
      // Get the member's registration
      const { data: memberReg } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', event.id as string)
        .eq('user_id', memberId)
        .single();

      // Remove from team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id as string)
        .eq('user_id', memberId);

      if (memberError) throw memberError;

      // Update their registration
      if (memberReg) {
        const reg = memberReg as any;
        await supabase
          .from('event_registrations')
          // @ts-ignore - Supabase types not generated
          .update({ team_id: null })
          .eq('id', reg.id as string);
      }

      toast.success(`${memberName} has been removed from the team`);
      router.refresh();
    } catch (error: any) {
      console.error('Remove member error:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };

  // Filter open teams by search
  const filteredTeams = openTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-display font-bold mb-2">
            {team ? 'My Team' : 'Team Management'}
          </h1>
          <p className="text-muted-foreground">
            {team 
              ? 'Manage your team, invite members, and collaborate on your project.'
              : 'Create a new team or join an existing one to start building together.'}
          </p>
        </motion.div>

        {team ? (
          /* Team View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Team Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <Card.Header>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <Users className="h-8 w-8 text-deep-black" />
                        </div>
                        <div>
                          <Card.Title className="text-2xl">{team.name}</Card.Title>
                          <Card.Description>
                            {teamMembers.length} of {event.max_team_size} members
                          </Card.Description>
                        </div>
                      </div>
                      {isLeader && (
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  {team.description && (
                    <Card.Content>
                      <p className="text-muted-foreground">{team.description}</p>
                    </Card.Content>
                  )}
                </Card>
              </motion.div>

              {/* Team Members */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <Card.Header>
                    <Card.Title>Team Members</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-charcoal/50"
                        >
                          <div className="flex items-center gap-4">
                            <UserAvatar
                              src={member.profile?.avatar_url}
                              name={member.profile?.full_name || 'Member'}
                              size="lg"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {member.profile?.full_name}
                                </span>
                                {member.user_id === team.leader_id && (
                                  <Badge variant="gold" size="sm">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Leader
                                  </Badge>
                                )}
                                {member.user_id === user.id && (
                                  <Badge variant="primary" size="sm">You</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.role || member.profile?.skill_level || 'Team Member'}
                              </div>
                              {member.profile?.skills && member.profile.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {member.profile.skills.slice(0, 4).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" size="sm">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {member.profile.skills.length > 4 && (
                                    <Badge variant="secondary" size="sm">
                                      +{member.profile.skills.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.profile?.github_username && (
                              <a
                                href={`https://github.com/${member.profile.github_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="icon">
                                  <Github className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            {isLeader && member.user_id !== user.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.user_id, member.profile?.full_name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {teamMembers.length < event.max_team_size && (
                        <button
                          onClick={() => copyJoinCode()}
                          className="w-full p-4 rounded-xl border-2 border-dashed border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          <UserPlus className="h-5 w-5 mx-auto mb-2" />
                          <span className="text-sm">Invite with code: {team.join_code}</span>
                        </button>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Join Code Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <Card.Header>
                    <Card.Title>Invite Members</Card.Title>
                    <Card.Description>
                      Share this code with others to invite them to your team
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-4 bg-charcoal rounded-lg font-mono text-xl text-center">
                        {team.join_code}
                      </div>
                      <Button variant="outline" size="icon" onClick={copyJoinCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>

              {/* Team Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <Card.Header>
                    <Card.Title>Team Stats</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">
                          {teamMembers.length}/{event.max_team_size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={team.is_open ? 'success' : 'secondary'}>
                          {team.is_open ? 'Open' : 'Closed'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>

              {/* Leave Team */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Team
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          /* No Team View */
          <Tabs defaultValue="join" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="join">Join a Team</TabsTrigger>
              <TabsTrigger value="create">Create Team</TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="space-y-6">
              {/* Join with Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <Card.Header>
                    <Card.Title>Join with Code</Card.Title>
                    <Card.Description>
                      Enter the team's join code to request to join
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter join code (e.g., ABC123)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="font-mono"
                        maxLength={6}
                      />
                      <Button
                        variant="gradient"
                        onClick={() => handleJoinTeam()}
                        loading={isJoining}
                      >
                        Join
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>

              {/* Browse Teams */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div>
                        <Card.Title>Browse Open Teams</Card.Title>
                        <Card.Description>
                          {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} looking for members
                        </Card.Description>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {filteredTeams.length > 0 ? (
                      <div className="space-y-3">
                        {filteredTeams.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-charcoal/50 hover:bg-charcoal transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <UserAvatar
                                src={t.avatar_url}
                                name={t.name}
                                size="lg"
                              />
                              <div>
                                <h4 className="font-medium">{t.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {t.description || 'No description'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" size="sm">
                                    {t.members?.length || 0}/{t.max_members || event.max_team_size} members
                                  </Badge>
                                  {t.looking_for_skills && t.looking_for_skills.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      Looking for: {t.looking_for_skills.slice(0, 2).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJoinTeam(t.id)}
                              disabled={isJoining}
                            >
                              Join
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchQuery ? 'No teams match your search' : 'No open teams available'}
                        </p>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="create">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="max-w-xl mx-auto">
                  <Card.Header>
                    <Card.Title>Create a New Team</Card.Title>
                    <Card.Description>
                      Start your own team and invite others to join
                    </Card.Description>
                  </Card.Header>
                  <Card.Content className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Team Name *</label>
                      <Input
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe your team and what you're building..."
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="gradient"
                      className="w-full"
                      onClick={handleCreateTeam}
                      loading={isCreating}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </Card.Content>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}

        {/* Leave Team Dialog */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Team?</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave {team?.name}? 
                {isLeader && teamMembers.length > 1 && ' Leadership will be transferred to another member.'}
                {isLeader && teamMembers.length === 1 && ' Since you are the only member, the team will be deleted.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeaveTeam}
                loading={isJoining}
              >
                Leave Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
