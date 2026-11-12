import React, { useState } from "react";
import { Link } from "react-router-dom";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { SimorghIcon } from "../assets/icon/SimorghIcon";
import { useT } from "../i18n/useT";
import BotManagement from "./BotManagement";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const t = useT();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="teacher-dashboard">
      <header className="teacher-dashboard__header">
        <div className="teacher-dashboard__brand">
          <span className="teacher-dashboard__mark">
            <SimorghIcon />
          </span>
          <span className="teacher-dashboard__brand-name">
            {t("brand.name")}
          </span>
          <span className="teacher-dashboard__divider" aria-hidden="true" />
          <h1>{t("teacherDashboard.title")}</h1>
        </div>
        <Link className="teacher-dashboard__back" to="/chat">
          <ForumOutlinedIcon fontSize="small" />
          <span>{t("teacherDashboard.backToChat")}</span>
        </Link>
      </header>

      <div className="teacher-dashboard__body">
        <nav
          className="teacher-dashboard__nav"
          aria-label={t("teacherDashboard.title")}
        >
          <button
            type="button"
            className={`teacher-dashboard__nav-item${activeSection === "bots" ? " is-active" : ""}`}
            aria-current={activeSection === "bots" ? "page" : undefined}
            onClick={() => setActiveSection("bots")}
          >
            <SmartToyOutlinedIcon fontSize="small" />
            <span>{t("teacherDashboard.manageBots")}</span>
          </button>
        </nav>

        <main className="teacher-dashboard__content">
          {activeSection === "bots" && <BotManagement />}
        </main>
      </div>
    </div>
  );
}
