'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { AuthLayout } from '@/components/layouts';
import { requestPasswordReset } from '@/lib/auth/actions';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(data.email);

      if (!result.success) {
        toast.error(result.error || 'Failed to send reset email');
        setIsSubmitting(false);
        return;
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success('Reset email sent!');
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        description="We've sent you a password reset link"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>

          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a password reset link to{' '}
            <span className="text-foreground font-medium">{submittedEmail}</span>.
            Please check your inbox and follow the instructions to reset your password.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setSubmittedEmail('');
              }}
              className="w-full"
            >
              Try again with a different email
            </Button>
          </div>

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

  return (
    <AuthLayout
      title="Forgot your password?"
      description="No worries, we'll send you reset instructions"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          size="lg"
          loading={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
          {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </motion.form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
