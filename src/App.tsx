import { useState, useMemo, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { CORE_MODULES, SERVICE_LAYERS, REPOSITORIES, BIXBOTT_DOCS_CHAPTERS } from "./data";
import { ServiceState, LogEntry, DocChapter } from "./types";
import { ServiceCard } from "./components/ServiceCard";
import { RepoCard } from "./components/RepoCard";
import { BixbottAgentChat } from "./components/BixbottAgentChat";
import { InteractivePlayground } from "./components/InteractivePlayground";
import { PulseRateMeter } from "./components/PulseRateMeter";
import { HealthGaugeSection } from "./components/HealthGaugeSection";
import { PRBlueprintWorkspace } from "./components/PRBlueprintWorkspace";
import { 
  Bot, 
  Cpu, 
  Database,
  Terminal, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Github,
  Monitor,
  Heart,
  GitPullRequest,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Search,
  ArrowRight,
  Sparkles,
  Menu,
  X,
  Code,
  Copy,
  Check,
  Zap,
  Workflow,
  ShieldAlert,
  Info,
  Download,
  Command,
  Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<"landing" | "tools" | "repos" | "chat" | "docs" | "pr-blueprint">("landing");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [docsSearchQuery, setDocsSearchQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("overview-core");
  const [selectedRepoFilter, setSelectedRepoFilter] = useState<"all" | "bixbott-docs" | "docs">("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<"all" | "Hướng dẫn" | "API Reference" | "Kiến trúc">("all");
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const [coreModules, setCoreModules] = useState<ServiceState[]>(CORE_MODULES);
  const [serviceLayers, setServiceLayers] = useState<ServiceState[]>(SERVICE_LAYERS);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    {
      id: "log-initial",
      timestamp: new Date().toLocaleTimeString(),
      service: "System",
      message: "Orchestrator online. Connected to dotcom-03 repo registry.",
      type: "success"
    }
  ]);

  const logsContainerRef = useRef<HTMLDivElement>(null);
  const commandSearchInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll log feed to the bottom when new logs are added
  useEffect(() => {
    if (autoScrollEnabled && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [systemLogs, autoScrollEnabled]);

  // Handle service state changes from cards
  const handleServiceStateChange = (key: string, nextStatus: "running" | "stopped" | "idle" | "error") => {
    const update = (items: ServiceState[]) => 
      items.map(item => {
        if (item.key === key) {
          // Calculate simulated resource metrics depending on status
          let cpu = 0;
          let memory = 0;
          if (nextStatus === "running") {
            // Expanded ranges: CPU up to 9.5 (95%), Memory up to 500 MB to easily trigger threshold warnings
            cpu = parseFloat((Math.random() * 9.2 + 0.5).toFixed(1));
            memory = Math.floor(Math.random() * 470 + 40);
          }
          return { ...item, status: nextStatus, cpu, memory };
        }
        return item;
      });

    setCoreModules(prev => update(prev));
    setServiceLayers(prev => update(prev));
  };

  // Log feed pipeline
  const handleAddLog = (serviceName: string, text: string, type: "info" | "success" | "warn" | "error") => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      service: serviceName,
      message: text,
      type
    };
    
    setSystemLogs(prev => [...prev, newLog].slice(-50));

    // Append log line into corresponding service state logs list
    const appendServiceLog = (items: ServiceState[]) =>
      items.map(item => {
        if (item.name === serviceName) {
          return {
            ...item,
            logs: [text, ...item.logs].slice(0, 20)
          };
        }
        return item;
      });

    setCoreModules(prev => appendServiceLog(prev));
    setServiceLayers(prev => appendServiceLog(prev));
  };

  // Download raw text system logs
  const handleDownloadLogs = () => {
    if (systemLogs.length === 0) return;
    const logContent = systemLogs
      .map(log => `[${log.timestamp}] [${log.service.toUpperCase()}] [${log.type.toUpperCase()}] ${log.message}`)
      .join("\r\n");
    
    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bixbott_diagnostic_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Listen for keyboard shortcuts and define Command Palette actions
  const commands = useMemo(() => [
    { id: "goto-landing", label: "Trang Chủ", desc: "Chuyển hướng sang giao diện điều khiển chính", shortcut: "Alt + 1", action: () => { setActiveMainTab("landing"); setShowCommandPalette(false); } },
    { id: "goto-tools", label: "Trang Công Cụ (Telemeters)", desc: "Quản lý và theo dõi hiệu năng microservices", shortcut: "Alt + 2", action: () => { setActiveMainTab("tools"); setShowCommandPalette(false); } },
    { id: "goto-repos", label: "Nhiệm vụ & Repos", desc: "Quản lý build và tích hợp kho lưu trữ GitHub", shortcut: "Alt + 3", action: () => { setActiveMainTab("repos"); setShowCommandPalette(false); } },
    { id: "goto-chat", label: "Trợ Lý AI Chatbot", desc: "Hỏi đáp, kiểm thử hệ thống qua ngôn ngữ tự nhiên", shortcut: "Alt + 4", action: () => { setActiveMainTab("chat"); setShowCommandPalette(false); } },
    { id: "goto-pr-blueprint", label: "Kéo Nhánh & Auto-Run PR", desc: "Giao diện bản thiết kế kéo PR nhánh tự động", shortcut: "Alt + 5", action: () => { setActiveMainTab("pr-blueprint"); setShowCommandPalette(false); } },
    { id: "goto-docs", label: "Cẩm nang tài liệu Docs", desc: "Xem hướng dẫn sử dụng và tài liệu kỹ thuật", shortcut: "Alt + 6", action: () => { setActiveMainTab("docs"); setShowCommandPalette(false); } },
    { id: "action-restart-all", label: "Khởi động toàn bộ dịch vụ (Start/Restart All)", desc: "Kích hoạt RUNNING cho tất cả microservices", shortcut: "Alt + R", action: () => {
        const resetStatus = (items: ServiceState[]) => items.map(item => ({ ...item, status: "running" as const, cpu: parseFloat((Math.random() * 9.2 + 0.5).toFixed(1)), memory: Math.floor(Math.random() * 470 + 40) }));
        setCoreModules(resetStatus);
        setServiceLayers(resetStatus);
        setSystemLogs(prev => [...prev, {
          id: `log-cli-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          service: "System",
          message: "[MANUAL] Khởi chạy lại toàn diện hệ thống thông qua CLI Command Palette.",
          type: "success"
        }].slice(-50));
        setShowCommandPalette(false);
      }
    },
    { id: "action-stop-all", label: "Vô hiệu hóa toàn bộ dịch vụ (Stop All)", desc: "Dừng tất cả microservices để bảo trì hệ thống", shortcut: "Alt + S", action: () => {
        const stopStatus = (items: ServiceState[]) => items.map(item => ({ ...item, status: "stopped" as const, cpu: 0, memory: 0 }));
        setCoreModules(stopStatus);
        setServiceLayers(stopStatus);
        setSystemLogs(prev => [...prev, {
          id: `log-cli-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          service: "System",
          message: "[MANUAL] Tất cả node dịch vụ đã được vô hiệu hóa tạm thời từ Command Palette.",
          type: "warn"
        }].slice(-50));
        setShowCommandPalette(false);
      }
    },
    { id: "action-download-logs", label: "Tải xuống Nhật ký Hệ thống (.txt)", desc: "Xuất file .txt ghi nhận toàn bộ logs hiện hành", shortcut: "Alt + D", action: () => {
        handleDownloadLogs();
        setShowCommandPalette(false);
      } 
    },
    { id: "action-doc-core", label: "Mở nhanh: Kiến Trúc Core Bixbott Engine", desc: "Đọc về lõi nhân hệ điều khiển AI Core", shortcut: "", action: () => {
        setSelectedDocId("overview-core");
        setActiveMainTab("docs");
        setShowCommandPalette(false);
      }
    },
    { id: "action-doc-api", label: "Mở nhanh: Giao thức Bixbott Telemetry", desc: "Xem chi tiết định dạng gói tin và truyền tải SDK", shortcut: "", action: () => {
        setSelectedDocId("bixbott-telemetry-protocol");
        setActiveMainTab("docs");
        setShowCommandPalette(false);
      }
    },
  ], [systemLogs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K hoặc Cmd+K mở Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }

      // Escape để đóng Command Palette
      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }

      // Alt+1 to Alt+5: chuyển nhanh tab chính (chỉ kích hoạt khi không gõ phím trong input/textarea)
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveMainTab("landing");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveMainTab("tools");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveMainTab("repos");
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveMainTab("chat");
        } else if (e.key === "5") {
          e.preventDefault();
          setActiveMainTab("pr-blueprint");
        } else if (e.key === "6") {
          e.preventDefault();
          setActiveMainTab("docs");
        } else if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          const targetCmd = commands.find(c => c.id === "action-restart-all");
          if (targetCmd) targetCmd.action();
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          const targetCmd = commands.find(c => c.id === "action-stop-all");
          if (targetCmd) targetCmd.action();
        } else if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          const targetCmd = commands.find(c => c.id === "action-download-logs");
          if (targetCmd) targetCmd.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commands]);

  // Filtered commands list
  const filteredCommands = useMemo(() => {
    if (!commandSearch.trim()) return commands;
    const query = commandSearch.toLowerCase();
    return commands.filter(
      cmd =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.desc.toLowerCase().includes(query)
    );
  }, [commands, commandSearch]);

  useEffect(() => {
    if (showCommandPalette) {
      setCommandSearch("");
      const timer = setTimeout(() => {
        commandSearchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showCommandPalette]);

  // Real-time telemetry background fluctuation (heartbeat) every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const fluctuate = (items: ServiceState[]) =>
        items.map(item => {
          if (item.status === "running") {
            // Slight CPU variation: fluctuate randomly within +/- 1.0 units (i.e. +/- 10% CPU score)
            // But keep it bounded between 0.2 and 9.8
            const change = (Math.random() * 2.0 - 1.0);
            const nextCpu = Math.max(0.2, Math.min(9.8, parseFloat((item.cpu + change).toFixed(1))));
            
            // Slight Memory variation: fluctuate randomly (+/- 14 MB)
            // Keep bounded between 15MB and 500MB
            const memChange = Math.floor(Math.random() * 28 - 14);
            const nextMem = Math.max(15, Math.min(500, item.memory + memChange));

            return {
              ...item,
              cpu: nextCpu,
              memory: nextMem
            };
          }
          return item;
        });

      setCoreModules(prev => fluctuate(prev));
      setServiceLayers(prev => fluctuate(prev));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Star and forks aggregates
  const repoStats = useMemo(() => {
    let stars = 0;
    let forks = 0;
    REPOSITORIES.forEach(r => {
      stars += r.stars;
      forks += r.forks;
    });
    return { stars, forks, total: REPOSITORIES.length };
  }, []);

  // CPU and Memory sums, with dynamic stability computations
  const telemetrySums = useMemo(() => {
    let totalCpu = 0;
    let totalMemory = 0;
    let activeNodes = 0;
    let hasCpuAlert = false;
    let hasMemoryAlert = false;
    const alertNodes: string[] = [];

    let totalUptime = 0;
    let totalLatency = 0;
    let activeLatencyCount = 0;
    
    // Stability score starting at 100%
    let stability = 100;

    const allModules = [...coreModules, ...serviceLayers];

    allModules.forEach(item => {
      let uptime = 0;
      let latency = 0;
      
      const nodeCpuPercent = item.cpu * 10;
      const nodeMemPercent = (item.memory / 512) * 100;
      
      const itemHasCpuAlert = item.status === "running" && nodeCpuPercent > 80;
      const itemHasMemAlert = item.status === "running" && nodeMemPercent > 90;
      const isOverloaded = itemHasCpuAlert || itemHasMemAlert;

      if (item.status === "running") {
        totalCpu += item.cpu;
        totalMemory += item.memory;
        activeNodes += 1;
        
        if (itemHasCpuAlert) {
          hasCpuAlert = true;
        }
        if (itemHasMemAlert) {
          hasMemoryAlert = true;
        }
        if (isOverloaded) {
          alertNodes.push(item.name);
        }

        uptime = 99.98;
        // base latency depends on cpu/memory footprint
        latency = 1.5 + (item.cpu * 1.5) + (item.memory * 0.04);
        
        if (itemHasCpuAlert) {
          uptime -= (nodeCpuPercent - 80) * 0.12;
          latency += (nodeCpuPercent - 80) * 3.2;
        }
        if (itemHasMemAlert) {
          uptime -= (nodeMemPercent - 90) * 0.18;
          latency += (nodeMemPercent - 90) * 4.0;
        }

        totalUptime += uptime;
        totalLatency += latency;
        activeLatencyCount++;
      } else if (item.status === "error") {
        uptime = 18.5;
        latency = 350.0;
        totalUptime += uptime;
        totalLatency += latency;
        activeLatencyCount++;
      } else if (item.status === "idle") {
        uptime = 100.0;
        latency = 1.0;
        totalUptime += uptime;
        totalLatency += latency;
        activeLatencyCount++;
      } else if (item.status === "stopped") {
        uptime = 0.0;
        totalUptime += uptime;
      }
    });

    // Deduct stability penalty
    coreModules.forEach(item => {
      if (item.status === "stopped") stability -= 10;
      if (item.status === "error") stability -= 25;
      
      const cpuP = item.cpu * 10;
      const memP = (item.memory / 512) * 100;
      if (item.status === "running" && (cpuP > 80 || memP > 90)) stability -= 8;
    });

    serviceLayers.forEach(item => {
      if (item.status === "stopped") stability -= 6;
      if (item.status === "error") stability -= 16;
      
      const cpuP = item.cpu * 10;
      const memP = (item.memory / 512) * 100;
      if (item.status === "running" && (cpuP > 80 || memP > 90)) stability -= 5;
    });

    stability = Math.max(5, Math.min(100, stability));
    const averageUptime = parseFloat((totalUptime / allModules.length).toFixed(2));
    const averageLatency = activeLatencyCount > 0 ? parseFloat((totalLatency / activeLatencyCount).toFixed(1)) : 0;

    return {
      cpu: parseFloat(totalCpu.toFixed(1)),
      memory: totalMemory,
      activeNodes,
      totalNodes: allModules.length,
      hasCpuAlert,
      hasMemoryAlert,
      alertNodes,
      stabilityScore: stability,
      averageUptime,
      averageLatency
    };
  }, [coreModules, serviceLayers]);

  // Hooking Repo Card to Gemini chat box
  const handleAskAIAboutRepo = (repoName: string) => {
    const targetRepo = REPOSITORIES.find(r => r.name === repoName);
    if (!targetRepo) return;

    setChatPrompt(
      `Tôi muốn tìm hiểu kỹ lưỡng về kho lưu trữ: **dotcom-03/${targetRepo.name}**.\n\n` +
      `Hãy giải thích nhiệm vụ chính của dự án này, ngôn ngữ lập trình \`${targetRepo.mainLanguage}\` được tối ưu hóa như thế nào, và cách nó ăn khớp vào kiến trúc phân phối Bixbott (Web, App, Server).`
    );

    // Scroll to chatbot on mobile dynamically
    const chatElement = document.getElementById("bixbott-chat");
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderDocParagraphs = (content: string) => {
    const blocks = content.split("\n\n");
    return blocks.map((block, idx) => {
      // 1. Is it a header?
      if (block.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-mono text-base sm:text-lg font-bold text-[#f27d26] mt-6 mb-3 border-b border-[#1f1f23] pb-2 uppercase tracking-wide">
            {block.replace("## ", "")}
          </h3>
        );
      }
      if (block.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-mono text-sm sm:text-base font-bold text-slate-100 mt-4 mb-2">
            {block.replace("### ", "")}
          </h4>
        );
      }
      // 2. Is it a quote block?
      if (block.startsWith("> ")) {
        return (
          <div key={idx} className="border-l-2 border-[#f27d26] bg-[#f27d26]/5 p-4 rounded font-sans text-xs sm:text-sm text-slate-300 my-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#f27d26] shrink-0 mt-0.5" />
            <div>{block.replace(/^>\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</div>
          </div>
        );
      }
      // 3. Is it a code block?
      if (block.startsWith("```")) {
        const lines = block.split("\n");
        const firstLine = lines[0];
        const lang = firstLine.replace("```", "") || "bash";
        const codeLines = lines.slice(1, lines.length - 1).join("\n");
        return (
          <div key={idx} className="my-5 border border-[#1f1f23] rounded overflow-hidden">
            <div className="bg-[#141417] px-4 py-1.5 flex justify-between items-center text-[10px] font-mono border-b border-[#1f1f23]">
              <span className="text-[#f27d26] uppercase font-bold">{lang}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeLines);
                  setCopiedDocId(idx.toString());
                  setTimeout(() => setCopiedDocId(null), 2000);
                }}
                className="flex items-center gap-1 text-[#5c5c5c] hover:text-[#f27d26] transition-colors cursor-pointer"
              >
                {copiedDocId === idx.toString() ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00ff41]" />
                    <span className="text-[#00ff41]">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-[#050505] overflow-x-auto text-xs font-mono text-emerald-400">
              <code>{codeLines}</code>
            </pre>
          </div>
        );
      }
      
      // 4. Bullets list?
      if (block.trim().startsWith("- ") || block.trim().startsWith("* ")) {
        const listItems = block.split("\n").map(l => l.replace(/^[-*]\s*/, ""));
        return (
          <ul key={idx} className="list-disc pl-5 my-3 text-slate-300 space-y-1.5 font-sans leading-relaxed text-xs sm:text-sm">
            {listItems.map((item, idy) => (
              <li key={idy}>
                {item.split("**").map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="text-[#f27d26] font-mono font-semibold">{part}</strong> : part)}
              </li>
            ))}
          </ul>
        );
      }

      // 5. Basic markdown table
      if (block.includes("|") && block.includes("---")) {
        const lines = block.split("\n");
        const headers = lines[0].split("|").slice(1, -1).map(h => h.trim());
        const bodyCells = lines.slice(2).map(l => l.split("|").slice(1, -1).map(c => c.trim()));
        return (
          <div key={idx} className="my-5 overflow-x-auto border border-[#1f1f23] rounded">
            <table className="w-full text-left font-mono text-[11px] sm:text-xs">
              <thead className="bg-[#141417] border-b border-[#1f1f23] text-[#f27d26] uppercase">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f23] bg-[#0c0c0e]">
                {bodyCells.map((row, i) => (
                  <tr key={i} className="hover:bg-[#141417]/30">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 text-slate-300">
                        {cell.replace(/`/g, "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Default: simple paragraph, support markdown bold **text** and inline code `code`
      return (
        <p key={idx} className="text-slate-300 leading-relaxed my-3 font-sans font-light text-xs sm:text-sm">
          {block.split("**").map((chunk1, cidx1) => {
            const item1 = cidx1 % 2 === 1 ? <strong key={cidx1} className="text-[#f27d26]/90 font-mono font-semibold">{chunk1}</strong> : chunk1;
            
            if (typeof item1 === "string") {
              return item1.split("`").map((chunk2, cidx2) => {
                if (cidx2 % 2 === 1) {
                  return <code key={cidx2} className="px-1.5 py-0.5 bg-[#141417] border border-[#1f1f23] rounded font-mono text-[11px] text-[#f27d26] font-bold">{chunk2}</code>;
                }
                return chunk2;
              });
            }
            return item1;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased selection:bg-[#f27d26]/10 selection:text-[#f27d26]">
      
      {/* HEADER BAR */}
      <header className="border-b border-[#1f1f23] bg-[#0c0c0e]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => setActiveMainTab("landing")}
              className="w-10 h-10 bg-gradient-to-tr from-[#f27d26] to-[#e06b16] rounded flex items-center justify-center shadow-[0_0_15px_rgba(242,125,38,0.15)] ring-1 ring-[#f27d26]/30 cursor-pointer"
              title="Về Trang Chủ"
            >
              <Bot className="w-6 h-6 text-black font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  onClick={() => setActiveMainTab("landing")}
                  className="font-mono text-base font-extrabold tracking-tight text-slate-100 uppercase sm:text-lg cursor-pointer hover:text-[#f27d26] transition-colors"
                >
                  Bixbott Console VL2
                </span>
                <span className="text-[10px] font-mono bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] px-1.5 py-0.5 rounded uppercase font-bold select-none">
                  VL2 PRO
                </span>
              </div>
              <p className="text-[11px] text-[#5c5c5c] font-mono tracking-tight uppercase leading-none font-bold hidden sm:block">
                Hệ điều hành AI VL2 & Liên kết Kho Lưu trữ dotcom-03
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#050505] border border-[#1f1f23] p-1 rounded font-mono text-xs max-w-fit select-none mx-2 animate-in fade-in duration-300">
            <button
              onClick={() => setActiveMainTab("landing")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "landing"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Trang Chủ</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "landing" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥1</span>
            </button>
            <button
              onClick={() => setActiveMainTab("tools")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "tools"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Trang Công Cụ</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "tools" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥2</span>
            </button>
            <button
              onClick={() => setActiveMainTab("repos")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "repos"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Nhiệm Vụ & Repos</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "repos" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥3</span>
            </button>
            <button
              onClick={() => setActiveMainTab("chat")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "chat"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Trợ Lý AI</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "chat" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥4</span>
            </button>
            <button
              onClick={() => setActiveMainTab("pr-blueprint")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "pr-blueprint"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Kéo Nhánh & PR</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "pr-blueprint" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥5</span>
            </button>
            <button
              onClick={() => setActiveMainTab("docs")}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1.5 group/btn ${
                activeMainTab === "docs"
                  ? "bg-[#f27d26] text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Cẩm Nang Docs</span>
              <span className={`text-[8px] scale-90 px-1 py-0.2 rounded font-mono ${
                activeMainTab === "docs" ? "bg-black/10 text-black/90" : "bg-[#141417] text-[#5c5c5c] group-hover/btn:text-[#f27d26]/80"
              }`}>⌥6</span>
            </button>
          </nav>

          {/* Header Action Elements */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop Quick Stats Grid Header */}
            <div className="hidden xl:flex items-center gap-5 text-xs font-mono text-slate-400 mr-2 border-r border-[#1f1f23] pr-5 py-1">
              <div className="pl-4 py-0.5 border-l border-[#1f1f23] flex items-center gap-1.5">
                <div>
                  <span className="text-[9px] text-[#5c5c5c] block font-bold leading-none mb-1">CPU</span>
                  <span className={`font-bold text-xs ${telemetrySums.hasCpuAlert ? "text-red-500 animate-pulse" : "text-[#f27d26]"}`}>
                    {telemetrySums.cpu}%
                  </span>
                </div>
                {telemetrySums.hasCpuAlert && (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-bounce" title="CPU alert: Node load exceeds 80%!" />
                )}
              </div>
              <div className="pl-4 py-0.5 border-l border-[#1f1f23] flex items-center gap-1.5">
                <div>
                  <span className="text-[9px] text-[#5c5c5c] block font-bold leading-none mb-1">RAM</span>
                  <span className={`font-bold text-xs ${telemetrySums.hasMemoryAlert ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {telemetrySums.memory}MB
                  </span>
                </div>
                {telemetrySums.hasMemoryAlert && (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-bounce" title="RAM alert: Node memory exceeds 90%!" />
                )}
              </div>
              <div className="pl-4 py-0.5 border-l border-[#1f1f23]">
                <span className="text-[9px] text-[#5c5c5c] block font-bold leading-none mb-1">NODES</span>
                <span className="text-[#00ff41] font-bold text-xs">{telemetrySums.activeNodes}/{telemetrySums.totalNodes}</span>
              </div>
            </div>
            
            {/* Quick Command Palette terminal trigger button */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 font-mono text-xs text-[#f27d26]/90 hover:text-[#f27d26] bg-[#f27d26]/5 hover:bg-[#f27d26]/10 border border-[#f27d26]/20 hover:border-[#f27d26]/40 rounded transition-all cursor-pointer group shrink-0"
              title="Mở bảng điều phối lệnh nhanh [Ctrl + K]"
            >
              <Command className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-bold text-[11px] uppercase tracking-wider">COMMANDS</span>
              <kbd className="text-[8px] bg-black text-[#f27d26]/70 px-1.5 py-0.5 rounded border border-[#f27d26]/20 font-bold font-mono select-none">
                Ctrl K
              </kbd>
            </button>

            <a 
              href="https://github.com/dotcom-03" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:text-white bg-[#050505] border border-[#1f1f23] rounded hover:border-[#f27d26]/30 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4 text-[#f27d26]" />
              <span className="font-bold">dotcom-03</span>
              <ExternalLink className="w-3 h-3 text-[#5c5c5c]" />
            </a>

            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-[#050505] border border-[#1f1f23] rounded cursor-pointer transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#f27d26]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAVBAR DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1f1f23] bg-[#0c0c0e] px-4 py-3 flex flex-col gap-1.5 font-mono text-xs sticky top-18 z-40 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => { setActiveMainTab("landing"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "landing" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>TRANG CHỦ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveMainTab("tools"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "tools" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>TRANG CÔNG CỰ (CONSOLE)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveMainTab("repos"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "repos" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>NHIỆM VỤ & REPOS GITHUB</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveMainTab("chat"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "chat" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>TRỢ LÝ CHAT AI</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveMainTab("pr-blueprint"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "pr-blueprint" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>KÉO NHÁNH & PR PHẦN MỀM</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveMainTab("docs"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded transition-all cursor-pointer flex items-center justify-between ${
              activeMainTab === "docs" 
                ? "bg-[#f27d26]/10 border-l-2 border-[#f27d26] text-[#f27d26] font-bold" 
                : "text-slate-400 hover:bg-[#141417]"
            }`}
          >
            <span>CẨM NANG HƯỚNG DẪN (DOCS)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* REVOLUTIONARY METRIC OVERLAYS FOR MOBILE (DASHBOARD ONLY) */}
      {(activeMainTab === "tools" || activeMainTab === "repos") && (
        <section className="lg:hidden border-b border-[#1f1f23] bg-[#0c0c0e]/20 px-4 py-3.5">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`bg-[#050505] border p-3 rounded text-center flex flex-col justify-center items-center transition-colors duration-300 ${telemetrySums.hasCpuAlert ? "border-red-500/50 bg-red-950/10" : "border-[#1f1f23]"}`}>
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold">CPU LOAD</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`font-mono text-sm font-bold ${telemetrySums.hasCpuAlert ? "text-red-500 animate-pulse" : "text-[#f27d26]"}`}>{telemetrySums.cpu}%</span>
                {telemetrySums.hasCpuAlert && <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-bounce" />}
              </div>
            </div>
            <div className={`bg-[#050505] border p-3 rounded text-center flex flex-col justify-center items-center transition-colors duration-300 ${telemetrySums.hasMemoryAlert ? "border-red-500/50 bg-red-950/10" : "border-[#1f1f23]"}`}>
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold">MEMORY USE</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`font-mono text-sm font-bold ${telemetrySums.hasMemoryAlert ? "text-red-500 animate-pulse" : "text-white"}`}>{telemetrySums.memory} MB</span>
                {telemetrySums.hasMemoryAlert && <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-bounce" />}
              </div>
            </div>
            <div className="bg-[#050505] border border-[#1f1f23] p-3 rounded text-center">
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold">ACTIVE NODES</span>
              <span className="font-mono text-sm font-bold text-[#00ff41]">{telemetrySums.activeNodes} / 10</span>
            </div>
            <div className="bg-[#050505] border border-[#1f1f23] p-3 rounded text-center">
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold">REPOS INTEGRATED</span>
              <span className="font-mono text-sm font-bold text-[#f27d26]">{repoStats.total} Units</span>
            </div>
          </div>
        </section>
      )}


      {/* LANDING PAGE VIEW */}
      {activeMainTab === "landing" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16 animate-in fade-in duration-300">
          
          {/* Hero Section */}
          <div className="relative border border-[#1f1f23] bg-[#0c0c0e] rounded p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col items-center text-center">
            {/* Background neon elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#f27d26]/3 to-transparent rounded-tr-full pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-6 flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#f27d26]/10 border border-[#f27d26]/20 font-mono text-xs text-[#f27d26] uppercase tracking-wider font-bold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> BIXBOTT AGENT ECOSYSTEM VL2 PRO
              </span>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-mono font-extrabold tracking-tight text-white leading-none">
                Hệ Điều Hành <span className="text-[#f27d26]">Multi-Agent</span> & Giám Sát Hạ Tầng
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 font-sans font-light leading-relaxed max-w-2xl">
                Chào mừng tới giải pháp DevSecOps Multi-Agent tự trị tối tân. Bixbott tự động liên kết dữ liệu thời gian thực của <strong className="text-white font-mono font-medium">11 Repositories</strong> chính thuộc dotcom-03, bảo đảm an toàn điện toán biên tối ưu thông qua AI điều phối khép kín.
              </p>

              {/* Hero Actions Call to Action */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setActiveMainTab("tools")}
                  className="px-6 py-3.5 bg-[#f27d26] hover:bg-[#e06b16] text-black font-mono font-extrabold text-xs sm:text-sm rounded shadow-[0_0_20px_rgba(242,125,38,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <span>BẮT ĐẦU VẬN HÀNH CONSOLE</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setActiveMainTab("docs")}
                  className="px-6 py-3.5 bg-[#050505] hover:bg-[#141417] text-slate-200 hover:text-white border border-[#1f1f23] hover:border-[#f27d26]/40 font-mono font-bold text-xs sm:text-sm rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#f27d26]" />
                  <span>XEM TÀI LIỆU KỸ THUẬT (DOCS)</span>
                </button>
              </div>
            </div>

            {/* Hero Quick Telemetry Dashboard */}
            <div className="w-full mt-10 md:mt-12 pt-8 border-t border-[#1f1f23]/60 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left font-mono">
              <div className="bg-[#050505] p-4 border border-[#1f1f23] rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#5c5c5c] font-bold">MONITORING LAB</span>
                  <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse"></span>
                </div>
                <p className="text-xs text-slate-400">Thiết bị hoạt động</p>
                <p className="text-lg font-bold text-[#f27d26]">{telemetrySums.activeNodes}/{telemetrySums.totalNodes} Nodes</p>
              </div>
              
              <div className="bg-[#050505] p-4 border border-[#1f1f23] rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#5c5c5c] font-bold">EDGE LATENCY</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-slate-400">Thời gian phản hồi</p>
                <p className="text-lg font-bold text-white">&lt; 15 ms</p>
              </div>

              <div className={`p-4 border rounded transition-colors duration-300 ${telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert ? "bg-red-950/15 border-red-500/50" : "bg-[#050505] border-[#1f1f23]"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold ${telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert ? "text-red-400" : "text-[#5c5c5c]"}`}>
                    {telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert ? "SYSTEM ALERT" : "CONNECTIVE STACK"}
                  </span>
                  {telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-[#f27d26]" />
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {telemetrySums.hasCpuAlert ? "CPU Quá tải (>80%)" : telemetrySums.hasMemoryAlert ? "RAM Quá tải (>90%)" : "Chiếm dụng CPU"}
                </p>
                <p className={`text-lg font-bold ${telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {telemetrySums.cpu}% {telemetrySums.hasCpuAlert && <span className="text-xs font-normal text-red-400 font-mono ml-1">[QUÁ TẢI]</span>}
                </p>
              </div>

              <div className="bg-[#050505] p-4 border border-[#1f1f23] rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#5c5c5c] font-bold">GITHUB METADATA</span>
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">Kho dữ liệu tích hợp</p>
                <p className="text-lg font-bold text-[#f27d26]">{repoStats.total} Repos</p>
              </div>
            </div>
          </div>

          {/* SYSTEM STABILITY PULSE RATE METER */}
          <PulseRateMeter
            stabilityScore={telemetrySums.stabilityScore}
            averageUptime={telemetrySums.averageUptime}
            averageLatency={telemetrySums.averageLatency}
            activeCount={telemetrySums.activeNodes}
            totalCount={telemetrySums.totalNodes}
          />

          {/* Section 2: Core Ecosystem Benefits */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-mono font-bold uppercase tracking-tight text-white">Lợi Điểm Tuyệt Đối Của Bixbott</h2>
              <p className="text-xs text-[#5c5c5c] uppercase font-mono mt-1 font-bold">Các thước đo kiến tạo lên sự thành công của dotcom-03</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-[#1f1f23] bg-[#050505] p-6 rounded relative overflow-hidden group hover:border-[#f27d26]/40 transition-colors">
                <div className="p-3 bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] w-fit rounded mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-mono text-base font-bold text-slate-200 mb-2">Bảo Mật Tầng Biên (Edge Security)</h3>
                <p className="text-xs text-slate-400 font-sans font-light leading-relaxed">
                  Hạn chế hoàn toàn các nguy cơ rò rỉ khóa API hay thông tin đăng nhập nhờ thuật toán băm bảo vệ K-Anonymity độc đáo, xử lý siêu tốc qua Cloudflare Workers và Azure Functions mã nguồn mở.
                </p>
              </div>

              <div className="border border-[#1f1f23] bg-[#050505] p-6 rounded relative overflow-hidden group hover:border-[#f27d26]/40 transition-colors">
                <div className="p-3 bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] w-fit rounded mb-4">
                  <Workflow className="w-6 h-6" />
                </div>
                <h3 className="font-mono text-base font-bold text-slate-200 mb-2">Đồng Bộ Trạng Thái Đồng Khởi</h3>
                <p className="text-xs text-slate-400 font-sans font-light leading-relaxed">
                  Giám sát đồng thời hoạt động của 11 micro-services từ giao diện thiết kế Web UI cho tới kịch bản console, hỗ trợ kỉ cương điều vận nhấp nháy chuyển trạng thái thời gian thực.
                </p>
              </div>

              <div className="border border-[#1f1f23] bg-[#050505] p-6 rounded relative overflow-hidden group hover:border-[#f27d26]/40 transition-colors">
                <div className="p-3 bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] w-fit rounded mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-mono text-base font-bold text-slate-200 mb-2">Thủ Lĩnh AI Guard Resident</h3>
                <p className="text-xs text-slate-400 font-sans font-light leading-relaxed">
                  Mô hình AI bảo mật cục bộ máy chủ sẵn sàng giải đáp kịch bản biên dịch, tra cứu cấu trúc tệp tin, gỡ lỗi và phân tích log hệ thống tiếng Việt mượt mà.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Github Tech Repositories Showcase */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#1f1f23] pb-4 gap-3">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-mono font-bold uppercase tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                  <Github className="w-5.5 h-5.5 text-[#f27d26]" /> 11 Dự Án Kỹ Thuật Nền Tảng
                </h2>
                <p className="text-xs text-[#5c5c5c] uppercase font-mono mt-1 font-bold">Khám phá chi tiết mã nguồn mở được vận hành tự trị</p>
              </div>
              <button
                onClick={() => setActiveMainTab("repos")}
                className="px-4 py-2 border border-[#f27d26]/30 hover:border-[#f27d26] text-[#f27d26] hover:bg-[#f27d26]/5 rounded font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>QUẢN TRỊ TRÊN CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REPOSITORIES.map(repo => (
                <RepoCard 
                  key={repo.name} 
                  repo={repo} 
                  onAskAI={(name) => {
                    handleAskAIAboutRepo(name);
                  }} 
                />
              ))}
            </div>
          </div>

          {/* Section 4: Secondary Call to Action Card */}
          <div className="relative border border-[#1f1f23] bg-gradient-to-r from-[#0c0c0e] to-[#f27d26]/5 p-8 rounded shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight">Vận hành hạ tầng AI trong 10 giây</h3>
              <p className="text-xs text-slate-400 font-sans font-light leading-relaxed">
                Khuấy động tài nguyên, kích hoạt dịch vụ và trải nghiệm ngay bảng thử nghiệm dòng lệnh với tài liệu hướng dẫn cực kỳ trực quan của Bixbott Guard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto h-fit">
              <button
                onClick={() => setActiveMainTab("tools")}
                className="px-6 py-2.5 bg-[#f27d26] hover:bg-[#e06b16] text-black font-mono font-extrabold text-xs rounded transition-colors cursor-pointer text-center"
              >
                KHỞI CHẠY CONSOLE NGAY
              </button>
              <button
                onClick={() => setActiveMainTab("docs")}
                className="px-6 py-2.5 bg-[#050505] border border-[#1f1f23] hover:border-[#f27d26]/30 text-slate-300 font-mono text-xs font-bold rounded transition-colors cursor-pointer text-center"
              >
                TRA CỨU HƯỚNG DẪN
              </button>
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: TRANG CÔNG CỤ CONSOLE */}
      {activeMainTab === "tools" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 animate-in fade-in duration-300">
          
          {/* BANNER GREETINGS */}
          <div className="relative border border-[#1f1f23] bg-[#0c0c0e] p-6 rounded shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="relative">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block mb-1 flex items-center gap-1 font-bold">
                <Activity className="w-3.5 h-3.5 text-[#f27d26]" /> BIXBOTT RESOURCE ORCHESTRATOR
              </span>
              <h2 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white mb-2 leading-tight">
                Hệ Thống Trực Quan Hóa & Điều Hành Dịch Vụ
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-light max-w-3xl">
                Kiểm soát trạng thái của các lõi dịch vụ, bật/tắt các tác vụ, đo lường độ trễ mạng lưới, xem lu���ng logs hoạt động và thử nghiệm các tính năng hộp cát tự trị của Bixbott.
              </p>
            </div>
          </div>

          {/* DYNAMIC RESOURCE WARNING BANNER */}
          {(telemetrySums.hasCpuAlert || telemetrySums.hasMemoryAlert) && (
            <div className="border border-red-500/30 bg-red-950/10 p-4.5 rounded shadow-xl flex items-start gap-3.5 animate-pulse relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <ShieldAlert className="w-5.5 h-5.5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                  CẢNH BÁO: PHÁT HIỆN NODE VƯỢT NGƯỠNG AN TOÀN TÀI NGUYÊN (SYSTEM ALERT THRESHOLD EXCEEDED)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                  Phát hiện nút dịch vụ hoạt động vượt ngưỡng an toàn <strong className="text-white font-mono font-bold">CPU &gt; 80%</strong> hoặc <strong className="text-white font-mono font-bold">RAM &gt; 90%</strong>. 
                  Các nút đang cảnh báo: <span className="font-mono text-red-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-red-950 ml-1 inline-block">{telemetrySums.alertNodes.join(", ")}</span>
                </p>
                <p className="text-[10.5px] text-slate-400 font-sans italic">
                  Khuyến nghị: Sử dụng thanh công cụ bên dưới hoặc Trợ lý AI Bixbott để rà soát lỗi luồng hoặc nhấn "Khởi động lại (Restart)" để ổn định tài nguyên biên.
                </p>
              </div>
            </div>
          )}

          {/* SYSTEM STABILITY PULSE RATE METER */}
          <PulseRateMeter
            stabilityScore={telemetrySums.stabilityScore}
            averageUptime={telemetrySums.averageUptime}
            averageLatency={telemetrySums.averageLatency}
            activeCount={telemetrySums.activeNodes}
            totalCount={telemetrySums.totalNodes}
          />

          {/* OVERALL SYSTEM HEALTH STABILITY GAUGE SECTION */}
          <HealthGaugeSection
            stabilityScore={telemetrySums.stabilityScore}
            coreModules={coreModules}
            serviceLayers={serviceLayers}
            telemetrySums={telemetrySums}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* CORE MODULES COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shadow-sm">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-slate-100 leading-none">
                      Lõi Hệ Thống (Bixbott Core Components)
                    </h2>
                    <span className="text-[10px] text-[#5c5c5c] font-sans">Kiểm soát cơ sở dữ liệu và AI engine</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-[#050505] px-2 py-0.5 rounded border border-[#1f1f23] text-slate-400 font-bold text-xs">
                  Core Layer
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {coreModules.map(service => (
                  <ServiceCard 
                    key={service.key} 
                    service={service} 
                    onStateChange={handleServiceStateChange}
                    onAddLog={handleAddLog}
                  />
                ))}
              </div>
            </div>

            {/* SERVICE DELIVERY LAYERS COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-slate-100 leading-none">
                      Cổng Phân Phối Dịch Vụ (Delivery Layers)
                    </h2>
                    <span className="text-[10px] text-[#5c5c5c] font-sans">Quản trị các endpoints biên dịch Web, Mobile và Tài liệu</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-[#050505] px-2 py-0.5 rounded border border-[#1f1f23] text-slate-400 font-bold text-xs">
                  Delivery Layer
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {serviceLayers.map(service => (
                  <ServiceCard 
                    key={service.key} 
                    service={service} 
                    onStateChange={handleServiceStateChange}
                    onAddLog={handleAddLog}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* INTERACTIVE PLAYGROUND SANDBOX & LOG FEED (GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* PLAYGROUND SANDBOX */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shadow-sm">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-white leading-none">
                      Hộp cát thử nghiệm công cụ (Playground Sandbox)
                    </h2>
                    <span className="text-[10px] text-[#5c5c5c] font-sans">Tương tác trực tiếp và chạy thuật toán băm biên</span>
                  </div>
                </div>
              </div>
              
              <InteractivePlayground />
            </div>

            {/* LOG STREAM DISPLAY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shadow-sm">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-white leading-none">
                      Bảng Nhật Ký Điều Hành (Global Logs Feed)
                    </h2>
                    <span className="text-[10px] text-[#5c5c5c] font-sans">Luồng sự kiện điều orchestration thời gian thực</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-scroll Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[10px] font-mono font-bold text-[#5c5c5c] uppercase tracking-wider hidden sm:inline">
                      Tự động cuộn
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoScrollEnabled}
                      onClick={() => setAutoScrollEnabled(prev => !prev)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 outline-none focus:outline-none cursor-pointer ${
                        autoScrollEnabled ? "bg-[#f27d26]/20 border-[#f27d26]/40" : "bg-[#141417] border-neutral-800 hover:border-neutral-700"
                      }`}
                      title={autoScrollEnabled ? "Ấn để tắt tự động cuộn" : "Ấn để bật tự động cuộn"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full transition-all duration-200 ${
                          autoScrollEnabled ? "translate-x-5 bg-[#f27d26] shadow-[0_0_8px_rgba(242,125,38,0.7)]" : "translate-x-1 bg-slate-600"
                        }`}
                      />
                    </button>
                  </label>

                  <button
                    onClick={handleDownloadLogs}
                    disabled={systemLogs.length === 0}
                    className="px-2.5 py-1.5 bg-[#f27d26]/10 hover:bg-[#f27d26]/20 disabled:opacity-40 disabled:cursor-not-allowed border border-[#f27d26]/20 hover:border-[#f27d26]/45 rounded text-[10px] font-mono text-[#f27d26] transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-bold"
                    title="Tải xuống nhật ký sự kiện (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xuất Log (.TXT)
                  </button>
                </div>
              </div>

              <div 
                ref={logsContainerRef}
                className="bg-[#050505] border border-[#1f1f23] rounded p-4.5 font-mono text-xs max-h-56 overflow-y-auto scrollbar-custom space-y-1.5 leading-relaxed text-slate-300"
              >
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-[#141417] pb-1 hover:bg-[#0c0c0e]/30">
                    <span className="text-[#5c5c5c] shrink-0 select-none">[{log.timestamp}]</span>
                    <span className="text-[#f27d26] font-bold shrink-0">{log.service}:</span>
                    <span className={`flex-1 ${
                      log.type === "success" ? "text-[#00ff41]" :
                      log.type === "warn" ? "text-amber-400" :
                      log.type === "error" ? "text-red-400" : "text-slate-300"
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      )}

      {/* TAB 3: TRANG NHIỆM VỤ & REPOSITORIES */}
      {activeMainTab === "repos" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 animate-in fade-in duration-300">
          
          {/* HEADER SUMMARY OF REPOS */}
          <div className="relative border border-[#1f1f23] bg-[#0c0c0e] p-6 rounded shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="relative space-y-2">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block font-bold">
                REPOSITORY REGISTRY & RECONCILIATION
              </span>
              <h2 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white leading-none">
                Kho Mã Nguồn & Giám Sát Nhiệm Vụ
              </h2>
              <p className="text-xs text-slate-400 font-sans font-light max-w-2xl leading-relaxed">
                Khám phá chi tiết 11 kho lưu trữ mã nguồn mở lớn và các nhiệm vụ rà soát rủi ro bảo mật do Bixbott Auto-Agent chịu trách nhiệm giám sát. Nhấn để yêu cầu AI phân tích sâu từng Repository cụ thể.
              </p>
            </div>

            <div className="relative font-mono flex items-center gap-6 shrink-0 bg-[#050505] p-4 rounded border border-[#1f1f23]">
              <div className="text-center px-2">
                <span className="text-[10px] text-[#5c5c5c] font-bold uppercase block mb-1">STARS</span>
                <span className="text-lg font-bold text-[#f27d26]">{repoStats.stars} ★</span>
              </div>
              <div className="w-px h-8 bg-[#1f1f23]"></div>
              <div className="text-center px-2">
                <span className="text-[10px] text-[#5c5c5c] font-bold uppercase block mb-1">FORKS</span>
                <span className="text-lg font-bold text-white">{repoStats.forks} ⑂</span>
              </div>
              <div className="w-px h-8 bg-[#1f1f23]"></div>
              <div className="text-center px-2">
                <span className="text-[10px] text-[#5c5c5c] font-bold uppercase block mb-1">TOTAL</span>
                <span className="text-lg font-bold text-[#00ff41]">{repoStats.total} Repos</span>
              </div>
            </div>
          </div>

          {/* CHECKLIST NHIỆM VỤ SYSTEM MONITORING */}
          <div className="border border-[#1f1f23] bg-[#050505] rounded p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#141417] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#f27d26]" />
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-white">Nhiệm Vụ Đang Xử Lý & Giám Sát An Ninh Biên</h3>
                  <p className="text-[10px] text-[#5c5c5c] font-sans">Kế hoạch rà soát rò rỉ khóa API, lỗ hổng zero-day tự động của Bixbott Guard</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#f27d26]/10 text-[#f27d26] border border-[#f27d26]/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                Trạng thái: Tối Ưu
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#0c0c0e] border border-[#1f1f23] p-3.5 rounded flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00ff41] mt-1.5 animate-ping"></div>
                <div className="space-y-1">
                  <p className="text-white font-bold uppercase text-[11px]">RÀ SOÁT CHỮ KÝ API KEY PHƠI PHÀN</p>
                  <p className="text-[10.5px] text-slate-400 font-sans">Đang tự động băm bảo vệ K-Anonymity trên 11 Repositories</p>
                  <span className="text-[9px] bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20 px-1 py-0.2 rounded font-bold">HOÀN THÀNH AN TOÀN</span>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-[#1f1f23] p-3.5 rounded flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 animate-pulse"></div>
                <div className="space-y-1">
                  <p className="text-white font-bold uppercase text-[11px]">ĐỒNG BỘ TRẠNG THÁI CORE-SERVICES</p>
                  <p className="text-[10.5px] text-slate-400 font-sans">Đang cập nhật chỉ số sử dụng tài nguyên của từng microservices biên</p>
                  <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1 py-0.2 rounded font-bold">ĐANG TIẾN HÀNH</span>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-[#1f1f23] p-3.5 rounded flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00ff41] mt-1.5 animate-ping"></div>
                <div className="space-y-1">
                  <p className="text-white font-bold uppercase text-[11px]">PHÂN TÍCH CHÉO DEPENDENCY GRAPHS</p>
                  <p className="text-[10.5px] text-slate-400 font-sans">Đối soát mã nguồn với cẩm nang hướng dẫn bixbott-docs</p>
                  <span className="text-[9px] bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20 px-1 py-0.2 rounded font-bold">HOÀN THÀNH AN TOÀN</span>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-[#1f1f23] p-3.5 rounded flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#5c5c5c] mt-1.5"></div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold uppercase text-[11px]">XÁC THỰC COMPILER RULES GITHUB ACTIONS</p>
                  <p className="text-[10.5px] text-slate-600 font-sans">Kích hoạt bộ phân tích tĩnh kiểm tra mã độc bixbott-app</p>
                  <span className="text-[9px] bg-[#0c0c0e] text-slate-500 border border-[#1f1f23] px-1 py-0.2 rounded font-bold">ĐANG CHỜ EVENT COLD</span>
                </div>
              </div>
            </div>
          </div>

          {/* THE 11 REPOSITORIES SHOWN IN GORGEOUS GRID */}
          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Github className="w-4 h-4 text-[#f27d26]" /> Danh sách 11 kho lưu trữ kỹ thuật của dotcom-03
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REPOSITORIES.map(repo => (
                <RepoCard 
                  key={repo.name} 
                  repo={repo} 
                  onAskAI={handleAskAIAboutRepo} 
                />
              ))}
            </div>
          </div>

        </main>
      )}

      {/* TAB 4: TRỢ LÝ AI (STANDALONE CHAT) */}
      {activeMainTab === "chat" && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-9 animate-in fade-in duration-300">
          
          {/* EXPLANATORY HEADER */}
          <div className="relative border border-[#1f1f23] bg-[#050505] p-5 rounded flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none text-right"></div>
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shrink-0">
                <Bot className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1">
                <h2 className="font-mono text-base font-bold text-white uppercase leading-none">
                  Trợ Lý Toàn Năng Bixbott Guard AI
                </h2>
                <p className="text-xs text-slate-400 font-sans font-light">
                  Phân tích bảo mật, giải đáp kịch bản biên dịch, tra cứu cấu trúc 11 Github Repositories của dotcom-03 dựa trên sức mạnh của trí lực AI thế hệ mới.
                </p>
              </div>
            </div>
            
            <div className="px-3.5 py-2 font-mono text-[10px] text-slate-500 bg-[#0c0c0e] border border-[#1f1f23] rounded flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></span>
              <span>Gemini 2.5 Active</span>
            </div>
          </div>

          {/* CHAT IN MULTI-COLUMN CONTROLPANEL FOCUS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2">
              <BixbottAgentChat 
                initialPrompt={chatPrompt} 
                onClearPrompt={() => setChatPrompt(undefined)}
              />
            </div>

            {/* SIDE PANEL SYSTEM INFO CONTEXT */}
            <div className="space-y-6">
              
              <div className="border border-[#1f1f23] bg-[#050505] rounded p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#f27d26]"></div>
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#f27d26]" /> Ghi Chú Bảo Mật K-Anonymity
                </h3>
                <div className="text-xs text-slate-400 font-sans font-light space-y-3 leading-relaxed">
                  <p>
                    Bixbott Guard AI liên tục quét chữ băm SHA-256 của các mật khẩu bị rò rỉ. Mật khẩu không bao giờ được gửi đi dưới dạng bản rõ, mà chỉ gửi tiền tố 5 ký tự đầu để bảo vệ dữ liệu người dùng tuyệt đối.
                  </p>
                  <p>
                    Bạn có thể hỏi AI về bất kỳ dự án nào trong 11 dự án mấu chốt của <span className="font-mono text-[#f27d26]">dotcom-03</span>, bao gồm các dự án Cloudflare Worker, Azure Function và công cụ băm mật khẩu.
                  </p>
                </div>
              </div>

              <div className="border border-[#1f1f23] bg-[#050505] rounded p-5 space-y-3.5">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  💡 Gợi Ý Câu Hỏi Trợ Lý
                </h3>
                <div className="text-[11px] font-mono text-slate-400 space-y-2">
                  <button 
                    onClick={() => setChatPrompt("Kiến trúc phân phối microservices của Bixbott hoạt động như thế nào?")}
                    className="w-full text-left p-2.5 rounded bg-[#0c0c0e] hover:bg-[#141417] border border-[#1f1f23] transition-all text-slate-300 hover:text-white cursor-pointer block"
                  >
                    → Kiến trúc phân phối microservices của Bixbott hoạt động thế nào?
                  </button>
                  <button 
                    onClick={() => setChatPrompt("Giải thích hoạt động của PwnedPasswordsSpeedChallenge và cách mã hóa bảo mật.")}
                    className="w-full text-left p-2.5 rounded bg-[#0c0c0e] hover:bg-[#141417] border border-[#1f1f23] transition-all text-slate-300 hover:text-white cursor-pointer block"
                  >
                    → Giải thích hoạt động của PwnedPasswordsSpeedChallenge?
                  </button>
                  <button 
                    onClick={() => setChatPrompt("Làm sao Cloudflare Worker giải quyết bài toán mã hóa K-Anonymity nhanh hơn?")}
                    className="w-full text-left p-2.5 rounded bg-[#0c0c0e] hover:bg-[#141417] border border-[#1f1f23] transition-all text-slate-300 hover:text-white cursor-pointer block"
                  >
                    → Làm sao Cloudflare Worker giải quyết băm K-Anonymity?
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* TAB 5: PR BLUEPRINT WORKSPACE WITH DUAL SCREEN AUTORUN PROGRESS */}
      {activeMainTab === "pr-blueprint" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
          <PRBlueprintWorkspace />
        </main>
      )}

      {/* LANDING & DOCS TABS RENDERING */}
      {activeMainTab === "docs" && (() => {
        const filteredChapters = BIXBOTT_DOCS_CHAPTERS.filter(ch => {
          const matchesSearch = docsSearchQuery === "" || 
            ch.title.toLowerCase().includes(docsSearchQuery.toLowerCase()) ||
            ch.summary.toLowerCase().includes(docsSearchQuery.toLowerCase()) ||
            ch.category.toLowerCase().includes(docsSearchQuery.toLowerCase()) ||
            ch.content.toLowerCase().includes(docsSearchQuery.toLowerCase());
          
          const matchesRepo = selectedRepoFilter === "all" || ch.repository === selectedRepoFilter;
          const matchesCategory = selectedCategoryFilter === "all" || ch.category === selectedCategoryFilter;

          return matchesSearch && matchesRepo && matchesCategory;
        });

        const activeDoc = BIXBOTT_DOCS_CHAPTERS.find(ch => ch.id === selectedDocId) || BIXBOTT_DOCS_CHAPTERS[0];

        return (
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 items-start relative animate-in fade-in duration-300">
            
            {/* LEFT COLUMN: Sidebar Navigation & Filters */}
            <div className="w-full md:w-[30%] lg:w-[25%] space-y-6 md:sticky md:top-24 select-none shrink-0">
              
              <div>
                <h2 className="font-mono text-sm font-extrabold uppercase text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#f27d26]" /> Tra Cứu Tài Liệu
                </h2>
                <span className="text-[10px] text-[#5c5c5c] font-sans font-medium block mt-1 uppercase">
                  QUẢN LÝ TỰ ĐỘNG BIXBOTT-DOCS VÀ DOCS REPO
                </span>
              </div>

              {/* Search & Filter Box */}
              <div className="bg-[#050505] border border-[#1f1f23] rounded p-4 space-y-4">
                
                {/* Search Box */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-[#5c5c5c] font-bold uppercase block">Tên hoặc nội dung tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5c5c5c]" />
                    <input
                      type="text"
                      placeholder="Tìm từ khóa..."
                      value={docsSearchQuery}
                      onChange={(e) => setDocsSearchQuery(e.target.value)}
                      className="w-full bg-[#0c0c0e] border border-[#1f1f23] rounded pl-9 pr-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#f27d26] transition-colors"
                    />
                    {docsSearchQuery && (
                      <button
                        onClick={() => setDocsSearchQuery("")}
                        className="absolute right-2 top-2 p-1 text-[#5c5c5c] hover:text-white text-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Repo Filter Pill Group */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-[#5c5c5c] font-bold uppercase block">Bộ lọc Kho Lưu trữ</label>
                  <div className="grid grid-cols-3 gap-1 grid-flow-row text-[9.5px] font-mono">
                    <button
                      onClick={() => setSelectedRepoFilter("all")}
                      className={`text-center py-1 rounded border transition-all cursor-pointer ${
                        selectedRepoFilter === "all"
                          ? "bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/30 font-bold"
                          : "bg-[#0c0c0e]/40 text-[#5c5c5c] border-[#1f1f23] hover:text-slate-300"
                      }`}
                    >
                      TẤT CẢ
                    </button>
                    
                    <button
                      onClick={() => setSelectedRepoFilter("bixbott-docs")}
                      className={`text-center py-1 rounded border transition-all cursor-pointer ${
                        selectedRepoFilter === "bixbott-docs"
                          ? "bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/30 font-bold"
                          : "bg-[#0c0c0e]/40 text-[#5c5c5c] border-[#1f1f23] hover:text-slate-300"
                      }`}
                      title="bixbott-docs"
                    >
                      BIXBOTT
                    </button>

                    <button
                      onClick={() => setSelectedRepoFilter("docs")}
                      className={`text-center py-1 rounded border transition-all cursor-pointer ${
                        selectedRepoFilter === "docs"
                          ? "bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/30 font-bold"
                          : "bg-[#0c0c0e]/40 text-[#5c5c5c] border-[#1f1f23] hover:text-slate-300"
                      }`}
                      title="docs/wiki"
                    >
                      DOCS
                    </button>
                  </div>
                </div>

                {/* Category Filter Pill Group */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-[#5c5c5c] font-bold uppercase block">Bộ lọc phân mục</label>
                  <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                    {["all", "Hướng dẫn", "API Reference", "Kiến trúc"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat as any)}
                        className={`px-2.5 py-1 rounded border transition-all cursor-pointer uppercase ${
                          selectedCategoryFilter === cat
                            ? "bg-white text-black border-white font-bold"
                            : "bg-[#0c0c0e]/40 text-slate-400 border-[#1f1f23] hover:text-slate-200"
                        }`}
                      >
                        {cat === "all" ? "Tất Cả" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nav List chapters */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-[#5c5c5c] font-bold uppercase tracking-wider block">CHƯƠNG TÀI LIỆU ({filteredChapters.length})</span>
                
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto scrollbar-custom pr-1">
                  {filteredChapters.length === 0 ? (
                    <p className="text-xs text-slate-500 font-sans italic py-4">Không tìm thấy tài liệu phù hợp.</p>
                  ) : (
                    filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedDocId(ch.id)}
                        className={`w-full text-left p-2.5 rounded border transition-all cursor-pointer block group ${
                          selectedDocId === ch.id
                            ? "bg-[#141417] border-[#f27d26] text-white"
                            : "bg-transparent border-[#1f1f23] text-slate-400 hover:bg-[#141417]/20 hover:text-white"
                        }`}
                      >
                        <p className="font-mono text-xs font-bold leading-normal truncate group-hover:text-[#f27d26] transition-colors">{ch.title}</p>
                        <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                          <span className="text-slate-500">{ch.category}</span>
                          <span className={`px-1 py-0.5 rounded border leading-none font-bold uppercase ${
                            ch.repository === "bixbott-docs" 
                              ? "bg-[#f27d26]/10 border-[#f27d26]/20 text-[#f27d26]" 
                              : "bg-[#050505] border-[#1f1f23] text-slate-500"
                          }`}>
                            {ch.repository}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Document Content Reader */}
            <div className="w-full md:w-[70%] lg:w-[75%] border border-[#1f1f23] bg-[#0c0c0e] rounded p-6 shadow-xl space-y-6">
              
              {/* Active Doc Header */}
              <div className="border-b border-[#1f1f23] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[9px] font-mono text-[#f27d26] font-bold uppercase leading-none">
                      {activeDoc.category}
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#050505] border border-[#1f1f23] rounded text-[9px] font-mono text-slate-400 leading-none font-bold uppercase">
                      REPO: {activeDoc.repository}
                    </span>
                  </div>
                  <h1 className="font-mono text-base sm:text-2xl font-black text-white">{activeDoc.title}</h1>
                </div>

                <a
                  href={`https://github.com/dotcom-03/${activeDoc.repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 font-mono text-[10px] text-slate-400 hover:text-white bg-[#050505] border border-[#1f1f23] rounded transition-transform scale-100 hover:scale-[1.02] cursor-pointer shrink-0"
                >
                  <Github className="w-3.5 h-3.5 text-[#f27d26]" />
                  <span>XEM TRÊN GITHUB</span>
                </a>
              </div>

              {/* Doc Summary Context Alert */}
              <div className="border-l-4 border-[#1f1f23] bg-[#050505] p-4.5 rounded text-xs text-slate-400 font-sans italic tracking-wide leading-relaxed">
                <strong>Khám phá nhanh:</strong> {activeDoc.summary}
              </div>

              {/* Render doc contents */}
              <div className="article-body">
                {renderDocParagraphs(activeDoc.content)}
              </div>

              <div className="border-t border-[#1f1f23]/60 pt-6 mt-12 flex justify-between items-center text-xs font-mono text-slate-500">
                <span>Qúy khách đang đọc: {activeDoc.id}.md</span>
                <button
                  onClick={() => setActiveMainTab("tools")}
                  className="text-[#f27d26] hover:text-[#e06b16] transition-colors font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Quay về Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>
        );
      })()}

      {/* FOOTER BAR */}
      <footer className="border-t border-[#1f1f23] bg-[#0c0c0e] py-8.5 mt-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#050505] border border-[#1f1f23] rounded flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#f27d26]" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                Bixbott Resident Infrastructure VL2
              </span>
              <p className="text-[10px] text-[#5c5c5c] font-sans font-light">
                Developed in high-density sandbox console with full dotcom-03 repo integrations, fully updated to version 2.0 (VL2).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4.5 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#f27d26] fill-[#f27d26]" />
              Crafted for dotcom-03
            </span>
            <span>Uptime: 100% stable</span>
          </div>
        </div>
      </footer>

      {/* COMMAND PALETTE COMPONENT (Spotlight / Cmd+K style panel) */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommandPalette(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] p-4"
          >
            <motion.div
              initial={{ scale: 0.97, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0c0c0e] border border-[#1f1f23]/90 hover:border-[#f27d26]/35 w-full max-w-xl rounded shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col cursor-normal"
            >
              {/* Search Bar section */}
              <div className="p-4 border-b border-[#1f1f23] bg-black/40 flex items-center gap-3">
                <Command className="w-5 h-5 text-[#f27d26] shrink-0 animate-pulse" />
                <input
                  ref={commandSearchInputRef}
                  value={commandSearch}
                  onChange={e => setCommandSearch(e.target.value)}
                  type="text"
                  placeholder="Nhập lệnh điều phối, tên trang hoặc phím tắt..."
                  className="bg-transparent text-white placeholder-slate-500 font-mono text-sm w-full focus:outline-none focus:ring-0 outline-none border-none py-1"
                />
                <button
                  onClick={() => setShowCommandPalette(false)}
                  className="text-[10px] font-mono bg-[#141417] text-[#5c5c5c] px-2 py-1 rounded border border-[#1f1f23] hover:text-white cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Guide Bar */}
              <div className="px-4 py-2 bg-[#050505] border-b border-[#1f1f23]/65 text-[9px] font-mono text-[#5c5c5c] flex justify-between uppercase font-bold tracking-widest">
                <span>DANH SÁCH LỆNH LIÊN KẾT NHANH</span>
                <span>Kết quả tìm thấy: {filteredCommands.length}</span>
              </div>

              {/* Command List items */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1 scroller-custom bg-black/20">
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full text-left p-3 rounded font-mono transition-all duration-150 hover:bg-[#f27d26]/5 border border-transparent hover:border-[#f27d26]/20 flex items-center justify-between group/cmd cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-200 group-hover/cmd:text-[#f27d26]">
                        {cmd.label}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover/cmd:text-slate-400 font-sans">
                        {cmd.desc}
                      </span>
                    </div>

                    {cmd.shortcut ? (
                      <kbd className="text-[9px] bg-[#141417] text-slate-400 group-hover/cmd:text-[#f27d26] px-1.5 py-0.5 rounded border border-[#1f1f23] transition-colors shadow">
                        {cmd.shortcut}
                      </kbd>
                    ) : (
                      <div className="text-[10px] text-slate-600 font-sans group-hover/cmd:text-[#f27d26] flex items-center gap-1">
                        Chạy nhanh <span>➔</span>
                      </div>
                    )}
                  </button>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="text-center text-[#5c5c5c] py-8 text-xs font-mono">
                    Không tìm thấy lệnh hoặc phím tắt tương ứng cho "{commandSearch}"
                  </div>
                )}
              </div>

              {/* Command Palette Status Bar footer */}
              <div className="p-3 bg-[#050505] border-t border-[#1f1f23] text-[9px] font-mono text-[#5c5c5c] flex justify-between items-center bg-black/60">
                <span className="flex items-center gap-1 text-slate-400">
                  💡 <span>Ấn <kbd className="bg-[#141417] border border-[#1f1f23] px-1 rounded mx-0.5 text-[#f27d26] font-bold">Alt</kbd> + [1-5]</span> từ bất kì đâu để chuyển nhanh tab!
                </span>
                <span className="text-slate-400 uppercase font-bold tracking-tight">OS CONSOLE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}
