import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  DollarSign,
  Globe,
  Link2,
  MapPin,
  Megaphone,
  Repeat,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import type { TrainingIconId } from "@/config/training-content";

export const TRAINING_ICONS: Record<TrainingIconId, LucideIcon> = {
  mapPin: MapPin,
  link2: Link2,
  rocket: Rocket,
  globe: Globe,
  wifi: Wifi,
  activity: Activity,
  wallet: Wallet,
  shieldCheck: ShieldCheck,
  repeat: Repeat,
  megaphone: Megaphone,
  target: Target,
  dollarSign: DollarSign,
  star: Star,
  zap: Zap,
  sparkles: Sparkles,
  bookOpen: BookOpen,
};

export function TrainingIcon({
  id,
  size = 16,
  className,
}: {
  id: TrainingIconId;
  size?: number;
  className?: string;
}) {
  const Icon = TRAINING_ICONS[id];
  return <Icon size={size} className={className} />;
}
