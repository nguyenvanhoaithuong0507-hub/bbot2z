export interface ServiceState {
  key: string;
  name: string;
  role: string;
  status: "idle" | "running" | "stopped" | "error";
  cpu: number;
  memory: number; // in MB
  port?: number;
  logs: string[];
}

export interface RepoMetadata {
  name: string;
  url: string;
  description: string;
  category: "Security" | "Infrastructure" | "Documentation" | "UI/UX" | "CLI/Tools";
  status: "stable" | "beta" | "active" | "legacy";
  mainLanguage: string;
  stars: number;
  forks: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  message: string;
  type: "info" | "success" | "warn" | "error";
}

export interface DocChapter {
  id: string;
  title: string;
  category: "Hướng dẫn" | "API Reference" | "Kiến trúc";
  repository: "bixbott-docs" | "docs";
  summary: string;
  content: string; // Markdown formatted or rich text content
}

