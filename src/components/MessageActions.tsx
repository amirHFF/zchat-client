import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
// import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
// import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import "./MessageActions.css";

type Props = { text: string; sentTime?: string };

export default function MessageActions({ text, sentTime }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text.trim() || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard access can be unavailable in insecure contexts.
    }
  };

  return (
    <div className="message-actions">
      {/* <IconButton className="message-actions__button" size="small" aria-label="Like" onClick={() => {}}>
        <ThumbUpAltOutlinedIcon fontSize="small" />
      </IconButton> */}
      {/* <IconButton className="message-actions__button" size="small" aria-label="Dislike" onClick={() => {}}>
        <ThumbDownAltOutlinedIcon fontSize="small" />
      </IconButton> */}
      <IconButton
        className="message-actions__button"
        size="small"
        aria-label="Copy message"
        onClick={handleCopy}
        disabled={!text.trim()}
      >
        {copied ? (
          <CheckIcon fontSize="small" />
        ) : (
          <ContentCopyOutlinedIcon fontSize="small" />
        )}
      </IconButton>
      {sentTime && <span className="message-actions__time">{sentTime}</span>}
    </div>
  );
}
