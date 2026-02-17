
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface SocialLink {
  platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin' | 'email';
  url: string;
}

export interface ProfileData {
  name: string;
  bio: string;
  avatarUrl: string;
  links: LinkItem[];
  socials: SocialLink[];
  paypalMe?: string;
  theme: 'minimal' | 'gradient' | 'glass' | 'dark' | 'passion';
}
