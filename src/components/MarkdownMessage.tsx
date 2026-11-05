import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./MarkdownMessage.css";

type Props = { content: string };

function MarkdownMessageBase({ content }: Props) {
    return (
        <div className="md-message" dir="auto">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // جدول داخل wrapper اسکرول‌خور تا بیرون حباب نزند
                    table: ({ node, ...props }) => (
                        <div className="md-table-wrap">
                            <table {...props} />
                        </div>
                    ),
                    // لینک‌ها در تب جدید و امن
                    a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default React.memo(MarkdownMessageBase);