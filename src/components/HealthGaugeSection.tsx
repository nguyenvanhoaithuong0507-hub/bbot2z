import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ShieldCheck, 
  ShieldX, 
  Cpu, 
  Terminal, 
  Zap, 
  HelpCircle, 
  Activity, 
  TrendingUp,
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";
import { ServiceState } from "../types";

interface HealthGaugeSectionProps {
  stabilityScore: number;
  coreModules: ServiceState[];
  serviceLayers: ServiceState[];
  telemetrySums: {
    cpu: number;
    memory: number;
    activeNodes: number;
    totalNodes: number;
    hasCpuAlert: boolean;
    hasMemoryAlert: boolean;
    alertNodes: string[];
    averageUptime: number;
    averageLatency: number;
  };
}

export const HealthGaugeSection: React.FC<HealthGaugeSectionProps> = ({
  stabilityScore,
  coreModules,
  serviceLayers,
  telemetrySums
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [interactiveTab, setInteractiveTab] = useState<"penalties" | "recommendations">("penalties");

  // Determine current status categorization and colors
  const statusConfig = useMemo(() => {
    if (stabilityScore >= 90) {
      return {
        label: "TỐI ƯU (OPTIMAL)",
        color: "#00ff41", // Cybersecurity Neon Green
        bgLight: "bg-[#00ff41]/5",
        borderLight: "border-[#00ff55]/20",
        glow: "rgba(0, 255, 65, 0.25)",
        desc: "Hệ thống đang hoạt động trong ngưỡng lý tưởng, độ trễ tối thiểu và tỷ lệ lỗi cực thấp."
      };
    } else if (stabilityScore >= 70) {
      return {
        label: "ỔN ĐỊNH CÓ GIỚI HẠN (MODERATE)",
        color: "#f27d26", // Bixbott Orange
        bgLight: "bg-[#f27d26]/5",
        borderLight: "border-[#f27d26]/20",
        glow: "rgba(242, 125, 38, 0.2)",
        desc: "Hạ tầng có tải trung bình hoặc có dịch vụ đang dừng, các tiến trình cốt lõi vẫn được bảo toàn."
      };
    } else {
      return {
        label: "CẢNH BÁO NGUY CƠ (CRITICAL)",
        color: "#f43f5e", // Critical Rose/Red
        bgLight: "bg-[#f43f5e]/5",
        borderLight: "border-[#f43f5e]/20",
        glow: "rgba(244, 63, 94, 0.25)",
        desc: "Nhiều dịch vụ cốt lõi bị lỗi hoặc dừng nghiêm trọng. Cần can thiệp khởi động lại dịch vụ ngay."
      };
    }
  }, [stabilityScore]);

  // SVG Gauge calculations
  // We'll use a circular gauge with 3/4 outline (270 degrees)
  const size = 180;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = 270; // Degree angle of gauge
  const gapLength = 360 - arcLength;
  const dashArray = `${(arcLength / 360) * circumference} ${circumference}`;
  // Stroke offset maps from 0% (full dashArray of arcLength) to 100% (0 offset)
  const scorePercent = stabilityScore / 100;
  const dashOffset = (arcLength / 360) * circumference * (1 - scorePercent);

  // Analyze active modifiers to compute the diagnostic list
  const activeModifiers = useMemo(() => {
    const list: Array<{
      type: "penalty" | "bonus";
      score: number;
      name: string;
      reason: string;
    }> = [];

    // Base startup credit
    list.push({
      type: "bonus",
      score: 100,
      name: "Tín dụng khởi động",
      reason: "Hạ tầng lõi tối ưu mặc định"
    });

    // Check Core modules state
    coreModules.forEach(m => {
      const cpuP = m.cpu * 10;
      const memP = (m.memory / 512) * 100;

      if (m.status === "stopped") {
        list.push({
          type: "penalty",
          score: 10,
          name: `Dừng ${m.name}`,
          reason: "Hạ tầng lõi bị ngắt tạm thời"
        });
      } else if (m.status === "error") {
        list.push({
          type: "penalty",
          score: 25,
          name: `Lỗi ${m.name}`,
          reason: "Sự cố định vị lỗi thực thi AI Core"
        });
      } else if (m.status === "running") {
        if (cpuP > 80 || memP > 90) {
          list.push({
            type: "penalty",
            score: 8,
            name: `Quá tải ${m.name}`,
            reason: "Tận dụng tài nguyên vượt ngưỡng >80% CPU />90% RAM"
          });
        }
      }
    });

    // Check Service Layers state
    serviceLayers.forEach(m => {
      const cpuP = m.cpu * 10;
      const memP = (m.memory / 512) * 100;

      if (m.status === "stopped") {
        list.push({
          type: "penalty",
          score: 6,
          name: `Dừng ${m.name}`,
          reason: "Cổng biên dịch bị dừng"
        });
      } else if (m.status === "error") {
        list.push({
          type: "penalty",
          score: 16,
          name: `Lỗi ${m.name}`,
          reason: "Mất kết nối cổng biên dịch phân phối"
        });
      } else if (m.status === "running") {
        if (cpuP > 80 || memP > 90) {
          list.push({
            type: "penalty",
            score: 5,
            name: `Quá tải ${m.name}`,
            reason: "Thời gian phản hồi biên bị suy hao tải"
          });
        }
      }
    });

    return list;
  }, [coreModules, serviceLayers]);

  // Compute dynamic recommendations based on current penalties
  const recommendations = useMemo(() => {
    const list: string[] = [];
    const stoppedCount = [...coreModules, ...serviceLayers].filter(m => m.status === "stopped").length;
    const errorCount = [...coreModules, ...serviceLayers].filter(m => m.status === "error").length;
    const overloadedCount = telemetrySums.alertNodes.length;

    if (errorCount > 0) {
      list.push(`Khắc phục khẩn cấp ${errorCount} nút đang bị LỖI (Error) bằng cách chuyển sang trạng thái RUNNING chỉnh định.`);
    }
    if (stoppedCount > 0) {
      list.push(`Khởi chạy lại ${stoppedCount} dịch vụ đã dừng để khôi phục hoàn toàn chỉ số ổn định 100%.`);
    }
    if (overloadedCount > 0) {
      list.push(`Tái cấu trúc tải của các nút vượt ngưỡng để giải phóng bộ nhớ RAM biên.`);
    }
    if (list.length === 0) {
      list.push("Hạ tầng an toàn xuất sắc! Không có khuyến nghị bổ sung nào tại thời điểm này.");
    }

    return list;
  }, [coreModules, serviceLayers, telemetrySums]);

  return (
    <div 
      className={`border rounded-lg p-6 ${statusConfig.bgLight} ${statusConfig.borderLight} transition-all duration-500 relative overflow-hidden`}
    >
      {/* Dynamic scan line background effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[pulse_2.5s_infinite]"></div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row gap-8 items-center justify-between">
        
        {/* LEFT COLUMN: Large Gauge Widget representation */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full sm:w-56 text-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            
            {/* Visual Arc Gauge */}
            <svg 
              width={size} 
              height={size} 
              viewBox={`0 0 ${size} ${size}`} 
              className="transform -rotate-225"
            >
              <defs>
                <radialGradient id="gaugeGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={statusConfig.color} stopOpacity="0.15" />
                  <stop offset="100%" stopColor="transparent" opacity="0" />
                </radialGradient>
              </defs>

              {/* Background Glow */}
              <circle 
                cx={center} 
                cy={center} 
                r={radius} 
                fill="url(#gaugeGlowGrad)" 
              />

              {/* Background Gauge Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#15151b"
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeLinecap="round"
              />

              {/* Active Stability Fill */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={statusConfig.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                initial={{ strokeDashoffset: (arcLength / 360) * circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${statusConfig.glow})` }}
              />

              {/* Outer delicate ring border */}
              <circle
                cx={center}
                cy={center}
                r={radius + 12}
                fill="none"
                stroke="#1f1f23"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Absolute Centered Readout Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-3 font-mono">
              <span className="text-[10px] text-[#5c5c5c] font-bold tracking-widest uppercase mb-1">Stability</span>
              <motion.span 
                key={stabilityScore}
                initial={{ scale: 0.85, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-extrabold tracking-tighter text-white"
                style={{ textShadow: `0 0 15px ${statusConfig.glow}` }}
              >
                {stabilityScore}%
              </motion.span>
              <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded uppercase ${
                stabilityScore >= 90 ? "bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20" :
                stabilityScore >= 70 ? "bg-[#f27d26]/10 text-[#f27d26] border border-[#f27d26]/20" :
                "bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20"
              }`}>
                {stabilityScore >= 90 ? "Optimal" : stabilityScore >= 70 ? "Stable" : "Alert"}
              </span>
            </div>
          </div>
          
          <div className="mt-2">
            <span className="font-mono text-[10px] text-[#5c5c5c] block font-bold uppercase tracking-wider">SYSTEM METRIC SHIELD</span>
            <span className="font-sans text-[11px] text-slate-400 mt-0.5 inline-block max-w-xs leading-normal">
              Chỉ số sức khỏe tổng hợp thời gian thực từ 10 thành phần.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostics and dynamic stability factors */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 rounded font-mono text-[8px] text-[#5c5c5c] font-bold uppercase tracking-wide">
                  Chẩn đoán chi tiết
                </span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  BÁO CÁO PHÂN PHỐI SỨC KHỎE HẠ TẦNG
                </span>
              </div>
              <h4 className="text-sm font-sans font-medium text-slate-300">
                Trạng thái: <strong className="font-mono uppercase" style={{ color: statusConfig.color }}>{statusConfig.label}</strong>
              </h4>
            </div>

            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="p-1 px-2.5 bg-zinc-950 border border-neutral-800 hover:border-neutral-700 rounded text-[9.5px] font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-bold uppercase tracking-widest shrink-0"
              title="Xem thông tin chi tiết về cơ chế tính điểm"
            >
              <Info className="w-3.5 h-3.5 text-[#f27d26]" />
              {showExplanation ? "Đóng" : "Hướng dẫn tính điểm"}
            </button>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {statusConfig.desc}
          </p>

          {/* Dynamic Score explanation panel */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-[#050505] border border-[#1f1f23]/80 rounded p-4 text-[11px] font-mono text-slate-400 space-y-2.5 leading-relaxed"
              >
                <div className="font-bold text-[#f27d26] uppercase text-[10px] tracking-wider border-b border-[#1f1f23] pb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> BIỂU PHÍ KHẤU TRỪ ỔN ĐỊNH HỆ THỐNG
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                    <span>Lõi dịch vụ bị Dừng (Stop)</span>
                    <span className="text-red-400 font-bold">-10% / dịch vụ</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                    <span>Lõi dịch vụ gặp Lỗi (Error)</span>
                    <span className="text-red-500 font-bold">-25% / dịch vụ</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                    <span>Cổng phân phối bị Dừng</span>
                    <span className="text-red-400/90 font-bold">-6% / cổng</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-zinc-900">
                    <span>Cổng phân phối gặp Lỗi</span>
                    <span className="text-red-500/95 font-bold">-16% / cổng</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-zinc-900 sm:col-span-2">
                    <span>Dịch vụ hoạt động quá tải (&gt;80% CPU hoặc &gt;90% RAM)</span>
                    <span className="text-amber-500 font-bold">-5% đến -8% / dịch vụ</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  * Điểm tối thiểu không bao giờ dưới 5% nhằm đảm bảo có thể hiển thị cảnh báo từ xa.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub-tab navigation inside Health Section */}
          <div className="border border-[#1f1f23] bg-black/35 rounded overflow-hidden">
            <div className="flex border-b border-[#1f1f23] bg-zinc-950 font-mono text-[9.5px] uppercase font-bold tracking-wider select-none">
              <button
                type="button"
                onClick={() => setInteractiveTab("penalties")}
                className={`flex-1 py-2 text-center border-r border-[#1f1f23] transition-all cursor-pointer ${
                  interactiveTab === "penalties" ? "bg-[#0c0c0e] text-[#f27d26]" : "text-slate-500 hover:text-slate-200"
                }`}
              >
                Nhân Tố Tác Động ({activeModifiers.length})
              </button>
              <button
                type="button"
                onClick={() => setInteractiveTab("recommendations")}
                className={`flex-1 py-2 text-center transition-all cursor-pointer ${
                  interactiveTab === "recommendations" ? "bg-[#0c0c0e] text-[#f27d26]" : "text-slate-500 hover:text-slate-200"
                }`}
              >
                Khuyến Nghị ({recommendations.filter(r => !r.includes("nghị bổ sung")).length})
              </button>
            </div>

            {/* Sub-tab Content areas */}
            <div className="p-3 bg-[#0a0a0c] min-h-[140px] max-h-56 overflow-y-auto scroller-custom">
              <AnimatePresence mode="wait">
                {interactiveTab === "penalties" ? (
                  <motion.div
                    key="penalties"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2 font-mono text-xs"
                  >
                    {activeModifiers.map((mod, idx) => (
                      <div 
                        key={`${mod.name}-${idx}`}
                        className={`flex items-center justify-between p-2 rounded border ${
                          mod.type === "bonus" 
                            ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400" 
                            : "bg-red-950/10 border-red-500/10 text-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {mod.type === "bonus" ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ShieldX className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold block text-[11px] leading-tight text-slate-200">
                              {mod.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-sans block mt-0.5 leading-none">
                              {mod.reason}
                            </span>
                          </div>
                        </div>

                        <span className={`font-bold font-mono text-[11px] ${
                          mod.type === "bonus" ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {mod.type === "bonus" ? `+${mod.score}%` : `-${mod.score}%`}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2.5"
                  >
                    {recommendations.map((rec, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 bg-zinc-900/35 border border-zinc-800/80 rounded flex gap-2.5 items-start text-xs font-sans text-slate-300"
                      >
                        <div className="p-1 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded text-[#f27d26] shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] font-bold text-slate-500 tracking-wider block uppercase">Action Needed</span>
                          <p className="text-[11.5px] leading-relaxed text-slate-300">
                            {rec}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
