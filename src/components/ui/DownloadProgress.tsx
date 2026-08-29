'use client';

interface DownloadProgressProps {
  progress: number;
}

export function DownloadProgress({ progress }: DownloadProgressProps) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-9 w-9 -rotate-90 transform">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-[#1B3B36]/20"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-[#4F7942] transition-all duration-300"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-[#1B3B36]">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
