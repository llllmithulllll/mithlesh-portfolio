import type { LucideIcon } from 'lucide-react';
import { AtSign, Facebook, Github, Globe2, Instagram, Linkedin, Link2, Mail, MessageCircle, Music2, Phone, Send, Twitch, Youtube } from 'lucide-react';

export const socialIconOptions: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'whatsapp', label: 'WhatsApp · chat icon', icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'tiktok', label: 'TikTok · music icon', icon: Music2 },
  { id: 'twitch', label: 'Twitch', icon: Twitch },
  { id: 'website', label: 'Website', icon: Globe2 },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'threads', label: 'Threads · @ icon', icon: AtSign },
  { id: 'other', label: 'Other link', icon: Link2 },
];

export function inferSocialIcon(label: string, url = '') {
  const value = `${label} ${url}`.toLowerCase();
  if (value.includes('linkedin')) return 'linkedin';
  if (value.includes('github')) return 'github';
  if (value.includes('instagram')) return 'instagram';
  if (value.includes('facebook') || value.includes('fb.com')) return 'facebook';
  if (value.includes('youtube') || value.includes('youtu.be')) return 'youtube';
  if (value.includes('whatsapp') || value.includes('wa.me')) return 'whatsapp';
  if (value.includes('telegram') || value.includes('t.me')) return 'telegram';
  if (value.includes('tiktok')) return 'tiktok';
  if (value.includes('twitch')) return 'twitch';
  if (value.startsWith('mailto:') || value.includes('email')) return 'email';
  if (value.startsWith('tel:') || value.includes('phone')) return 'phone';
  if (value.includes('thread')) return 'threads';
  if (value.includes('http') || value.includes('website')) return 'website';
  return 'other';
}

export function getSocialIcon(icon: string | undefined, label: string, url = ''): LucideIcon {
  const id = socialIconOptions.some(option => option.id === icon) ? icon! : inferSocialIcon(label, url);
  return socialIconOptions.find(option => option.id === id)?.icon || Link2;
}
