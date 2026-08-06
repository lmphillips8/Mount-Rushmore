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
      <span
        className="hero-dot"
        style={{ width: 8, height: 8, top: 14, left: 22 }}
      />
      <span
        className="hero-dot"
        style={{ width: 5, height: 5, top: 30, left: 40 }}
      />
      <span
        className="hero-dot"
        style={{ width: 6, height: 6, bottom: 22, right: 30 }}
      />
      <span
        className="hero-dot"
        style={{ width: 12, height: 12, bottom: 10, right: 55 }}
      />

      {image && <img src="/header.webp" />}

      <h1 className="hero-title">{title}</h1>
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
    </div>
  );
}
