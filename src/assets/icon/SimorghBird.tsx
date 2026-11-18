import React from "react";

/*
 * طرح سیمرغ که هم آیکون ثابت (SimorghIcon) و هم لودر (SimorghLoader) از آن
 * استفاده می‌کنند. طرح را فقط اینجا تغییر دهید تا هر دو یکسان بمانند.
 * مختصات در viewBox ‎0 0 120 120 هستند. استایل‌های لازم برای ظاهر ثابت
 * به‌صورت attribute روی خود المان‌ها گذاشته شده تا بدون CSS هم درست دیده شود؛
 * انیمیشن‌ها فقط در CSS لودر تعریف می‌شوند.
 */

/* پرهای بال: زاویه (به سمت بالا) و مقیاس طول */
const FEATHERS = [
  { a: 64, s: 0.62 },
  { a: 46, s: 0.82 },
  { a: 28, s: 0.98 },
  { a: 10, s: 1 },
  { a: -8, s: 0.88 },
  { a: -24, s: 0.68 },
];
const COVERTS = [
  { a: 56, s: 0.46 },
  { a: 36, s: 0.55 },
  { a: 16, s: 0.58 },
  { a: -2, s: 0.55 },
  { a: -18, s: 0.45 },
];

const FEATHER_D = "M0 0C-8-5-24-6-40 1C-24 6-8 5 0 0Z";

const TAIL_STROKE = {
  fill: "none",
  strokeWidth: 3.2,
  strokeLinecap: "round",
} as const;
const SHORT_TAIL_STROKE = {
  ...TAIL_STROKE,
  strokeWidth: 1.8,
  opacity: 0.8,
} as const;
const CREST_STROKE = {
  fill: "none",
  strokeWidth: 1.7,
  strokeLinecap: "round",
} as const;

type Props = {
  /** پیشوند یکتا برای id گرادیان‌ها؛ هر SVG باید uid خودش را داشته باشد. */
  uid: string;
};

export const SimorghBird = ({ uid }: Props) => {
  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${id(n)})`;

  const wing = (side: "l" | "r") => {
    const x = side === "l" ? 54 : 66;
    const mirror = side === "l" ? "" : " scale(-1 1)";
    return (
      <g className={`s-wing s-wing-${side}`}>
        {FEATHERS.map((f, i) => (
          <path
            key={`f${i}`}
            d={FEATHER_D}
            fill={url("wing")}
            stroke={url("wingEdge")}
            strokeWidth="0.5"
            transform={`translate(${x} 52)${mirror} rotate(${f.a}) scale(${f.s})`}
          />
        ))}
        {COVERTS.map((f, i) => (
          <path
            key={`c${i}`}
            d={FEATHER_D}
            fill={url("covert")}
            opacity="0.92"
            transform={`translate(${x} 52)${mirror} rotate(${f.a}) scale(${f.s})`}
          />
        ))}
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={id("wing")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={id("wingEdge")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
        <linearGradient id={id("covert")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff5fa2" />
          <stop offset="100%" stopColor="#ffd86b" />
        </linearGradient>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient
          id={id("tail")}
          gradientUnits="userSpaceOnUse"
          x1="60"
          y1="76"
          x2="60"
          y2="108"
        >
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="45%" stopColor="#22d3ee" />
          <stop offset="80%" stopColor="#ff5fa2" />
          <stop offset="100%" stopColor="#ffd86b" />
        </linearGradient>
        <linearGradient
          id={id("crest")}
          gradientUnits="userSpaceOnUse"
          x1="60"
          y1="32"
          x2="60"
          y2="15"
        >
          <stop offset="0%" stopColor="#ffd86b" />
          <stop offset="100%" stopColor="#ff5fa2" />
        </linearGradient>
      </defs>

      <g className="s-bird">
        {/* دم */}
        <g className="s-tail s-tail-c">
          <path d="M60 76C54 88 66 96 60 106" stroke={url("tail")} {...TAIL_STROKE} />
          <circle cx="60" cy="108" r="2.6" fill="#ffd86b" />
          <circle cx="60" cy="108" r="1.1" fill="#6d28d9" />
        </g>
        <g className="s-tail s-tail-l">
          <path d="M59 76C52 86 46 92 47 102" stroke={url("tail")} {...TAIL_STROKE} />
          <circle cx="47" cy="104" r="2.2" fill="#ff5fa2" />
          <circle cx="47" cy="104" r="0.9" fill="#ffd86b" />
        </g>
        <g className="s-tail s-tail-r">
          <path d="M61 76C68 86 74 92 73 102" stroke={url("tail")} {...TAIL_STROKE} />
          <circle cx="73" cy="104" r="2.2" fill="#ff5fa2" />
          <circle cx="73" cy="104" r="0.9" fill="#ffd86b" />
        </g>
        <g className="s-tail s-tail-c s-tail-short">
          <path d="M59.5 76C56 84 54 90 53 97" stroke={url("tail")} {...SHORT_TAIL_STROKE} />
          <path d="M60.5 76C64 84 66 90 67 97" stroke={url("tail")} {...SHORT_TAIL_STROKE} />
        </g>

        {/* بال‌ها */}
        {wing("l")}
        {wing("r")}

        {/* بدن */}
        <path fill={url("body")} d="M60 40C69 46 70 64 60 78C50 64 51 46 60 40Z" />
        <path
          className="s-chest"
          d="M60 50C63 56 63 62 60 69"
          stroke="#e0f2fe"
          fill="none"
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.45}
        />

        {/* سر و تاج */}
        <path className="s-crest" d="M60 32C60 26 58 23 54 21" stroke={url("crest")} {...CREST_STROKE} />
        <path className="s-crest" d="M60 32C60 25 60 21 60 16" stroke={url("crest")} {...CREST_STROKE} />
        <path className="s-crest" d="M60 32C61 26 64 23 68 21" stroke={url("crest")} {...CREST_STROKE} />
        <circle cx="54" cy="21" r="1.4" fill="#ffd86b" />
        <circle cx="60" cy="15.5" r="1.5" fill="#ff5fa2" />
        <circle cx="68" cy="21" r="1.4" fill="#ffd86b" />

        <circle cx="60" cy="37" r="5.4" fill={url("body")} />
        <path d="M58.2 39.6 60 44l1.8-4.4z" fill="#ffd86b" />
        <g className="s-eyes">
          <circle cx="57.8" cy="36" r="1.15" fill="#fff" />
          <circle cx="62.2" cy="36" r="1.15" fill="#fff" />
          <circle cx="58" cy="36.1" r="0.55" fill="#1e1b4b" />
          <circle cx="62" cy="36.1" r="0.55" fill="#1e1b4b" />
        </g>
      </g>
    </>
  );
};
