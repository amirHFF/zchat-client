import React, { useId } from "react";
import "./style.css";

type Props = {
  size?: number;
  label?: string;
  showLabel?: boolean;
  fullscreen?: boolean;
};

export const SimorghLoader = ({
  size = 64,
  label = "در حال بارگذاری…",
  showLabel = false,
  fullscreen = false,
}: Props) => {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${id(n)})`;

  const loader = (
    <div className="simorgh-loader" role="status" aria-live="polite">
      <svg
        viewBox="0 0 24 24"
        className="simorgh-icon simorgh-loader-svg"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <defs>
          {/* حلقهٔ بیرونی: طلایی → فیروزه‌ای */}
          <linearGradient id={id("outer")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0b85c" />
            <stop offset="50%" stopColor="#f1e3b4" />
            <stop offset="100%" stopColor="#3fb5ae" />
          </linearGradient>
          {/* حلقهٔ داخلی: طلایی */}
          <linearGradient id={id("inner")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5dc92" />
            <stop offset="50%" stopColor="#c9972f" />
            <stop offset="100%" stopColor="#f0cf7a" />
          </linearGradient>
          {/* بال‌ها و بدن: آبی تیره → فیروزه‌ای */}
          <linearGradient
            id={id("wingL")}
            gradientUnits="userSpaceOnUse"
            x1="12"
            y1="11"
            x2="4"
            y2="3"
          >
            <stop offset="0%" stopColor="#0e4a96" />
            <stop offset="100%" stopColor="#25b5c4" />
          </linearGradient>
          <linearGradient
            id={id("wingR")}
            gradientUnits="userSpaceOnUse"
            x1="12"
            y1="11"
            x2="20"
            y2="3"
          >
            <stop offset="0%" stopColor="#0e4a96" />
            <stop offset="100%" stopColor="#25b5c4" />
          </linearGradient>
          <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2aa9c4" />
            <stop offset="100%" stopColor="#0c4a8f" />
          </linearGradient>
          {/* دم: فیروزه‌ای → طلایی */}
          <linearGradient
            id={id("tail")}
            gradientUnits="userSpaceOnUse"
            x1="11"
            y1="14"
            x2="21"
            y2="21"
          >
            <stop offset="0%" stopColor="#1f9fc0" />
            <stop offset="65%" stopColor="#4fd1c5" />
            <stop offset="100%" stopColor="#e9c46a" />
          </linearGradient>
        </defs>

        {/* حلقهٔ بیرونی (جدید) */}
        <circle
          className="s-ring-outer"
          cx="12"
          cy="12"
          r="11.2"
          stroke={url("outer")}
        />
        <circle
          className="s-ring-outer-spin"
          cx="12"
          cy="12"
          r="11.2"
          stroke={url("outer")}
        />

        {/* حلقهٔ داخلی (قبلی) */}
        <circle
          className="s-ring-track"
          cx="12"
          cy="12"
          r="9.3"
          stroke={url("inner")}
        />
        <circle
          className="s-ring-spin"
          cx="12"
          cy="12"
          r="9.3"
          stroke={url("inner")}
        />

        <g className="s-bird">
          <path
            className="s-tail s-tail-glow"
            d="M11.4 14.4C11.6 17.5 14 19.6 17 19.2c1.6-.2 2.8.6 3.5 1.8"
            stroke={url("tail")}
          />
          <path
            fill={url("body")}
            d="M11 14.2c-1 2.3-2.5 3.6-4.2 4.2 2 .4 3.8-.4 4.8-2z"
          />
          <path
            className="s-wing s-wing-left"
            fill={url("wingL")}
            d="M11.6 10.4C8.8 10 5.8 7.6 4 3.5l2 1.7.2-2.6 1.6 2.4.6-2.2 1 2.8c.7 1.8 1.5 3 2.4 3.6z"
          />
          <path
            className="s-wing s-wing-right"
            fill={url("wingR")}
            d="M12.4 10.4c2.8-.4 5.8-2.8 7.6-6.9l-2 1.7-.2-2.6-1.6 2.4-.6-2.2-1 2.8c-.7 1.8-1.5 3-2.4 3.6z"
          />
          <path
            fill={url("body")}
            d="M12 9c1.6.3 2.2 2 1.6 3.8-.6 1.6-2 2.2-2.8 1.8-.4-1.6-.2-3.8 1.2-5.6z"
          />
          <path
            className="s-neck"
            stroke={url("body")}
            d="M12.2 9.6c.6-1.2.2-2.6-.8-3.2"
          />
          <circle cx="11" cy="6" r="1.2" fill={url("body")} />
          <path className="s-beak" d="M10 5.8 8.6 6.4l1.5.2z" />
          <path className="s-crest" d="M11.5 5c.5-1 1.3-1.6 2.1-1.6" />
        </g>
      </svg>
      {showLabel ? (
        <span className="simorgh-loader-label">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );

  return fullscreen ? (
    <div className="simorgh-loader-overlay">{loader}</div>
  ) : (
    loader
  );
};
