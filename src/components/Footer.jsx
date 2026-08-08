import { SOCIAL_LINKS } from "../constants.js";
import "../styles/components/Footer.scss";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-socials">
        <p>RagerBrian Socials</p>
        {SOCIAL_LINKS.map(({ href, label, Icon, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
            style={{ "--bubble-color": color }}
            aria-label={label}
            title={label}
          >
            <Icon size={14} />
          </a>
        ))}
      </div>
      <div className="footer-credits">
        <p>{new Date().getFullYear()} - Mount Rushmore</p>
        <p>Brainchild of @latino_chill</p>
      </div>
      <div>
        <p>Site by @glutenfreeLP</p>
        <a href="https://buymeacoffee.com/glutenfeelp">Buy me a coffee!</a>
      </div>
    </footer>
  );
}
