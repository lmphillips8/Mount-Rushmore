import { useState } from "react";
import { todayEastern, formatLongDate } from "../utils/date";
import { Share2, Check } from "lucide-react";
import { useToday } from "../context/useToday";
import "../styles/components/Share.scss";

export default function ShareTemplate({ prompt, answers }) {
  const [copied, setCopied] = useState(false);

  const template = [
    `${formatLongDate(todayEastern())}`,
    `${prompt?.emoji ?? ""} Mount Rushmore of: ${prompt?.text}`.trim(),
    ...answers.map((a, i) => `🗿 ${a}`),
    "\n",
    `Create your own Mount Rushmore! https://www.rbrushmore.com`,
  ].join("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? (
        <>
          <Check size={12} /> Copied!
        </>
      ) : (
        <>
          <Share2 size={12} /> Share
        </>
      )}
    </button>
  );
}
