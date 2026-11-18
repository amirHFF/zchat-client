import React, { useId } from "react";
import "./SimorghIcon.css";
import { SimorghBird } from "./SimorghBird";

/**
 * لوگوی ثابت سیمرغ (هدر سایدبار، داشبورد معلم).
 * همان طرح لودر است، بدون هاله، حلقه‌ها و انیمیشن.
 */
export const SimorghIcon = () => {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="8 10 104 104" aria-hidden="true" className="simorgh-icon">
      <SimorghBird uid={uid} />
    </svg>
  );
};
