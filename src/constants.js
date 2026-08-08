import { SiTwitch, SiYoutube, SiDiscord, SiX } from "react-icons/si";

// Swap these placeholder URLs for your actual account links.
export const SOCIAL_LINKS = [
  {
    href: "https://twitch.tv/RagerBrian",
    label: "Twitch",
    Icon: SiTwitch,
    color: "#9146ff",
  },
  {
    href: "https://www.youtube.com/@RagerBrian",
    label: "YoutTube",
    Icon: SiYoutube,
    color: "#e44040",
  },
  {
    href: "https://discord.com/invite/G6ghbz3HuQ",
    label: "Discord",
    Icon: SiDiscord,
    color: "#5865f2",
  },
  {
    href: "https://x.com/RagerBrian_",
    label: "Twitter / X",
    Icon: SiX,
    color: "#111111",
  },
];

export const Errors = {
  noPrompt: "No Mount Rushmore set for today! Go bother Brian",
};
