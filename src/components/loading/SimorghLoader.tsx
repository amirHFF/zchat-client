import React, { useId } from "react";
import "./style.css";
import { SimorghBird } from "../../assets/icon/SimorghBird";

type Props = {
  size?: number;
  label?: string;
  showLabel?: boolean;
  fullscreen?: boolean;
};

const SPARK_ANGLES = [0, 72, 144, 216, 288];

const STAR_D = "M0-3.2.9-.9 3.2 0 .9.9 0 3.2-.9.9-3.2 0-.9-.9Z";

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
            viewBox="0 0 120 120"
            className="simorgh-icon simorgh-loader-svg"
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
          <defs>
            <radialGradient id={id("halo")} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd86b" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#ff5fa2" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd86b" />
              <stop offset="50%" stopColor="#ff5fa2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* هالهٔ نورانی */}
          <circle className="s-halo" cx="60" cy="60" r="46" fill={url("halo")} />

          {/* حلقه‌ها */}
          <circle className="s-ring-dash" cx="60" cy="60" r="47" />
          <circle
              className="s-ring-track"
              cx="60"
              cy="60"
              r="54"
              stroke={url("ring")}
          />
          <circle
              className="s-ring-spin"
              cx="60"
              cy="60"
              r="54"
              pathLength={100}
              stroke={url("ring")}
          />

          {/* جرقه‌های چرخان */}
          <g className="s-orbit">
            {SPARK_ANGLES.map((a, i) => (
                <g key={a} transform={`rotate(${a} 60 60)`}>
                  <path
                      className="s-spark"
                      d={STAR_D}
                      transform="translate(60 6)"
                      fill={i % 2 ? "#a5f3fc" : "#ffd86b"}
                      style={{ animationDelay: `${i * 0.35}s` }}
                  />
                </g>
            ))}
          </g>

          {/* طرح سیمرغ (مشترک با SimorghIcon) */}
          <SimorghBird uid={uid} />
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
