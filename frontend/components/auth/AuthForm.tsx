'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  CheckCircle2,
  Crosshair,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
} from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { useAuth, type Account, type Role } from './AuthProvider';
import { INDIAN_STATES, getStateTheme } from '@/data/stateThemes';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number').or(z.literal('')),
  location: z.string().trim().min(2, 'Location is required. Click "Detect My Live Location" or enter your location.'),
  state: z.string().trim().min(2, 'Please select your state.'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type Values = {
  name?: string;
  email: string;
  phone?: string;
  location?: string;
  state?: string;
  city?: string;
  pincode?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
  password: string;
};

function resolveSafeRedirect(nextParam: string | null, role: Role): string {
  if (role !== 'user') return '/admin/dashboard';
  if (!nextParam) return '/account';
  if (!nextParam.startsWith('/') || nextParam.startsWith('//') || nextParam.startsWith('/\\')) {
    return '/account';
  }
  const cleanPath = nextParam.split('?')[0].toLowerCase();
  if (
    cleanPath === '/login' ||
    cleanPath === '/register' ||
    cleanPath === '/forgot-password' ||
    cleanPath === '/reset-password'
  ) {
    return '/account';
  }
  return nextParam;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-steel/50 transition-all focus:border-panther-red focus:outline-none focus:ring-4 focus:ring-panther-red/10';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const params = useSearchParams();
  const { account, role, loading, setAuth, refresh } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === 'login';

  // Live location detection state
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [detectedStateInfo, setDetectedStateInfo] = useState<{ state: string; pincode?: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as unknown as Resolver<Values>,
  });

  const selectedState = watch('state');

  useEffect(() => {
    if (!loading && account) {
      const nextParam = params.get('next');
      const target = resolveSafeRedirect(nextParam, role);
      router.replace(target);
    }
  }, [loading, account, role, params, router]);

  const handleDetectLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue('lat', latitude);
        setValue('lng', longitude);

        try {
          // Reverse-geocoding via BigDataCloud client API
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          const rawState = data.principalSubdivision || data.region || '';
          const city = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || '';
          const pincode = data.postcode || '';
          const detectedCountry = data.countryName || 'India';

          const matchedTheme = getStateTheme(rawState || city);
          const stateName = matchedTheme.id !== 'national' ? matchedTheme.name : rawState || 'Uttar Pradesh';

          const formattedText = [city, stateName, pincode ? `PIN: ${pincode}` : ''].filter(Boolean).join(', ');

          setValue('location', formattedText);
          setValue('state', stateName);
          setValue('city', city);
          setValue('pincode', pincode);
          setValue('country', detectedCountry);
          setDetectedStateInfo({ state: stateName, pincode });

          // Also sync country code to localStorage
          try {
            const countryCode = data.countryCode || 'IN';
            localStorage.setItem('panther-country', countryCode);
            window.dispatchEvent(new CustomEvent('panther:country', { detail: countryCode }));
          } catch { /* storage blocked */ }
        } catch {
          // Fallback if network blocked for reverse geocode
          const fallbackText = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setValue('location', fallbackText);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission was denied. Please pick your state from the dropdown below.');
        } else {
          setLocationError('Could not fetch GPS location. Please select your state below.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onSubmit = async (v: Values) => {
    setError('');
    try {
      const payload = isLogin ? v : { ...v, country: v.country || 'India' };
      const r = await api<{ role: 'super_admin' | 'admin' | 'user'; account: Account }>(
        isLogin ? '/auth/login' : '/auth/register',
        { method: 'POST', body: JSON.stringify(payload) }
      );
      setAuth(r.role, r.account);
      refresh().catch(() => null);
      const nextParam = params.get('next');
      const target = resolveSafeRedirect(nextParam, r.role);
      router.replace(target);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not sign in. Please try again.');
    }
  };

  const err = (m?: string) =>
    m ? (
      <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-panther-red">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{m}</span>
      </p>
    ) : null;

  return (
    <section className="relative flex min-h-[calc(100svh-72px)] items-center justify-center bg-[#F8F9FA] px-5 py-12 lg:min-h-[calc(100svh-80px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(228,32,43,0.04),transparent_60%)]"
      />

      <div className="relative w-full max-w-[460px] rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_50px_-15px_rgba(16,24,40,0.08)] sm:p-10">
        {/* Title & Subtitle */}
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {isLogin ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-2 text-sm text-steel">
          {isLogin
            ? 'Welcome back. Sign in to access your dashboard and enquiries.'
            : 'Register to unlock your personalized dashboard, subsidy quotes & bookings.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
                Full name <span className="text-panther-red">*</span>
              </label>
              <input
                id="name"
                placeholder="e.g. Ramesh Kumar"
                autoComplete="name"
                {...register('name')}
                className={inputClass}
              />
              {err(errors.name?.message)}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
              Email address <span className="text-panther-red">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="username"
              {...register('email')}
              className={inputClass}
            />
            {err(errors.email?.message)}
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
                Phone number <span className="font-normal lowercase text-steel">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                autoComplete="tel"
                {...register('phone')}
                className={inputClass}
              />
              {err(errors.phone?.message)}
            </div>
          )}

          {/* REQUIRED LOCATION & STATE (Register Mode) */}
          {!isLogin && (
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <label htmlFor="location" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal">
                  <MapPin className="h-3.5 w-3.5 text-panther-red" />
                  <span>Live Location <span className="text-panther-red">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-panther-red shadow-sm border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                  {locating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-3 w-3" />
                      <span>Detect My Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact Location Text with Pin */}
              <div className="relative">
                <input
                  id="location"
                  placeholder="Click 'Detect My Location' or type address/city..."
                  {...register('location')}
                  className={`${inputClass} bg-white text-xs sm:text-sm pl-10`}
                />
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-panther-red" />
              </div>
              {err(errors.location?.message)}

              {/* State Dropdown */}
              <div>
                <label htmlFor="state" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-steel">
                  State / Region <span className="text-panther-red">*</span>
                </label>
                <select
                  id="state"
                  {...register('state')}
                  className={`${inputClass} bg-white text-xs sm:text-sm cursor-pointer`}
                >
                  <option value="">-- Select your Indian State --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.icon} {st.name}
                    </option>
                  ))}
                </select>
                {err(errors.state?.message)}
              </div>

              {/* Success / Error indicators */}
              {detectedStateInfo && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Detected: <strong>{detectedStateInfo.state}</strong>
                    {detectedStateInfo.pincode ? ` (PIN ${detectedStateInfo.pincode})` : ''}
                  </span>
                </div>
              )}

              {locationError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  {locationError}
                </p>
              )}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Password <span className="text-panther-red">*</span>
              </label>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-panther-red transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                {...register('password')}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {err(errors.password?.message)}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-panther-red"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_20px_-2px_rgba(228,32,43,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-2px_rgba(228,32,43,0.65)] active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>{isLogin ? 'Signing in…' : 'Creating account…'}</span>
              </span>
            ) : isLogin ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Footer Switch Link */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-steel">
          {isLogin ? (
            <>
              New to Panther?{' '}
              <Link href="/register" className="font-bold text-panther-red hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-panther-red hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
