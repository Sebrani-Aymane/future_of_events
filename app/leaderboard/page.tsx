'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Crown,
  Star,
  Sparkles,
  Users,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Avatar,
  Progress,
} from '@/components/ui';
import { PageLayout, Container, Section } from '@/components/layouts';

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  team: {
    name: string;
    avatar: string;
    members: number;
  };
  project: {
    name: string;
    slug: string;
  };
  score: number;
  breakdown: {
    innovation: number;
    technical: number;
    design: number;
    impact: number;
    presentation: number;
  };
  judgesCount: number;
}

// Mock data
const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 2,
    team: { name: 'Tech Wizards', avatar: '', members: 4 },
    project: { name: 'HealthAI', slug: 'healthai' },
    score: 92.4,
    breakdown: { innovation: 9.5, technical: 9.2, design: 9.0, impact: 9.5, presentation: 9.3 },
    judgesCount: 5,
  },
  {
    rank: 2,
    previousRank: 1,
    team: { name: 'Innovators', avatar: '', members: 3 },
    project: { name: 'SmartCity', slug: 'smartcity' },
    score: 88.7,
    breakdown: { innovation: 9.0, technical: 8.8, design: 8.5, impact: 9.2, presentation: 8.9 },
    judgesCount: 5,
  },
  {
    rank: 3,
    previousRank: 3,
    team: { name: 'Code Ninjas', avatar: '', members: 3 },
    project: { name: 'EcoTrack', slug: 'ecotrack' },
    score: 85.2,
    breakdown: { innovation: 8.5, technical: 8.8, design: 8.3, impact: 8.5, presentation: 8.5 },
    judgesCount: 5,
  },
  {
    rank: 4,
    previousRank: 5,
    team: { name: 'Byte Force', avatar: '', members: 4 },
    project: { name: 'FinanceHub', slug: 'financehub' },
    score: 82.1,
    breakdown: { innovation: 8.0, technical: 8.5, design: 8.0, impact: 8.2, presentation: 8.4 },
    judgesCount: 4,
  },
  {
    rank: 5,
    previousRank: 4,
    team: { name: 'Data Miners', avatar: '', members: 3 },
    project: { name: 'LearnFlow', slug: 'learnflow' },
    score: 79.8,
    breakdown: { innovation: 7.8, technical: 8.2, design: 7.5, impact: 8.0, presentation: 8.3 },
    judgesCount: 4,
  },
  // Add more entries...
];

const mockStats = {
  totalTeams: 98,
  projectsJudged: 67,
  totalScores: 285,
  lastUpdated: new Date(),
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold flex items-center justify-center shadow-lg shadow-gold/30">
          <Crown className="h-8 w-8 text-deep-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-deep-black font-bold text-xs">
          1
        </div>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-silver via-gray-300 to-silver flex items-center justify-center shadow-lg shadow-silver/30">
          <Medal className="h-7 w-7 text-deep-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-silver flex items-center justify-center text-deep-black font-bold text-xs">
          2
        </div>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bronze via-orange-600 to-bronze flex items-center justify-center shadow-lg shadow-bronze/30">
          <Medal className="h-6 w-6 text-deep-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bronze flex items-center justify-center text-deep-black font-bold text-xs">
          3
        </div>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-charcoal border border-white/10 flex items-center justify-center font-bold">
      {rank}
    </div>
  );
}

function RankChange({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current;
  
  if (diff > 0) {
    return (
      <span className="flex items-center gap-1 text-success text-sm">
        <TrendingUp className="h-4 w-4" />
        +{diff}
      </span>
    );
  }
  
  if (diff < 0) {
    return (
      <span className="flex items-center gap-1 text-destructive text-sm">
        <TrendingDown className="h-4 w-4" />
        {diff}
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-sm">
      <Minus className="h-4 w-4" />
    </span>
  );
}

export default function LeaderboardPage() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setLastUpdate(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Top 3 podium
  const topThree = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="gold" size="lg" className="mb-4">
              <Trophy className="mr-2 h-4 w-4" />
              Live Leaderboard
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">Rankings</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time scores from our panel of expert judges.
              Updated every 30 seconds.
            </p>

            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className={`relative flex h-3 w-3 ${isLive ? '' : 'opacity-50'}`}>
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-success' : 'bg-muted'}`} />
                </span>
                <span className={`text-sm ${isLive ? 'text-success' : 'text-muted-foreground'}`}>
                  {isLive ? 'Live' : 'Paused'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLastUpdate(new Date())}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Teams', value: mockStats.totalTeams },
              { label: 'Projects Judged', value: mockStats.projectsJudged },
              { label: 'Total Scores', value: mockStats.totalScores },
              { label: 'Last Updated', value: lastUpdate.toLocaleTimeString() },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass">
                  <Card.Content className="p-4 text-center">
                    <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 md:gap-8 mb-16">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-[200px]"
            >
              <Card variant="glass" className="text-center overflow-hidden">
                <div className="h-2 bg-silver" />
                <Card.Content className="p-6">
                  <RankBadge rank={2} />
                  <h3 className="font-bold mt-4 mb-1">{topThree[1].team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {topThree[1].project.name}
                  </p>
                  <div className="text-3xl font-display font-bold text-silver">
                    {topThree[1].score}
                  </div>
                  <RankChange current={2} previous={topThree[1].previousRank} />
                </Card.Content>
              </Card>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-[240px]"
            >
              <Card variant="gradient" className="text-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/20 to-transparent pointer-events-none" />
                <div className="h-2 bg-gold" />
                <Card.Content className="p-8 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <Sparkles className="h-6 w-6 text-gold animate-pulse" />
                  </div>
                  <RankBadge rank={1} />
                  <h3 className="font-bold text-lg mt-4 mb-1">{topThree[0].team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {topThree[0].project.name}
                  </p>
                  <div className="text-4xl font-display font-bold text-gold mb-2">
                    {topThree[0].score}
                  </div>
                  <RankChange current={1} previous={topThree[0].previousRank} />
                  <Badge variant="gold" className="mt-4">
                    <Star className="mr-1 h-3 w-3" />
                    Leading
                  </Badge>
                </Card.Content>
              </Card>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-[180px]"
            >
              <Card variant="glass" className="text-center overflow-hidden">
                <div className="h-2 bg-bronze" />
                <Card.Content className="p-5">
                  <RankBadge rank={3} />
                  <h3 className="font-bold mt-4 mb-1">{topThree[2].team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {topThree[2].project.name}
                  </p>
                  <div className="text-2xl font-display font-bold text-bronze">
                    {topThree[2].score}
                  </div>
                  <RankChange current={3} previous={topThree[2].previousRank} />
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Full Leaderboard */}
      <Section padding="lg" background="muted">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title>Full Rankings</Card.Title>
                  <Badge variant="secondary">{mockLeaderboard.length} Teams</Badge>
                </div>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="divide-y divide-white/10">
                  {mockLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.team.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 md:p-6 hover:bg-white/5 transition-colors ${
                        entry.rank <= 3 ? 'bg-white/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-12 flex justify-center">
                        <RankBadge rank={entry.rank} />
                      </div>

                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold truncate">{entry.team.name}</h3>
                          <Badge variant="secondary" size="sm">
                            <Users className="mr-1 h-3 w-3" />
                            {entry.team.members}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.project.name}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          entry.rank === 1 ? 'text-gold' :
                          entry.rank === 2 ? 'text-silver' :
                          entry.rank === 3 ? 'text-bronze' : ''
                        }`}>
                          {entry.score}
                        </div>
                        <RankChange current={entry.rank} previous={entry.previousRank} />
                      </div>

                      {/* View Details */}
                      <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                        <Link href={`/projects/${entry.project.slug}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </Container>
      </Section>
    </PageLayout>
  );
}
