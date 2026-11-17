// Contact details as published on pantherev.com. Confirm the phone number with Panther before launch:
// the live site shows +91 7599117599 in the footer but links the contact page to a different number.
export const site = {
  name: 'Panther Electric Vehicles',
  short: 'Panther EV',
  url: 'https://pantherev.com',
  address: ['164, Mohkampur, Near Amar Ujala', 'Meerut, Uttar Pradesh – 250002', 'India'],
  email: 'panthererickshaw1@gmail.com',
  phone: '+91 7599117599',
  phoneHref: 'tel:+917599117599',
  social: [
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/panther.e.rickshaw/' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/panthererickshaw?igsh=emlxdHF5b213cnF3' },
    { key: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/917599117599' },
    { key: 'youtube', label: 'YouTube', href: 'https://youtube.com/@panthererickshaw9264?si=_2ELtVAXiP_vJnkE' },
  ],
  stats: { vehicles: 80000, years: 10, since: 2014 },
};

export const whyPanther = [
  { title: 'Proven reliability', body: '10+ years of trusted performance and durability in the toughest Indian environments.', model: 'panther-xl-plus' },
  { title: 'Low maintenance', body: 'Designed to minimise service needs and costs, so your vehicle stays on the road longer.', model: 'panther-deluxe' },
  { title: 'Built for tough roads', body: 'Heavy-duty chassis and advanced suspension designed for any terrain or heavy load.', model: 'panther-cargo' },
  { title: 'Efficient power', body: 'Optimised for maximum range and profitability with high-density Li-Ion technology.', model: 'panther-super-deluxe' },
];

export const journey = [
  { year: '2014', title: 'Panther established', body: 'First e-rickshaw launched, pioneering clean mobility.', tag: 'Foundation' },
  { year: '2018', title: 'Production expansion', body: 'Expanded production to include heavy-duty cargo vehicles.', tag: 'Growth' },
  { year: '2022', title: 'Li-Ion revolution', body: 'Introduced advanced Li-Ion battery technology for longer life cycles.', tag: 'Innovation' },
  { year: '2025', title: 'Global footprint', body: 'Reached 80,000+ vehicles on Indian roads.', tag: 'Milestone' },
];

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Vehicles', href: '/vehicles', mega: true },
  { label: 'Why Panther', href: '/#why-panther' },
  { label: 'Technology', href: '/#technology' },
  { label: 'Services', href: '/services' },
  { label: 'Dealership', href: '/dealership' },
  { label: 'Company', href: '/company' },
  { label: 'Finance', href: '/finance' },
  { label: 'Our Teams', href: '/our-teams' },
  { label: 'Contact', href: '/contact' },
];
