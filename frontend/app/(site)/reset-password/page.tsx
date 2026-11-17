import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Reset password', robots: { index: false }, referrer: 'no-referrer' };
export default function Page() { return <Suspense><ResetPasswordForm /></Suspense>; }
