import {
  SiTwitch,
  SiInstagram,
  SiDiscord,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { rotationClass } from "../utils/colors";
import "../styles/components/SocialLinks.scss";
import { SOCIAL_LINKS } from "../constants";

export default function SocialLinks() {
  return (
    <div className="social-links">
      <h4>Follow RagerBrian!</h4>
      <div className="social-bubbles">
        {SOCIAL_LINKS.map(({ href, label, Icon, color }, i) => (
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
