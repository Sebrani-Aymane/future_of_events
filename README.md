# 🚀 Hackathon Platform

> Africa's premier hackathon management platform, built for coding schools starting with 1337 Morocco.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)

## ✨ Features

### 🎯 Public Event Site
- Dynamic landing page with countdown timer
- Live activity feed showing registrations in real-time
- Interactive schedule timeline
- Tiered sponsor showcase
- Prize breakdown with animations
- FAQ accordion

### 📝 Registration System
- Multi-step registration form
- OAuth integration (GitHub, Google)
- Team creation and join with unique codes
- Skill selection and experience tracking
- Email verification

### 👥 Participant Dashboard
- Real-time countdown to submission
- Team management workspace
- Project submission with file uploads
- Live leaderboard preview
- Announcement feed
- Chat with team members

### ⚙️ Admin Command Center
- Real-time event statistics
- Participant management with filters
- Team oversight and approval
- Judging setup and criteria management
- Announcement broadcasting
- Analytics dashboard

### ⚖️ Judging Interface
- Clean scoring interface
- Weighted criteria system
- Project queue management
- Score breakdown visualization
- Judge progress tracking
- Conflict of interest handling

### 🏆 Leaderboard & Results
- Live real-time rankings
- Animated podium display
- Score trend indicators
- Winner celebration effects
- Project showcase

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Custom Design System
- **Database:** Supabase (PostgreSQL + RLS)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **State:** TanStack Query + Zustand
- **Components:** Radix UI Primitives

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Participant dashboard
│   ├── judge/             # Judge portal
│   └── leaderboard/       # Public leaderboard
├── components/
│   ├── layouts/           # Page layouts
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase/          # Supabase clients & queries
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
├── types/
│   ├── database.ts        # Database types
│   └── index.ts           # Application types
└── supabase/
    └── schema.sql         # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/hackathon-platform.git
cd hackathon-platform
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Set up the database:**
- Create a new Supabase project
- Run the schema from `supabase/schema.sql`
- Enable Row Level Security policies

5. **Download fonts:**
The project uses custom fonts (Satoshi, Cabinet Grotesk, JetBrains Mono). 
Download them and place in `public/fonts/`.

6. **Start the development server:**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Colors
- **Primary:** Electric Cyan (#00E5FF)
- **Secondary/Accent:** Neon Orange (#FF6B35)
- **Background:** Deep Black (#0A0A0A)
- **Cards:** Charcoal (#1A1A1A)
- **Success:** Emerald (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Rose (#F43F5E)

### Typography
- **Display:** Cabinet Grotesk
- **Body:** Satoshi
- **Mono:** JetBrains Mono

### Components
19 premium UI components including:
- Button (7 variants, loading states)
- Input, Textarea, Select
- Card (6 variants, hover effects)
- Badge (11 color variants)
- Avatar with fallback
- Dialog & Modal
- Progress bars
- Tabs & Accordion
- File Upload with drag-and-drop
- Skeleton loaders
- Toast notifications

## 🔐 Authentication Flow

1. User registers with email/password or OAuth
2. Email verification (optional, configurable)
3. Complete profile in multi-step form
4. Join/create team with unique code
5. Access participant dashboard

### Roles
- **Participant:** Default role for hackathon attendees
- **Judge:** Access to judging portal (invite-only)
- **Admin:** Full event management access
- **Super Admin:** Multi-event management

## 📊 Database Schema

### Core Tables
- `events` - Hackathon event details
- `profiles` - User profiles
- `teams` - Team information
- `team_members` - Team membership
- `registrations` - Event registrations
- `projects` - Team project submissions
- `judges` - Judge assignments
- `scores` - Project scores
- `sponsors` - Event sponsors
- `activity_feed` - Real-time activity
- `announcements` - Admin announcements
- `feedback` - Post-event feedback

All tables have Row Level Security (RLS) policies enabled.

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📈 Roadmap

- [x] Core platform features
- [x] Registration system
- [x] Participant dashboard
- [x] Admin panel
- [x] Judging interface
- [x] Leaderboard
- [ ] Certificate generation
- [ ] Post-event surveys
- [ ] Photo gallery
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Slack/Discord integration

## 💰 Pricing Model

Target: $500-$3,000/year per school

| Tier | Price/Year | Features |
|------|------------|----------|
| **Starter** | $500 | 1 event, 200 participants, basic features |
| **Growth** | $1,200 | 3 events, 500 participants, analytics |
| **Enterprise** | $3,000 | Unlimited events, white-label, priority support |

## 📄 License

MIT License - feel free to use for your own hackathons!

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📧 Contact

Built with ❤️ by the 1337 Events team

- Email: hello@1337.events
- Twitter: [@1337events](https://twitter.com/1337events)
- Discord: [Join our community](https://discord.gg/1337events)

---

<p align="center">
  <strong>Build the Future of African Tech 🌍</strong>
</p>
