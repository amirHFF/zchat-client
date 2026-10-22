import { useEffect, useState } from "react";
import keycloak from "../auth/Keycloak.ts";
import "../theme.css";
import "../App.css";
import React from "react";
import { useT } from "../i18n/useT";
import { SimorghLoader } from "./loading/SimorghLoader.tsx";

let initStarted = false; // جلوگیری از دوبار init در React StrictMode (dev)

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
