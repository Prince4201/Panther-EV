import type { HeroData } from '@/types/hero';

// The four vehicle slides shown on the home hero, in order. Each is a transparent cut-out (fit: 'contain')
// that sits on the fixed golden-waterfront background. Admin > Hero Banners can replace these with other cut-outs;
// this list is used when the backend is unreachable or has no cut-out banners, so the homepage never renders empty.
const base = { fit: 'contain', textColor: 'light', textAlign: 'left', overlay: 0, bgColor: '#14151A', active: true, duration: null, description: '', button1Text: 'Explore Vehicle', button2Text: '', button2Url: '' } as const;

export const heroFallback: HeroData = {
  settings: { autoplay: true, duration: 3000, pauseOnHover: false, showIndicators: true, showArrows: false, transition: 'slide' },
  slides: [
    { ...base, _id: 'v1', order: 1, title: 'Panther XL Plus', subtitle: 'Built for every journey.', image: '/hero/panther-xl-plus.png', imageAlt: 'Blue Panther XL Plus electric rickshaw', button1Url: '/vehicles/panther-xl-plus' },
    { ...base, _id: 'v2', order: 2, title: 'Panther XL', subtitle: 'Power. Comfort. Reliability.', image: '/hero/panther-xl.png', imageAlt: 'Red Panther XL electric rickshaw with roof carrier', button1Url: '/vehicles/panther-xl' },
    { ...base, _id: 'v3', order: 3, title: 'Panther Super Deluxe', subtitle: 'Redefining everyday mobility.', image: '/hero/panther-super-deluxe.png', imageAlt: 'Yellow Panther Super Deluxe electric rickshaw', button1Url: '/vehicles/panther-super-deluxe' },
    { ...base, _id: 'v4', order: 4, title: 'Panther E-Rickshaw', subtitle: 'Smart mobility for a changing world.', image: '/hero/panther-e-rickshaw.png', imageAlt: 'Grey Panther Deluxe electric rickshaw', button1Url: '/vehicles' },
  ],
};
