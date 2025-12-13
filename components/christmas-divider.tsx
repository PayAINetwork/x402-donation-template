"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ChristmasDivider = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const theme = resolvedTheme || "light";

  // Colors from request: Green, White, Red, White...
  const colors = [
    "#248665", // Green
    "#FFFFFF", // White
    "#D83228", // Red
    "#FFFFFF", // White
  ];

  // Segment properties from user request
  // width: 14.74px, height: 17px
  // transform: matrix(0, 1, 1, 0, 0, 0) -> This is effectively a 90deg rotation and flip, or swapping X/Y.
  // Given it's a "box", we'll apply dimensions and rotation.
  const boxWidth = 14.74;
  const boxHeight = 17;
  const gap = 4;

  // Total width of one "unit" in the row (including gap) to calculate scroll
  const unitWidth = boxWidth + gap;

  // We need enough items to cover the screen width.
  // Let's assume a max screen of ~2000px for safety.
  // 2000 / (14.74 + 4) ~= 106 items. Let's do 120.
  const totalItems = 120;

  return (
    <div
      className="w-full overflow-hidden flex items-center justify-start"
      style={{ height: "20px" }} // Adjusted container height to fit rotated boxes if needed, or keeping it loose
    >
      <motion.div
        className="flex"
        style={{ gap: `${gap}px` }}
        animate={{
          x: [0, -(unitWidth * 3 * 10)], // Move by a chunk to reset smoothly. *3 for color group.
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 10, // Slower speed
            ease: "linear",
          },
        }}
      >
        {/* Render multiple groups to ensure infinite loop illusion */}
        {[...Array(2)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex" style={{ gap: `${gap}px` }}>
            {[...Array(totalItems)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                  backgroundColor: colors[i % colors.length],
                  flexShrink: 0,
                  transform: "skewX(-45deg)", // User specified slant of 45 deg
                }}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
