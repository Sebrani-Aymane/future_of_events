'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Globe,
  CheckCircle,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Gift,
  FileText,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Progress,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { PageLayout, Container, Section } from '@/components/layouts';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Event, Sponsor, Team, Registration } from '@/types';
import { format, formatDistanceToNow, isPast, isFuture, differenceInDays, differenceInHours } from 'date-fns';

interface EventDetailClientProps {
  event: Event & { _count: { registrations: number; teams: number; projects: number } };
  sponsors: Sponsor[];
  isRegistered: boolean;
  userRegistration: Registration | null;
  userTeam: Team | null;
  isAuthenticated: boolean;
}

// Countdown Hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useState(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  });

  return timeLeft;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-charcoal rounded-xl border border-white/10">
      <span className="text-3xl md:text-4xl font-display font-bold text-gradient">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  return (
    <a
      href={sponsor.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 bg-charcoal/50 rounded-xl border border-white/5 hover:border-primary/30 transition-all group"
    >
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="h-12 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
        />
      ) : (
        <span className="text-muted-foreground">{sponsor.name}</span>
      )}
    </a>
  );
}

export default function EventDetailClient({
  event,
  sponsors,
  isRegistered,
  userRegistration,
  userTeam,
  isAuthenticated,
}: EventDetailClientProps) {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const registrationDeadline = new Date(event.registration_deadline);
  const submissionDeadline = new Date(event.submission_deadline);
  const now = new Date();

  const timeLeft = useCountdown(startDate);
  const isLive = now >= startDate && now <= endDate;
  const isEnded = isPast(endDate);
  const canRegister = event.is_registration_open && !isPast(registrationDeadline) && !isEnded;

  // Calculate capacity
  const capacityPercentage = event.max_participants
    ? Math.min(100, (event._count.registrations / event.max_participants) * 100)
    : 0;
  const spotsLeft = event.max_participants
    ? event.max_participants - event._count.registrations
    : null;

  // Parse JSON fields
  const prizes = event.prizes || [];
  const schedule = event.schedule || [];
  const faqs = event.faqs || [];
  const judgingCriteria = event.judging_criteria || [];

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.slug}`);
      return;
    }

    setIsRegistering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already registered
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (existingReg) {
        toast.info('You are already registered for this event!');
        setIsRegistering(false);
        return;
      }

      // Create registration
      const { error } = await supabase.from('event_registrations').insert({
        event_id: event.id,
        user_id: user.id,
        status: 'approved',
        role: 'participant',
      } as any);

      if (error) throw error;

      toast.success('Successfully registered! Welcome to the event! 🎉');
      router.push(`/dashboard/${event.slug}`);
      router.refresh();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="relative pt-20 pb-0 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {event.cover_image_url || event.banner_url ? (
            <>
              <img
                src={event.cover_image_url || event.banner_url || ''}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-deep-black/80 via-deep-black/90 to-deep-black" />
            </>
          ) : (
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${event.primary_color || '#00E5FF'}10, ${event.secondary_color || '#FF6B35'}10)`,
              }}
            />
          )}
        </div>

        <Container className="relative z-10 pt-16 pb-8">
          {/* Back Button */}
          <Link
            href={"/events" as any}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Status Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isLive && (
                  <Badge variant="success" className="animate-pulse">
                    🔴 Live Now
                  </Badge>
                )}
                {isEnded && <Badge variant="secondary">Event Ended</Badge>}
                {canRegister && (
                  <Badge variant="primary">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Registration Open
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge variant="outline">
                    <Globe className="mr-1 h-3 w-3" />
                    Virtual
                  </Badge>
                )}
              </div>

              {/* Event Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
                {event.name}
              </h1>

              {/* Tagline */}
              {event.tagline && (
                <p className="text-xl text-muted-foreground mb-6">
                  {event.tagline}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    {format(startDate, 'MMM d')} - {format(endDate, 'd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>
                    {event.is_virtual ? 'Virtual Event' : event.location || 'TBA'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{event._count.registrations} registered</span>
                </div>
              </div>

              {/* Organizer */}
              {event.organizer_name && (
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-sm text-muted-foreground">Organized by</span>
                  <span className="font-medium">{event.organizer_name}</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {isRegistered ? (
                  <Link href={`/dashboard/${event.slug}`}>
                    <Button variant="gradient" size="lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : canRegister ? (
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleRegister}
                    loading={isRegistering}
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                    {!isRegistering && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" disabled>
                    {isEnded ? 'Event Ended' : 'Registration Closed'}
                  </Button>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  {event.discord_url && (
                    <a href={event.discord_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </a>
                  )}
                  {event.twitter_url && (
                    <a href={event.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Twitter className="h-5 w-5" />
                      </Button>
                    </a>
                  )}
                  {event.linkedin_url && (
                    <a href={event.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Linkedin className="h-5 w-5" />
                      </Button>
                    </a>
                  )}
                  {event.website_url && (
                    <a href={event.website_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Globe className="h-5 w-5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Countdown / Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="p-6">
                {!isEnded && !isLive && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      Event Starts In
                    </h3>
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <CountdownBlock value={timeLeft.days} label="Days" />
                      <CountdownBlock value={timeLeft.hours} label="Hours" />
                      <CountdownBlock value={timeLeft.minutes} label="Minutes" />
                      <CountdownBlock value={timeLeft.seconds} label="Seconds" />
                    </div>
                  </>
                )}

                {isLive && (
                  <div className="text-center mb-6">
                    <Badge variant="success" className="text-lg py-2 px-4 animate-pulse">
                      🎉 Event is Live!
                    </Badge>
                  </div>
                )}

                {/* Capacity */}
                {event.max_participants && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Registration</span>
                      <span>
                        {event._count.registrations} / {event.max_participants}
                      </span>
                    </div>
                    <Progress value={capacityPercentage} />
                    {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 50 && (
                      <p className="text-sm text-warning mt-2">
                        <AlertCircle className="inline h-4 w-4 mr-1" />
                        Only {spotsLeft} spots left!
                      </p>
                    )}
                  </div>
                )}

                {/* Key Dates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registration Deadline</span>
                    <span className={isPast(registrationDeadline) ? 'text-error' : ''}>
                      {format(registrationDeadline, 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submission Deadline</span>
                    <span>{format(submissionDeadline, 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>

                {/* Team Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-3">Team Requirements</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Team Size</span>
                      <span>{event.min_team_size} - {event.max_team_size} members</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solo Participants</span>
                      <span>{event.allow_solo_participants ? 'Allowed' : 'Not allowed'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Content Tabs */}
      <Section className="py-16">
        <Container>
          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="prizes">Prizes</TabsTrigger>
              <TabsTrigger value="rules">Rules & Criteria</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-8">
              {event.description && (
                <Card variant="glass" className="p-8">
                  <h2 className="text-2xl font-display font-bold mb-4">About the Event</h2>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br/>') }}
                  />
                </Card>
              )}

              {event.theme && (
                <Card variant="glass" className="p-8">
                  <h2 className="text-2xl font-display font-bold mb-4">
                    <Zap className="inline h-6 w-6 mr-2 text-primary" />
                    Theme
                  </h2>
                  <p className="text-lg text-muted-foreground">{event.theme}</p>
                </Card>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="glass" className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{event._count.registrations}</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </Card>
                <Card variant="glass" className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <div className="text-3xl font-bold">{event._count.teams}</div>
                  <div className="text-sm text-muted-foreground">Teams</div>
                </Card>
                <Card variant="glass" className="p-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <div className="text-3xl font-bold">{event._count.projects}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </Card>
                <Card variant="glass" className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-success" />
                  <div className="text-3xl font-bold">{differenceInHours(endDate, startDate)}</div>
                  <div className="text-sm text-muted-foreground">Hours of Hacking</div>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card variant="glass" className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6">Event Schedule</h2>
                {schedule.length > 0 ? (
                  <div className="space-y-4">
                    {schedule.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-lg bg-charcoal/50 border border-white/5"
                      >
                        <div className="text-sm text-primary font-medium min-w-[100px]">
                          {item.time}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Schedule will be announced soon.</p>
                )}
              </Card>
            </TabsContent>

            {/* Prizes Tab */}
            <TabsContent value="prizes">
              <Card variant="glass" className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6">
                  <Gift className="inline h-6 w-6 mr-2 text-primary" />
                  Prizes
                </h2>
                {prizes.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {prizes.map((prize: any, index: number) => (
                      <Card
                        key={index}
                        variant={index === 0 ? 'gradient' : 'default'}
                        className="p-6 text-center"
                      >
                        <div className="text-4xl mb-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          {prize.title || `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place`}
                        </h3>
                        <div className="text-2xl font-display font-bold text-gradient mb-4">
                          {prize.amount || prize.value}
                        </div>
                        {prize.perks && (
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {prize.perks.map((perk: string, i: number) => (
                              <li key={i} className="flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                {perk}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Prizes will be announced soon.</p>
                )}
              </Card>
            </TabsContent>

            {/* Rules & Criteria Tab */}
            <TabsContent value="rules" className="space-y-8">
              {event.rules && (
                <Card variant="glass" className="p-8">
                  <h2 className="text-2xl font-display font-bold mb-4">
                    <FileText className="inline h-6 w-6 mr-2 text-primary" />
                    Rules
                  </h2>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.rules.replace(/\n/g, '<br/>') }}
                  />
                </Card>
              )}

              {judgingCriteria.length > 0 && (
                <Card variant="glass" className="p-8">
                  <h2 className="text-2xl font-display font-bold mb-4">Judging Criteria</h2>
                  <div className="space-y-4">
                    {judgingCriteria.map((criterion: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-charcoal/50"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {criterion.weight || index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          {criterion.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {criterion.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <Card variant="glass" className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6">
                  <HelpCircle className="inline h-6 w-6 mr-2 text-primary" />
                  Frequently Asked Questions
                </h2>
                {faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {faqs.map((faq: any, index: number) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">FAQ will be added soon.</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <Section className="py-16 border-t border-white/10">
          <Container>
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Our Sponsors
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {sponsors.map((sponsor) => (
                <SponsorLogo key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Sticky CTA (Mobile) */}
      {canRegister && !isRegistered && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-deep-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleRegister}
            loading={isRegistering}
          >
            {isRegistering ? 'Registering...' : 'Register Now'}
          </Button>
        </div>
      )}
    </PageLayout>
  );
}
