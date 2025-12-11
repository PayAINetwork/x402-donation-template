"use client";

import React from "react";

export function FestiveBorder() {
  return (
    <div className="flex w-full h-3 overflow-hidden">
      {/* Repeating pattern of Red/Green triangles/blocks */}
      {Array.from({ length: 40 }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="w-4 h-full bg-[#D83228] transform -skew-x-12" />
          <div className="w-4 h-full bg-[#248665] transform -skew-x-12" />
        </React.Fragment>
      ))}
    </div>
  );
}
