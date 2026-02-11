'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Github,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button, Input, Checkbox } from '@/components/ui';
import { AuthLayout } from '@/components/layouts';
import { signIn, signInWithOAuth } from '@/lib/auth/actions';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const error = searchParams.get('error');
  const verified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Show toast for URL params
  useEffect(() => {
    if (error === 'auth_callback_error') {
      toast.error('Authentication failed. Please try again.');
    }
    if (verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
    }
  }, [error, verified]);

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);

    try {
      const result = await signIn(data.email, data.password, redirectTo);

      if (!result.success) {
        toast.error(result.error || 'Sign in failed');
        setIsSubmitting(false);
        return;
      }

      toast.success('Signed in successfully!');
      router.push(result.redirectTo || '/dashboard' as any);
      router.refresh();
    } catch (err) {
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);

    try {
      const result = await signInWithOAuth(provider, redirectTo);

      if ('error' in result) {
        toast.error(result.error);
        setOauthLoading(null);
        return;
      }

      // Redirect to OAuth provider
      window.location.href = result.url;
    } catch (err) {
      toast.error('Failed to initiate OAuth sign in');
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">
            {error === 'auth_callback_error'
              ? 'Authentication failed. Please try again.'
              : 'An error occurred. Please try again.'}
          </p>
        </motion.div>
      )}

      {/* Success Alert */}
      {verified === 'true' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
          <p className="text-sm text-success">
            Email verified successfully! You can now sign in.
          </p>
        </motion.div>
      )}

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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            {...register('rememberMe')}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || oauthLoading !== null}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
          {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-deep-black px-4 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('github')}
            loading={oauthLoading === 'github'}
            disabled={isSubmitting || oauthLoading !== null}
          >
            <Github className="mr-2 h-5 w-5" />
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('google')}
            loading={oauthLoading === 'google'}
            disabled={isSubmitting || oauthLoading !== null}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>
      </motion.form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>

      {/* Judge/Admin Links */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-muted-foreground text-center mb-3">
          Are you a judge or organizer?
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/judge/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Judge Portal
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/admin/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
