import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Bot, User, RefreshCw, Terminal, Keyboard, Sparkles, Settings } from "lucide-react";

interface BixbottAgentChatProps {
  initialPrompt?: string;
  onClearPrompt?: () => void;
}

export const BixbottAgentChat: React.FC<BixbottAgentChatProps> = ({ initialPrompt, onClearPrompt }) => {
  const [persona, setPersona] = useState<"default" | "sysadmin" | "security">("default");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Xin chào! Tôi là **Bixbott Resident AI Agent**. Tôi được thiết kế để điều hành, giám sát các dịch vụ lớp lõi và liên kết trực tiếp với dữ liệu lưu trữ của **dotcom-03**.\n\nBạn có thể hỏi tôi về:\n- Hoạt động của lớp lõi `bixbott-core` và `bixbott-engine`\n- Các dự án an ninh như `PwnedPasswords` và `EmailAddressExtractor`\n- Thư viện câu lệnh `LinuxCommandLibrary` hay trợ lý `copilot-cli`",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handlePersonaChange = (newPersona: "default" | "sysadmin" | "security") => {
    setPersona(newPersona);
    
    let notifyText = "";
    if (newPersona === "sysadmin") {
      notifyText = "⚙️ **[MÁY CHỦ BIXBOTT]**: Đã chuyển sang Agent Persona: **SysAdmin (Quản Trị Hệ Thống)**. Lõi AI hiện áp dụng cấu trúc hệ thống giám sát tải CPU/RAM, xử lý tự động hóa, điều phối log và phân tích các tệp lệnh Linux.";
    } else if (newPersona === "security") {
      notifyText = "🛡️ **[HỆ THỐNG AN NINH]**: Đã chuyển sang Agent Persona: **Security Auditor (Kiểm Toán Bảo Mật)**. Lõi AI đang tăng cường phân tích lỗ hổng, rà soát mã nguồn rò rỉ JWT/Key, kiểm tra bảo mật mật khẩu và zero-trust rules.";
    } else {
      notifyText = "🤖 **[BIXBOTT CORE]**: Đã hoàn tác về Agent Persona mặc định: **Trợ Lý Bộ Điều Phối**.";
    }

    setMessages(prev => [
      ...prev,
      {
        id: `sys-notif-${Date.now()}`,
        role: "assistant",
        content: notifyText,
        timestamp: new Date()
      }
    ]);
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearPrompt) onClearPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || input;
    const cleanText = rawText.trim();
    if (!cleanText || isLoading) return;

    if (!textToSend) setInput("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: cleanText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Map chat history so Gemini knows the contextual state changes; skip welcome/notifications to prevent noise
      const historyPayload = messages
        .filter(m => m.id !== "welcome" && m.id !== "welcome-reset" && !m.id.startsWith("sys-notif-"))
        .slice(-6)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanText, history: historyPayload, persona })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với máy chủ Bixbott API.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.reply || "Tôi nhận được thông điệp rỗng từ lõi phân tích.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: "assistant",
          content: `⚠️ **Lỗi kết nối bixbott-engine**: ${err.message || "Không thể khởi động phân tích AI."}\n\nVui lòng kiểm tra lại GEMINI_API_KEY trong thẻ **Settings > Secrets** và khởi động lại dự án.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Hệ thống phân tích đã khởi tạo lại thành công. Tôi đã sẵn sàng nhận các yêu cầu điều vận mới từ bạn.",
        timestamp: new Date()
      }
    ]);
  };

  // Safe lightweight parser to render headings, bullet points, and inline code with developer aesthetic
  const parseResponseText = (content: string) => {
    return content.split("\n").map((line, idx) => {
      // Empty line
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      // Headers (e.g. ### Header or **Header**)
      if (line.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-mono font-bold text-[#f27d26] mt-2 mb-1 border-b border-[#1f1f23] pb-0.5">{line.replace("###", "").trim()}</h4>;
      }
      if (line.startsWith("##")) {
        return <h3 key={idx} className="text-sm font-mono font-bold text-orange-400 mt-3 mb-1.5">{line.replace("##", "").trim()}</h3>;
      }
      if (line.startsWith("#")) {
        return <h2 key={idx} className="text-base font-mono font-bold text-white mt-3 mb-2">{line.replace("#", "").trim()}</h2>;
      }

      // Bullet points
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        const textOnly = line.trim().substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-300 leading-relaxed mb-0.5 font-sans font-light">
            {formatBoldAndCode(textOnly)}
          </li>
        );
      }

      // Check if numbered list (e.g. "1. Item")
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="ml-4 flex gap-2 text-xs text-slate-300 leading-relaxed mb-1 font-sans font-light">
            <span className="font-mono text-[#f27d26] text-[11px] font-bold">{numMatch[1]}.</span>
            <span>{formatBoldAndCode(numMatch[2])}</span>
          </div>
        );
      }

      // Blockquote
      if (line.trim().startsWith(">")) {
        return (
          <blockquote key={idx} className="border-l-2 border-[#f27d26] pl-3.5 py-1 text-slate-400 text-xs italic my-1.5 font-sans">
            {formatBoldAndCode(line.replace(">", "").trim())}
          </blockquote>
        );
      }

      // Standard text line
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed font-sans font-light mb-1.5">
          {formatBoldAndCode(line)}
        </p>
      );
    });
  };

  const formatBoldAndCode = (text: string) => {
    // Basic regex placeholder to render inline code and strong statements
    // Matches backticks `code` and bold **text**
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    
    // Joint regex for backticks and double asterisks
    const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Push leading plain text
      if (match.index > currentIdx) {
        parts.push(text.substring(currentIdx, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
        const content = matchStr.slice(1, -1);
        parts.push(
          <span key={match.index} className="px-1.5 py-0.5 font-mono text-[11px] bg-[#050505] border border-[#1f1f23] text-[#f27d26] rounded">
            {content}
          </span>
        );
      } else if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
        const content = matchStr.slice(2, -2);
        parts.push(
          <strong key={match.index} className="font-medium text-white font-sans">
            {content}
          </strong>
        );
      }

      currentIdx = regex.lastIndex;
    }

    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  const pills = [
    { label: "Mô phỏng Bixbott Core", prompt: "Hãy phân tích kiến trúc lõi bixbott-core và bixbott-engine hoạt động chung như thế nào?" },
    { label: "Check bảo mật PwnedPasswords", prompt: "Các dự án PwnedPasswords của dotcom-03 (Azure, Cloudflare, Downloader) liên kết thế nào để bảo vệ thông tin?" },
    { label: "Sử dụng Linux Library", prompt: "Dự án LinuxCommandLibrary giải quyết vấn đề gì cho bixbott-server?" },
    { label: "Copilot & CLI", prompt: "Khác biệt cốt lõi giữa dotcom-03/cli và dotcom-03/copilot-cli là gì?" }
  ];

  return (
    <div id="bixbott-chat" className="border border-[#1f1f23] bg-[#0c0c0e] rounded shadow-2xl flex flex-col h-[600px] overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f27d26] via-[#e26210] to-[#0c0c0e]"></div>

      <div className="bg-[#0c0c0e]/80 backdrop-blur border-b border-[#1f1f23] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-[#f27d26]" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] border-2 border-[#0c0c0e] rounded-full shadow-md status-pulse"></span>
          </div>
          <div>
            <span className="font-mono font-bold text-[14px] text-slate-100 uppercase tracking-tight block">Bixbott Agent Copilot</span>
            <span className="text-[10px] font-mono text-[#00ff41] block uppercase leading-none">Resident AI Core Active</span>
          </div>
        </div>

        <button 
          onClick={handleClearHistory} 
          className="text-[#5c5c5c] hover:text-slate-100 p-1.5 rounded hover:bg-[#141417] border border-[#1f1f23] transition-all font-mono text-xs flex items-center gap-1.5 cursor-pointer"
          title="Xóa lịch sử hội thoại"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Mới
        </button>
      </div>

      {/* Dynamic Persona Settings Bar with futuristic styling */}
      <div className="bg-[#0c0c0e] border-b border-[#1f1f23] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-[#f27d26] animate-[spin_8s_linear_infinite]" />
          <span className="text-[#5c5c5c] font-bold uppercase text-[10px] tracking-wider">Agent Persona:</span>
          <div className="relative inline-block">
            <select
              value={persona}
              onChange={(e) => handlePersonaChange(e.target.value as "default" | "sysadmin" | "security")}
              className="bg-[#050505] text-slate-100 border border-[#1f1f23] hover:border-[#f27d26]/50 focus:border-[#f27d26] rounded px-3 py-1 pr-7 text-[11px] font-medium outline-none cursor-pointer appearance-none hover:bg-[#141417] transition-all font-mono"
            >
              <option value="default">🤖 Default AI Core</option>
              <option value="sysadmin">💻 SysAdmin Expert</option>
              <option value="security">🛡️ Security Auditor</option>
            </select>
            <div className="absolute right-2 top-2.5 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] border-t-[#f27d26] pointer-events-none"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
          {persona === "sysadmin" && (
            <span className="flex items-center gap-1 text-orange-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
              SYSADMIN MODE ACTIVE
            </span>
          )}
          {persona === "security" && (
            <span className="flex items-center gap-1 text-red-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              SECURITY ENFORCED
            </span>
          )}
          {persona === "default" && (
            <span className="flex items-center gap-1 text-slate-500 font-mono">
              DEFAULT ORCHESTRATION
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0c0c0e]/20 scrollbar-custom">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role !== "user" && (
              <div className="w-7 h-7 shrink-0 bg-[#050505] border border-[#1f1f23] rounded flex items-center justify-center text-[#f27d26]">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className={`max-w-[85%] rounded p-3.5 border ${
              msg.role === "user" 
              ? "bg-[#f27d26]/10 border-[#f27d26]/20 text-slate-200 shadow-md"
              : "bg-[#050505]/60 border-[#1f1f23] text-slate-300 shadow-md"
            }`}>
              {/* Message Meta */}
              <div className="flex items-center justify-between gap-6 mb-1 text-[9px] font-mono text-[#5c5c5c] border-b border-[#1f1f23] pb-1">
                <span className="flex items-center gap-1 capitalize font-bold">
                  {msg.role === "user" ? <User className="w-3 h-3 text-[#f27d26]" /> : <Terminal className="w-3 h-3 text-[#f27d26]" />}
                  {msg.role === "user" ? "Điều Hợp Viên" : "Bixbott Resident Core"}
                </span>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Message Content formatted */}
              <div className="space-y-1">
                {parseResponseText(msg.content)}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 shrink-0 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded flex items-center justify-center text-[#f27d26]">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-7 h-7 shrink-0 bg-[#050505] border border-[#1f1f23] rounded flex items-center justify-center text-[#f27d26] animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            
            <div className="bg-[#050505] border border-[#1f1f23] rounded p-4 text-xs text-slate-400 font-mono tracking-tight flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#f27d26] rounded-full animate-bounce"></span>
              <span className="inline-block w-2 h-2 bg-[#f27d26] rounded-full animate-bounce delay-100"></span>
              <span className="inline-block w-2 h-2 bg-[#f27d26] rounded-full animate-bounce delay-200"></span>
              Bixbott AI is analyzing system repository files...
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-5 py-2.5 bg-[#0c0c0e] border-t border-[#1f1f23]">
          <span className="text-[10px] font-mono text-[#5c5c5c] uppercase tracking-wider mb-2 block flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#f27d26]" /> gợi ý nhanh từ lõi bixbott
          </span>
          <div className="grid grid-cols-2 gap-2">
            {pills.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                className="text-left p-2.5 bg-[#050505] hover:bg-[#141417] border border-[#1f1f23] hover:border-[#f27d26]/40 rounded text-[11px] leading-snug text-slate-400 hover:text-white tracking-tight transition-all font-mono cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-[#0c0c0e] border-t border-[#1f1f23] flex items-center gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Gửi mệnh lệnh hoặc đặt câu hỏi kỹ thuật cho Bixbott..."
            disabled={isLoading}
            className="w-full bg-[#050505] border border-[#1f1f23] focus:border-[#f27d26] rounded px-4.5 py-3 text-xs text-slate-100 placeholder-[#5c5c5c] focus:outline-none transition-colors pr-10 font-mono"
          />
          <Keyboard className="absolute right-3.5 top-3.5 w-4 h-4 text-[#5c5c5c] pointer-events-none" />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="p-3 bg-[#f27d26] hover:bg-[#e06b16] text-black rounded transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold uppercase tracking-tight flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
