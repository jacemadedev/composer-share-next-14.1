"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({
  className,
  children,
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title?: string;
  description?: React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200",
        "bg-white border-[1px] border-gray-200",
        "dark:shadow-none dark:bg-black dark:border-white/[0.2]",
        "justify-between flex flex-col space-y-4",
        "p-6",
        className
      )}
    >
      <div className="flex-1">
        {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon && <div className="mb-2">{icon}</div>}
        {title && (
          <div className="font-bold text-neutral-600 dark:text-neutral-200">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </div>
        )}
      </div>
    </div>
  );
} 