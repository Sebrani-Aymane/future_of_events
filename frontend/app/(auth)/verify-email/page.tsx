'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { AuthLayout } from '@/components/layouts';
import { resendVerificationEmail } from '@/lib/auth/actions';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(email);

  const handleResend = async () => {
    if (!resendEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);

    try {
      const result = await resendVerificationEmail(resendEmail);

      if (!result.success) {
        toast.error(result.error || 'Failed to resend verification email');
        setIsResending(false);
        return;
      }

      toast.success(result.message || 'Verification email sent!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      description="We've sent a verification link to your inbox"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Email Icon Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 2,
            }}
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Inbox className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center"
          >
            <Mail className="h-4 w-4 text-white" />
          </motion.div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Check your inbox</h3>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent a verification email to{' '}
          {email ? (
            <span className="text-foreground font-medium">{email}</span>
          ) : (
            'your email address'
          )}
          . Click the link in the email to verify your account.
        </p>

        {/* Email Tips */}
        <div className="mb-8 p-4 rounded-xl bg-charcoal border border-white/10 text-left">
          <h4 className="text-sm font-medium mb-3">Haven&apos;t received it?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              Make sure you entered the correct email
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              Wait a few minutes for the email to arrive
            </li>
          </ul>
        </div>

        {/* Resend Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              loading={isResending}
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? '' : 'mr-2'}`} />
              {!isResending && 'Resend'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your email and click resend to get a new verification link
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout
        title="Verify your email"
        description="We've sent a verification link to your inbox"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}