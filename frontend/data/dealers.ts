// Only the address Panther publishes is listed. Add dealers from Admin (Phase 4) or append here; search and the page pick them up.
export interface Dealer {
  id: string; name: string; type: 'Head office' | 'Dealer' | 'Service centre';
  address: string; city: string; state: string; pincode: string; phone?: string; email?: string; hours?: string;
}
export const dealers: Dealer[] = [
  { id: 'meerut-hq', name: 'Panther Electric Vehicles', type: 'Head office', address: '164, Mohkampur, Near Amar Ujala', city: 'Meerut', state: 'Uttar Pradesh', pincode: '250002', phone: '+91 7599117599', email: 'sales@pantherev.com' },
];
export const mapsUrl = (d: Dealer) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.address}, ${d.city}, ${d.state} ${d.pincode}`)}`;
