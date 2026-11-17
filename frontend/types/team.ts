export interface TeamMember {
  _id: string;
  name: string;
  /** Free text: Director, Founder, Sales Manager ... */
  designation: string;
  email: string;
  image: string;
  imagePublicId?: string;
  /** Display size of the photo in percent (50-500). Missing = 100. */
  imageScale?: number;
  /** Photo moved from the centre, in percent of its frame (-100..100). x: minus = left. y: minus = up. Missing = 0. */
  imagePosX?: number;
  imagePosY?: number;
  description: string;
  experience: string;
  additionalInfo: string;
  displayOrder: number;
  isVisible: boolean;
}

export const IMAGE_SCALE = { min: 50, max: 500, step: 5, base: 100 } as const;
export const imageScaleOf = (m: { imageScale?: number }) => { const n = Number(m.imageScale); return Number.isFinite(n) && n > 0 ? Math.min(IMAGE_SCALE.max, Math.max(IMAGE_SCALE.min, n)) : IMAGE_SCALE.base; };
export const IMAGE_POS = { min: -100, max: 100, step: 5 } as const;
export const imagePosOf = (v?: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(IMAGE_POS.max, Math.max(IMAGE_POS.min, n)) : 0; };
/**
 * Shows the photo at its saved size and position. Only a transform (move, then zoom about the centre), so the frame
 * and the card never change size and the photo keeps its proportions; whatever leaves the frame is clipped by it.
 */
export const imageStyle = (m: { imageScale?: number; imagePosX?: number; imagePosY?: number }) => {
  const s = imageScaleOf(m); const x = imagePosOf(m.imagePosX); const y = imagePosOf(m.imagePosY);
  if (s === IMAGE_SCALE.base && !x && !y) return undefined;
  return { transform: `translate(${x}%, ${y}%) scale(${s / 100})` };
};
