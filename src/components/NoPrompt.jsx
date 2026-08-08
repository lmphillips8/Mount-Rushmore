import { Errors } from "../constants.js";
import { formatLongDate, todayEastern } from "../utils/date.js";
import Hero from "./Hero.jsx";
import SocialLinks from "./SocialLinks.jsx";
export default function NoPrompt({ color }) {
  return (
    <div className="page">
      <Hero
        color={color}
        eyebrow={formatLongDate(todayEastern())}
        title={Errors.noPrompt}
        image={true}
      />
      <SocialLinks />
    </div>
  );
}
