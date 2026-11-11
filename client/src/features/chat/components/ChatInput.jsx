import { useState, useRef, useCallback } from "react";

function ChatInput({ onSend, loading, disabled }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!message.trim() || loading || disabled) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, loading, disabled, onSend]);

  // Enter = send, Shift+Enter = newline
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const isDisabled = loading || disabled;
  const canSend = message.trim().length > 0 && !isDisabled;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`
          flex items-end gap-3 rounded-2xl border bg-white px-4 py-3
          transition-all duration-200
          ${disabled
            ? "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"
            : loading
              ? "border-indigo-200 shadow-md shadow-indigo-50"
              : "border-slate-200 hover:border-slate-300 focus-within:border-indigo-300 focus-within:shadow-lg focus-within:shadow-indigo-50/50"
          }
        `}
        style={{ boxShadow: disabled ? "none" : undefined }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isDisabled}
          placeholder={
            disabled
              ? "Select a category above to start chatting…"
              : loading
                ? "AI is thinking…"
                : "Message AI Assistant…  (Shift+Enter for newline)"
          }
          className="
            flex-1 resize-none bg-transparent text-[0.9375rem] text-slate-800
            placeholder-slate-400 outline-none leading-relaxed
            disabled:cursor-not-allowed max-h-[180px] overflow-y-auto
          "
          style={{ minHeight: "26px" }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          title={canSend ? "Send message" : "Type a message first"}
          className={`
            flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl
            transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-500
            ${canSend
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-md"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            /* Spinner */
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            /* Send icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Hint */}
      {!disabled && (
        <p className="mt-2 text-center text-[11px] text-slate-400">
          AI answers are strictly restricted to the selected category.
          {!loading && " · Enter to send, Shift+Enter for newline"}
        </p>
      )}
    </form>
  );
}

export default ChatInput;
