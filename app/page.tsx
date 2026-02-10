'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  ChevronRight,
  Zap,
  Code2,
  Rocket,
  Award,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Button, Badge, Card, Avatar } from '@/components/ui';
import { PageLayout, Container, HeroSection, Section } from '@/components/layouts';

// Types
interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ActivityItem {
  id: string;
  type: 'registration' | 'team' | 'project' | 'score';
  message: string;
  timestamp: Date;
  avatar?: string;
}

interface Sponsor {
  name: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  url: string;
}

interface Prize {
  place: number;
  amount: string;
  perks: string[];
}

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  type: 'ceremony' | 'workshop' | 'hacking' | 'break' | 'judging';
}

// Mock data
const mockEvent = {
  name: 'hackathon 2026',
  tagline: 'Build the Future of African Tech',
  description: 'Join 500+ developers for 48 hours of innovation, collaboration, and creation. Build solutions that matter.',
  startDate: new Date('2024-03-15T09:00:00'),
  endDate: new Date('2024-03-17T18:00:00'),
  location: '1337 Coding School, Benguerir',
  registrationDeadline: new Date('2024-03-10T23:59:59'),
  stats: {
    participants: 456,
    teams: 98,
    projects: 67,
    totalPrize: 50000,
  },
};

const mockPrizes: Prize[] = [
  { place: 1, amount: '$20,000', perks: ['Incubation Program', 'Mentorship', 'Cloud Credits'] },
  { place: 2, amount: '$10,000', perks: ['Mentorship', 'Cloud Credits'] },
  { place: 3, amount: '$5,000', perks: ['Cloud Credits'] },
];

const mockSchedule: ScheduleItem[] = [
  { time: 'Day 1 - 09:00', title: 'Opening Ceremony', description: 'Kickoff and team formation', type: 'ceremony' },
  { time: 'Day 1 - 11:00', title: 'Hacking Begins', description: 'Start building your project', type: 'hacking' },
  { time: 'Day 1 - 14:00', title: 'Workshop: AI/ML', description: 'Learn from industry experts', type: 'workshop' },
  { time: 'Day 2 - 10:00', title: 'Checkpoint', description: 'Mid-hackathon progress check', type: 'hacking' },
  { time: 'Day 2 - 15:00', title: 'Mentor Sessions', description: 'Get feedback from mentors', type: 'workshop' },
  { time: 'Day 3 - 14:00', title: 'Submission Deadline', description: 'Final project submissions', type: 'hacking' },
  { time: 'Day 3 - 16:00', title: 'Judging', description: 'Project presentations', type: 'judging' },
  { time: 'Day 3 - 18:00', title: 'Awards Ceremony', description: 'Winners announcement', type: 'ceremony' },
];

const mockSponsors: Sponsor[] = [
  { name: 'Tech Corp', logo: '/sponsors/tech-corp.svg', tier: 'platinum', url: '#' },
  { name: 'Cloud Inc', logo: '/sponsors/cloud-inc.svg', tier: 'gold', url: '#' },
  { name: 'Dev Tools', logo: '/sponsors/dev-tools.svg', tier: 'gold', url: '#' },
  { name: 'Startup Hub', logo: '/sponsors/startup-hub.svg', tier: 'silver', url: '#' },
  { name: 'Code Academy', logo: '/sponsors/code-academy.svg', tier: 'silver', url: '#' },
  { name: 'Open Source Foundation', logo: '/sponsors/osf.svg', tier: 'bronze', url: '#' },
];

const mockActivity: ActivityItem[] = [
  { id: '1', type: 'registration', message: 'Ahmed M. just registered', timestamp: new Date(), avatar: '' },
  { id: '2', type: 'team', message: 'Team "Code Ninjas" was created', timestamp: new Date(), avatar: '' },
  { id: '3', type: 'project', message: '"EcoTrack" project submitted', timestamp: new Date(), avatar: '' },
  { id: '4', type: 'registration', message: 'Sara K. just registered', timestamp: new Date(), avatar: '' },
  { id: '5', type: 'team', message: 'Youssef joined "Innovators"', timestamp: new Date(), avatar: '' },
];

const faqs = [
  {
    question: 'Who can participate?',
    answer: 'Anyone with a passion for coding and innovation! Students, professionals, and hobbyists are all welcome. No prior hackathon experience required.',
  },
  {
    question: 'Do I need a team to register?',
    answer: 'No! You can register as an individual and form a team later, or we can help match you with other participants during team formation.',
  },
  {
    question: 'What should I bring?',
    answer: 'Bring your laptop, charger, and enthusiasm! We provide food, drinks, sleeping areas, and a creative environment.',
  },
  {
    question: 'Is there a participation fee?',
    answer: 'No, participation is completely free! We cover meals, snacks, and swag for all participants.',
  },
  {
    question: 'What can I build?',
    answer: 'Anything! Web apps, mobile apps, AI/ML projects, hardware hacks - as long as it solves a real problem.',
  },
  {
    question: 'How are projects judged?',
    answer: 'Projects are evaluated on innovation, technical complexity, design, impact, and presentation by our panel of industry experts.',
  },
];

// Countdown hook
function useCountdown(targetDate: Date): CountdownTime {
  const calculateTimeLeft = (): CountdownTime => {
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
  };

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const countdown = useCountdown(mockEvent.startDate);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Rotate activity feed
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % mockActivity.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center"
          >
            {/* Live Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="primary" size="lg" className="animate-pulse-glow">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Registration Open • {mockEvent.stats.participants} Registered
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="text-gradient">{mockEvent.name}</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              {mockEvent.description}
            </motion.p>

            {/* Event Info */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-muted-foreground mb-10"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>March 15-17, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{mockEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>500 Participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>${mockEvent.stats.totalPrize.toLocaleString()} in Prizes</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button variant="gradient" size="xl" asChild className="shadow-glow">
                <Link href="/register">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="#about">
                  Learn More
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div variants={fadeInUp}>
              <p className="text-sm text-muted-foreground mb-4">Event starts in</p>
              <div className="flex items-center justify-center gap-3 md:gap-6">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Minutes' },
                  { value: countdown.seconds, label: 'Seconds' },
                ].map((item, index) => (
                  <div key={item.label} className="text-center">
                    <div className="relative">
                      <div className="w-16 md:w-20 h-16 md:h-20 rounded-xl bg-charcoal border border-white/10 flex items-center justify-center">
                        <span className="font-display text-3xl md:text-4xl font-bold text-gradient stat-number">
                          {item.value.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground mt-2 block">
                      {item.label}
                    </span>
                    {index < 3 && (
                      <span className="hidden md:inline absolute -right-3 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Live Activity Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 max-w-md mx-auto"
          >
            <div className="relative overflow-hidden bg-charcoal/50 border border-white/10 rounded-full px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {mockActivity[currentActivityIndex].message}
                </span>
              </div>
            </div>
          </motion.div>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Section padding="md" background="muted">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: mockEvent.stats.participants, label: 'Registered', icon: Users, suffix: '+' },
              { value: mockEvent.stats.teams, label: 'Teams', icon: Code2, suffix: '' },
              { value: mockEvent.stats.projects, label: 'Projects', icon: Rocket, suffix: '' },
              { value: mockEvent.stats.totalPrize, label: 'In Prizes', icon: Trophy, prefix: '$', format: true },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient stat-number">
                  {stat.prefix || ''}
                  {stat.format ? stat.value.toLocaleString() : stat.value}
                  {stat.suffix || ''}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* About Section */}
      <Section id="about">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">About the Event</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              48 Hours of <span className="text-gradient">Innovation</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the largest student hackathon in Morocco. Build real solutions,
              learn from experts, and compete for amazing prizes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Code2,
                title: 'Build',
                description: 'Create innovative solutions using cutting-edge technologies. Web, mobile, AI, IoT - anything goes!',
              },
              {
                icon: Users,
                title: 'Collaborate',
                description: 'Team up with like-minded developers. Learn from each other and make lasting connections.',
              },
              {
                icon: Award,
                title: 'Compete',
                description: 'Present your project to industry judges. Win prizes, recognition, and opportunities.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" hover="lift" className="h-full">
                  <Card.Content className="p-8 text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-primary mb-6">
                      <feature.icon className="h-8 w-8 text-deep-black" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Prizes Section */}
      <Section id="prizes" background="gradient">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="gold" className="mb-4">Prizes</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gold">${mockEvent.stats.totalPrize.toLocaleString()}</span> in Prizes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compete for amazing cash prizes, mentorship opportunities, and more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {mockPrizes.map((prize, index) => (
              <motion.div
                key={prize.place}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={index === 0 ? 'md:-mt-8' : ''}
              >
                <Card
                  variant={index === 0 ? 'gradient' : 'glass'}
                  hover="glow"
                  className="h-full overflow-hidden"
                >
                  <Card.Content className="p-8 text-center relative">
                    {/* Place Badge */}
                    <div className={`
                      inline-flex items-center justify-center w-16 h-16 rounded-full mb-6
                      ${index === 0 ? 'bg-gold text-deep-black' : ''}
                      ${index === 1 ? 'bg-silver text-deep-black' : ''}
                      ${index === 2 ? 'bg-bronze text-deep-black' : ''}
                    `}>
                      <Trophy className="h-8 w-8" />
                    </div>

                    <Badge
                      variant={index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}
                      className="mb-4"
                    >
                      {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                    </Badge>

                    <div className="font-display text-4xl md:text-5xl font-bold mb-6">
                      {prize.amount}
                    </div>

                    <ul className="space-y-3">
                      {prize.perks.map((perk) => (
                        <li key={perk} className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Star className="h-4 w-4 text-gold" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Schedule Section */}
      <Section id="schedule">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Schedule</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Event <span className="text-gradient">Timeline</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              48 hours packed with coding, workshops, mentorship, and fun.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {mockSchedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-6 pb-8 last:pb-0"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-4 h-4 rounded-full border-2 z-10
                    ${item.type === 'ceremony' ? 'bg-primary border-primary' : ''}
                    ${item.type === 'hacking' ? 'bg-success border-success' : ''}
                    ${item.type === 'workshop' ? 'bg-accent border-accent' : ''}
                    ${item.type === 'judging' ? 'bg-gold border-gold' : ''}
                    ${item.type === 'break' ? 'bg-muted border-muted' : ''}
                  `} />
                  {index < mockSchedule.length - 1 && (
                    <div className="w-0.5 flex-1 bg-white/10" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <span className="text-sm font-mono text-muted-foreground">{item.time}</span>
                  <h3 className="font-semibold text-lg mt-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Sponsors Section */}
      <Section id="sponsors" background="muted">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Sponsors</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Powered by <span className="text-gradient">Industry Leaders</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thanks to our amazing sponsors who make this event possible.
            </p>
          </motion.div>

          {/* Platinum */}
          <div className="mb-12">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">PLATINUM SPONSORS</p>
            <div className="flex justify-center">
              {mockSponsors.filter(s => s.tier === 'platinum').map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-8 rounded-2xl bg-charcoal border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="h-16 w-48 bg-white/10 rounded-lg flex items-center justify-center text-muted-foreground">
                    {sponsor.name}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Gold */}
          <div className="mb-12">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">GOLD SPONSORS</p>
            <div className="flex flex-wrap justify-center gap-6">
              {mockSponsors.filter(s => s.tier === 'gold').map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 rounded-xl bg-charcoal border border-white/10 hover:border-gold/50 transition-all"
                >
                  <div className="h-12 w-36 bg-white/10 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    {sponsor.name}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Silver & Bronze */}
          <div>
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">PARTNERS</p>
            <div className="flex flex-wrap justify-center gap-4">
              {mockSponsors.filter(s => ['silver', 'bronze'].includes(s.tier)).map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-charcoal/50 border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="h-8 w-24 bg-white/5 rounded flex items-center justify-center text-muted-foreground text-xs">
                    {sponsor.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section id="faq">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-semibold pr-6">{faq.question}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section padding="xl" background="gradient">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Ready to <span className="text-gradient">Build?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Don&apos;t miss your chance to be part of something amazing.
              Registration closes on March 10th.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="xl" asChild className="shadow-glow">
                <Link href="/register">
                  Register Now
                  <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="#schedule">
                  View Schedule
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>
    </PageLayout>
  );
}
