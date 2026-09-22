import React, { useState, useId, useMemo, useRef } from 'react';

/**
 * SparkMetricCard
 * Fully dynamic, active, and interactive KPI Card with real-time vector SVG sparklines,
 * pulsing telemetry indicator, interactive hover crosshairs, active data points, live tooltips,
 * and automatic slope/trend calculation for value increases and decreases.
 */
const SparkMetricCard = ({
  variant = 'light', // 'dark' | 'light'
  title,
  value,
  previousValue,
  unit,
  subtext,
  badgeText,
  badgeType, // 'positive' | 'negative' | 'neutral' | 'warning'
  badgeIcon, // 'up' | 'down' | 'dot' | 'none'
  chartColor = 'purple', // 'purple' | 'orange' | 'amber' | 'rose' | 'emerald' | 'blue' | 'indigo' | 'teal'
  presetWave = 'wave1', // 'wave1' | 'wave2' | 'wave3' | 'wave4' | 'up' | 'down'
  trend = 'auto', // 'auto' | 'up' | 'down' | 'neutral'
  dataPoints = [], // Array of numbers or objects: { value: number, label?: string, tooltip?: string }
  onClick,
  className = '',
  loading = false,
}) => {
  const gradientId = useId().replace(/:/g, '_');
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Extract numeric magnitude from value (handles numbers or strings like "3", "100%", "< 2")
  const numericVal = useMemo(() => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/[-+]?[0-9]*\.?[0-9]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  }, [value]);

  // Color schemes for sparklines & interactive tooltips
  const colorSchemes = {
    purple: {
      stroke: '#818CF8',
      strokeSecondary: '#6366F1',
      fillStart: 'rgba(99, 102, 241, 0.45)',
      fillEnd: 'rgba(99, 102, 241, 0.0)',
      filterGlow: 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.45))',
      dotColor: '#A5B4FC',
      pulseColor: 'rgba(129, 140, 248, 0.5)',
      tooltipBg: '#1E1B4B',
      tooltipText: '#E0E7FF',
    },
    orange: {
      stroke: '#FB923C',
      strokeSecondary: '#F97316',
      fillStart: 'rgba(249, 115, 22, 0.35)',
      fillEnd: 'rgba(249, 115, 22, 0.0)',
      filterGlow: 'drop-shadow(0 2px 5px rgba(249, 115, 22, 0.35))',
      dotColor: '#FDBA74',
      pulseColor: 'rgba(249, 115, 22, 0.5)',
      tooltipBg: '#431407',
      tooltipText: '#FFEDD5',
    },
    amber: {
      stroke: '#FBBF24',
      strokeSecondary: '#F59E0B',
      fillStart: 'rgba(245, 158, 11, 0.35)',
      fillEnd: 'rgba(245, 158, 11, 0.0)',
      filterGlow: 'drop-shadow(0 2px 5px rgba(245, 158, 11, 0.35))',
      dotColor: '#FDE68A',
      pulseColor: 'rgba(245, 158, 11, 0.5)',
      tooltipBg: '#451A03',
      tooltipText: '#FEF3C7',
    },
    rose: {
      stroke: '#FB7185',
      strokeSecondary: '#F43F5E',
      fillStart: 'rgba(244, 63, 94, 0.35)',
      fillEnd: 'rgba(244, 63, 94, 0.0)',
      filterGlow: 'drop-shadow(0 2px 6px rgba(244, 63, 94, 0.4))',
      dotColor: '#FDA4AF',
      pulseColor: 'rgba(244, 63, 94, 0.5)',
      tooltipBg: '#4C0519',
      tooltipText: '#FFE4E6',
    },
    emerald: {
      stroke: '#34D399',
      strokeSecondary: '#10B981',
      fillStart: 'rgba(16, 185, 129, 0.35)',
      fillEnd: 'rgba(16, 185, 129, 0.0)',
      filterGlow: 'drop-shadow(0 2px 5px rgba(16, 185, 129, 0.35))',
      dotColor: '#6EE7B7',
      pulseColor: 'rgba(16, 185, 129, 0.5)',
      tooltipBg: '#064E3B',
      tooltipText: '#D1FAE5',
    },
    blue: {
      stroke: '#60A5FA',
      strokeSecondary: '#3B82F6',
      fillStart: 'rgba(59, 130, 246, 0.35)',
      fillEnd: 'rgba(59, 130, 246, 0.0)',
      filterGlow: 'drop-shadow(0 2px 5px rgba(59, 130, 246, 0.35))',
      dotColor: '#93C5FD',
      pulseColor: 'rgba(59, 130, 246, 0.5)',
      tooltipBg: '#1E3A8A',
      tooltipText: '#DBEAFE',
    },
    indigo: {
      stroke: '#818CF8',
      strokeSecondary: '#4F46E5',
      fillStart: 'rgba(79, 70, 229, 0.35)',
      fillEnd: 'rgba(79, 70, 229, 0.0)',
      filterGlow: 'drop-shadow(0 2px 6px rgba(79, 70, 229, 0.4))',
      dotColor: '#C7D2FE',
      pulseColor: 'rgba(79, 70, 229, 0.5)',
      tooltipBg: '#1E1B4B',
      tooltipText: '#EEF2FF',
    },
    teal: {
      stroke: '#2DD4BF',
      strokeSecondary: '#0D9488',
      fillStart: 'rgba(13, 148, 136, 0.35)',
      fillEnd: 'rgba(13, 148, 136, 0.0)',
      filterGlow: 'drop-shadow(0 2px 5px rgba(13, 148, 136, 0.35))',
      dotColor: '#99F6E4',
      pulseColor: 'rgba(13, 148, 136, 0.5)',
      tooltipBg: '#042F2E',
      tooltipText: '#CCFBF1',
    },
  };

  const scheme = colorSchemes[chartColor] || colorSchemes.purple;

  // Dynamically compute sparkline data points according to numeric value and trend movement
  const normalizedPoints = useMemo(() => {
    if (dataPoints && dataPoints.length >= 2) {
      return dataPoints.map((item, idx) => {
        if (typeof item === 'number') {
          return { value: item, label: `Point ${idx + 1}`, raw: item };
        }
        return {
          value: typeof item?.value === 'number' ? item.value : 0,
          label: item?.label || `Point ${idx + 1}`,
          tooltip: item?.tooltip,
          raw: item,
        };
      });
    }

    // Dynamic wave synthesis based on current numeric value & preset wave
    const current = Math.max(0, numericVal);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    // Determine movement slope
    const isDownTrend =
      trend === 'down' ||
      presetWave === 'down' ||
      (typeof previousValue === 'number' && previousValue > current);

    let multipliers;
    if (isDownTrend) {
      // Downward slope trajectory (decreases over time to current value)
      multipliers = [1.35, 1.28, 1.15, 1.2, 1.08, 1.04, 1.0];
    } else if (presetWave === 'wave2') {
      multipliers = [0.75, 0.85, 0.8, 0.92, 0.88, 0.96, 1.0];
    } else if (presetWave === 'wave3') {
      multipliers = [0.7, 0.78, 0.86, 0.82, 0.9, 0.94, 1.0];
    } else if (presetWave === 'wave4') {
      multipliers = [0.65, 0.72, 0.8, 0.85, 0.92, 0.97, 1.0];
    } else {
      // Standard positive growth trajectory (wave1 / up)
      multipliers = [0.6, 0.68, 0.75, 0.82, 0.88, 0.95, 1.0];
    }

    return multipliers.map((mult, i) => {
      const pointVal = Math.round((current === 0 ? (isDownTrend ? 4 - i * 0.6 : i * 0.6) : current * mult) * 10) / 10;
      return {
        value: Math.max(0, pointVal),
        label: days[i],
        tooltip: `${days[i]}: ${pointVal} ${unit || ''}`.trim(),
        raw: pointVal,
      };
    });
  }, [dataPoints, numericVal, presetWave, trend, previousValue, unit]);

  // Determine computed movement: upward, downward, or steady
  const movement = useMemo(() => {
    if (normalizedPoints.length < 2) return { isUp: true, pct: 0 };
    const first = normalizedPoints[0].value;
    const last = normalizedPoints[normalizedPoints.length - 1].value;
    const diff = last - first;
    const pct = first > 0 ? Math.round((diff / first) * 100) : (last > 0 ? 100 : 0);
    return {
      isUp: diff >= 0,
      pct: Math.abs(pct),
      diff,
    };
  }, [normalizedPoints]);

  // Compute SVG cubic paths & point coordinates
  const chartGeometry = useMemo(() => {
    const width = 104;
    const height = 44;
    const paddingX = 4;
    const paddingTop = 6;
    const paddingBottom = 6;

    const values = normalizedPoints.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const isFlat = max === min;

    // Harmonic wave offsets for flat or constant data so the sparkline remains alive and organic
    const flatHarmonicOffsets = [0.3, 0.45, 0.4, 0.65, 0.55, 0.78, 0.85];

    const points = normalizedPoints.map((p, i) => {
      const x = paddingX + (i / Math.max(1, normalizedPoints.length - 1)) * (width - 2 * paddingX);

      let y;
      if (isFlat) {
        const harmonicFactor = flatHarmonicOffsets[i % flatHarmonicOffsets.length] || 0.5;
        const baselineOffset = p.value === 0 ? 0.3 : 0.5;
        const normalizedH = baselineOffset * 0.4 + harmonicFactor * 0.6;
        y = height - paddingBottom - normalizedH * (height - paddingTop - paddingBottom);
      } else {
        const range = max - min;
        const normalizedY = (p.value - min) / range;
        y = height - paddingBottom - normalizedY * (height - paddingTop - paddingBottom);
      }

      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        value: p.value,
        label: p.label,
        tooltip: p.tooltip || `${p.label}: ${p.value}`,
      };
    });

    if (points.length < 2) {
      return { line: '', area: '', points: [], lastPoint: null };
    }

    // Generate smooth cubic bezier spline
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }

    const last = points[points.length - 1];
    const areaPath = `${linePath} L ${last.x} ${height} L ${points[0].x} ${height} Z`;

    return {
      line: linePath,
      area: areaPath,
      points,
      lastPoint: last,
    };
  }, [normalizedPoints]);

  // Handle interactive hover over SVG sparkline
  const handleMouseMove = (e) => {
    if (!svgRef.current || !chartGeometry.points.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const index = Math.min(
      chartGeometry.points.length - 1,
      Math.max(0, Math.round(relativeX * (chartGeometry.points.length - 1)))
    );
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const isDark = variant === 'dark';
  const isLongValue = typeof value === 'string' && value.length > 8;
  const activePoint = hoveredIndex !== null ? chartGeometry.points[hoveredIndex] : null;
  const latestPoint = chartGeometry.lastPoint;

  // Resolve Badge Text, Badge Icon, and Badge Type
  const resolvedBadgeText = badgeText || (movement.isUp ? `+${movement.pct}%` : `-${movement.pct}%`);
  const resolvedBadgeIcon =
    badgeIcon !== undefined
      ? badgeIcon
      : movement.isUp
      ? 'up'
      : 'down';
  const resolvedBadgeType =
    badgeType || (movement.isUp ? 'positive' : 'negative');

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[24px] p-5 sm:p-5.5 flex flex-col justify-between h-full min-h-[142px] transition-all duration-300 select-none group ${
        isDark
          ? 'bg-[#0B132B] dark:bg-[#0A1024] text-white border border-slate-800/90 shadow-lg shadow-black/20 hover:border-indigo-500/50 hover:shadow-indigo-500/10'
          : 'bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700'
      } ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}
    >
      {/* Background ambient glow for dark card */}
      {isDark && (
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all" />
      )}

      {/* Top Section: Title, Value & Dynamic Interactive Sparkline */}
      <div className="flex items-start justify-between gap-2">
        {/* Left Column: Title & Main Number */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div
            className={`text-xs sm:text-[13px] font-medium tracking-tight truncate ${
              isDark ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {title}
          </div>

          <div className="flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
            <span
              className={`${
                isLongValue
                  ? 'text-lg sm:text-xl lg:text-[20px] xl:text-[22px]'
                  : 'text-2xl sm:text-3xl lg:text-[26px] xl:text-[28px]'
              } font-extrabold tracking-tight font-sans whitespace-nowrap leading-tight transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {loading ? (
                <span className="inline-block w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                value
              )}
            </span>
            {unit && !loading && (
              <span
                className={`text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 ${
                  isDark ? 'text-slate-400' : 'text-slate-400 dark:text-slate-400'
                }`}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Fully Dynamic Vector Area Sparkline */}
        <div className="shrink-0 relative flex items-center justify-end pl-1 pt-1">
          {/* Floating Hover Tooltip */}
          {activePoint && (
            <div
              className="absolute -top-7 right-0 z-30 pointer-events-none px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xl whitespace-nowrap border animate-in fade-in duration-100"
              style={{
                backgroundColor: isDark ? scheme.tooltipBg : '#0F172A',
                color: isDark ? scheme.tooltipText : '#F8FAFC',
                borderColor: isDark ? scheme.strokeSecondary : '#334155',
              }}
            >
              {activePoint.tooltip}
            </div>
          )}

          <div className="w-18 sm:w-22 lg:w-22 xl:w-26 h-9 sm:h-10 lg:h-11 overflow-visible cursor-crosshair relative">
            <svg
              ref={svgRef}
              viewBox="0 0 104 44"
              className="w-full h-full overflow-visible group-hover:scale-105 transition-transform duration-300"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={(e) => {
                if (e.touches?.[0]) handleMouseMove(e.touches[0]);
              }}
              onTouchEnd={handleMouseLeave}
            >
              <defs>
                <linearGradient id={`spark_grad_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={scheme.fillStart} />
                  <stop offset="100%" stopColor={scheme.fillEnd} />
                </linearGradient>
              </defs>

              {/* Gradient Filled Area */}
              <path
                d={chartGeometry.area}
                fill={`url(#spark_grad_${gradientId})`}
                className="transition-all duration-500 ease-out"
              />

              {/* Glowing Line Stroke */}
              <path
                d={chartGeometry.line}
                fill="none"
                stroke={scheme.strokeSecondary || scheme.stroke}
                strokeWidth={variant === 'dark' ? 2.4 : 2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-out"
                style={{ filter: scheme.filterGlow }}
              />

              {/* Active Pulse Radar Dot on the Latest Point when not hovering */}
              {!activePoint && latestPoint && (
                <g className="animate-in fade-in">
                  {/* Ping Ring */}
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="4.5"
                    fill="none"
                    stroke={scheme.strokeSecondary || scheme.stroke}
                    strokeWidth="1.2"
                    className="animate-ping opacity-60 origin-center"
                  />
                  {/* Outer Glow Circle */}
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="3.5"
                    fill={scheme.pulseColor}
                  />
                  {/* Solid Center Dot */}
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="2"
                    fill={scheme.dotColor || '#ffffff'}
                    stroke={isDark ? '#0B132B' : '#ffffff'}
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* Interactive Crosshair & Active Point when Hovered */}
              {activePoint && (
                <g className="animate-in fade-in duration-150">
                  {/* Vertical Guide */}
                  <line
                    x1={activePoint.x}
                    y1={0}
                    x2={activePoint.x}
                    y2={44}
                    stroke={scheme.strokeSecondary || scheme.stroke}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  {/* Outer Pulsing Glow */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="5"
                    fill={scheme.strokeSecondary || scheme.stroke}
                    opacity="0.35"
                  />
                  {/* Inner Active Point */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="2.8"
                    fill={scheme.dotColor || '#ffffff'}
                    stroke={isDark ? '#0B132B' : '#ffffff'}
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: Trend Pill Badge & Subtext */}
      <div className="mt-auto pt-3 flex items-center justify-between gap-1.5 border-t border-transparent">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-2xs transition-colors shrink-0 ${
            isDark
              ? resolvedBadgeType === 'negative'
                ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                : resolvedBadgeType === 'warning'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                : resolvedBadgeType === 'neutral'
                ? 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                : 'bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/50'
              : resolvedBadgeType === 'negative'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/40'
              : resolvedBadgeType === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/40'
              : resolvedBadgeType === 'neutral'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              : 'bg-[#E6F4EA] dark:bg-emerald-950/50 text-[#1E8E3E] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
          }`}
        >
          {resolvedBadgeIcon === 'none' ? null : resolvedBadgeIcon === 'dot' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          ) : resolvedBadgeType === 'negative' || resolvedBadgeIcon === 'down' ? (
            <span className="text-[12px] leading-none">↘</span>
          ) : (
            <span className="text-[12px] leading-none">↗</span>
          )}
          <span>{resolvedBadgeText}</span>
        </span>

        {subtext && (
          <span
            className={`text-[11px] font-semibold truncate text-right pl-1 ${
              isDark ? 'text-slate-400' : 'text-slate-400 dark:text-slate-400'
            }`}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default SparkMetricCard;
