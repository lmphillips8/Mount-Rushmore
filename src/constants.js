import { SiTwitch, SiInstagram, SiDiscord, SiX } from "react-icons/si";

// Swap these placeholder URLs for your actual account links.
export const SOCIAL_LINKS = [
  {
    href: "https://twitch.tv/your-channel",
    label: "Twitch",
    Icon: SiTwitch,
    color: "#9146ff",
  },
  {
    href: "https://instagram.com/your-handle",
    label: "Instagram",
    Icon: SiInstagram,
    color: "#e4405f",
  },
  {
    href: "https://discord.gg/your-invite",
    label: "Discord",
    Icon: SiDiscord,
    color: "#5865f2",
  },
  {
    href: "https://x.com/your-handle",
    label: "Twitter / X",
    Icon: SiX,
    color: "#111111",
  },
];

export const Errors = {
  noPrompt: "No Mount Rushmore set for today! Go bother Brian",
};
