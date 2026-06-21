import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, ShieldAlert, Cpu, Terminal, Search, Copy, Check, FileText, ChevronRight } from "lucide-react";

export const InteractivePlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pwned" | "linux" | "extractor" | "terminal">("pwned");

  // Pwned Passwords state
  const [password, setPassword] = useState("");
  const [pwnedResult, setPwnedResult] = useState<any | null>(null);
  const [isCheckingPwned, setIsCheckingPwned] = useState(false);

  // Linux command state
  const [commandQuery, setCommandQuery] = useState("");
  const [commands, setCommands] = useState<any[]>([]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Email extractor state
  const [rawText, setRawText] = useState(
    "Logs #2348 - admin@bixbott-server.dev - connection established.\n" +
    "Warning: potential breach on backup client dotcom_deployer@gmail.com by attacker from ip 127.0.0.1.\n" +
    "Send recovery token securely to security-ops@dotcom-03.org for validation. Support mail: support@bixbott-api.dev."
  );
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
  const [isExtracted, setIsExtracted] = useState(false);

  // Terminal Simulator state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "=== BIXBOTT DEVOPS INTERACTIVE TERMINAL v2.4 ===",
    "Mã dòng lệnh liên kết với dotcom-03/cli & dotcom-03/copilot-cli",
    "Gõ 'help' hoặc 'bixbott status' để xem thông tin dịch vụ.",
    ""
  ]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial commands load
    fetchCommands();
  }, [commandQuery]);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  const fetchCommands = async () => {
    try {
      const res = await fetch(`/api/commands?q=${commandQuery}`);
      const data = await res.json();
      setCommands(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsCheckingPwned(true);
    try {
      const res = await fetch("/api/pwned-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      setPwnedResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingPwned(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const handleExtractEmails = () => {
    // Regex for Email Extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = rawText.match(emailRegex) || [];
    // Remove duplicates
    const uniqueEmails = Array.from(new Set(matches));
    setExtractedEmails(uniqueEmails);
    setIsExtracted(true);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLines = [...terminalLines, `bixbott@console:~$ ${cmd}`];
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === "clear") {
      setTerminalLines([]);
      setTerminalInput("");
      return;
    }

    if (lowerCmd === "help") {
      newLines.push(
        "Các lệnh khả dụng trong hệ thống Bixbott CLI:",
        "  help                               - Hiển thị danh sách câu lệnh",
        "  clear                              - Xóa sạch màn hình terminal",
        "  bixbott status                     - Hiển thị tài nguyên phần cứng",
        "  bixbott list-repos                 - Danh sách 11 kho tài nguyên Github dotcom-03",
        "  bixbott analyze <repo-name>        - Phân tích thông tin dự án",
        ""
      );
    } else if (lowerCmd === "bixbott status") {
      newLines.push(
        "--- BIXBOTT SYSTEM DIAGNOSTICS ---",
        "Orchestrator   : ACTIVE (Port 3000)",
        "API Gateway    : SHIELDING MODE on SSL 443",
        "Engine Node    : AI-READY (3.5-flash cluster)",
        "Database Link  : DISK READ SAFE",
        "SYSTEM HEALTH  : 99.85% uptime baseline stable.",
        ""
      );
    } else if (lowerCmd === "bixbott list-repos") {
      newLines.push(
        "+----------------------------------+------------------+----------+",
        "| REPOSITORY NAME                  | FUNCTION         | RATING   |",
        "+----------------------------------+------------------+----------+",
        "| PwnedPasswordsSpeedChallenge     | Speed hash check | [★★★☆☆]  |",
        "| PwnedPasswordsCloudflareWorker   | Edge serverless  | [★★★★☆]  |",
        "| ux-rebuild                       | Visual overhaul  | [★★★☆☆]  |",
        "| LinuxCommandLibrary              | Offline docs     | [★★★★★]  |",
        "| EmailAddressExtractor            | Regex tool       | [★★★☆☆]  |",
        "| copilot-cli                      | Rust AI DevOps   | [★★★★★]  |",
        "| cli                              | Core shell controller| [★★★★☆]  |",
        "+----------------------------------+------------------+----------+",
        "Gõ 'bixbott analyze <name>' để trích xuất sâu cấu trúc mã.",
        ""
      );
    } else if (lowerCmd.startsWith("bixbott analyze")) {
      const target = cmd.substring("bixbott analyze".length).trim();
      if (!target) {
        newLines.push("Vui lòng chỉ định một kho dự án. Ví dụ: bixbott analyze copilot-cli");
      } else {
        newLines.push(
          `🚀 Đang phân tích mã nguồn tại dotcom-03/${target}...`,
          `[SUCCESS] Kết nối nhánh HEAD thành công.`,
          `> Kiến trúc chính: Được viết dưới triết lý hiệu năng cao.`,
          `> Khuyến nghị: Kết hợp với Trợ lý AI Bixbott bên mép phải để khai thác mã mẫu.`,
          ""
        );
      }
    } else {
      newLines.push(
        `bash: command not found: ${cmd}`,
        "Vui lòng gõ 'help' để xem hướng dẫn sử dụng dòng lệnh.",
        ""
      );
    }

    setTerminalLines(newLines);
    setTerminalInput("");
  };

  return (
    <div className="border border-[#1f1f23] bg-[#0c0c0e]/40 rounded overflow-hidden shadow-xl">
      {/* Tab Selectors */}
      <div className="bg-[#0c0c0e] border-b border-[#1f1f23] flex flex-wrap">
        <button
          onClick={() => setActiveTab("pwned")}
          className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs font-semibold tracking-tight uppercase border-r border-[#1f1f23] transition-colors ${
            activeTab === "pwned"
              ? "bg-[#050505] text-[#f27d26] border-t-2 border-t-[#f27d26]"
              : "text-[#5c5c5c] hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#f27d26]" />
          Pwned Checker
        </button>
        <button
          onClick={() => setActiveTab("linux")}
          className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs font-semibold tracking-tight uppercase border-r border-[#1f1f23] transition-colors ${
            activeTab === "linux"
              ? "bg-[#050505] text-[#f27d26] border-t-2 border-t-[#f27d26]"
              : "text-[#5c5c5c] hover:text-slate-200"
          }`}
        >
          <Search className="w-4 h-4 text-[#f27d26]" />
          Linux commands
        </button>
        <button
          onClick={() => setActiveTab("extractor")}
          className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs font-semibold tracking-tight uppercase border-r border-[#1f1f23] transition-colors ${
            activeTab === "extractor"
              ? "bg-[#050505] text-[#f27d26] border-t-2 border-t-[#f27d26]"
              : "text-[#5c5c5c] hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-[#f27d26]" />
          Mail Extractor
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs font-semibold tracking-tight uppercase transition-colors ${
            activeTab === "terminal"
              ? "bg-[#050505] text-[#f27d26] border-t-2 border-t-[#f27d26]"
              : "text-[#5c5c5c] hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4 text-[#f27d26]" />
          Bixbott Terminal
        </button>
      </div>

      {/* Tab panel contents */}
      <div className="p-6">
        
        {/* TAB 1: PWNED PASSWORDS */}
        {activeTab === "pwned" && (
          <div>
            <div className="mb-5">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block mb-1">
                Security Node Simulator
              </span>
              <h4 className="font-mono font-bold text-base text-white flex items-center gap-2">
                Kiểm tra rò rỉ mật khẩu bảo mật (Pwned Database)
              </h4>
              <p className="text-xs text-slate-400 font-sans font-light mt-1.5 max-w-2xl leading-relaxed">
                Mô phỏng cơ chế bộ lọc biên từ các dự án <span className="font-mono text-[#f27d26]">PwnedPasswordsCloudflareWorker</span> và <span className="font-mono text-[#f27d26]">PwnedPasswordsAzureFunction</span>. Nhập mật khẩu để đánh giá tốc độ challenge (tính bằng ms) và xem mật khẩu đã từng bị lộ hay chưa.
              </p>
            </div>

            <form onSubmit={handleCheckPassword} className="flex gap-2.5 max-w-xl mb-6">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mẫu thử mật khẩu (Ví dụ: 123456, admin, bixbott...)"
                className="flex-1 bg-[#050505] border border-[#1f1f23] rounded px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#f27d26] transition-all placeholder:text-[#5c5c5c]"
                required
              />
              <button
                type="submit"
                disabled={isCheckingPwned || !password}
                className="bg-[#f27d26] hover:bg-[#e06b16] text-black font-mono text-xs font-bold uppercase tracking-tight px-5 rounded disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isCheckingPwned ? "Đang quét..." : "Kiểm tra"}
              </button>
            </form>

            {pwnedResult && (
              <div className="border border-[#1f1f23] bg-[#050505] rounded p-5 max-w-xl flex items-start gap-4">
                <div className="p-3 bg-[#0c0c0e] border border-[#1f1f23] rounded">
                  {pwnedResult.status === "secure" ? (
                    <ShieldCheck className="w-8 h-8 text-[#00ff41]" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Trạng thái:{" "}
                      <span className={pwnedResult.status === "secure" ? "text-[#00ff41]" : "text-rose-400"}>
                        {pwnedResult.status === "secure" ? "An Toàn" : "Rò rỉ"}
                      </span>
                    </span>

                    <span className="text-[10px] font-mono bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] px-2 py-0.5 rounded">
                      {pwnedResult.latencyMs} ms latency
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                    {pwnedResult.advice}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-t border-[#1f1f23] pt-3 text-[11px] font-mono text-[#5c5c5c]">
                    <div>
                      <span>Số lần bị lộ:</span>
                      <span className="text-slate-300 block font-bold text-sm">
                        {pwnedResult.count.toLocaleString()} lần
                      </span>
                    </div>
                    <div>
                      <span>Phần cứng phản hồi:</span>
                      <span className="text-slate-300 block font-bold text-xs">
                        Edge Cloudflare API
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINUX COMMANDS SEARCH */}
        {activeTab === "linux" && (
          <div>
            <div className="mb-5">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block mb-1">
                Lớp Dòng lệnh & Hệ Thống
              </span>
              <h4 className="font-mono font-bold text-base text-white">
                Thư viện tra cứu phím tắt dòng lệnh Linux
              </h4>
              <p className="text-xs text-slate-400 font-sans font-light mt-1.5 max-w-2xl leading-relaxed">
                Tương tác ngoại tuyến trực tiếp với mã nguồn từ kho tài nguyên <span className="font-mono text-[#f27d26]">LinuxCommandLibrary</span>. Tra cứu nhanh lệnh quản lý file, phân tích mạng, điều phối bộ nhớ của máy chủ.
              </p>
            </div>

            <div className="relative max-w-xl mb-6">
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Tìm commands (Ví dụ: ls, grep, chmod, tail...)"
                className="w-full bg-[#050505] border border-[#1f1f23] rounded pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#f27d26] transition-all placeholder:text-[#5c5c5c]"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#5c5c5c]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto scrollbar-custom pr-2">
              {commands.map((cmd) => (
                <div key={cmd.command} className="border border-[#1f1f23] bg-[#050505] rounded p-4 flex flex-col justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#f27d26] mb-1 block">
                      {cmd.command}
                    </span>
                    <p className="text-xs text-slate-400 font-sans leading-snug line-clamp-2 mb-3 font-light">
                      {cmd.description}
                    </p>
                  </div>

                  <div className="bg-[#0c0c0e] border border-[#1f1f23] rounded p-2 flex items-center justify-between">
                    <code className="text-[10px] font-mono text-slate-300 overflow-x-auto select-all pr-4">
                      {cmd.usage}
                    </code>
                    <button
                      onClick={() => handleCopy(cmd.usage)}
                      className="p-1.5 text-[#5c5c5c] hover:text-white hover:bg-[#141417] rounded transition-colors shrink-0 cursor-pointer"
                      title="Sao chép câu lệnh"
                    >
                      {copiedCmd === cmd.usage ? (
                        <Check className="w-3.5 h-3.5 text-[#00ff41]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {commands.length === 0 && (
                <div className="col-span-2 py-8 text-center text-[#5c5c5c] font-mono text-xs">
                  Không tìm thấy câu lệnh phù hợp trên Linux Index.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REGEX EMAIL EXTRACTOR */}
        {activeTab === "extractor" && (
          <div>
            <div className="mb-5">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block mb-1">
                Text Mining Core tool
              </span>
              <h4 className="font-mono font-bold text-base text-white">
                Bộ trích xuất và lọc Email từ văn bản thô
              </h4>
              <p className="text-xs text-slate-400 font-sans font-light mt-1.5 max-w-2xl leading-relaxed">
                Tái hiện lõi chức năng của hệ thống <span className="font-mono text-[#f27d26]">EmailAddressExtractor</span>. Thả các đống văn bản hỗn độn chứa logs hệ thống hoặc thông tin rác bên dưới để lọc ra danh sách email sạch duy nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="font-mono text-[10px] text-[#5c5c5c] uppercase block mb-1.5 font-bold">
                  Dữ liệu thô cần quét (Logs/Texts)
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full h-44 bg-[#050505] border border-[#1f1f23] rounded p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#f27d26] transition-all resize-none scrollbar-custom"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-[#5c5c5c] uppercase font-bold">
                    Kết quả email sạch lượm được ({extractedEmails.length})
                  </span>
                  {extractedEmails.length > 0 && (
                    <button
                      onClick={() => handleCopy(extractedEmails.join("\n"))}
                      className="text-xs font-mono text-[#f27d26] hover:text-[#e06b16] flex items-center gap-1 leading-none cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Sao chép tất
                    </button>
                  )}
                </div>

                <div className="w-full h-44 bg-[#050505] border border-[#1f1f23] rounded p-4 overflow-y-auto scrollbar-custom">
                  {isExtracted ? (
                    extractedEmails.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1.5">
                        {extractedEmails.map((email) => (
                          <div
                            key={email}
                            className="bg-[#0c0c0e]/40 border border-[#1f1f23] rounded px-2.5 py-1 text-slate-300 text-[11px] font-mono flex items-center justify-between hover:bg-[#0c0c0e] transition-colors"
                          >
                            <span>{email}</span>
                            <span className="text-[9px] bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] px-1.5 rounded uppercase font-mono">
                              Hợp lệ
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-[#5c5c5c] font-mono text-xs">
                        ⚠️ Không tìm thấy email nào khớp Regex.
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#5c5c5c] text-center font-mono text-xs">
                      Hãy kích hoạt nút quét bên dưới để truy xuất email.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleExtractEmails}
              className="px-5 py-2.5 bg-[#f27d26] hover:bg-[#e06b16] text-black font-mono text-xs font-bold uppercase tracking-tight rounded transition-colors cursor-pointer"
            >
              Phân Tích và Trích Xuất
            </button>
          </div>
        )}

        {/* TAB 4: SSH TERMINAL SIMULATION */}
        {activeTab === "terminal" && (
          <div>
            <div className="mb-4">
              <span className="font-mono text-[10px] text-[#f27d26] uppercase tracking-widest block mb-1">
                DevOps Control Panel
              </span>
              <h4 className="font-mono font-bold text-base text-white">
                Giao thức điều khiển dòng lệnh Bixbott CLI
              </h4>
              <p className="text-xs text-slate-400 font-sans font-light mt-1.5 max-w-2xl leading-relaxed">
                Giả lập lại một console shell tương tác từ <span className="font-mono text-[#f27d26]">dotcom-03/cli</span> và <span className="font-mono text-[#f27d26]">dotcom-03/copilot-cli</span>. Hãy gõ mã lệnh để trực tiếp quản trị hạ tầng.
              </p>
            </div>

            {/* Simulated monitor */}
            <div className="bg-[#050505] border border-[#1f1f23] rounded p-4.5 font-mono text-xs leading-relaxed max-h-[280px] overflow-y-auto scoller-custom">
              {terminalLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`min-h-[1.2rem] ${
                    line.startsWith("bixbott@console:")
                      ? "text-[#f27d26] font-bold"
                      : line.startsWith("bash: error") || line.startsWith("Lỗi")
                      ? "text-red-400"
                      : line.startsWith("+----") || line.startsWith("|")
                      ? "text-[#5c5c5c]"
                      : "text-slate-300"
                  }`}
                >
                  {line}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center bg-[#050505] border border-[#1f1f23] rounded px-3 py-2">
              <span className="font-mono text-xs text-[#f27d26] font-bold mr-1.5 shrink-0 select-none">
                bixbott@console:~$
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Gõ lệnh (Ví dụ: bixbott status, bixbott list-repos, help, bixbott analyze ux-rebuild...)"
                className="flex-1 bg-transparent border-0 outline-none text-slate-100 text-xs font-mono py-1 focus:ring-0 focus:outline-none"
              />
              <button type="submit" className="text-[#f27d26] hover:text-[#e06b16] p-1 cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
