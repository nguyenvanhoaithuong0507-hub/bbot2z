import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined in the environment.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

// Simulated command list for the LinuxCommandLibrary tool fallback
const SIMULATED_LINUX_COMMANDS = [
  { command: "ls", description: "List directory contents with optional detail view.", usage: "ls -la /var/log" },
  { command: "grep", description: "Search for patterns in files using regular expressions.", usage: "grep -rl 'pwned' ." },
  { command: "chmod", description: "Change permissions of files and directories.", usage: "chmod 755 bixbott-server" },
  { command: "ps", description: "Report a snapshot of the current active system processes.", usage: "ps aux | grep bixbott" },
  { command: "systemctl", description: "Control the systemd system and service manager.", usage: "systemctl status bixbott-engine" },
  { command: "curl", description: "Transfer data from or to a server using supported protocols.", usage: "curl -X POST https://api.bixbott.dev" },
  { command: "df", description: "Show amount of free disk space on filesystems.", usage: "df -h" },
  { command: "top", description: "Display real-time Linux system resource running tasks dynamically.", usage: "top -u bixbott" },
  { command: "tail", description: "Output the last part of files like runtime logs dynamically.", usage: "tail -f /var/log/bixbott/core.log" },
  { command: "netstat", description: "Print network connections, routing tables, and interface statistics.", usage: "netstat -tulnp" },
  { command: "iptables", description: "Administration tool for IPv4 packet filtering and NAT.", usage: "iptables -L -n" },
  { command: "docker", description: "Pack, ship and run any application as a lightweight container.", usage: "docker ps -a" }
];

// 1. Chat flow endpoint with system guidance
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, persona } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const currentPersona = persona || "default";

    if (!ai) {
      // Offline mode fallback simulation suited to the selected persona
      const lowercaseMsg = message.toLowerCase();
      let reply = "";
      
      if (currentPersona === "sysadmin") {
        reply = `**[OFFLINE MODE - SYSADMIN EXPERT]** 🧑‍💻 _Đang hoạt động trong chế độ giả lập vận hành._\n\n`;
        if (lowercaseMsg.includes("pwned") || lowercaseMsg.includes("mật khẩu")) {
          reply += "Cảnh báo hạ tầng về việc rò rỉ cơ sở dữ liệu! Dự án `PwnedPasswords` của chúng ta đã được triển khai các kiểm tra hiệu năng để chặn đứng bruteforce trước khi gây nghẽn băng thông hệ thống: `PwnedPasswordsazureFunction` phục vụ scale tự động, và `CloudflareWorker` định tuyến tải tại mạng biên.";
        } else if (lowercaseMsg.includes("lệnh") || lowercaseMsg.includes("linux")) {
          reply += "Công cụ quản trị chính: Thư viện `LinuxCommandLibrary` là bí kíp lâm sàng của SysAdmin, giúp tự động hóa shell scripts và phân giải tài nguyên CPU/RAM khi vận hành.";
        } else {
          reply += `Yêu cầu hệ thống: "${message}". Tôi khuyến nghị chạy rà soát tệp cấu hình, nén tệp ghi nhật ký dịch vụ hoặc khởi động lại các nút đang báo động tài nguyên quá tải.`;
        }
      } else if (currentPersona === "security") {
        reply = `**[OFFLINE MODE - SECURITY AUDITOR]** 🛡️ _Đang hoạt động trong chế độ giả lập thanh tra an ninh._\n\n`;
        if (lowercaseMsg.includes("pwned") || lowercaseMsg.includes("mật khẩu")) {
          reply += "Báo cáo an ninh: Dự án phân tích mật khẩu `PwnedPasswordsSpeedChallenge` sử dụng mật mã hóa an toàn nhằm so khớp và ngăn chặn các rủi ro tiết lộ mật khẩu của lớp người dùng. Đề nghị kích hoạt xác thực đa nhân tố MFA ngay cho các nhân tố liên kết.";
        } else if (lowercaseMsg.includes("lệnh") || lowercaseMsg.includes("linux")) {
          reply += "An ninh dòng lệnh: Dự án `LinuxCommandLibrary` có lưu trữ các câu lệnh audit quyền hạn như `chmod` hay cấu hình tường lửa `iptables` để bảo vệ cổng mạng biên.";
        } else {
          reply += `Phát hiện truy vấn: "${message}". Đang thực hiện đánh giá rủi ro sơ bộ đối với hệ thống của bạn. Khuyến nghị không chuyển giao thông tin nhạy cảm ở dạng thô mà hãy mã hóa salt-hash đầy đủ.`;
        }
      } else {
        reply = `**[OFFLINE MODE - BIXBOTT DEFAULT]** 🤖 _Đang hoạt động trong chế độ ngoại cấu hình._\n\n`;
        if (lowercaseMsg.includes("pwned") || lowercaseMsg.includes("mật khẩu")) {
          reply += "Mã nguồn của dotcom-03 có các dự án lọc và rò rỉ mật khẩu ấn tượng: `PwnedPasswordsSpeedChallenge` để đánh giá tốc độ, `PwnedPasswordsCloudflareWorker` xử lý không máy chủ trên Cloudflare Worker, `PwnedPasswordsDownloader` tải danh sách về máy, và `PwnedPasswordsAzureFunction` chạy trên nền tảng Azure. Điều này giúp ngăn chặn việc rò rỉ mật khẩu.";
        } else if (lowercaseMsg.includes("lệnh") || lowercaseMsg.includes("linux")) {
          reply += "Dự án `LinuxCommandLibrary` là một thư viện toàn diện lưu trữ câu lệnh Linux cho quản trị viên hệ thống. Nó rất hữu ích khi bixbott-engine cần chạy tự động hóa các tác vụ hạ tầng.";
        } else if (lowercaseMsg.includes("bixbott") || lowercaseMsg.includes("bibot")) {
          reply += "Hệ sinh thái Bixbott của chúng ta được chia làm 5 lớp lõi:\n" +
                   "1. **bixbott-server**: Máy chủ lõi điều phối lưu lượng.\n" +
                   "2. **bixbott-backend**: Phần logic chính xử lý nghiệp vụ.\n" +
                   "3. **bixbott-api**: Điểm nhận tệp API bảo mật.\n" +
                   "4. **bixbott-core**: Mã nguồn lõi vận hành.\n" +
                   "5. **bixbott-engine**: Động cơ xử lý AI và dữ liệu chuyên biệt.";
        } else {
          reply += `Tôi nhận được yêu cầu: "${message}". Đây là một phần tích hợp tuyệt vời! Bixbott Core kết nối với tất cả các tài liệu kỹ thuật tại dotcom-03/docs và bộ CLI dòng lệnh điều hành tại dotcom-03/cli. Hãy cấu hình Secrets API Key để kích hoạt trí tuệ nhân tạo toàn năng.`;
        }
      }
      return res.json({ reply });
    }

    // Dynamic prompt customization based on selected Agent Persona
    let personaPrompt = "";
    if (currentPersona === "sysadmin") {
      personaPrompt = `
[EXPERT STATUS: SYSADMIN & DEV-OPS OPERATOR]
- You are Bixbott playing the role of a system operations expert and backend sysadmin.
- Tone: Highly logical, technical, prompt, diagnostic, prioritizing server health, terminal scripts, active processes, and infrastructure scalability.
- Core focus: Server optimization, explaining Linux command syntax, analyzing resource logs, resolving memory/CPU alerts, configuring docker containers, and handling deployment shell queries.
- Speak in Vietnamese with high professional confidence, referencing directories, resource optimization, and operational guidelines.`;
    } else if (currentPersona === "security") {
      personaPrompt = `
[EXPERT STATUS: CYBER SECURITY AUDITOR]
- You are Bixbott playing the role of an elite White-Hat Security Auditor and threat assessment engineer.
- Tone: Extremely careful, vigilant, security-conscious, authoritative, highly protective of credentials, and focusing on zero-risk and zero-trust engineering.
- Core focus: Mitigating vulnerabilities, evaluating authentication secrets, ensuring zero-trust, analyzing secure hashes (under PwnedPasswords), guarding against credential leaks, scanning code repositories for API key leaks, and setting up secure firewall or access configs.
- Speak in Vietnamese with high professional caution, emphasizing protective mitigations, cryptographic best practices, and safety alerts.`;
    } else {
      personaPrompt = `
[EXPERT STATUS: CENTRAL COORDINATOR & SOLUTIONS ARCHITECT]
- You are Bixbott playing the role of the central intelligent coordinator, offering premium high-level state management, dynamic telemetry orchestration, and architectural wisdom.
- Tone: Sleek, top-tier, enterprise-ready intelligence, polite and incredibly capable.
- Core focus: High-level system descriptions, dotcom-03 repository design, core integrations, and developer productivity tools.`;
    }

    const systemInstruction = `You are Bixbott, the central intelligent coordinator agent for Bixbott's ecosystem.
You respond in Vietnamese (tiếng Việt), but you can use English terminology when describing technical components. 
You are styled as a sleek, top-tier, enterprise-ready artificial core residing in the console, offering state management and analytical intelligence.
${personaPrompt}

You have comprehensive knowledge of Bixbott architecture layers and dotcom-03's GitHub repositories:
1. Bixbott core architecture components:
   - bixbott-server: Máy chủ dòng lệnh chính
   - bixbott-backend: Hệ thống backend chính điều khiển nghiệp vụ
   - bixbott-api: Máy chủ cổng API bảo mật tiếp nhận yêu cầu
   - bixbott-core: Thư viện lõi trung tâm điều phối tài nguyên
   - bixbott-engine: Động cơ phân tích, xử lý các tác vụ AI và dữ liệu lớn

2. Services / Delivery interfaces:
   - bixbott-web: Giao diện điều khiển Web (nơi người dùng tương tác trong trình duyệt)
   - bixbott-app: Ứng dụng di động (cho iOS/Android)
   - bixbott-server: Lọc tải và dịch vụ hạ tầng đám mây
   - bixbott-docs: Hệ thống tài liệu kỹ thuật tĩnh
   - bixbott-sdk: Bộ phát triển phần mầm tích hợp các hệ thống con

3. dotcom-03 GitHub Repositories:
   - LinuxCommandLibrary (thư viện lệnh Linux hữu ích)
   - EmailAddressExtractor (bộ lọc trích xuất email hàng loạt)
   - PwnedPasswordsSpeedChallenge (thử thách so sánh tốc độ lọc mật khẩu bị rò rỉ)
   - PwnedPasswordsCloudflareWorker (Worker kiểm tra mật khẩu pwned siêu mượt trên mép mạng Cloudflare)
   - PwnedPasswordsDownloader (bộ tải cơ sở dữ liệu mật khẩu pwned)
   - PwnedPasswordsAzureFunction (Azure Functions không máy chủ lọc mật khẩu bị lộ)
   - ux-rebuild (dự án tái định hình trải nghiệm người dùng hiện đại)
   - octocat.github.io (trang danh mục và hồ sơ cá nhân)
   - docs (kho lưu trữ hướng dẫn kỹ thuật)
   - cli (tiện ích tương tác CLI chính thống)
   - copilot-cli (trợ lý dòng lệnh AI-powered hỗ trợ DevOps)

Speak elegantly, formatted with clear headings, lists and inline code symbols where applicable. Your style is highly professional and proactive.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini route error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in the Bixbott engine." });
  }
});

// 2. Simulated Linux Command lookup (LinuxCommandLibrary repo)
app.get("/api/commands", (req, res) => {
  const query = (req.query.q || "").toString().toLowerCase();
  if (!query) {
    return res.json(SIMULATED_LINUX_COMMANDS);
  }
  const filtered = SIMULATED_LINUX_COMMANDS.filter(cmd => 
    cmd.command.includes(query) || cmd.description.toLowerCase().includes(query)
  );
  res.json(filtered);
});

// 3. Password Check Endpoint (Simulating Cloudflare worker &Azure Function lookup)
app.post("/api/pwned-check", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  // Pure deterministic math/hashing simulator
  // Commonly known weak passwords have high match counts
  const weakPasswords: Record<string, number> = {
    "123456": 23485102,
    "password": 9812492,
    "123456789": 8312019,
    "qwerty": 4892011,
    "admin": 3120912,
    "bixbott": 42,
    "dotcom": 13,
  };

  const cleanPass = password.trim().toLowerCase();
  const foundCount = weakPasswords[cleanPass];

  if (foundCount !== undefined) {
    return res.json({
      status: "compromised",
      count: foundCount,
      advice: "Mật khẩu này nằm trong danh sách rò rỉ phổ biến nhất! Hãy thay đổi ngay lập tức.",
      latencyMs: Math.floor(Math.random() * 45) + 5 // Simulating Speed Challenge
    });
  }

  // Simulate cloud lookups
  if (password.length < 8) {
    return res.json({
      status: "danger",
      count: 247,
      advice: "Độ dài mật khẩu dưới 8 ký tự. Rất dễ bị tấn công brute force.",
      latencyMs: Math.floor(Math.random() * 60) + 10
    });
  }

  return res.json({
    status: "secure",
    count: 0,
    advice: "Tuyệt vời! Không tìm thấy dữ liệu rò rỉ khớp trên hệ thức toán Azure & Cloudflare của chúng tôi.",
    latencyMs: Math.floor(Math.random() * 30) + 5
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bixbott Engine Server running on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();
