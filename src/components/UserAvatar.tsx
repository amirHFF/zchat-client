import React from "react";
import "./UserAvatar.css";

interface Props {
    name: string;
    online?: boolean;
    /** اگر true باشد، در حالت آفلاین هم نشانگر (حلقه‌ی توخالی) نمایش داده می‌شود */
    showOffline?: boolean;
    /** تصویر اختیاری (مثلاً آواتار بات)؛ اگر نباشد حرف اول نام نمایش داده می‌شود */
    src?: string;
    /** اندازه به پیکسل (پیش‌فرض 36) */
    size?: number;
    className?: string;
    /** chatscope برای تشخیص اسلات آواتار از prop «as» استفاده می‌کند؛ به DOM پاس داده نمی‌شود */
    as?: unknown;
}

/** رنگ‌ها از متغیرهای تم خوانده می‌شوند تا با تغییر تم، آواتارها هم هماهنگ شوند */
const themeTones = [
    "var(--blue)",
    "var(--teal)",
    "var(--coral)",
    "var(--gold)",
    "var(--navy)",
];

function hashName(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function getTone(name: string) {
    return themeTones[hashName(name) % themeTones.length];
}

export default function UserAvatar({
    name,
    online = false,
    showOffline = false,
    src,
    size = 36,
    className,
}: Props) {
    const safeName = name ?? "";
    const showDot = online || showOffline;
    const letter = safeName.trim()[0]?.toUpperCase() ?? "?";

    const classes = ["zc-avatar", showDot && "zc-avatar--has-dot", className]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={classes}
            style={
                {
                    "--avatar-size": `${size}px`,
                    "--avatar-tone": getTone(safeName),
                } as React.CSSProperties
            }
        >
            <div className="zc-avatar__face" aria-hidden={!src}>
                {src ? <img src={src} alt={safeName} draggable={false} /> : letter}
            </div>

            {showDot && (
                <span
                    role="status"
                    aria-label={online ? "online" : "offline"}
                    className={`zc-avatar__dot ${online ? "zc-avatar__dot--online" : "zc-avatar__dot--offline"}`}
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
