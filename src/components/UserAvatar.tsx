import React from "react";

interface Props {
    name: string;
    online?: boolean;
    /** اگر true باشد، در حالت آفلاین هم دایره‌ی خاکستری نشان می‌دهد */
    showOffline?: boolean;
}

const colors = [
    "#4F46E5",
    "#2563EB",
    "#059669",
    "#EA580C",
    "#DC2626",
    "#9333EA",
    "#0891B2",
    "#CA8A04"
];

function getColor(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }

    return colors[hash % colors.length];
}
function escapeXml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** آواتار حرف اول رنگی به‌صورت data URI برای استفاده در Avatar ی chatscope */
export function avatarDataUri(name: string | undefined) {
    const safeName = name ?? "";
    const letter = escapeXml((safeName[0] ?? "?").toUpperCase());
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42">` +
        `<rect width="42" height="42" fill="${getColor(safeName)}"/>` +
        `<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="white" ` +
        `font-family="sans-serif" font-size="18" font-weight="600">${letter}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function UserAvatar({name, online = false, showOffline = false}: Props) {
    console.log("UserAvatar render", { name, online, showOffline });
    const showDot = online || showOffline;
    return (
        <div
            style={{
                position: "relative",
                width: 42,
                height: 42,
                flexShrink: 0,
                overflow: "visible",
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: getColor(name),
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 16,
                }}
            >
                {name?.[0]?.toUpperCase() ?? "?"}
            </div>

            {showDot && (
                <div
                    role="status"
                    aria-label={online ? "online" : "offline"}
                    style={{
                        position: "absolute",
                        insetInlineEnd: 0,
                        bottom: 0,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: online ? "#22C55E" : "#9CA3AF",
                        border: "2px solid white",
                        boxSizing: "border-box",
                    }}
                />
            )}
        </div>
    );
}
const BOT_AVATAR_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" role="img" aria-label="AI assistant">
    <circle cx="21" cy="21" r="21" fill="#173F7A"/>
    <path d="M27.5 1.1A21 21 0 0 1 40.8 28c-2.4-5.5-6.8-8.7-13.2-9.7-5.2-.8-7.2-4.8-6-9.2.9-3.2 2.8-5.8 5.9-8Z" fill="#2477D4"/>
    <path d="M36.7 31.5a21.1 21.1 0 0 1-8.9 8.3c.7-4.3 3.6-7.3 8.9-8.3Z" fill="#00B7A5"/>
    <path d="M20.8 8.2v3" stroke="#BDF5EA" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="20.8" cy="7.2" r="1.8" fill="#32D3BC"/>
    <path d="M11 16.8a5.2 5.2 0 0 1 5.2-5.2h9.6a5.2 5.2 0 0 1 5.2 5.2v8.1a5.2 5.2 0 0 1-5.2 5.2h-4.1l-4.3 3v-3h-1.2a5.2 5.2 0 0 1-5.2-5.2v-8.1Z" fill="#FFFDF8"/>
    <circle cx="16.8" cy="20.2" r="2" fill="#2477D4"/>
    <circle cx="25.2" cy="20.2" r="2" fill="#2477D4"/>
    <circle cx="17.4" cy="19.6" r=".65" fill="#fff"/>
    <circle cx="25.8" cy="19.6" r=".65" fill="#fff"/>
    <path d="M16.8 25c1.1 1.2 2.5 1.8 4.2 1.8s3.1-.6 4.2-1.8" fill="none" stroke="#173F7A" stroke-width="1.6" stroke-linecap="round"/>
  </svg>
`.trim();

export const BOT_AVATAR_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BOT_AVATAR_SVG)}`;