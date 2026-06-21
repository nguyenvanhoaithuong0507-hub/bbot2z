import { RepoMetadata, ServiceState, DocChapter } from "./types";

export const CORE_MODULES: ServiceState[] = [
  {
    key: "bixbott-server",
    name: "bixbott-server",
    role: "Máy chủ của Bixbott (Main Orchestrator)",
    status: "running",
    cpu: 1.2,
    memory: 148,
    port: 3000,
    logs: [
      "[SYSTEM] Orchestrator initialized.",
      "[SERVER] Listening on host 0.0.0.0, port 3000.",
      "[ROUTE] API gateway routes mapped successfully.",
      "[HEALTH] Core connectivity stable."
    ]
  },
  {
    key: "bixbott-backend",
    name: "bixbott-backend",
    role: "Phần backend của Bixbott (Business Logic)",
    status: "running",
    cpu: 0.8,
    memory: 210,
    port: 8080,
    logs: [
      "[BACKEND] Connecting to main cluster...",
      "[DATABASE] State stream established.",
      "[WORKER] Daemon thread active for transaction logs.",
      "[MONITOR] Memory footprint baseline optimized."
    ]
  },
  {
    key: "bixbott-api",
    name: "bixbott-api",
    role: "Máy chủ API của Bixbott (Security Gateway)",
    status: "running",
    cpu: 0.4,
    memory: 95,
    port: 443,
    logs: [
      "[API] Security Layer V2 active with AES-GCM.",
      "[GATEWAY] CORS filters and rate limiting active.",
      "[SSL] Keypair certification checked automatically.",
      "[SHIELD] Active mitigation: DDoS protections primed."
    ]
  },
  {
    key: "bixbott-core",
    name: "bixbott-core",
    role: "Lõi hệ thống Bixbott (Central Core)",
    status: "running",
    cpu: 2.1,
    memory: 320,
    logs: [
      "[CORE] Microkernel initialized in isolation mode.",
      "[SCHEDULER] Load balancer weight updated.",
      "[IPC] Shared-memory ring buffers hot swaps: Active."
    ]
  },
  {
    key: "bixbott-engine",
    name: "bixbott-engine",
    role: "Bộ máy xử lý của Bixbott (Execution Engine)",
    status: "running",
    cpu: 8.5,
    memory: 470,
    logs: [
      "[ENGINE] Analytical registers aligned for AI streaming.",
      "[GPU] CUDA dynamic pipeline compiled for text reasoning.",
      "[VECTOR] High performance indices cached (11 repo states index)."
    ]
  }
];

export const SERVICE_LAYERS: ServiceState[] = [
  {
    key: "bixbott-web",
    name: "bixbott-web",
    role: "Giao diện Web điều hành (Web UI Platform)",
    status: "running",
    cpu: 0.2,
    memory: 64,
    port: 80,
    logs: [
      "[WEB] Next-gen React client loaded securely.",
      "[ASSET] Assets compiled into production chunk weights.",
      "[THEME] Swiss dark-slate parameters loaded."
    ]
  },
  {
    key: "bixbott-app",
    name: "bixbott-app",
    role: "Ứng dụng di động (Mobile App Ecosystem)",
    status: "idle",
    cpu: 0.0,
    memory: 0,
    logs: [
      "[MOBILE] Application wrapper sleep state.",
      "[SOCKET] Reconnection timer delay configured for 2s.",
      "[APP] Waiting for physical terminal trigger."
    ]
  },
  {
    key: "bixbott-server-layer",
    name: "bixbott-server",
    role: "Hệ thống phân phối máy chủ đám mây (Cloud Layer)",
    status: "running",
    cpu: 0.5,
    memory: 110,
    port: 22,
    logs: [
      "[SSH] Shell connection listening securely on custom port.",
      "[SYNC] Shared configuration synchronized dynamically.",
      "[DOCKER] Target nodes (11 repository runtimes) healthy."
    ]
  },
  {
    key: "bixbott-docs",
    name: "bixbott-docs",
    role: "Hệ thống tài liệu kỹ thuật (Developer Docs Portal)",
    status: "running",
    cpu: 0.1,
    memory: 42,
    logs: [
      "[DOCS] Decoupled static HTML pages mounted.",
      "[SEARCH] FlexSearch lightweight index mapped successfully."
    ]
  },
  {
    key: "bixbott-sdk",
    name: "bixbott-sdk",
    role: "Thư viện phát triển tích hợp (Client SDK & Libs)",
    status: "running",
    cpu: 0.1,
    memory: 35,
    logs: [
      "[SDK] Node, Python and Rust build targets mapped.",
      "[VERSION] Semantic version bump aligned with v2.4.9-core."
    ]
  }
];

export const REPOSITORIES: RepoMetadata[] = [
  {
    name: "PwnedPasswordsSpeedChallenge",
    url: "https://github.com/dotcom-03/PwnedPasswordsSpeedChallenge",
    description: "Công cụ và thử nghiệm hiệu năng nhằm so sánh tốc độ lọc, băm và rà soát các mẫu mật khẩu đã bị rò rỉ hàng loạt.",
    category: "Security",
    status: "beta",
    mainLanguage: "C++",
    stars: 124,
    forks: 18
  },
  {
    name: "PwnedPasswordsCloudflareWorker",
    url: "https://github.com/dotcom-03/PwnedPasswordsCloudflareWorker",
    description: "Worker chạy trên nền tảng Cloudflare Edge có hiệu năng phản hồi nano giây để rà quét mật khẩu thông qua cơ sở dữ liệu HaveIBeenPwned.",
    category: "Infrastructure",
    status: "stable",
    mainLanguage: "TypeScript",
    stars: 256,
    forks: 34
  },
  {
    name: "octocat.github.io",
    url: "https://github.com/dotcom-03/octocat.github.io",
    description: "Cổng thông tin portfolio cá nhân hiển thị chi tiết sản phẩm, triết lý kỹ thuật của dotcom-03.",
    category: "UI/UX",
    status: "stable",
    mainLanguage: "HTML",
    stars: 45,
    forks: 8
  },
  {
    name: "PwnedPasswordsDownloader",
    url: "https://github.com/dotcom-03/PwnedPasswordsDownloader",
    description: "Bộ tiện ích tải dữ liệu bất đồng bộ song song tải hàng tỷ hash mật khẩu pwned từ máy chủ bảo mật về lưu trữ cục bộ.",
    category: "CLI/Tools",
    status: "active",
    mainLanguage: "C#",
    stars: 142,
    forks: 21
  },
  {
    name: "PwnedPasswordsAzureFunction",
    url: "https://github.com/dotcom-03/PwnedPasswordsAzureFunction",
    description: "Giải pháp Serverless API tích hợp trên Azure Functions tối hưu hóa chi phí truy vấn rò rỉ thông tin đăng nhập diện rộng.",
    category: "Infrastructure",
    status: "stable",
    mainLanguage: "C#",
    stars: 98,
    forks: 14
  },
  {
    name: "ux-rebuild",
    url: "https://github.com/dotcom-03/ux-rebuild",
    description: "Mã nguồn định hình lại hoàn chỉnh cấu trúc visual, trải nghiệm người dùng hiện đại, sắc sảo cho bảng quản trị Bixbott.",
    category: "UI/UX",
    status: "active",
    mainLanguage: "TypeScript",
    stars: 189,
    forks: 29
  },
  {
    name: "LinuxCommandLibrary",
    url: "https://github.com/dotcom-03/LinuxCommandLibrary",
    description: "Bản phân tích chỉ mục ngoại tuyến và thư viện tối ưu hóa chứa hàng nghìn lệnh Linux phổ biến đến nâng cao cho quản lý Server.",
    category: "CLI/Tools",
    status: "stable",
    mainLanguage: "Go",
    stars: 512,
    forks: 73
  },
  {
    name: "EmailAddressExtractor",
    url: "https://github.com/dotcom-03/EmailAddressExtractor",
    description: "Công cụ Regex thông minh phân tích sâu luồng văn bản khổng lồ để trích xuất sạch sẽ tất cả địa chỉ email hợp lệ không trùng lặp.",
    category: "Security",
    status: "active",
    mainLanguage: "Go",
    stars: 115,
    forks: 16
  },
  {
    name: "docs",
    url: "https://github.com/dotcom-03/docs",
    description: "Trung tâm quản lý mã nguồn tĩnh chứa toàn bộ tri thức lập trình, vận hành và chuẩn chỉnh kiến trúc đám mây Bixbott.",
    category: "Documentation",
    status: "stable",
    mainLanguage: "Markdown",
    stars: 87,
    forks: 22
  },
  {
    name: "cli",
    url: "https://github.com/dotcom-03/cli",
    description: "Giao diện dòng lệnh trung tâm của Bixbott hỗ trợ quản tự động các container, module lõi thông qua các pipeline tự trị.",
    category: "CLI/Tools",
    status: "active",
    mainLanguage: "Rust",
    stars: 204,
    forks: 25
  },
  {
    name: "copilot-cli",
    url: "https://github.com/dotcom-03/copilot-cli",
    description: "Bộ công cụ CLI đính kèm AI hỗ trợ nhà vận hành tự động viết kịch bản script xử lý hạ tầng Bixbott bằng đàm thoại tiếng Việt.",
    category: "CLI/Tools",
    status: "active",
    mainLanguage: "Rust",
    stars: 382,
    forks: 41
  }
];

export const BIXBOTT_DOCS_CHAPTERS: DocChapter[] = [
  {
    id: "overview-core",
    title: "1. Tổng quan kiến trúc Bixbott Core Engine",
    category: "Kiến trúc",
    repository: "docs",
    summary: "Hiểu rõ về mô hình cốt lõi điều vận của Bixbott Agent, sự tương tác giữa bixbott-core, bixbott-engine và các luồng suy luận thông minh.",
    content: `## 1. Tổng quan kiến trúc Bixbott Core Engine

Hệ thống **Bixbott Agent** là một nền tảng vận hành tự trị ứng dụng Multi-Agent nâng cao (DevSecOps Multi-Agent). Cột xương sống của hệ thống được chia thành ba modul nghiệp vụ độc lập:

### Sơ đồ dòng chảy dữ liệu Bixbott Orchestration:
\`\`\`text
[Yêu cầu Người Dùng] ──> [Bixbott API Gateway]
                                │
                                ▼ (Phân tích Bảo mật & Routing)
                      [Bixbott Server (Main Orchestrator)]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼ (Phân luồng AI Agent)                         ▼ (Điều khiển tài nguyên)
 [Bixbott Engine - CUDA LLM] <=== IPC Ring Buffer ===> [Bixbott Core microkernel]
                                                        │
                                                        ▼
                                             [Hạ tầng K8s Container]
\`\`\`

### Các Module chức năng chủ chốt:
1. **bixbott-core**: Chịu trách nhiệm khởi tạo Microkernel hệ điều hành, lên lịch trình điều khiển CPU và quản lý các luồng IPC (Inter-Process Communication) hiệu năng cao qua bộ nhớ chia sẻ.
2. **bixbott-engine**: Chứa các thanh ghi phân tích và CUDA pipelines hỗ trợ stream suy luận tự động của AI Resident trực tiếp đến máy chủ vận hành của bạn.
3. **bixbott-server**: Là bộ não orchestrator kết nối các vi dịch vụ và xử lý đồng bộ liên kết 11 kho lưu trữ mã nguồn của dự án.

> **⚠️ Lưu ý an toàn**: Khi vận hành Bixbott Core trên môi trường đám mây độc lập, hãy bảo đảm cổng giao tiếp nội bộ IPC được phân cụm riêng và mã hóa hoàn toàn trước khi lưu chuyển dữ liệu nhạy cảm.`
  },
  {
    id: "cli-installation",
    title: "2. Hướng dẫn thiết lập CLI & Toàn quyền điều hành Daemon",
    category: "Hướng dẫn",
    repository: "docs",
    summary: "Hướng dẫn chi tiết cách thiết lập, cấu hình daemon và kiểm tra trạng thái hoạt động thông qua lệnh bixbott command line.",
    content: `## 2. Hướng dẫn thiết lập CLI & Toàn quyền điều hành Daemon

Giao diện CLI của Bixbott (\`bixbott-cli\`) và trợ lý thông minh đi kèm (\`copilot-cli\`) được viết hoàn toàn bằng **Rust** để đảm bảo tốc độ tối đa, mức độ tiêu thụ bộ nhớ RAM tối thiểu và tối ưu hóa an toàn luồng (thread-safety).

### 🛠️ Các bước cài đặt nhanh:

Cách đơn giản nhất để cài đặt nhị phân CLI trên hệ thống Linux là thông qua script cài đặt tự động:

\`\`\`bash
# Tải và chạy script bootstrap cài đặt chính thức từ repo docs
curl -sSf https://raw.githubusercontent.com/dotcom-03/docs/main/scripts/install.sh | sh
\`\`s

Cấu hình cấu trúc file môi trường cục bộ \`~/.config/bixbott/config.toml\`:

\`\`\`toml
[daemon]
address = "127.0.0.1"
port = 9050
log_level = "info"

[copilot]
engine = "gemini-2.5-flash"
language = "vi"
interactive_mode = true
\`\`\`

### 🖥️ Các câu lệnh cơ bản của Bixbott CLI:

Sử dụng lệnh trực tiếp trong Shell để vận hành và giám sát hạ tầng:

| Câu lệnh | Mô tả chi tiết chức năng | Ví dụ câu lệnh thực tế |
| :--- | :--- | :--- |
| \`bixbott status\` | Kiểm tra trạng thái hiện tại của hệ Orchestrator | \`bixbott status --detailed\` |
| \`bixbott list-repos\` | Liệt kê nhanh 11 repositories kết nối an toàn | \`bixbott list-repos --sync\` |
| \`bixbott start [node]\` | Đăng ký khởi chạy một node dịch vụ cụ thể | \`bixbott start bixbott-web\` |
| \`bixbott analyze [task]\` | Kích hoạt AI Copilot để phân tích log hệ thống hoặc scan lỗi | \`bixbott analyze ux-rebuild\` |

### 💡 Trợ lý Phân Tích Thông Minh với bixbott copilot-cli:

Nhờ tích hợp đàm thoại tiếng Việt tự trị, bạn có thể thực thi lệnh thông qua ngôn ngữ tự nhiên:
\`\`\`bash
# Truy vấn AI trợ giúp tìm lỗi bảo mật trên repo ux-rebuild
bixbott analyze ux-rebuild
\`\`\``
  },
  {
    id: "pwned-cloudflare",
    title: "3. Bảo mật Edge: Pwned Passwords Cloudflare Workers",
    category: "Kiến trúc",
    repository: "bixbott-docs",
    summary: "Cơ chế rà quét mật khẩu ở tầng mạng biên (Edge) an toàn tuyệt đối với Cloudflare Workers và thuật toán băm K-Anonymity.",
    content: `## 3. Bảo mật Edge: Pwned Passwords Cloudflare Workers

Hệ thống bảo vệ biên chống bẻ khóa mật khẩu tích hợp trực tiếp từ hai kho dự án hàng đầu của \`dotcom-03\` là **PwnedPasswordsCloudflareWorker** và **PwnedPasswordsAzureFunction**.

### 🔒 Triết lý bảo mật đầu cuối (K-Anonymity Algorithm):

Hệ thống Bixbott cam kết **không bao giờ truyền mật khẩu văn bản thô (Plaintext)** của người dùng lên bất kỳ API hay đám mây nào. Thay vào đó, thuật toán **K-Anonymity** được tối ưu hóa ở rìa mạng biên:

1. **Băm mật khẩu cục bộ**: Mật khẩu được băm bằng thuật toán SHA-1 ngay tại máy khách:
   - *Ví dụ mật khẩu*: \`123456\`
   - *SHA-1 hash tương ứng*: \`7C4A8D09CA3762AF61E59520943DC26494F8941B\`
2. **Kỹ thuật Cắt Phân Biên (Prefix Slice)**: Khách hàng chỉ gửi **5 ký tự đầu tiên** của chuỗi hash (\`7C4A8\`) lên hệ thống Cloudflare Worker.
3. **Mã biên tìm kiếm siêu tốc**: Cloudflare Worker tiếp nhận 5 ký tự tiền tố, truy xuất an toàn kho dữ liệu hàng tỷ mật khẩu đã bị rò rỉ và phản hồi lại danh sách tất cả các hậu tố (Suffixes) trùng khớp với tốc độ nano giây nhờ cơ chế Edge Cache.
4. **Đối sánh máy khách hoàn toàn kín đáo**: Máy khách nhận danh sách hậu tố từ Edge, tự so sánh hậu tố của mình cục bộ để cho ra kết quả an toàn tuyệt đối.

### 🌐 Triển khai Cloudflare Worker:

Triển khai nhanh mã nguồn \`index.ts\` lên hạ tầng Cloudflare Workers:

\`\`\`typescript
// Trích xuất từ kho mã nguồn PwnedPasswordsCloudflareWorker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const prefix = url.pathname.slice(1, 6); // Trích xuất 5 ký tự đầu tiên
    
    if (prefix.length !== 5) {
      return new Response("Yêu cầu prefix 5 ký tự SHA-1", { status: 400 });
    }

    const targetUrl = \`https://api.pwnedpasswords.com/range/\${prefix}\`;
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": "Bixbott-Guard-Edge-Worker" },
      cf: { cacheEverything: true, cacheTtl: 86400 } // Edge caching cực mạnh
    });

    return response;
  }
}
\`\`\``
  },
  {
    id: "docs-api-gateway",
    title: "4. API Reference - Endpoint Bảo mật của Bixbott API Gateway",
    category: "API Reference",
    repository: "bixbott-docs",
    summary: "Chi tiết các API endpoints bảo mật của cổng Bixbott-API, bao gồm tham số, headers và cấu trúc JSON trả về.",
    content: `## 4. API Reference - Endpoint Bảo mật của Bixbott API Gateway

Tài nguyên API Gateway điều vận của Bixbott (\`bixbott-api\`) hỗ trợ định dạng truyền tải dữ liệu JSON và cung cấp các lớp bảo mật lọc biên.

### 🔌 1. API Kiểm tra mật khẩu rò rỉ (Pwned Check Proxy)

Vấn tin bảo mật cho mật khẩu thông qua cơ quan hạ tầng.

- **URL**: \`/api/pwned/check\`
- **Phương thức**: \`POST\`
- **Headers**:
  \`\`\`http
  Content-Type: application/json
  Authorization: Bearer BIXBOTT_SECURE_TOKEN_V2
  \`\`\`
- **Body JSON Gửi đi**:
  \`\`\`json
  {
    "hash_prefix": "7C4A8"
  }
  \`\`\`
- **JSON Phản hồi thành công (200 OK)**:
  \`\`\`json
  {
    "status": "success",
    "prefix": "7C4A8",
    "matches_count": 834,
    "latency_ms": 12,
    "source_node": "cloudflare-edge-osaka"
  }
  \`\`\`

---

### 📥 2. API Trích xuất sạch Email bixbott-extractor

Trích xuất danh sách bất đồng bộ từ luồng logs thô dạng nén.

- **URL**: \`/api/extractor/extract\`
- **Phương thức**: \`POST\`
- **Body JSON Gửi đi**:
  \`\`\`json
  {
    "raw_text": "System administrator alert: please inform support@dotcom-03.dev and contact tech-ops@bixbott.io immediately."
  }
  \`\`\`
- **JSON Phản hồi thành công (200 OK)**:
  \`\`\`json
  {
    "extracted_count": 2,
    "emails": [
      "support@dotcom-03.dev",
      "tech-ops@bixbott.io"
    ],
    "compilation_time_ms": 1.4
  }
  \`\`\``
  },
  {
    id: "docs-system-architecture",
    title: "5. Cơ chế đồng bộ hạ tầng & Bảng liên kết 11 Repos",
    category: "Kiến trúc",
    repository: "docs",
    summary: "Cách thức Bixbott Orchestration giám sát, phân loại và liên kết 11 dự án Github mở rộng của dotcom-03.",
    content: `## 5. Cơ chế đồng bộ hạ tầng & Bảng liên kết 11 Repos

Để đạt được sự liên kết mượt mà trên toàn bộ hệ thống phát triển của \`dotcom-03\`, **Bixbott Orchestration Layer** liên kết trực quan 11 kho lưu trữ thông qua cơ chế phân dòng:

### 📊 Phân vùng kiến trúc bảo mật & công nghệ:

\`\`\`text
┌────────────────────────────────────────────────────────┐
│                        BIXBOTT                         │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼ (Bảo mật biên)                 ▼ (Thiết bị & Di động)
 ┌──────────────────────┐         ┌──────────────────────┐
 │ Pwned Speed Challenge│         │ bixbott-web (React)   │
 │ Cloudflare Worker    │         │ bixbott-app (Flutter)│
 │ Azure Serverless     │         │ bixbott-sdk          │
 └──────────────────────┘         └──────────────────────┘
\`\`\`

### 🔗 Kiểm tra độ khớp của các công nghệ liên kết:

1. **Cơ chế băm & lưu trữ ngoại tuyến**: Dự án \`PwnedPasswordsDownloader\` tải hàng triệu hash lưu trữ an toàn, phục vụ dữ liệu offline cục bộ cho \`LinuxCommandLibrary\`.
2. **Kịch bản tự động hóa**: Nhóm nhị phân CLI (\`cli\` và \`copilot-cli\`) được bổ sung và tối ưu trực tiếp từ tệp tri thức tổng hợp định hướng lưu tại repo \`docs\`.
3. **Mã tái sinh giao diện**: Mã nguồn \`ux-rebuild\` cấu hình trực tiếp các thẻ hiển thị mượt mà trên cổng di động \`bixbott-app\` và trang web hành chính trung ương \`bixbott-web\`.

Hệ thống điều khiển này bảo đảm độ trễ cập nhật trạng thái kho lưu trữ luôn ở mức dưới **300ms**, nâng cấp chất lượng phân tích của Resident AI lên độ chuẩn xác cao nhất.`
  }
];

