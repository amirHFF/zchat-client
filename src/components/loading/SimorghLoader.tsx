import React from "react";
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
  const loader = (
    <div className="simorgh-loader" role="status" aria-live="polite">
      <svg
        viewBox="0 0 24 24"
        className="simorgh-icon simorgh-loader-svg"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <circle className="s-ring-track" cx="12" cy="12" r="9.3" />
        <circle className="s-ring-spin" cx="12" cy="12" r="9.3" />
        <g className="s-bird">
          <path
            className="s-tail s-tail-glow"
            d="M11.4 14.4C11.6 17.5 14 19.6 17 19.2c1.6-.2 2.8.6 3.5 1.8"
          />
          <path
            className="s-body"
            d="M11 14.2c-1 2.3-2.5 3.6-4.2 4.2 2 .4 3.8-.4 4.8-2z"
          />
          <path
            className="s-wing s-wing-left"
            d="M11.6 10.4C8.8 10 5.8 7.6 4 3.5l2 1.7.2-2.6 1.6 2.4.6-2.2 1 2.8c.7 1.8 1.5 3 2.4 3.6z"
          />
          <path
            className="s-wing s-wing-right"
            d="M12.4 10.4c2.8-.4 5.8-2.8 7.6-6.9l-2 1.7-.2-2.6-1.6 2.4-.6-2.2-1 2.8c-.7 1.8-1.5 3-2.4 3.6z"
          />
          <path
            className="s-body"
            d="M12 9c1.6.3 2.2 2 1.6 3.8-.6 1.6-2 2.2-2.8 1.8-.4-1.6-.2-3.8 1.2-5.6z"
          />
          <path className="s-neck" d="M12.2 9.6c.6-1.2.2-2.6-.8-3.2" />
          <circle className="s-body" cx="11" cy="6" r="1.2" />
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
