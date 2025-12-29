import {
  FaSpotify,
  FaApple,
  FaYoutube,
  FaAmazon,
  FaSoundcloud,
  FaTiktok,
  FaDeezer,
} from "react-icons/fa";

import type { Database } from "./supabase/Database";

import {
  SiYoutubemusic,
  SiPandora,
  SiTidal,
} from "react-icons/si";

import { type IconType } from "react-icons/lib";

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];

// export type StreamingPlatform =
//   | "spotify"
//   | "apple_music"
//   | "youtube"
//   | "youtube_music"
//   | "amazon_music"
//   | "soundcloud"
//   | "deezer"
//   | "tidal"
//   | "pandora"
//   | "tiktok";

type Props = {
  platform:StreamingPlatform
  size?: number;
  color?: string;
};

const ICONS: Partial<Record<StreamingPlatform, IconType>> = {
  spotify: FaSpotify,
  apple_music: FaApple,
  youtube: FaYoutube,
  youtube_music: SiYoutubemusic,
  amazon_music: FaAmazon,
  soundcloud: FaSoundcloud,
  deezer: FaDeezer,
  tidal: SiTidal,
  pandora: SiPandora,
  tiktok: FaTiktok,
};

export default function StreamingIcon({
  platform,
  size = 22,
  color = "currentColor",
}: Props) {
  const Icon = ICONS[platform];

  if (!Icon) return null;

  return <Icon size={size} color={color} />;
}
