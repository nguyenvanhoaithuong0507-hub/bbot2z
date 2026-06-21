import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GitPullRequest, 
  GitBranch, 
  CornerDownRight, 
  Play, 
  Square, 
  RotateCcw, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  FileCode,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  Github
} from "lucide-react";
import { REPOSITORIES } from "../data";

// Type definitions for the PR simulation
interface PRProcessStep {
  id: string;
  command: string;
  description: string;
  status: "idle" | "running" | "success" | "failed";
  output: string[];
  durationMs: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "bibot";
  content: string;
  timestamp: string;
  attachedPR?: {
    repoName: string;
    branchName: string;
    targetBranch: string;
    status: string;
  };
}

export const PRBlueprintWorkspace: React.FC = () => {
  // Chat messaging states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bibot",
      content: "Xin chào! Tôi là Trợ lý Tự trị Bixbott VL2. Tôi có thể giúp bạn tự động hóa quy trình kéo nhánh, phân tích các Pull Request (PR) đang mở trên dotcom-03 và chạy các chuỗi lệnh kiểm thử Sandbox. Hãy chọn một mẫu PR bên dưới hoặc trò chuyện trực tiếp để bắt đầu tự động hóa!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Simulation State variables
  const [activeRepo, setActiveRepo] = useState(REPOSITORIES[0]?.name || "bixbott-app");
  const [targetBranch, setTargetBranch] = useState("main");
  const [sourceBranch, setSourceBranch] = useState("feature/vl2-blueprint-core");
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [terminalSpeed, setTerminalSpeed] = useState<"normal" | "fast" | "instant">("normal");
  const [commandLogs, setCommandLogs] = useState<string[]>(["[BIXBOTT-DAEMON] Chi nhánh tự trị đang chờ lệnh..."]);

  // Detailed step definitions for the PR validation flow
  const [steps, setSteps] = useState<PRProcessStep[]>([
    {
      id: "git-fetch",
      command: "git fetch origin pull/42/head:pr/feature-vl2",
      description: "Đang truy xuất thông tin từ nhánh từ xa (Remote Pull Request) và ánh xạ cục bộ...",
      status: "idle",
      output: [
        "Connecting to dotcom-03 repository architecture...",
        "Fetching remote branch state structure...",
        "remote: Enumerating objects: 24, done.",
        "remote: Counting objects: 100% (24/24), done.",
        "remote: Compressing objects: 100% (14/14), done.",
        "unpacking objects: 100% (24/24), done.",
        "From github.com/dotcom-03/bixbott-app",
        " * [new ref]        refs/pull/42/head -> pr/feature-vl2"
      ],
      durationMs: 1500
    },
    {
      id: "git-checkout",
      command: "git checkout -b pr/feature-vl2 && git merge origin/main",
      description: "Chuyển sang nhánh PR và phân tích xung đột cấu trúc với nhánh chính...",
      status: "idle",
      output: [
        "Switched to a new branch 'pr/feature-vl2'",
        "Attempting integration merge with stable branch 'main'...",
        "Evaluating structural changes in /src/components/ ...",
        "Analyzing AST patterns for matching signatures...",
        "No conflicting diffs detected. Auto-merge fully compatible."
      ],
      durationMs: 1200
    },
    {
      id: "vuln-scan",
      command: "bixbott-guard-cli scan --target=./src",
      description: "Quy trình Bixbott Guard tự động quét lỗ hổng zero-day và rò rỉ JWT/API Keys...",
      status: "idle",
      output: [
        "BIXBOTT SECURE STATIC SCANNER v2.0-PRO",
        "Initializing credentials scanner module...",
        "Scanning 18 matching Javascript/Typescript source files...",
        "Checking for unprotected token patterns: OK",
        "Auditing package.json dependencies for critical vulnerabilities...",
        "0 vulnerabilities detected in 154 third-party modules.",
        "Security status: SECURE [Green Flag]"
      ],
      durationMs: 2000
    },
    {
      id: "syntax-check",
      command: "npx tsc --noEmit",
      description: "Chạy trình biên dịch Typescript phân tích lỗi cú pháp nghiêm trọng...",
      status: "idle",
      output: [
        "Loaded typescript v5.2.2 compiler configuration...",
        "Checking type declarations and enum structures on VL2 classes...",
        "Analyzing imported namespaces matching local models...",
        "Compilation completed in 1.43s.",
        "TypeScript execution: 0 errors, 0 warnings found."
      ],
      durationMs: 1800
    },
    {
      id: "compile-test",
      command: "npm run build --minify",
      description: "Tiến hành đóng gói bản tối ưu hóa cục bộ trong Sandbox cô lập...",
      status: "idle",
      output: [
        "vite v5.0.12 building for production...",
        "transforming (42) src/components/HealthGaugeSection.tsx",
        "rendering chunks...",
        "dist/index.html                     0.45 kB │ gzip:  0.28 kB",
        "dist/assets/index-D7bA9k.css      38.40 kB │ gzip:  8.92 kB",
        "dist/assets/index-G92hAs.js      312.54 kB │ gzip: 92.12 kB",
        "✓ Built in 2.1s"
      ],
      durationMs: 2200
    },
    {
      id: "pr-validate",
      command: "bixbott-agent publish-report --pr=42",
      description: "Bản sao lưu hoàn tất, gửi kết quả chuẩn hóa dạng PR Check trở lại Repo...",
      status: "idle",
      output: [
        "Compiling evaluation metrics report...",
        "Success rate: 100%. Coverage: 96.8%.",
        "Generating beautiful telemetry graphs in markdown status comments...",
        "Uploading diagnostic profile package payload...",
        "PR #42 marked as [VALIDATED/READY TO MERGE] by Bixbott Autopilot."
      ],
      durationMs: 1500
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat and terminal logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [commandLogs]);

  // Terminal speed multiplier
  const getSpeedMultiplier = () => {
    if (terminalSpeed === "fast") return 0.3;
    if (terminalSpeed === "instant") return 0.01;
    return 1.0;
  };

  // Run the automated command succession
  const runAutoCommandProcess = async (startingIndex = 0) => {
    setIsProcessRunning(true);
    let logBuffer = [...commandLogs];
    
    for (let i = startingIndex; i < steps.length; i++) {
      setCurrentStepIndex(i);
      
      // Update step to running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "running" } : s));
      
      const step = steps[i];
      // Append command prompt
      logBuffer.push(`$ ${step.command}`);
      logBuffer.push(`[SYS] START - ${step.description}`);
      setCommandLogs([...logBuffer]);

      // Print step outputs sequentially with slight delay
      const speed = getSpeedMultiplier();
      const outputDelay = (step.durationMs / step.output.length) * speed;

      for (const line of step.output) {
        await new Promise(resolve => setTimeout(resolve, outputDelay));
        logBuffer.push(`   ${line}`);
        setCommandLogs([...logBuffer]);
      }

      // Mark step status
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "success" } : s));
      logBuffer.push(`[SYS] SUCCESS - ${step.id} completed successfully.`);
      logBuffer.push("");
      setCommandLogs([...logBuffer]);
    }

    setIsProcessRunning(false);
    setCurrentStepIndex(-1);

    // Chat agent response when auto-run is completed
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "bibot",
        content: `🎉 **QUY TRÌNH KÉO NHÁNH & KIỂM THỬ TỰ ĐỘNG ĐÃ HOÀN TẤT THÀNH CÔNG!** \n\nHệ thống tối ưu hóa mã nguồn PR số #42 trên repository **${activeRepo}** đã vượt qua tất cả các chốt chặn bảo mật, biên dịch lỗi cú pháp, và tự động liên kết thành công. Mã nguồn hiện đã sẵn sàng tích hợp thẳng vào phân hệ **${targetBranch}** của kiến trúc VL2 Pro.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleStopProcess = () => {
    setIsProcessRunning(false);
    setCommandLogs(prev => [...prev, "❌ [WARNING] Quy trình tự động đã bị dừng bởi Quản trị viên.", ""]);
    setSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "failed" } : s));
  };

  const handleResetProcess = () => {
    setIsProcessRunning(false);
    setCurrentStepIndex(-1);
    setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    setCommandLogs(["[BIXBOTT-DAEMON] Nhánh cơ sở đã được làm mới. Linh hồn điều phối sẵn sàng..."]);
  };

  // Preset quick triggers
  const triggerPRTemplate = (repoName: string, branchName: string, idNum: number) => {
    setActiveRepo(repoName);
    setSourceBranch(branchName);
    
    // Add user message
    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "user",
        content: `Yêu cầu tự động hóa: Kéo nhanh nhánh PR #${idNum} '${branchName}' trên repository ${repoName} và chạy kiểm thử an toàn.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "bibot",
          content: `🤖 **Đã nhận diện yêu cầu PR tự động.** \n\n* **Repository**: ${repoName}\n* **Mã nhánh**: ${branchName}\n* **Mục tiêu hợp nhất**: ${targetBranch}\n\nĐang gửi tín chỉ kích hoạt luồng kiểm thử qua hệ quản trị **Bixbott Command Pipeline**. Xin mời theo dõi biểu đồ thực thi và Terminal ở **Cột Bên Phải** để xem tiến trình thời gian thực!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Adjust commands names based on inputs
      setSteps(prev => prev.map((s, idx) => {
        if (idx === 0) {
          return {
            ...s,
            command: `git fetch origin pull/${idNum}/head:${branchName.replace("/", "-")}`,
            output: [
              `Connecting to repository ${repoName} ...`,
              `Mapping Remote reference pull/${idNum}/head ...`,
              `remote: Enumerating objects: 18, done.`,
              `Switched and synchronized local cache.`
            ]
          };
        }
        return s;
      }));

      // Launch process
      handleResetProcess();
      setTimeout(() => {
        runAutoCommandProcess(0);
      }, 500);

    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText("");

    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "user",
        content: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);

    // Simulate intelligent prompt response
    setTimeout(() => {
      setIsTyping(false);
      const lower = userMsg.toLowerCase();
      let responseText = "";
      let autoTrigger = false;

      if (lower.includes("pr") || lower.includes("pull") || lower.includes("kéo") || lower.includes("nhánh")) {
        responseText = `Tôi đã phân tích cụm từ bảo mật của bạn. Bạn muốn kéo nhánh tự động? \n\nTôi đã cấu hình một kịch bản ảo hóa thực tế để xác minh PR này trên repository **${activeRepo}** từ nhánh nguồn **${sourceBranch}** sang **${targetBranch}**.\n\nHệ lệnh Bixbott Auto-Run Pipeline sẽ được kích hoạt để đảm bảo an toàn tối đa. Bạn có thể nhấn nút **Chạy quy trình tự động** bất kỳ lúc nào để theo dõi.`;
        autoTrigger = true;
      } else if (lower.includes("quét") || lower.includes("vulner") || lower.includes("bảo mật") || lower.includes("security")) {
        responseText = `🛡️ **Bixbott Guard Security Module** đã được kích hoạt trực tiếp theo yêu cầu. Tôi sẽ chuyển tiếp quy trình phân tích tĩnh mã nguồn sang kịch bản nâng cao. Bạn sẽ được ưu tiên chạy quét mã độc trong bước 3 của quy trình.`;
      } else if (lower.includes("help") || lower.includes("trợ giúp") || lower.includes("hướng dẫn")) {
        responseText = `Bạn có thể trò chuyện với tôi để thiết lập hạ tầng kéo nhánh PR.\n\n* **Các câu lệnh hỗ trợ:**\n  - "Kéo nhánh PR bixbott-app"\n  - "Kiểm tra bảo mật và quét zero-day"\n  - "Kiểm tra xung đột nhánh"\n\nHoặc có thể chọn trực tiếp các Thẻ Mẫu PR Nhanh ở phía dưới cùng để khởi động tức thì!`;
      } else {
        responseText = `Đã ghi nhận yêu cầu: "${userMsg}". \n\nLà một hệ thống điều phối Multi-Agent tự trị cấp cao VL2, tôi đề xuất việc kiểm tra tích hợp liên tục. Hãy sử dụng bảng kích hoạt ở góc phải để mô phỏng dọn dẹp các xung đột cấu trúc.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "bibot",
          content: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (autoTrigger) {
        setTimeout(() => {
          runAutoCommandProcess(0);
        }, 1200);
      }

    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] text-slate-300">
      
      {/* HEADER SECTION WITH HIGH TECH HUD STATUS */}
      <div className="bg-[#0b0b0d] border border-[#1f1f23] rounded-t-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f27d26]/10 border border-[#f27d26]/30 text-[#f27d26] rounded-lg shadow-[0_0_12px_rgba(242,125,38,0.15)]">
            <GitPullRequest className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider leading-none">
                BẢN THIẾT KẾ KÉO NHÁNH PR TỰ TRỊ VL2 PRO
              </h2>
              <span className="text-[9px] bg-emerald-950/40 border border-emerald-500/30 text-[#00ff41] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
                CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">
              Trình kéo nhánh liên lết microservices, mô phỏng sandbox an toàn, kiểm tra tích hợp liên tục bảo vệ dotcom-03.
            </p>
          </div>
        </div>

        {/* Workspace controls */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#141417] border border-neutral-800 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">REPO HOẠT ĐỘNG:</span>
            <select 
              value={activeRepo} 
              onChange={(e) => setActiveRepo(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer border-none font-bold"
            >
              {REPOSITORIES.map(repo => (
                <option key={repo.name} value={repo.name} className="bg-[#0f0f12] text-slate-300">
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#141417] border border-neutral-800 px-3 py-1.5 rounded hidden lg:flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">ĐÍCH HỢP NHẤT:</span>
            <span className="text-[#f27d26] font-bold">origin/{targetBranch}</span>
          </div>

          <div className="flex items-center gap-1 bg-red-950/20 px-2 py-1 rounded border border-red-500/20 text-red-400 font-bold text-[10px] uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></div>
            Môi trường Sandbox VL2
          </div>
        </div>
      </div>

      {/* DETAILED GRAPHIC TWIN-PANEL VIEWPORT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-black/40 border-l border-r border-b border-[#1f1f23] rounded-b-lg">
        
        {/* ======================================================== */}
        {/* VIEW 1: LEFT COLUMN - CHAT AND BLUEPRINT COMMUNICATIONS */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col h-full border-r border-[#1f1f23] bg-[#070709]/80 overflow-hidden">
          
          {/* Section banner */}
          <div className="px-4 py-2 bg-[#0c0c0e] border-b border-[#1f1f23] flex items-center justify-between select-none">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-[#f27d26]" />
              TRUYỀN THÔNG TRỢ LÝ BIXBOTT
            </div>
            <span className="text-[9px] font-mono text-[#5c5c5c] font-bold">
              CONVO_ID: BXB-88402
            </span>
          </div>

          {/* Messages core container list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scroller-custom">
            
            {/* Context Info Box */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-lg text-xs leading-relaxed text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#f27d26] text-[10px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" /> Khung Điều Hành Tương Tác
              </div>
              <p>
                Trò chuyện với Bibot Agent để mô tả các nhánh bạn muốn phân tích. Bạn cũng có thể kéo nhanh các mẫu ở bảng điều khiển bên dưới để tự động chạy các dòng lệnh Git và kiểm lỗi an toàn.
              </p>
            </div>

            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Meta header */}
                <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-slate-500 font-bold uppercase select-none">
                  <span>{msg.role === "user" ? "QUẢN TRỊ VIÊN" : "BIBOT AUTOMATION"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble style */}
                <div 
                  className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed border ${
                    msg.role === "user" 
                      ? "bg-zinc-900 text-white border-neutral-700/80 rounded-tr-none" 
                      : "bg-[#0b0c10] text-slate-300 border-[#f27d26]/10 rounded-tl-none relative before:absolute before:top-0 before:left-[-6px] before:w-1.5 before:h-1.5 before:bg-[#0b0c10] before:border-l before:border-b before:border-[#f27d26]/10"
                  }`}
                >
                  <p className="whitespace-pre-line leading-normal">
                    {msg.content}
                  </p>

                  {/* Attachment card (if available) */}
                  {msg.attachedPR && (
                    <div className="mt-2.5 p-2 bg-black/40 border border-neutral-800 rounded flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-[#f27d26]" />
                        <span className="font-mono text-white text-[11px] font-bold">
                          {msg.attachedPR.branchName}
                        </span>
                      </div>
                      <span className="text-[9px] bg-[#f27d26]/10 text-[#f27d26] px-1 rounded font-mono font-bold uppercase">
                        {msg.attachedPR.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Simulated AI typing indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase font-bold">
                  Bixbott đang tính toán...
                </div>
                <div className="bg-[#0b0c10] border border-[#f27d26]/15 rounded-lg rounded-tl-none p-3 px-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#f27d26] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#f27d26] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#f27d26] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset templates Quick Trigger bar */}
          <div className="px-3 py-2 bg-zinc-950/90 border-t border-b border-[#1f1f23]">
            <span className="text-[9px] font-mono font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">
              KÍCH HOẠT NHANH BẢN THIẾT KẾ PR SẴN CÓ (TEMPLATES):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => triggerPRTemplate("bixbott-app", "feature/vl2-blueprint-ui", 42)}
                className="px-2 py-1 bg-[#f27d26]/5 hover:bg-[#f27d26]/15 border border-[#f27d26]/20 hover:border-[#f27d26]/50 rounded font-mono text-[9px] text-[#f27d26] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <GitPullRequest className="w-3 h-3" />
                PR #42 (vl2-ui)
              </button>
              <button
                type="button"
                onClick={() => triggerPRTemplate("bixbott-server", "hotfix/bixbott-sec-patch", 88)}
                className="px-2 py-1 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/50 rounded font-mono text-[9px] text-rose-400 font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                PR #88 (sec-patch)
              </button>
              <button
                type="button"
                onClick={() => triggerPRTemplate("bixbott-docs", "docs/update-guide-vl2", 15)}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded font-mono text-[9px] text-slate-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="w-3 h-3 text-sky-400" />
                PR #15 (docs-vl2)
              </button>
            </div>
          </div>

          {/* Chat user manual message input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#0a0a0c] border-t border-[#1f1f23] flex items-center gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Yêu cầu Bibot kiểm tra PR/Nhánh cụ thể..."
              disabled={isProcessRunning}
              className="flex-1 bg-zinc-950 hover:bg-black/40 border border-zinc-800 focus:border-[#f27d26]/60 rounded px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:outline-none transition-all disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={isProcessRunning || !inputText.trim()}
              className="px-4 py-2.5 bg-[#f27d26] hover:bg-[#f27d26]/90 disabled:opacity-30 disabled:cursor-not-allowed rounded text-black font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer"
              title="Gửi tin nhắn yêu cầu"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi
            </button>
          </form>

        </div>

        {/* ======================================================== */}
        {/* VIEW 2: RIGHT COLUMN - AUTO RUN COMMAND PROGRESS MONITOR */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col h-full bg-[#050507]">
          
          {/* Header Panel for Terminal process tracking */}
          <div className="px-4 py-2 bg-[#0c0c0e] border-b border-[#1f1f23] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#00ff41]" />
              THEO DÕI QUY TRÌNH AUTO RUN COMMAND (PIPELINE)
            </div>
            
            <div className="flex items-center gap-2.5">
              {/* Process indicator light */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <span className="text-[#5c5c5c]">TRẠNG THÁI:</span>
                {isProcessRunning ? (
                  <span className="text-yellow-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                    ACTIVE SPEED x{terminalSpeed === "normal" ? "1" : terminalSpeed === "fast" ? "3" : "100"}
                  </span>
                ) : (
                  <span className="text-slate-500 font-bold">READY IDLE</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Pipeline State Steps (Visual representation of sequential state) */}
          <div className="p-4 bg-[#0a0a0d] border-b border-[#1f1f23] grid grid-cols-2 md:grid-cols-6 gap-2 text-center select-none">
            {steps.map((st, idx) => {
              const isActive = idx === currentStepIndex;
              const isComp = st.status === "success";
              const isErr = st.status === "failed";
              
              return (
                <div 
                  key={st.id}
                  className={`p-1.5 border rounded flex flex-col items-center justify-center transition-all ${
                    isActive 
                      ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400 font-bold scale-102"
                      : isComp 
                        ? "bg-emerald-950/10 border-emerald-500/30 text-emerald-400"
                        : isErr 
                          ? "bg-red-950/10 border-red-500/30 text-red-400"
                          : "bg-zinc-950/60 border-zinc-900 text-slate-600"
                  }`}
                  title={`${st.id}: ${st.description}`}
                >
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest leading-none block text-slate-500 mb-1">
                     BƯỚC {idx + 1}
                  </span>
                  
                  {isComp ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                  ) : isActive ? (
                    <Cpu className="w-4 h-4 text-yellow-400 animate-spin" />
                  ) : isErr ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-800 mb-2 mt-1"></div>
                  )}

                  <span className="text-[9.5px] font-mono leading-none tracking-tight block truncate max-w-full">
                    {st.id.replace("-", " ").toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pipeline controls and speed modifiers */}
          <div className="px-4 py-2 bg-[#0c0c0e] border-b border-[#1f1f23] flex flex-wrap items-center justify-between gap-3 select-none">
            
            {/* Play controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => runAutoCommandProcess(0)}
                disabled={isProcessRunning}
                className="px-3 py-1.5 bg-emerald-950/30 hover:bg-emerald-900/40 disabled:opacity-20 disabled:cursor-not-allowed border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-all"
                title="Bắt đầu chạy pipeline lệnh từ đầu"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-500/10" /> Chạy quy trình
              </button>
              
              <button
                type="button"
                onClick={handleStopProcess}
                disabled={!isProcessRunning}
                className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 disabled:opacity-20 disabled:cursor-not-allowed border border-red-500/25 text-red-400 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-all"
                title="Dừng quy trình đang diễn ra"
              >
                <Square className="w-3.5 h-3.5 fill-red-500/10" /> Dừng
              </button>

              <button
                type="button"
                onClick={handleResetProcess}
                disabled={isProcessRunning}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed border border-zinc-800 text-slate-400 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-all"
                title="Đưa các bước kiểm thử về trạng thái chờ Ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm mới
              </button>
            </div>

            {/* Terminal simulation speed indicator */}
            <div className="flex items-center gap-1 bg-[#141417] border border-neutral-800 p-0.5 rounded text-[10px] font-mono">
              <span className="text-[9px] text-slate-500 font-bold uppercase px-2">TỐC ĐỘ:</span>
              <button
                type="button"
                onClick={() => setTerminalSpeed("normal")}
                className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                  terminalSpeed === "normal" ? "bg-[#f27d26] text-black" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                x1
              </button>
              <button
                type="button"
                onClick={() => setTerminalSpeed("fast")}
                className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                  terminalSpeed === "fast" ? "bg-[#f27d26] text-black" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                x3
              </button>
              <button
                type="button"
                onClick={() => setTerminalSpeed("instant")}
                className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                  terminalSpeed === "instant" ? "bg-[#f27d26] text-black" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                BÙNG NỔ
              </button>
            </div>

          </div>

          {/* Live scrolling Terminal outputs screen */}
          <div 
            ref={terminalEndRef}
            className="flex-1 p-4 bg-[#030304] font-mono text-[11px] text-[#00ff41] overflow-y-auto space-y-1 scroller-custom selection:bg-[#00ff41]/20 selection:text-white"
          >
            {/* Terminal welcome lines */}
            <div className="text-slate-500 font-sans italic text-xs border-b border-zinc-900 pb-2 mb-3 leading-relaxed flex items-center justify-between">
              <span>Bixbott secure command monitoring shell, interactive logs stdout</span>
              <span className="text-slate-600 font-mono not-italic text-[10px]">UTP_LATENCY: 12ms</span>
            </div>

            {commandLogs.map((log, index) => {
              let colorClass = "text-emerald-400";
              const isCommand = log.startsWith("$");
              const isSystemSuccess = log.includes("SUCCESS") || log.includes("marked as [VALIDATED/READY TO MERGE]");
              const isWarning = log.includes("❌") || log.includes("WARNING");
              const isSystemStart = log.includes("START -");

              if (isCommand) {
                colorClass = "text-white font-bold";
              } else if (isSystemSuccess) {
                colorClass = "text-emerald-300 font-bold bg-[#00ff41]/5 px-1 py-0.2 rounded border border-[#00ff41]/10";
              } else if (isWarning) {
                colorClass = "text-red-400 font-bold";
              } else if (isSystemStart) {
                colorClass = "text-yellow-400 font-bold";
              } else if (log.startsWith("   ")) {
                colorClass = "text-slate-400 font-mono"; // Indented command output lines
              }

              return (
                <div key={index} className={`leading-relaxed whitespace-pre-wrap ${colorClass}`}>
                  {log}
                </div>
              );
            })}

            {/* Prompt blinking cursor indicator */}
            {isProcessRunning && (
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold mt-1">
                <span>$ executing active bixbott-daemon...</span>
                <span className="w-1.5 h-3 bg-yellow-400 animate-[pulse_0.8s_infinite]" />
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
