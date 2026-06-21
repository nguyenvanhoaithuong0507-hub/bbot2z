import React from "react";
import { RepoMetadata } from "../types";
import { GitFork, Star, ExternalLink, ShieldAlert, Cpu, Sparkles, BookOpen, HardDriveDownload } from "lucide-react";

interface RepoCardProps {
  repo: RepoMetadata;
  onAskAI: (repoName: string) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onAskAI }) => {
  const categoryConfig = {
    Security: {
      color: "bg-red-500/10 border-red-500/20 text-red-400 text-xs",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 mr-1" />
    },
    Infrastructure: {
      color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-xs",
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1" />
    },
    Documentation: {
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs",
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400 mr-1" />
    },
    "UI/UX": {
      color: "bg-pink-500/10 border-pink-500/20 text-pink-400 text-xs",
      icon: <Sparkles className="w-3.5 h-3.5 text-pink-400 mr-1" />
    },
    "CLI/Tools": {
      color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-xs",
      icon: <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400 mr-1" />
    }
  };

  const statusTags = {
    stable: "bg-emerald-600/15 text-emerald-400 border-emerald-500/20",
    beta: "bg-amber-600/15 text-amber-400 border-amber-500/20",
    active: "bg-blue-600/15 text-blue-400 border-blue-500/20",
    legacy: "bg-neutral-600/15 text-neutral-400 border-neutral-500/20"
  };

  const currentCategory = categoryConfig[repo.category];

  return (
    <div id={`repo-${repo.name}`} className="border border-[#1f1f23] bg-[#0c0c0e] p-4.5 rounded shadow-md hover:shadow-xl hover:border-[#f27d26] transition-all flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Absolute faint background glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#f27d26]/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#f27d26]/10 transition-all duration-300"></div>

      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`flex items-center border rounded px-1.5 py-0.5 text-[10px] font-mono leading-none ${currentCategory.color}`}>
              {currentCategory.icon}
              {repo.category}
            </span>
            <span className={`border rounded px-1.5 py-0.5 text-[10px] font-mono leading-none capitalize ${statusTags[repo.status]}`}>
              {repo.status}
            </span>
          </div>
          
          <a get-id={`lnk-${repo.name}`} href={repo.url} target="_blank" rel="noreferrer noopener" className="text-[#5c5c5c] hover:text-white p-1 rounded hover:bg-[#141417] transition-colors" title="Xem trên GitHub">
            <ExternalLink className="w-3.7 h-3.7" />
          </a>
        </div>

        <h4 className="font-mono font-bold text-[15px] sm:text-base text-slate-200 group-hover:text-[#f27d26] transition-colors tracking-tight line-clamp-1 mb-1.5">
          {repo.name}
        </h4>

        <p className="text-[12px] text-slate-400 leading-normal line-clamp-3 mb-4 font-sans font-light">
          {repo.description}
        </p>
      </div>

      <div className="border-t border-[#1f1f23] pt-3.5 mt-auto flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono bg-[#050505] border border-[#1f1f23] rounded px-1.5 py-0.5 text-[#5c5c5c]">
            {repo.mainLanguage}
          </span>
          
          <div className="flex items-center gap-2.5 text-[#5c5c5c] font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              {repo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3 text-orange-400" />
              {repo.forks}
            </span>
          </div>
        </div>

        <button
          onClick={() => onAskAI(repo.name)}
          className="w-full text-center py-1.5 px-3 bg-[#f27d26]/10 hover:bg-[#f27d26]/20 text-[#f27d26] border border-[#f27d26]/20 rounded font-mono text-[11px] font-medium tracking-tight transition-all uppercase hover:border-[#f27d26]/40"
        >
          Hỏi Trợ lý AI Bixbott
        </button>
      </div>
    </div>
  );
};
