'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Lock,
  Users,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  UserPlus,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  NativeSelect,
  Checkbox,
  Badge,
  Card,
} from '@/components/ui';
import { AuthLayout } from '@/components/layouts';
import { signUp, signInWithOAuth } from '@/lib/auth/actions';
import { toast } from 'sonner';

// Form schemas
const step1Schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  displayName: z.string().optional(),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
});

const step3Schema = z.object({
  occupation: z.enum(['student', 'professional', 'freelancer', 'other']),
  school: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
});

const step4Schema = z.object({
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  dietaryRestrictions: z.string().optional(),
  tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  teamPreference: z.enum(['have_team', 'looking', 'either']),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
  agreeToCodeOfConduct: z.literal(true, { errorMap: () => ({ message: 'You must agree to the code of conduct' }) }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Django', 'FastAPI',
  'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Machine Learning', 'Data Science', 'AI/LLM', 'Computer Vision',
  'Mobile (React Native)', 'Mobile (Flutter)', 'iOS', 'Android',
  'UI/UX Design', 'DevOps', 'Blockchain', 'IoT',
];

const steps = [
  { id: 1, title: 'Account', icon: Lock },
  { id: 2, title: 'Profile', icon: User },
  { id: 3, title: 'Experience', icon: Briefcase },
  { id: 4, title: 'Final', icon: Check },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStep1Submit = (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    goToNextStep();
  };

  const handleStep2Submit = (data: Step2Data) => {
    setFormData({ ...formData, ...data });
    goToNextStep();
  };

  const handleStep3Submit = (data: Step3Data) => {
    setFormData({ ...formData, ...data, skills: selectedSkills });
    goToNextStep();
  };

  const handleStep4Submit = async (data: Step4Data) => {
    setIsSubmitting(true);
    const finalData = { ...formData, ...data };
    
    try {
      // Create the full name from first and last name
      const fullName = `${finalData.firstName} ${finalData.lastName}`.trim();
      
      const result = await signUp({
        email: finalData.email!,
        password: finalData.password!,
        fullName,
        metadata: {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          displayName: finalData.displayName,
          bio: finalData.bio,
          occupation: finalData.occupation,
          school: finalData.school,
          company: finalData.company,
          role: finalData.role,
          experienceLevel: finalData.experienceLevel,
          skills: selectedSkills,
          github: finalData.github,
          linkedin: finalData.linkedin,
          portfolio: finalData.portfolio,
          tshirtSize: finalData.tshirtSize,
          dietaryRestrictions: finalData.dietaryRestrictions,
          teamPreference: finalData.teamPreference,
        },
      });

      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        setIsSubmitting(false);
        return;
      }

      toast.success(result.message || 'Registration successful!');
      
      if (result.redirectTo) {
        router.push(result.redirectTo as any);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);

    try {
      const result = await signInWithOAuth(provider);

      if ('error' in result) {
        toast.error(result.error);
        setOauthLoading(null);
        return;
      }

      // Redirect to OAuth provider
      window.location.href = result.url;
    } catch (error) {
      toast.error('Failed to initiate OAuth sign up');
      setOauthLoading(null);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join the hackathon and start building"
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                  ${currentStep >= step.id
                    ? 'bg-primary text-deep-black'
                    : 'bg-charcoal text-muted-foreground border border-white/10'
                  }
                  ${currentStep === step.id && 'ring-4 ring-primary/20'}
                `}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-12 lg:w-20 h-1 mx-2 rounded-full transition-all duration-300
                    ${currentStep > step.id ? 'bg-primary' : 'bg-charcoal'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-xs ${
                currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1Form
            key="step1"
            defaultValues={formData}
            onSubmit={handleStep1Submit}
            onOAuthSignUp={handleOAuthSignUp}
            oauthLoading={oauthLoading}
          />
        )}
        {currentStep === 2 && (
          <Step2Form
            key="step2"
            defaultValues={formData}
            onSubmit={handleStep2Submit}
            onBack={goToPrevStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Form
            key="step3"
            defaultValues={formData}
            selectedSkills={selectedSkills}
            onToggleSkill={toggleSkill}
            onSubmit={handleStep3Submit}
            onBack={goToPrevStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Form
            key="step4"
            defaultValues={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleStep4Submit}
            onBack={goToPrevStep}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// Step 1: Account Credentials
function Step1Form({
  defaultValues,
  onSubmit,
  onOAuthSignUp,
  oauthLoading,
}: {
  defaultValues: Partial<Step1Data>;
  onSubmit: (data: Step1Data) => void;
  onOAuthSignUp: (provider: 'github' | 'google') => void;
  oauthLoading: 'github' | 'google' | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="h-5 w-5" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="h-5 w-5" />}
        helperText="At least 8 characters"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="h-5 w-5" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-deep-black px-4 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onOAuthSignUp('github')}
          loading={oauthLoading === 'github'}
          disabled={oauthLoading !== null}
        >
          <Github className="mr-2 h-5 w-5" />
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onOAuthSignUp('google')}
          loading={oauthLoading === 'google'}
          disabled={oauthLoading !== null}
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

      <Button
        type="submit"
        variant="gradient"
        className="w-full"
        size="lg"
        disabled={oauthLoading !== null}
      >
        Continue
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.form>
  );
}

// Step 2: Profile Information
function Step2Form({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: Partial<Step2Data>;
  onSubmit: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Display Name"
        placeholder="johndoe"
        helperText="This is how others will see you"
        error={errors.displayName?.message}
        {...register('displayName')}
      />

      <Textarea
        label="Bio"
        placeholder="Tell us a bit about yourself..."
        maxLength={300}
        showCount
        rows={4}
        error={errors.bio?.message}
        {...register('bio')}
      />

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button type="submit" variant="gradient" className="flex-1">
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.form>
  );
}

// Step 3: Experience & Skills
function Step3Form({
  defaultValues,
  selectedSkills,
  onToggleSkill,
  onSubmit,
  onBack,
}: {
  defaultValues: Partial<Step3Data>;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { ...defaultValues, skills: selectedSkills },
  });

  const occupation = watch('occupation');

  const handleFormSubmit = (data: Step3Data) => {
    onSubmit({ ...data, skills: selectedSkills });
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <NativeSelect
        label="Occupation"
        error={errors.occupation?.message}
        {...register('occupation')}
      >
        <option value="">Select your occupation</option>
        <option value="student">Student</option>
        <option value="professional">Professional</option>
        <option value="freelancer">Freelancer</option>
        <option value="other">Other</option>
      </NativeSelect>

      {occupation === 'student' && (
        <Input
          label="School / University"
          placeholder="1337 Coding School"
          leftIcon={<GraduationCap className="h-5 w-5" />}
          {...register('school')}
        />
      )}

      {(occupation === 'professional' || occupation === 'freelancer') && (
        <>
          <Input
            label="Company"
            placeholder="Tech Corp"
            leftIcon={<Briefcase className="h-5 w-5" />}
            {...register('company')}
          />
          <Input
            label="Role"
            placeholder="Software Engineer"
            {...register('role')}
          />
        </>
      )}

      <NativeSelect
        label="Experience Level"
        error={errors.experienceLevel?.message}
        {...register('experienceLevel')}
      >
        <option value="">Select your level</option>
        <option value="beginner">Beginner (0-1 years)</option>
        <option value="intermediate">Intermediate (1-3 years)</option>
        <option value="advanced">Advanced (3-5 years)</option>
        <option value="expert">Expert (5+ years)</option>
      </NativeSelect>

      <div>
        <label className="block text-sm font-medium mb-3">
          Skills
          <span className="text-muted-foreground ml-2">
            ({selectedSkills.length} selected)
          </span>
        </label>
        <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-charcoal border border-white/10 max-h-48 overflow-y-auto">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onToggleSkill(skill)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedSkills.includes(skill)
                  ? 'bg-primary text-deep-black'
                  : 'bg-charcoal-50 text-muted-foreground hover:bg-charcoal-100'
                }
              `}
            >
              {skill}
            </button>
          ))}
        </div>
        {errors.skills && (
          <p className="mt-2 text-sm text-destructive">{errors.skills.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          variant="gradient"
          className="flex-1"
          disabled={selectedSkills.length === 0}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.form>
  );
}

// Step 4: Final Details
function Step4Form({
  defaultValues,
  isSubmitting,
  onSubmit,
  onBack,
}: {
  defaultValues: Partial<Step4Data>;
  isSubmitting: boolean;
  onSubmit: (data: Step4Data) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues,
  });

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Social Links (Optional)</p>
        <Input
          label="GitHub"
          placeholder="https://github.com/username"
          leftIcon={<Github className="h-5 w-5" />}
          error={errors.github?.message}
          {...register('github')}
        />
        <Input
          label="LinkedIn"
          placeholder="https://linkedin.com/in/username"
          leftIcon={<Linkedin className="h-5 w-5" />}
          error={errors.linkedin?.message}
          {...register('linkedin')}
        />
        <Input
          label="Portfolio"
          placeholder="https://yourportfolio.com"
          leftIcon={<Globe className="h-5 w-5" />}
          error={errors.portfolio?.message}
          {...register('portfolio')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NativeSelect
          label="T-Shirt Size"
          error={errors.tshirtSize?.message}
          {...register('tshirtSize')}
        >
          <option value="">Select size</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </NativeSelect>

        <NativeSelect
          label="Team Preference"
          error={errors.teamPreference?.message}
          {...register('teamPreference')}
        >
          <option value="">Select preference</option>
          <option value="have_team">I have a team</option>
          <option value="looking">Looking for team</option>
          <option value="either">Either is fine</option>
        </NativeSelect>
      </div>

      <Input
        label="Dietary Restrictions"
        placeholder="Vegetarian, Vegan, Allergies, etc."
        helperText="Optional - helps us prepare meals"
        {...register('dietaryRestrictions')}
      />

      <div className="space-y-4 p-4 rounded-xl bg-charcoal border border-white/10">
        <div>
          <Checkbox
            label="I agree to the Terms of Service"
            error={errors.agreeToTerms?.message}
            {...register('agreeToTerms')}
          />
          <p className="mt-1 ml-7 text-xs text-muted-foreground">
            Read our{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>
          </p>
        </div>

        <div>
          <Checkbox
            label="I agree to the Code of Conduct"
            error={errors.agreeToCodeOfConduct?.message}
            {...register('agreeToCodeOfConduct')}
          />
          <p className="mt-1 ml-7 text-xs text-muted-foreground">
            Read our{' '}
            <a href="/conduct" className="text-primary hover:underline">
              Code of Conduct
            </a>
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          variant="gradient"
          className="flex-1"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          {!isSubmitting && <Sparkles className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </motion.form>
  );
}
