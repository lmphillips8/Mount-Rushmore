export default function Hero({
  color = "orange",
  eyebrow,
  title,
  subtitle,
  image,
}) {
  return (
    <div className={`hero hero-${color}`}>
      {eyebrow && <div className="hero-eyebrow">{eyebrow}</div>}

      {image && <img src="/header.webp" />}

      <h1 className="hero-title">{title}</h1>
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
    </div>
  );
}
