"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  className?: string;
}

export function RiskGauge({ score, className }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (val: number) => {
    if (val <= 40) return "text-[#00FF7F]"; // Safe ✅ (Success Green)
    if (val <= 70) return "text-[#FFD700]"; // Medium ⚠️ (Gold/Warning)
    return "text-[#FF4B4B]"; // High Risk ❌ (Error Red)
  };

  const getLabel = (val: number) => {
    if (val <= 40) return "Safe ✅";
    if (val <= 70) return "Medium ⚠️";
    return "High Risk ❌";
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Background track */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress bar */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getColor(animatedScore))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className={cn("text-4xl font-headline font-bold", getColor(animatedScore))}>
          {Math.round(animatedScore)}%
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
          {getLabel(animatedScore)}
        </span>
      </div>
    </div>
  );
}
