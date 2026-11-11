import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Code block with language header + copy button ───────────────────────────
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const lang = className ? className.replace("language-", "") : "code";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <button className="copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Markdown components map ─────────────────────────────────────────────────
const markdownComponents = {
  pre({ children }) {
    // Flatten <pre> so <CodeBlock> can manage its own container without nesting <pre> in <pre>
    return <>{children}</>;
  },
  code({ node, className, children, ...props }) {
    const isBlock = Boolean(className) || String(children).includes("\n");
    if (isBlock) {
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }
    // Render standard inline code inside paragraphs without <div> or <pre>
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

// ─── Timestamp ───────────────────────────────────────────────────────────────
function Timestamp({ timestamp }) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  return (
    <span className="text-[11px] text-slate-400 mt-1 select-none">
      {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

// ─── Main ChatMessage ─────────────────────────────────────────────────────────
function ChatMessage({ message, role, timestamp }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message]);

  // ── User message ──────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="msg-animate flex w-full justify-end group">
        <div className="flex flex-col items-end max-w-[80%] sm:max-w-[72%]">
          <div
            style={{ background: "var(--msg-user)" }}
            className="rounded-2xl rounded-br-sm px-4 py-3 shadow-sm border border-indigo-100"
          >
            <p className="text-[0.9375rem] leading-relaxed text-slate-800 whitespace-pre-wrap font-normal">
              {message}
            </p>
          </div>
          <Timestamp timestamp={timestamp} />
        </div>
      </div>
    );
  }

  // ── AI message ────────────────────────────────────────────────────────────
  return (
    <div className="msg-animate flex w-full justify-start group">
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <div
          style={{ background: "var(--accent)" }}
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2zM9 9a5 5 0 000 10h6a5 5 0 000-10H9zm0 2h6a3 3 0 010 6H9a3 3 0 010-6zm1 1a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
        </div>
      </div>

      {/* Bubble */}
      <div className="flex flex-col items-start max-w-[82%] sm:max-w-[75%]">
        <div
          style={{ background: "var(--msg-ai)" }}
          className="rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm border border-slate-100 relative"
        >
          <div className="prose-ai">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message}
            </ReactMarkdown>
          </div>

          {/* Copy button (shown on hover) */}
          <button
            onClick={handleCopy}
            title="Copy response"
            className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                       flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600
                       bg-white border border-slate-200 rounded-full px-2 py-0.5 shadow-sm"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <Timestamp timestamp={timestamp} />
      </div>
    </div>
  );
}

export default ChatMessage;
