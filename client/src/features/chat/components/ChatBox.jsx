import { useEffect, useState, useRef, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useAuth } from "../../../context/AuthContext";
import {
  sendMessageStream,
  getConversation,
  getConversations,
} from "../services/chat.service";

// ─── Avatar initials ──────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 select-none"
      style={{ background: "var(--accent)" }}
    >
      {initials}
    </div>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  if (!category) return null;
  const label =
    category === "portfolio_data" ? "Hassan's Info" : "Stranger Things";
  const icon = category === "portfolio_data" ? "👨‍💻" : "🚲";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 ml-2">
      <span>{icon}</span>
      {label}
    </span>
  );
}

// ─── Thinking indicator ───────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div className="msg-animate flex w-full justify-start">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mr-3 mt-0.5"
        style={{ background: "var(--accent)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2zM9 9a5 5 0 000 10h6a5 5 0 000-10H9zm0 2h6a3 3 0 010 6H9a3 3 0 010-6zm1 1a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      </div>
      <div className="flex items-center gap-2 px-5 py-3.5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm">
        <span className="text-sm font-medium text-slate-500">Thinking</span>
        <div className="flex items-center gap-1">
          <span className="dot-1 h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
          <span className="dot-2 h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
          <span className="dot-3 h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Welcome screen ───────────────────────────────────────────────────
function WelcomeScreen({ selectedCategory, onSelectCategory }) {
  if (!selectedCategory) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-6 py-12">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-inner ring-1 ring-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Choose a Knowledge Domain
        </h2>
        <p className="mt-2.5 text-base text-slate-500 max-w-sm leading-relaxed">
          Select a topic to unlock the chat and focus the AI&apos;s answers on the right knowledge base.
        </p>

        {/* Category cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <button
            onClick={() => onSelectCategory("portfolio_data")}
            className="group flex flex-col items-start p-5 rounded-2xl border-2 border-slate-200
                       bg-white hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md hover:shadow-indigo-50
                       transition-all duration-200 text-left"
          >
            <span className="text-3xl mb-3">👨‍💻</span>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
              Hassan&apos;s Personal Info
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Resume, tech stack, skills, and portfolio projects.
            </p>
          </button>

          <button
            onClick={() => onSelectCategory("stranger_things")}
            className="group flex flex-col items-start p-5 rounded-2xl border-2 border-slate-200
                       bg-white hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md hover:shadow-indigo-50
                       transition-all duration-200 text-left"
          >
            <span className="text-3xl mb-3">🚲</span>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
              Stranger Things
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Hawkins, the Upside Down, characters, and lore.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Category chosen, no messages yet
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Ready to Chat</h2>
      <p className="text-sm text-slate-500 mt-1.5">
        Ask anything about{" "}
        {selectedCategory === "portfolio_data" ? "Hassan's background" : "Stranger Things"}.
      </p>
      <p className="mt-3 text-xs text-slate-400">
        Type your message in the box below to get started.
      </p>
    </div>
  );
}

// ─── Main ChatBox ─────────────────────────────────────────────────────────────
function ChatBox() {
  /* ── All existing state — fully preserved ── */
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [conversationId, setConversationId] = useState(() =>
    localStorage.getItem("conversationId")
  );
  const isStreaming = useRef(false);
  const { logout, user } = useAuth();

  /* ── New UI state ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Auto-scroll ref ── */
  const chatEndRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  /* ── Logout (original logic) ── */
  const handleLogout = async () => {
    localStorage.removeItem("conversationId");
    setConversationId(null);
    setSelectedCategory(null);
    setMessages([]);
    await logout();
  };

  /* ── Load conversations list (original logic) ── */
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data.data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };
    loadConversations();
  }, []);

  /* ── Load single conversation on ID change (original logic) ── */
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId || isStreaming.current) return;
      try {
        setLoading(true);
        const data = await getConversation(conversationId);
        setMessages(data.data.messages);
        if (data.data.category) {
          setSelectedCategory(data.data.category);
        } else if (data.data.conversation?.category) {
          setSelectedCategory(data.data.conversation.category);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
        localStorage.removeItem("conversationId");
        setConversationId(null);
        setMessages([]);
        setSelectedCategory(null);
      } finally {
        setLoading(false);
      }
    };
    loadConversation();
  }, [conversationId]);

  /* ── Send message (original logic, fully preserved) ── */
  const handleSendMessage = async (message) => {
    if (!selectedCategory) return;
    isStreaming.current = true;
    setMessages((prev) => [...prev, { role: "user", content: message, createdAt: new Date() }]);
    setLoading(true);

    try {
      await sendMessageStream({
        conversationId,
        message,
        category: selectedCategory,
        onInit: (newConversationId) => {
          if (!conversationId) {
            setConversationId(newConversationId);
            localStorage.setItem("conversationId", newConversationId);
          }
        },
        onChunk: (chunkText) => {
          setLoading(false);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + chunkText,
              };
            } else {
              updated.push({ role: "assistant", content: chunkText, createdAt: new Date() });
            }
            return updated;
          });
        },
        onError: (errorMessage) => {
          setLoading(false);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1].content += `\n\n**Error:** ${errorMessage}`;
            } else {
              updated.push({ role: "assistant", content: `**Error:** ${errorMessage}`, createdAt: new Date() });
            }
            return updated;
          });
        },
      });

      const conversationsData = await getConversations();
      setConversations(conversationsData.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      isStreaming.current = false;
    }
  };

  /* ── Select conversation (original logic) ── */
  const handleSelectConversation = async (selectedConversationId) => {
    isStreaming.current = false;
    setConversationId(selectedConversationId);
    localStorage.setItem("conversationId", selectedConversationId);
    const targetConv = conversations.find((c) => c._id === selectedConversationId);
    if (targetConv?.category) setSelectedCategory(targetConv.category);
    setSidebarOpen(false); // close mobile drawer
  };

  /* ── New chat (original logic) ── */
  const handleNewChat = () => {
    isStreaming.current = false;
    localStorage.removeItem("conversationId");
    setConversationId(null);
    setMessages([]);
    setSelectedCategory(null);
    setSidebarOpen(false);
  };

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Brand header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[0.9375rem] font-bold tracking-tight text-slate-900 leading-tight">AI Assistant</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">MERN · RAG · OpenRouter</p>
          </div>
        </div>

        {/* New Chat button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
                     text-sm font-semibold text-white transition-all duration-200
                     hover:opacity-90 hover:shadow-md active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>

      {/* ── Conversations list ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Recent Conversations
        </p>

        {conversations.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p className="text-xs text-slate-400">No conversations yet</p>
            <p className="text-xs text-slate-300 mt-1">Start a new chat above</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = conversationId === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`
                    group w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5
                    text-left text-sm transition-all duration-150
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600"}`}
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{conv.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── User profile ── */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg
                       bg-slate-100 text-slate-500 transition-colors
                       hover:bg-red-50 hover:text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-main)" }}>

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl
          transform transition-transform duration-250 ease-out
          lg:relative lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? "translate-x-0 sidebar-open" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-5 py-3.5">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1">
              <h2 className="text-[0.9375rem] font-semibold text-slate-900 truncate">
                {conversationId
                  ? conversations.find((c) => c._id === conversationId)?.title || "Current Session"
                  : "New Conversation"}
              </h2>
              <CategoryBadge category={selectedCategory} />
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              MERN + OpenRouter · Advanced RAG Pipeline
            </p>
          </div>
        </header>

        {/* ── Chat messages ── */}
        <div className="flex-1 overflow-y-auto chat-scroll" style={{ background: "var(--bg-chat)" }}>
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6">

            {messages.length === 0 ? (
              <WelcomeScreen
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            ) : (
              messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  message={msg.content}
                  timestamp={msg.createdAt}
                />
              ))
            )}

            {loading && <ThinkingIndicator />}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* ── Input composer ── */}
        <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput
              onSend={handleSendMessage}
              loading={loading}
              disabled={!selectedCategory}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatBox;
