# 🚀 Deployment Guide

This guide covers deploying the Hackathon Platform to production.

## Prerequisites

- A Vercel account (recommended) or other hosting provider
- A Supabase project
- Domain name (optional but recommended)

## 1. Supabase Setup

### Create a New Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings → API

### Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `databases/supabase/schema.sql`
3. Run the SQL to create all tables, functions, and policies

### Enable Authentication Providers

1. Go to Authentication → Providers
2. Enable Email/Password
3. (Optional) Enable GitHub OAuth:
   - Create a GitHub OAuth app at github.com/settings/developers
   - Add the Client ID and Secret
4. (Optional) Enable Google OAuth:
   - Create credentials at console.cloud.google.com
   - Add the Client ID and Secret

### Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize the confirmation, invitation, and magic link emails
3. Update the site URL to your production domain

### Set Up Storage Buckets

```sql
-- Run in SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('projects', 'projects', true),
  ('sponsors', 'sponsors', true);

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'projects', 'sponsors'));

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('avatars', 'projects'));
```

## 2. Environment Variables

Create a `.env.production` file or add these to your hosting provider:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Hackathon Platform"

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 3. Vercel Deployment

### Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Configure Build Settings

The default settings should work:
- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`

### Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all variables from your `.env.production`
3. Make sure to add them for Production, Preview, and Development

### Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site is live! 🎉

### Set Up Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Vercel)

## 4. Post-Deployment Checklist

### Security

- [ ] Verify RLS policies are working
- [ ] Test authentication flows
- [ ] Check API endpoints are protected
- [ ] Review CORS settings in Supabase

### Performance

- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN caching headers
- [ ] Test Core Web Vitals

### SEO

- [ ] Update meta tags with production URL
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Open Graph images
- [ ] Configure robots.txt

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure Supabase alerts
- [ ] Enable Vercel deployment notifications
- [ ] Set up log aggregation

## 5. Scaling Considerations

### Database

- Enable connection pooling in Supabase
- Set up database replicas for read-heavy workloads
- Configure proper indexes

### Caching

- Use Vercel Edge Config for feature flags
- Implement Redis for session storage
- Enable ISR for static pages

### CDN

- Configure image optimization
- Set up asset caching
- Use Vercel Edge Functions for geo-routing

## 6. Maintenance

### Regular Tasks

- Monitor Supabase usage and costs
- Review and rotate API keys quarterly
- Update dependencies monthly
- Run security audits

### Backup Strategy

- Enable Supabase automatic backups
- Set up point-in-time recovery
- Test restore procedures regularly

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Database Connection Issues

1. Check Supabase status page
2. Verify environment variables
3. Check connection pooling limits

### Authentication Problems

1. Verify redirect URLs in Supabase
2. Check cookie settings
3. Review CORS configuration

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- This project: Create an issue on GitHub
