import { Mail } from 'lucide-react';
import { imageStyle, type TeamMember } from '@/types/team';

/**
 * One person on the Our Teams page (also the live preview in Admin > Our Teams). Every field is optional, so each
 * line is only rendered when it has a value: there are never empty "Experience:" style labels.
 * The photo keeps its own proportions (object-contain), is shown at the size and position saved in Admin > Our Teams, and is clipped by its frame.
 */
export function TeamMemberCard({ member: m }: { member: TeamMember }) {
  const initials = m.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  return (
    <article className="flex h-full flex-col border border-line bg-white">
      <div data-photo-frame className="relative aspect-[4/5] w-full overflow-hidden bg-fog">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.image ? <img src={m.image} alt={m.name || m.designation || 'Team member'} loading="lazy" decoding="async" style={imageStyle(m)} draggable={false} className="h-full w-full object-contain" />
          : <span className="grid h-full w-full place-items-center font-display text-7xl text-steel/40" aria-hidden>{initials || 'P'}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {m.name && <h2 className="font-display text-3xl leading-none">{m.name}</h2>}
        {m.designation && <p className={`text-sm font-semibold uppercase tracking-wider text-panther-red ${m.name ? 'mt-2' : ''}`}>{m.designation}</p>}
        {m.description && <p className="mt-4 whitespace-pre-line text-sm text-steel">{m.description}</p>}
        {(m.experience || m.additionalInfo || m.email) && (
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            {m.experience && <div><dt className="text-xs font-semibold uppercase tracking-wider text-steel">Experience</dt><dd className="mt-0.5 font-semibold">{m.experience}</dd></div>}
            {m.additionalInfo && <div><dt className="sr-only">More</dt><dd className="whitespace-pre-line text-steel">{m.additionalInfo}</dd></div>}
            {m.email && <div><dt className="sr-only">Email</dt><dd><a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 break-all hover:text-panther-red"><Mail className="h-4 w-4 shrink-0" aria-hidden />{m.email}</a></dd></div>}
          </dl>
        )}
      </div>
    </article>
  );
}
