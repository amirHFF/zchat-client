import "../App.css";
import "../theme.css";
import React from "react";
import { useT } from "../i18n/useT";
import keycloak from "../auth/Keycloak.ts";
import { useEffect, useState } from "react";
import { SimorghLoader } from "./loading/SimorghLoader.tsx";

let initStarted = false; // جلوگیری از دوبار init در React StrictMode (dev)
// بازهٔ refresh دوره‌ای توکن Keycloak: پنج دقیقه.
const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const t = useT();

  useEffect(() => {
    if (initStarted) return;
    initStarted = true;

    keycloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      })
      .then(() => {
        setReady(true);
      })
      .catch((err) => {
        console.error("Keycloak init failed:", err);
        setReady(true); // حتی در خطا هم بذار اپ لود بشه، صفحات خودشون هندل می‌کنن
      });
  }, []);

  useEffect(() => {
    if (!ready || !keycloak.authenticated) return;

    // فقط برای نشست احراز‌شده تایمر می‌سازیم و هنگام unmount آن را پاک می‌کنیم.
    const refreshInterval = window.setInterval(() => {
      if (!keycloak.authenticated) return;

      // مقدار -1 باعث می‌شود Keycloak حتی پیش از نزدیک‌شدن به انقضا توکن را refresh کند.
      keycloak.updateToken(-1).catch((err) => {
        console.error("Keycloak token refresh failed:", err);
      });
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(refreshInterval);
  }, [ready]);

  if (!ready) {
    return (
      <div className="connecting-screen">
        {/* <div className="connecting-ring"></div> */}
        {/* <div className="connecting-text">{t("auth.loading")}</div> */}
        <SimorghLoader />
        <div className="connecting-sub">{t("auth.checkingSession")}</div>
      </div>
    );
  }

  return <>{children}</>;
}
