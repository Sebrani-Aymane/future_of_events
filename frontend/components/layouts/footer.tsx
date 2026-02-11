'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Heart,
  ExternalLink,
} from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Event',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Schedule', href: '#schedule' },
      { label: 'Prizes', href: '#prizes' },
      { label: 'Sponsors', href: '#sponsors' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Participants',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Login', href: '/login' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Rules & Guidelines', href: '/rules' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs', external: true },
      { label: 'API Reference', href: '/api-docs', external: true },
      { label: 'Design Kit', href: '/design-kit', external: true },
      { label: 'Past Events', href: '/past-events' },
      { label: 'Blog', href: '/blog', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Code of Conduct', href: '/conduct' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'GitHub', href: 'https://github.com', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

interface FooterProps {
  eventName?: string;
  organizerName?: string;
  organizerLogo?: string;
  showNewsletter?: boolean;
}

export function Footer({
  eventName = 'hackathon 2026',
  organizerName = '1337 Coding School',
  showNewsletter = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-foreground/[0.06]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom">
        {/* Newsletter Section */}
        {showNewsletter && (
          <div className="py-12 border-b border-foreground/[0.06]">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Stay Updated
                </h3>
                <p className="text-foreground/50">
                  Get notified about future hackathons, workshops, and tech events.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-base flex-1"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition-all duration-300"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-foreground/40">
                  No spam, unsubscribe at any time.
                </p>
              </motion.div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl leading-tight text-foreground">
                  HACKATHON
                </span>
                <span className="text-xs text-foreground/40 font-mono">
                  1337.EVENTS
                </span>
              </div>
            </Link>

            <p className="mt-6 text-foreground/50 text-sm max-w-xs">
              Building the future of African tech, one hackathon at a time.
              Join thousands of developers creating innovative solutions.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-foreground/5 text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <a
                href="mailto:hello@1337.events"
                className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@1337.events
              </a>
              <div className="flex items-center gap-2 text-sm text-foreground/50">
                <MapPin className="h-4 w-4" />
                Benguerir, Morocco
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-foreground/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-foreground/40">
              <span>© {currentYear} {eventName}.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-foreground/40">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-foreground/60" />
              <span>by</span>
              <a
                href="https://1337.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                {organizerName}
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-foreground/40">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/conduct" className="hover:text-foreground transition-colors">
                Conduct
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
