import {
  SiTwitch,
  SiInstagram,
  SiDiscord,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { rotationClass } from "../utils/colors";
import "../styles/components/SocialLinks.scss";

const LINKS = [
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

export default function SocialLinks() {
  return (
    <div className="social-links">
      <h4>Follow RagerBrian!</h4>
      <div className="social-bubbles">
        {LINKS.map(({ href, label, Icon, color }, i) => (
          <div className={`icon-wrapper ${rotationClass(i)}`}>
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-bubble"
              style={{ "--bubble-color": color }}
              aria-label={label}
              title={label}
            >
              <Icon size={40} color={color} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
