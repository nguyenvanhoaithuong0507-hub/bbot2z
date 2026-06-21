import React, { useMemo } from "react";
import { Activity, ShieldCheck, Heart, Clock, AlertTriangle } from "lucide-react";

interface PulseRateMeterProps {
  stabilityScore: number;
  averageUptime: number;
  averageLatency: number;
  activeCount: number;
  totalCount: number;
}

export const PulseRateMeter: React.FC<PulseRateMeterProps> = ({
  stabilityScore,
  averageUptime,
  averageLatency,
  activeCount,
  totalCount
}) => {
  // Determine color theme based on score threshold
  const statusTheme = useMemo(() => {
    if (stabilityScore >= 90) {
      return {
        accentColor: "#00ff41", // Emerald cybersecurity-neon green
        textClass: "text-[#00ff41]",
        bgClass: "border-[#00ff41]/25 bg-[#00ff41]/5",
        statusDesc: "HỆ THỐNG AN TOÀN TUYỆT ĐỐI",
        shortDesc: "Healthy Core - Optimal Latence",
        badgeClass: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
        pulseDelay: "1s"
      };
    } else if (stabilityScore >= 75) {
      return {
        accentColor: "#f27d26", // Classic Bixbott orange
        textClass: "text-[#f27d26]",
        bgClass: "border-[#f27d26]/25 bg-[#f27d26]/5",
        statusDesc: "HẠ TẦNG CÓ TẢI TRUNG BÌNH (WARN)",
        shortDesc: "Degraded Nodes - Moderated Latence",
        badgeClass: "bg-orange-950/40 text-orange-400 border-orange-500/30",
        pulseDelay: "0.6s"
      };
    } else {
      return {
        accentColor: "#ef4444", // Red critical
        textClass: "text-red-500",
        bgClass: "border-red-500/30 bg-red-950/10",
        statusDesc: "CỦNG CỐ KHẨN CẤP tài nguyên (CRITICAL)",
        shortDesc: "Severe Outages - Overloaded Nodes",
        badgeClass: "bg-red-950/50 text-red-400 border-red-500/30",
        pulseDelay: "0.3s"
      };
    }
  }, [stabilityScore]);

  // Radius of the arc inside SVG gauge
  const radius = 55;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // Semi-circle circumference
  const strokeDashoffset = circumference - (stabilityScore / 100) * circumference;

  // Needle angle from -90 degrees (0%) to +90 degrees (100%)
  const needleRotation = (stabilityScore / 100) * 180 - 90;

  return (
    <div 
      className={`border p-6 rounded shadow-2xl relative overflow-hidden transition-all duration-500 ${statusTheme.bgClass}`}
    >
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none"></div>

      {/* Header section with pulsating live badge */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-full border bg-black/40 ${statusTheme.textClass}`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5 leading-none">
              BIXBOTT PULSE RATE <span className="text-[10px] text-[#f27d26] bg-[#f27d26]/10 px-1 py-0.5 rounded border border-[#f27d26]/20 font-bold">VL2 PRO</span>
            </h3>
            <span className="text-[10px] text-[#5c5c5c] font-mono uppercase font-bold mt-1 block">
              HỒ SƠ KHẢ DỤNG HẠ TẦNG (SYSTEM STABILITY PROFILE)
            </span>
          </div>
        </div>

        {/* Live Pulse status bubble */}
        <div className="flex items-center gap-2.5 align-middle self-start sm:self-center">
          <span className={`px-2 py-0.5 text-[9px] font-mono border rounded font-bold uppercase ${statusTheme.badgeClass}`}>
            ● LIVE PULSE
          </span>
          <span className="text-[10px] text-[#5c5c5c] font-mono">
            SEC: {new Date().getSeconds()}s
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Dynamic ECG scrolling heartbeat wave inside Column 1 */}
        <div className="md:col-span-5 flex flex-col justify-center items-center py-2 relative">
          
          {/* Smooth vector Gauge representation */}
          <div className="relative w-48 h-28 flex items-center justify-center">
            <svg 
              viewBox="0 0 140 80" 
              className="w-full h-full drop-shadow-[0_0_15px_rgba(242,125,38,0.05)]"
            >
              <defs>
                <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                {/* Metallic gradient for the needle pivot */}
                <radialGradient id="pivot-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="40%" stopColor="#222" />
                  <stop offset="100%" stopColor="#050505" />
                </radialGradient>
              </defs>

              {/* Back track arc */}
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke="#15151b"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Glowing active stability progress */}
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke={statusTheme.accentColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />

              {/* Soft outer glow overlay */}
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke={statusTheme.accentColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                opacity="0.25"
                filter="url(#gauge-glow)"
                className="transition-all duration-1000 ease-out"
              />

              {/* Radial dial ticks around the speed gauge */}
              {[0, 25, 50, 75, 100].map((t, i) => {
                const angle = i * 45; // 0 to 180 deg
                const rad = (angle * Math.PI) / 180;
                // Since arc is from left (-180deg) to right (0deg)
                const cos = Math.cos(Math.PI - rad);
                const sin = Math.sin(Math.PI - rad);
                
                const x1 = 70 + (radius - 5) * cos;
                const y1 = 70 - (radius - 5) * sin;
                const x2 = 70 + (radius + 2) * cos;
                const y2 = 70 - (radius + 2) * sin;

                return (
                  <line
                    key={t}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#1f1f23"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Sleek Gauge Needle */}
              <g transform={`rotate(${needleRotation} 70 70)`} className="transition-all duration-1000 ease-out">
                {/* Back end pointer balancing weigh */}
                <path
                  d="M 68 70 L 70 20 L 72 70 Z"
                  fill={statusTheme.accentColor}
                  stroke={statusTheme.accentColor}
                  strokeWidth="0.5"
                />
                <circle cx="70" cy="20" r="1.5" fill="#ffffff" />
              </g>

              {/* Centered Metallic Cap */}
              <circle cx="70" cy="70" r="7" fill="url(#pivot-grad)" stroke="#1a1a20" strokeWidth="1" />
              <circle cx="70" cy="70" r="2.5" fill={statusTheme.accentColor} />
            </svg>

            {/* Float values inside center of the gauge structure */}
            <div className="absolute bottom-1 text-center font-mono">
              <span className={`text-3xl font-extrabold tracking-tighter block leading-none ${statusTheme.textClass}`}>
                {stabilityScore}%
              </span>
              <span className="text-[9px] text-[#5c5c5c] font-bold tracking-wider uppercase">Stability</span>
            </div>
          </div>
        </div>

        {/* Grid Stats indicators on the right side (7 columns) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Diagnostic Heartbeat Oscillosope / Pulse Line panel */}
          <div className="sm:col-span-2 bg-black/45 border border-[#1f1f23] rounded p-3 relative flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold">ECG OSCILLOSCOPE MONITOR</span>
              <p className={`text-xs font-mono font-bold leading-none ${statusTheme.textClass} flex items-center gap-1`}>
                <Heart className="w-3.5 h-3.5 fill-current animate-bounce" style={{ animationDuration: statusTheme.pulseDelay }} /> 
                {statusTheme.statusDesc}
              </p>
              <p className="text-[10px] text-slate-400 font-sans font-light leading-none">{statusTheme.shortDesc}</p>
            </div>

            {/* Real Electrocardiogram (ECG) animated SVG */}
            <div className="w-24 h-8 overflow-hidden relative">
              <svg viewBox="0 0 100 30" width="100%" height="100%" className={statusTheme.textClass}>
                <path
                  d="M 0 15 L 15 15 L 20 15 L 25 3 L 28 27 L 31 15 L 35 15 L 40 15  M 45 15 L 60 15 L 65 15 L 70 3 L 73 27 L 76 15 L 80 15 L 100 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ecg-line"
                />
              </svg>
            </div>
            
            {/* Custom local animation styles targeting ECG line effect */}
            <style>{`
              .ecg-line {
                stroke-dasharray: 200;
                animation: ecg-flow ${statusTheme.pulseDelay} linear infinite;
              }
              @keyframes ecg-flow {
                to {
                  stroke-dashoffset: -200;
                }
              }
            `}</style>
          </div>

          {/* Aggregate Uptime Card */}
          <div className="bg-black/25 border border-[#1f1f23] rounded p-3 flex items-center gap-3">
            <div className="p-2.5 bg-sky-950/20 border border-sky-500/20 rounded text-[#38bdf8]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold leading-none">AGGREGATE UPTIME</span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{averageUptime}%</p>
              <p className="text-[9px] text-[#5c5c5c] font-sans">Đo lường từ mọi node chạy</p>
            </div>
          </div>

          {/* Aggregate Active Latency Card */}
          <div className="bg-black/25 border border-[#1f1f23] rounded p-3 flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded text-amber-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#5c5c5c] block font-bold leading-none">AVERAGE LATENCY</span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">
                {averageLatency === 0 ? "Infinite" : `~${averageLatency} ms`}
              </p>
              <p className="text-[9px] text-[#5c5c5c] font-sans">Thời gian phản hồi bình quân</p>
            </div>
          </div>

          {/* Active Nodes vs Total count tracker */}
          <div className="sm:col-span-2 bg-black/15 px-3 py-2 border-t border-[#1f1f23]/40 flex items-center justify-between text-[10.5px] font-mono">
            <div className="flex gap-2 text-[#5c5c5c] font-sans">
              <span>Đại lượng:</span>
              <span className="text-slate-300 font-mono font-semibold">{activeCount} Hoạt động</span>
              <span>/</span>
              <span className="text-slate-400 font-mono">{totalCount} Trạm định vị</span>
            </div>
            
            {stabilityScore < 90 ? (
              <span className="flex items-center gap-1 text-amber-500 text-[10px] uppercase font-bold animate-[pulse_2s_infinite]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                CẦN RÀ SOÁT TẢI
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#00ff41] text-[10px] uppercase font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                TRẠNG THÁI HIỆU QUẢ KIỆN
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
