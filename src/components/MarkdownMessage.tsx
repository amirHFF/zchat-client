// import React from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";
// import "./MarkdownMessage.css";

// type Props = { content: string };

// function MarkdownMessageBase({ content }: Props) {
//     return (
//         <div className="md-message" dir="auto">
//             <ReactMarkdown
//                 remarkPlugins={[remarkGfm, remarkBreaks]}
//                 rehypePlugins={[rehypeHighlight]}
//                 components={{
//                     // جدول داخل wrapper اسکرول‌خور تا بیرون حباب نزند
//                     table: ({ node, ...props }) => (
//                         <div className="md-table-wrap">
//                             <table {...props} />
//                         </div>
//                     ),
//                     // لینک‌ها در تب جدید و امن
//                     a: ({ node, ...props }) => (
//                         <a {...props} target="_blank" rel="noopener noreferrer" />
//                     ),
//                 }}
//             >
//                 {content}
//             </ReactMarkdown>
//         </div>
//     );
// }

// export default React.memo(MarkdownMessageBase);

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import { visit } from "unist-util-visit";
import "highlight.js/styles/github-dark.css";
import "./MarkdownMessage.css";

type Props = { content: string };

function toText(node: any): string {
  if (node.type === "text") return node.value;
  return (node.children || []).map(toText).join("");
}

// اسم ستون را روی هر td می‌گذارد (برای کارت موبایل/تبلت)
function rehypeTableLabels() {
  return (tree: any) => {
    visit(tree, "element", (table: any) => {
      if (table.tagName !== "table") return;
      const thead = table.children.find((c: any) => c.tagName === "thead");
      const tbody = table.children.find((c: any) => c.tagName === "tbody");
      if (!thead || !tbody) return;

      const headRow = thead.children.find((c: any) => c.tagName === "tr");
      if (!headRow) return;
      const labels = headRow.children
        .filter((c: any) => c.tagName === "th")
        .map((th: any) => toText(th));

      tbody.children
        .filter((r: any) => r.tagName === "tr")
        .forEach((tr: any) => {
          let i = 0;
          tr.children.forEach((td: any) => {
            if (td.tagName === "td") {
              td.properties = td.properties || {};
              td.properties["dataLabel"] = labels[i] ?? "";
              i++;
            }
          });
        });
    });
  };
}

function TableWrap(props: any) {
  const [open, setOpen] = useState(false);

  // بستن با Escape + قفل اسکرول پشت مودال
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="md-table-wrap">
        <div className="md-table-toolbar">
          <button
            type="button"
            className="md-table-expand"
            onClick={() => setOpen(true)}
          >
            ⤢ بزرگ‌نمایی
          </button>
        </div>
        <div className="md-table-scroll">
          <table {...props} />
        </div>
      </div>

      {open && (
        <div className="md-modal" onClick={() => setOpen(false)}>
          <div
            className="md-modal-body"
            onClick={(e) => e.stopPropagation()}
            dir="auto"
          >
            <button
              type="button"
              className="md-modal-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <div className="md-modal-scroll">
              <table {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MarkdownMessageBase({ content }: Props) {
  return (
    <div className="md-message" dir="auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeTableLabels]}
        components={{
          table: ({ node, ...props }) => <TableWrap {...props} />,
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
