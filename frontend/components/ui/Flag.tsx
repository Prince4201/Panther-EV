/** Inline SVG flags. Emoji flags show as letters ("IN") on Windows, so they are drawn instead. */
export function Flag({ code, className = 'h-4 w-6' }: { code: string; className?: string }) {
  const common = { viewBox: '0 0 60 40', className: `${className} shrink-0 rounded-[2px] ring-1 ring-black/10`, 'aria-hidden': true as const, preserveAspectRatio: 'none' };
  switch (code) {
    case 'IN': return (<svg {...common}><rect width="60" height="13.4" fill="#FF9933" /><rect y="13.3" width="60" height="13.4" fill="#fff" /><rect y="26.6" width="60" height="13.4" fill="#138808" /><circle cx="30" cy="20" r="5" fill="none" stroke="#000080" strokeWidth="1.6" /><circle cx="30" cy="20" r="1.1" fill="#000080" /></svg>);
    case 'DE': return (<svg {...common}><rect width="60" height="13.4" fill="#000" /><rect y="13.3" width="60" height="13.4" fill="#DD0000" /><rect y="26.6" width="60" height="13.4" fill="#FFCE00" /></svg>);
    case 'US': return (<svg {...common}><rect width="60" height="40" fill="#fff" />{[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} y={(i * 40) / 13} width="60" height={40 / 13} fill="#B22234" />)}<rect width="26" height="21.5" fill="#3C3B6E" /></svg>);
    case 'GB': return (<svg {...common}><rect width="60" height="40" fill="#012169" /><path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="7" /><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="2.4" /><path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="12" /><path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="7" /></svg>);
    case 'AE': return (<svg {...common}><rect width="60" height="13.4" fill="#00732F" /><rect y="13.3" width="60" height="13.4" fill="#fff" /><rect y="26.6" width="60" height="13.4" fill="#000" /><rect width="15" height="40" fill="#FF0000" /></svg>);
    default: return (<svg {...common}><rect width="60" height="40" fill="#E3E5E8" /></svg>);
  }
}
