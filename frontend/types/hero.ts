export interface HeroSlideData {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  /** "cover" = full-bleed photo, "contain" = vehicle cut-out on a plain colour. */
  fit: 'cover' | 'contain';
  bgColor: string;
  textColor: 'dark' | 'light';
  textAlign: 'left' | 'center' | 'right';
  overlay: number;
  button1Text: string;
  button1Url: string;
  button2Text: string;
  button2Url: string;
  order: number;
  active: boolean;
  /** milliseconds; null = use the default from settings */
  duration: number | null;
}

export interface HeroSettings {
  autoplay: boolean;
  duration: number;
  pauseOnHover: boolean;
  showIndicators: boolean;
  showArrows: boolean;
  transition: 'fade' | 'slide';
}

export interface HeroData { slides: HeroSlideData[]; settings: HeroSettings }
