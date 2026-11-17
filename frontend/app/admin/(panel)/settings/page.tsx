'use client';
import { useAdmin } from '@/components/admin/AdminContext';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { HeroSettingsPanel } from '@/components/admin/HeroSettingsPanel';
import { PageTitle } from '@/components/admin/ui';

export default function SettingsPage() {
  const { can } = useAdmin();
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <PageTitle title="Settings" />
      <section><h2 className="font-display text-3xl">Change password</h2><p className="mb-6 mt-1 text-sm text-steel">Your other devices are signed out after you change it.</p><ChangePasswordForm /></section>
      {can('settings.manage') && <HeroSettingsPanel />}
    </div>
  );
}
