import { useMemo } from 'react';
import { generateDailySvg } from './dailySvgGenerator.js';

/**
 * DailySvgBackground React Component
 * Renders the daily procedural SVG background picture.
 */
export function DailySvgBackground({ dateStr, className = '' }) {
  const svgMarkup = useMemo(() => {
    return generateDailySvg(dateStr);
  }, [dateStr]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default DailySvgBackground;
