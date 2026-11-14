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
    /** "bot" یک آیکون ربات با رنگ‌های تم نمایش می‌دهد */
    variant?: "user" | "bot";
    /** chatscope برای تشخیص اسلات آواتار از prop «as» استفاده می‌کند؛ به DOM پاس داده نمی‌شود */
    as?: unknown;
}

/**
 * آیکون ربات به‌صورت SVG درون‌خطی (نه data URI) تا رنگ‌ها از متغیرهای تم خوانده شوند.
 * رنگ‌ها در UserAvatar.css با کلاس‌های zc-bot__* تعیین می‌شوند.
 */
function BotGlyph() {
    return (
        <svg className="zc-bot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path className="zc-bot__antenna" d="M12 3.6v2.6" />
            <circle className="zc-bot__spark" cx="12" cy="3" r="1.6" />
            <rect className="zc-bot__ear" x="2.2" y="11" width="2.2" height="4.4" rx="1.1" />
            <rect className="zc-bot__ear" x="19.6" y="11" width="2.2" height="4.4" rx="1.1" />
            <rect className="zc-bot__head" x="4.6" y="6.6" width="14.8" height="12.6" rx="4.4" />
            <rect className="zc-bot__eye" x="8.3" y="10.4" width="2.3" height="3.8" rx="1.15" />
            <rect className="zc-bot__eye" x="13.4" y="10.4" width="2.3" height="3.8" rx="1.15" />
            <path className="zc-bot__mouth" d="M10.4 16.4h3.2" />
        </svg>
    );
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
    variant = "user",
}: Props) {
    const safeName = name ?? "";
    const showDot = online || showOffline;
    const letter = safeName.trim()[0]?.toUpperCase() ?? "?";
    const isBot = variant === "bot";

    const classes = [
        "zc-avatar",
        isBot && "zc-avatar--bot",
        showDot && "zc-avatar--has-dot",
        className,
    ]
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
                {src ? (
                    <img src={src} alt={safeName} draggable={false} />
                ) : isBot ? (
                    <BotGlyph />
                ) : (
                    letter
                )}
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
