import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';

export const metadata: Metadata = { title: 'Settings' };
export default function Page() {
  return (
    <div>
      <h2 className="font-display text-3xl">Change password</h2>
      <p className="mb-6 mt-1 text-sm text-steel">After changing it, your other devices are signed out.</p>
      <ChangePasswordForm />
    </div>
  );
}
