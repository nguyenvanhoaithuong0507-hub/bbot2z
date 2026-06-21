import React, { useState, useEffect } from "react";
import { ServiceState } from "../types";
import { Play, Square, RotateCw, Terminal, Cpu, HardDrive, ShieldCheck, CheckCircle, AlertTriangle, Maximize2, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

interface ServiceCardProps {
  service: ServiceState;
  onStateChange: (key: string, nextStatus: "running" | "stopped" | "idle" | "error") => void;
  onAddLog: (serviceName: string, text: string, type: "info" | "success" | "warn" | "error") => void;
}

// Custom cybernetic Tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505] border border-[#1f1f23] p-2 rounded text-[10px] font-mono text-slate-300 shadow-xl">
        <span className="text-[#5c5c5c] block">{payload[0].payload.time}</span>
        <span className="text-[#f27d26] font-bold">CPU: {payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onStateChange, onAddLog }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; cpu: number; cpuPercent: number }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // 1. Preinitialize the history loop so that graphs aren't blank on start
  useEffect(() => {
    if (cpuHistory.length === 0 && service.status === "running") {
      const initial: { time: string; cpu: number; cpuPercent: number }[] = [];
      const now = new Date();
      for (let i = 9; i >= 0; i--) {
        const timeStr = new Date(now.getTime() - i * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const noise = (Math.random() * 1.2 - 0.6);
        const histCpu = Math.max(0.1, Math.min(9.9, parseFloat((service.cpu + noise).toFixed(1))));
        initial.push({
          time: timeStr,
          cpu: histCpu,
          cpuPercent: parseFloat((histCpu * 10).toFixed(0))
        });
      }
      setCpuHistory(initial);
    }
  }, [service.status]);

  // 2. Synchronize CPU dynamic value updates from the parent’s random fluctuations interval
  useEffect(() => {
    if (service.status !== "running") {
      if (cpuHistory.length > 0) {
        setCpuHistory([]);
      }
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentCpuPercent = parseFloat((service.cpu * 10).toFixed(0));

    setCpuHistory(prev => {
      // Prevent duplicating entries inside the exact same second
      if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          time: timeStr,
          cpu: service.cpu,
          cpuPercent: currentCpuPercent
        };
        return updated;
      }
      
      const nextList = [
        ...prev,
        {
          time: timeStr,
          cpu: service.cpu,
          cpuPercent: currentCpuPercent
        }
      ];
      return nextList.slice(-12); // bounds history window size to 12 points
    });
  }, [service.cpu, service.status]);

  const handleAction = (action: "start" | "stop" | "restart") => {
    if (action === "start") {
      onStateChange(service.key, "running");
      onAddLog(service.name, `[MANUAL] Yêu cầu khởi động dịch vụ ${service.name} thành công.`, "success");
    } else if (action === "stop") {
      onStateChange(service.key, "stopped");
      onAddLog(service.name, `[MANUAL] Đã dừng dịch vụ ${service.name}.`, "warn");
    } else if (action === "restart") {
      setIsRefreshing(true);
      onStateChange(service.key, "idle");
      onAddLog(service.name, `[MANUAL] Khởi động lại dịch vụ ${service.name} đang tiến hành...`, "info");
      
      setTimeout(() => {
        onStateChange(service.key, "running");
        onAddLog(service.name, `[MANUAL] Khởi động lại dịch vụ ${service.name} hoàn tất. Đang lắng nghe.`, "success");
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const statusColors = {
    running: {
      bg: "bg-[#00ff41]/10 border-[#00ff41]/20 text-[#00ff41]",
      indicator: "bg-[#00ff41] animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.5)]",
      desc: "Đang hoạt động"
    },
    stopped: {
      bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      indicator: "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      desc: "Đã dừng"
    },
    idle: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      indicator: "bg-amber-500 status-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      desc: "Đang nạp..."
    },
    error: {
      bg: "bg-red-500/10 border-red-500/20 text-red-500",
      indicator: "bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]",
      desc: "Sự cố"
    }
  };

  const currentStatus = statusColors[service.status];
  
  const isCpuOverloaded = service.status === "running" && (service.cpu * 10) > 80;
  const isRamOverloaded = service.status === "running" && service.memory > 460.8;
  const hasAlert = isCpuOverloaded || isRamOverloaded;

  return (
    <motion.div 
      id={`service-${service.key}`} 
      layout="position"
      initial={{ opacity: 0, y: 15 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        borderColor: hasAlert 
          ? "rgba(239, 68, 68, 0.45)" 
          : service.status === "stopped"
            ? "rgba(244, 63, 94, 0.25)"
            : service.status === "idle"
              ? "rgba(245, 158, 11, 0.25)"
              : "rgba(31, 31, 35, 1)",
        boxShadow: hasAlert
          ? "0 0 20px rgba(239, 68, 68, 0.08)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -3,
        borderColor: hasAlert 
          ? "rgba(239, 68, 68, 0.7)" 
          : service.status === "stopped"
            ? "rgba(244, 63, 94, 0.5)"
            : service.status === "idle"
              ? "rgba(245, 158, 11, 0.5)"
              : "#f27d26",
        boxShadow: hasAlert
          ? "0 15px 30px -10px rgba(239, 68, 68, 0.18)"
          : service.status === "stopped"
            ? "0 15px 30px -10px rgba(244, 63, 94, 0.1)"
            : "0 15px 30px -10px rgba(242, 125, 38, 0.15)",
        transition: { duration: 0.25 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        borderColor: { duration: 0.3 },
        backgroundColor: { duration: 0.3 }
      }}
      className="border rounded p-5 relative overflow-hidden bg-[#0c0c0e] group"
    >
      {/* Hiệu ứng xung động tia sáng quét qua khi đổi trạng thái (Cyberpunk Shimmer Sweep) */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={service.status}
          initial={{ left: "-100%" }}
          animate={{ left: "200%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className={`absolute top-0 bottom-0 w-1/2 skew-x-12 pointer-events-none z-10 ${
            service.status === "running"
              ? "bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,65,0.06)_50%,transparent_100%)]"
              : service.status === "stopped"
                ? "bg-[linear-gradient(90deg,transparent_0%,rgba(244,63,94,0.06)_50%,transparent_100%)]"
                : service.status === "error"
                  ? "bg-[linear-gradient(90deg,transparent_0%,rgba(239,68,68,0.09)_50%,transparent_100%)]"
                  : "bg-[linear-gradient(90deg,transparent_0%,rgba(245,158,11,0.06)_50%,transparent_100%)]"
          }`}
        />
      </AnimatePresence>

      {/* Alert red glow background overlay */}
      {hasAlert && (
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-red-500/[0.015] pointer-events-none border border-red-500/15 rounded z-0"
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-mono font-bold text-white text-base tracking-tight">{service.name}</h3>
            {hasAlert ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded font-mono border bg-red-950/20 border-red-500/30 text-red-500 animate-pulse font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                QUÁ TẢI
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs rounded font-mono border ${currentStatus.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.indicator}`}></span>
                {currentStatus.desc}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5c5c5c] mt-1 line-clamp-1">{service.role}</p>
        </div>
        
        {service.port && (
          <span className="text-[10px] font-mono bg-[#050505] border border-[#1f1f23] text-[#5c5c5c] px-2 py-0.5 rounded">
            PORT: {service.port}
          </span>
        )}
      </div>

      {service.status === "running" && (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3 bg-[#050505] rounded p-3 border border-[#1f1f23]">
            <div className="flex items-center gap-2.5">
              <Cpu className={`w-4 h-4 shrink-0 ${isCpuOverloaded ? "text-red-500 animate-pulse" : "text-[#f27d26]"}`} />
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className={`${isCpuOverloaded ? "text-red-400 font-bold" : "text-[#5c5c5c]"}`}>CPU</span>
                  <span className={`flex items-center gap-0.5 ${isCpuOverloaded ? "text-red-500 font-bold animate-pulse" : "text-[#5c5c5c]"}`}>
                    {(service.cpu * 10).toFixed(0)}%
                    {isCpuOverloaded && <span className="text-[8px] uppercase">[⚠️]</span>}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#1f1f23] rounded overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all duration-500 ${isCpuOverloaded ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-[#f27d26]"}`} 
                    style={{ width: `${Math.min(service.cpu * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <HardDrive className={`w-4 h-4 shrink-0 ${isRamOverloaded ? "text-red-500 animate-pulse" : "text-orange-400"}`} />
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className={`${isRamOverloaded ? "text-red-400 font-bold" : "text-[#5c5c5c]"}`}>RAM</span>
                  <span className={`flex items-center gap-0.5 ${isRamOverloaded ? "text-red-500 font-bold animate-pulse" : "text-[#5c5c5c]"}`}>
                    {service.memory} MB
                    {isRamOverloaded && <span className="text-[8px] uppercase">[⚠️]</span>}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#1f1f23] rounded overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all duration-500 ${isRamOverloaded ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-orange-400"}`} 
                    style={{ width: `${Math.min((service.memory / 512) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time CPU trend visualization (Recharts Area Chart) */}
          <div className="h-20 w-full bg-[#050505] rounded border border-[#1f1f23] p-1 overflow-hidden relative group">
            <div className="absolute top-1.5 left-2 px-1 py-0.2 bg-black/80 border border-[#1f1f23] rounded font-mono text-[8px] text-[#5c5c5c] z-10 uppercase tracking-widest font-bold">
              XU HƯỚNG CPU (REAL-TIME TREND)
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-1.5 right-2 p-1.5 bg-black/80 hover:bg-[#141417] border border-[#1f1f23] hover:border-[#f27d26] rounded text-slate-400 hover:text-white z-10 transition-all opacity-80 md:opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              title="Phóng to biểu đồ"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            {cpuHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuHistory} margin={{ top: 20, right: 3, left: -45, bottom: -5 }}>
                  <defs>
                    <linearGradient id={`cpuGlow-${service.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isCpuOverloaded ? "#ef4444" : "#f27d26"} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={isCpuOverloaded ? "#ef4444" : "#f27d26"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <XAxis dataKey="time" hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1f1f23', strokeWidth: 1 }} />
                  <ReferenceLine 
                    y={80} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    strokeWidth={1}
                    label={{ 
                      value: "CRITICAL (80%)", 
                      fill: "#ef4444", 
                      fontSize: 7, 
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      position: "insideBottomRight",
                      offset: 6
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="cpuPercent"
                    stroke={isCpuOverloaded ? "#ef4444" : "#f27d26"}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill={`url(#cpuGlow-${service.key})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] font-mono text-[#5c5c5c]">
                ĐANG CHỜ TÍN HIỆU LIVE...
              </div>
            )}
          </div>
        </div>
      )}

      {service.status !== "running" && (
        <div className="py-7 text-center rounded bg-[#050505]/40 border border-dashed border-[#1f1f23] mb-4 flex flex-col items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[#5c5c5c] mb-1.5" />
          <span className="text-xs text-slate-400 font-mono">Dịch vụ đang tạm ngưng vận hành</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2.5 border-t border-[#1f1f23] pt-3">
        <button 
          onClick={() => setShowLogs(!showLogs)} 
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono py-1 px-2.5 rounded hover:bg-[#141417] transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-[#f27d26]" />
          {showLogs ? "Ẩn Logs" : `Logs (${service.logs.length})`}
        </button>

        <div className="flex items-center gap-1">
          {service.status !== "running" ? (
            <button
              onClick={() => handleAction("start")}
              disabled={isRefreshing}
              className="p-1 px-2.5 bg-[#f27d26]/10 hover:bg-[#f27d26]/20 text-[#f27d26] border border-[#f27d26]/30 rounded text-xs font-mono flex items-center gap-1 transition-all"
            >
              <Play className="w-3 h-3" /> Chạy
            </button>
          ) : (
            <button
              onClick={() => handleAction("stop")}
              disabled={isRefreshing}
              className="p-1 px-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded text-xs font-mono flex items-center gap-1 transition-all"
            >
              <Square className="w-3 h-3" /> Dừng
            </button>
          )}

          <button
            onClick={() => handleAction("restart")}
            disabled={isRefreshing}
            className="p-1.5 text-slate-400 hover:text-white bixbott-rotate hover:bg-[#141417] rounded border border-transparent hover:border-[#1f1f23] transition-all"
            title="Khởi động lại"
          >
            <RotateCw className={`w-3.1 h-3.1 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-black rounded border border-[#1f1f23] font-mono text-[10.5px] leading-relaxed text-slate-300 max-h-32 overflow-y-auto scoller-custom">
              {service.logs.map((log, index) => (
                <div key={index} className="border-b border-neutral-950 py-0.5 last:border-0 hover:bg-[#0c0c0e]/40">
                  <span className="text-[#5c5c5c] text-[9px] mr-1.5">[{new Date().toLocaleTimeString()}]</span>
                  <span className={
                    log.includes("[ERROR]") || log.includes("[MANUAL] Đã dừng") ? "text-rose-400" :
                    log.includes("[MANUAL]") || log.includes("thành công") || log.includes("hoàn tất") ? "text-emerald-400" :
                    log.includes("[ROUTE]") || log.includes("[WEB]") ? "text-orange-400" : "text-slate-300"
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0c0c0e] border border-[#1f1f23] w-full max-w-4xl rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#1f1f23] flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26]">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-mono font-bold text-white text-base tracking-tight flex items-center gap-2">
                      {service.name}
                      <span className="text-[10px] bg-[#050505] border border-[#1f1f23] text-[#5c5c5c] px-2 py-0.5 rounded font-normal uppercase">
                        DỮ LIỆU TOÀN MÀN HÌNH (FULLSCREEN METRIC)
                      </span>
                    </h2>
                    <p className="text-xs text-[#5c5c5c] font-sans">{service.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {service.port && (
                    <span className="text-xs font-mono bg-[#050505] border border-[#1f1f23] text-[#5c5c5c] px-2.5 py-1 rounded">
                      PORT: {service.port}
                    </span>
                  )}
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-1 px-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Đóng bản phóng to"
                  >
                    <X className="w-4 h-4" /> Đóng [Esc]
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:24px_24px] bg-opacity-[0.03]">
                {/* Visual Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CPU Stat Card */}
                  <div className="bg-[#050505] border border-[#1f1f23] rounded p-5 flex items-center gap-4">
                    <div className="p-3.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26]">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-mono text-[#5c5c5c] block font-bold">CHỈ SỐ CPU HIỆN TẠI</span>
                      <p className="text-2xl font-mono font-bold text-white mt-0.5">{(service.cpu * 10).toFixed(0)}%</p>
                      <div className="h-1.5 w-full bg-[#1f1f23] rounded overflow-hidden mt-2">
                        <div 
                          className={`h-full rounded transition-all duration-500 ${isCpuOverloaded ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-[#f27d26]"}`} 
                          style={{ width: `${Math.min(service.cpu * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Memory Stat Card */}
                  <div className="bg-[#050505] border border-[#1f1f23] rounded p-5 flex items-center gap-4">
                    <div className="p-3.5 bg-orange-950/10 border border-[#1f1f23] rounded text-orange-400">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-mono text-[#5c5c5c] block font-bold">BỘ NHỚ SỬ DỤNG</span>
                      <p className="text-2xl font-mono font-bold text-white mt-0.5">{service.memory} MB</p>
                      <div className="h-1.5 w-full bg-[#1f1f23] rounded overflow-hidden mt-2">
                        <div 
                          className={`h-full rounded transition-all duration-500 ${isRamOverloaded ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-orange-400"}`} 
                          style={{ width: `${Math.min((service.memory / 512) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Stat Card */}
                  <div className="bg-[#050505] border border-[#1f1f23] rounded p-5 flex items-center gap-4">
                    <div className={`p-3.5 rounded border ${currentStatus.bg}`}>
                      <span className={`w-3 h-3 rounded-full block ${currentStatus.indicator}`}></span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#5c5c5c] block font-bold">TRẠNG THÁI VẬN HÀNH</span>
                      <p className="text-xl font-mono font-bold text-white mt-0.5">{currentStatus.desc.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Sẵn sàng nhận lệnh điều phối</p>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Big Chart Label */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#5c5c5c] font-bold">
                    BIỂU ĐỒ BẢN ĐỒ QUÁ TẢI TIÊU THỤ CPU (BIG TELEMETRY PLOT)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded font-mono text-[#f27d26]">
                    Khoảng thời gian: 36 giây gần nhất (Live)
                  </span>
                </div>

                {/* Larger Fullscreen Chart Container */}
                <div className="h-64 md:h-72 w-full bg-[#050505] rounded border border-[#1f1f23] p-4 relative overflow-hidden">
                  {cpuHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cpuHistory} margin={{ top: 25, right: 15, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id={`fsCpuGlow-${service.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isCpuOverloaded ? "#ef4444" : "#f27d26"} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={isCpuOverloaded ? "#ef4444" : "#f27d26"} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={[0, 100]} stroke="#333" className="text-[10px] font-mono" />
                        <XAxis dataKey="time" stroke="#333" className="text-[10px] font-mono" />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f27d26', strokeOpacity: 0.3, strokeWidth: 1.5 }} />
                        <ReferenceLine 
                          y={80} 
                          stroke="#ef4444" 
                          strokeDasharray="4 4" 
                          strokeWidth={1.5}
                          label={{ 
                            value: "MỨC QUÁ TẢI CRITICAL (80%)", 
                            fill: "#ef4444", 
                            fontSize: 10, 
                            fontWeight: "bold",
                            fontFamily: "monospace",
                            position: "insideTopRight",
                            offset: 10
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="cpuPercent"
                          stroke={isCpuOverloaded ? "#ef4444" : "#f27d26"}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#fsCpuGlow-${service.key})`}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-mono text-[#5c5c5c]">
                      ĐANG KHỞI TẠO BỘ KIỂM TRA ĐƯỜNG TRUYỀN...
                    </div>
                  )}
                </div>

                {/* Diagnostics logs inside Modal */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#5c5c5c] font-bold block">
                    ĐỒNG BỘ NHẬT KÝ SỰ KIỆN KHẢ DỤNG (DIAGNOSTIC EVENTS)
                  </span>
                  <div className="bg-black rounded border border-[#1f1f23] p-4 font-mono text-xs leading-relaxed text-slate-300 max-h-48 overflow-y-auto scroller-custom">
                    {service.logs.map((log, index) => (
                      <div key={index} className="border-b border-[#1f1f23]/30 py-1.5 last:border-0 hover:bg-[#0c0c0e]/40 flex items-start gap-2">
                        <span className="text-[#5c5c5c] text-[10px] mt-0.5 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className={
                          log.includes("[ERROR]") || log.includes("[MANUAL] Đã dừng") ? "text-rose-400" :
                          log.includes("[MANUAL]") || log.includes("thành công") || log.includes("hoàn tất") ? "text-emerald-400" :
                          log.includes("[ROUTE]") || log.includes("[WEB]") ? "text-orange-400" : "text-slate-300"
                        }>
                          {log}
                        </span>
                      </div>
                    ))}
                    {service.logs.length === 0 && (
                      <div className="text-center text-[#5c5c5c] py-4">Chưa có bản ghi nhật ký tự động.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Command Action Footer */}
              <div className="p-4 border-t border-[#1f1f23] bg-black/50 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Bixbott Terminal OS v1.1.2</span>
                <span className="text-[#00ff41] animate-pulse">● LIVE TELEMETRY STREAM ACTIVE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
