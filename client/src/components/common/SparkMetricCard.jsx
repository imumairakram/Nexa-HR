import React, { useState, useId, useMemo, useRef } from 'react';

/**
 * @typedef {Object} SparkDataPoint
 * @property {number} value
 * @property {string} [label]
 * @property {string} [tooltip]
 * @property {any} [raw]
 */

/**
 * SparkMetricCard
 * Fully dynamic, active, and interactive KPI Card with real-time vector SVG sparklines,
 * pulsing telemetry indicator, interactive hover crosshairs, active data points, live tooltips,
 * and automatic slope/trend calculation for value increases and decreases.
 *
 * @param {Object} props
 * @param {'dark' | 'light'} [props.variant='light']
 * @param {string | React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.titleAction]
 * @param {string | number} [props.value]
 * @param {number} [props.previousValue]
 * @param {string} [props.unit]
 * @param {string} [props.subtext]
 * @param {string} [props.badgeText]
 * @param {'positive' | 'negative' | 'neutral' | 'warning'} [props.badgeType]
 * @param {'up' | 'down' | 'dot' | 'none'} [props.badgeIcon]
 * @param {string} [props.chartColor='sky']
 * @param {'wave1' | 'wave2' | 'wave3' | 'wave4' | 'up' | 'down'} [props.presetWave='wave1']
 * @param {'auto' | 'up' | 'down' | 'neutral'} [props.trend='auto']
 * @param {Array<number | { value: number, label?: string, tooltip?: string }>} [props.dataPoints]
 * @param {React.MouseEventHandler<HTMLDivElement>} [props.onClick]
 * @param {string} [props.className]
 * @param {boolean} [props.loading]
 */
const SparkMetricCard = ({
  variant = 'light',
  title,
  titleAction,
  value,
  previousValue,
  unit,
  subtext,
  badgeText,
  badgeType,
  badgeIcon,
  chartColor = 'sky',
  presetWave = 'wave1',
  trend = 'auto',
  dataPoints = [],
  onClick,
  className = '',
  loading = false,
}) => {
  const gradientId = useId().replace(/:/g, '_');
  /** @type {React.RefObject<any>} */
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  // Extract numeric magnitude from value (handles numbers or strings like "3", "100%", "< 2")
  const numericVal = useMemo(() => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
      const match = value.match(/[-+]?[0-9]*\.?[0-9]+/);
      return match ? (isNaN(parseFloat(match[0])) ? 0 : parseFloat(match[0])) : 0;
    }
    return 0;
  }, [value]);

  // Color schemes for sparklines & interactive tooltips
  /** @type {Record<string, { stroke: string; strokeSecondary: string; fillStart: string; fillEnd: string; filterGlow: string; dotColor: string; pulseColor: string; tooltipBg: string; tooltipText: string; }>} */
  const colorSchemes = {
    purple: {
      stroke: '#818CF8',
      strokeSecondary: '#6366F1',
      fillStart: 'rgba(99, 102, 241, 0.45)',
      fillEnd: 'rgba(99, 102, 241, 0.0)',
            dotColor: '#A5B4FC',
      pulseColor: 'rgba(129, 140, 248, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    sky: {
      stroke: '#0A8FB5',
      strokeSecondary: '#07617D',
      fillStart: 'rgba(10, 143, 181, 0.35)',
      fillEnd: 'rgba(10, 143, 181, 0.0)',
      dotColor: '#3CC1E6',
      pulseColor: 'rgba(10, 143, 181, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    coral: {
      stroke: '#F43F5E',
      strokeSecondary: '#E11D48',
      fillStart: 'rgba(244, 63, 94, 0.35)',
      fillEnd: 'rgba(244, 63, 94, 0.0)',
            dotColor: '#FDA4AF',
      pulseColor: 'rgba(244, 63, 94, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    orange: {
      stroke: '#FB923C',
      strokeSecondary: '#F97316',
      fillStart: 'rgba(249, 115, 22, 0.35)',
      fillEnd: 'rgba(249, 115, 22, 0.0)',
            dotColor: '#FDBA74',
      pulseColor: 'rgba(249, 115, 22, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    amber: {
      stroke: '#FBBF24',
      strokeSecondary: '#F59E0B',
      fillStart: 'rgba(245, 158, 11, 0.35)',
      fillEnd: 'rgba(245, 158, 11, 0.0)',
            dotColor: '#FDE68A',
      pulseColor: 'rgba(245, 158, 11, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    rose: {
      stroke: '#FB7185',
      strokeSecondary: '#F43F5E',
      fillStart: 'rgba(244, 63, 94, 0.35)',
      fillEnd: 'rgba(244, 63, 94, 0.0)',
            dotColor: '#FDA4AF',
      pulseColor: 'rgba(244, 63, 94, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    emerald: {
      stroke: '#34D399',
      strokeSecondary: '#10B981',
      fillStart: 'rgba(16, 185, 129, 0.35)',
      fillEnd: 'rgba(16, 185, 129, 0.0)',
            dotColor: '#6EE7B7',
      pulseColor: 'rgba(16, 185, 129, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    blue: {
      stroke: '#60A5FA',
      strokeSecondary: '#3B82F6',
      fillStart: 'rgba(59, 130, 246, 0.35)',
      fillEnd: 'rgba(59, 130, 246, 0.0)',
            dotColor: '#93C5FD',
      pulseColor: 'rgba(59, 130, 246, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    indigo: {
      stroke: '#818CF8',
      strokeSecondary: '#4F46E5',
      fillStart: 'rgba(79, 70, 229, 0.35)',
      fillEnd: 'rgba(79, 70, 229, 0.0)',
            dotColor: '#C7D2FE',
      pulseColor: 'rgba(79, 70, 229, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
    teal: {
      stroke: '#2DD4BF',
      strokeSecondary: '#0D9488',
      fillStart: 'rgba(13, 148, 136, 0.35)',
      fillEnd: 'rgba(13, 148, 136, 0.0)',
            dotColor: '#99F6E4',
      pulseColor: 'rgba(13, 148, 136, 0.5)',
      tooltipBg: '#16211E',
      tooltipText: '#F1F5F4',
    },
  };

  const scheme = colorSchemes[chartColor] || colorSchemes.purple;

  // Dynamically compute sparkline data points according to numeric value and trend movement
  const normalizedPoints = useMemo(() => {
    if (dataPoints && dataPoints.length >= 2) {
      return dataPoints.map((item, idx) => {
        if (typeof item === 'number') {
          const val = isNaN(item) ? 0 : item;
          return { value: val, label: `Point ${idx + 1}`, raw: val };
        }
        const val = typeof item?.value === 'number' && !isNaN(item.value) ? item.value : 0;
        return {
          value: val,
          label: item?.label || `Point ${idx + 1}`,
          tooltip: item?.tooltip,
          raw: item,
        };
      });
    }

    // Dynamic wave synthesis based on current numeric value & preset wave
    const current = Math.max(0, isNaN(numericVal) ? 0 : numericVal);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    // Determine movement slope
    const isDownTrend =
      trend === 'down' ||
      presetWave === 'down' ||
      (typeof previousValue === 'number' && !isNaN(previousValue) && previousValue > current);

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
      const pointVal = Math.round((current === 0 ? 0 : current * mult) * 10) / 10;
      const safePointVal = isNaN(pointVal) ? 0 : Math.max(0, pointVal);
      return {
        value: safePointVal,
        label: days[i],
        tooltip: `${days[i]}: ${safePointVal} ${unit || ''}`.trim(),
        raw: safePointVal,
      };
    });
  }, [dataPoints, numericVal, presetWave, trend, previousValue, unit]);

  // Determine computed movement: upward, downward, or steady
  const movement = useMemo(() => {
    if (!normalizedPoints || normalizedPoints.length < 2) return { isUp: true, pct: 0, diff: 0 };
    const first = typeof normalizedPoints[0]?.value === 'number' && !isNaN(normalizedPoints[0].value) ? normalizedPoints[0].value : 0;
    const last = typeof normalizedPoints[normalizedPoints.length - 1]?.value === 'number' && !isNaN(normalizedPoints[normalizedPoints.length - 1].value) ? normalizedPoints[normalizedPoints.length - 1].value : 0;
    const diff = last - first;
    const pct = first > 0 ? Math.round((diff / first) * 100) : (last > 0 ? 100 : 0);
    return {
      isUp: diff >= 0,
      pct: isNaN(pct) ? 0 : Math.abs(pct),
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

    if (!normalizedPoints || normalizedPoints.length < 2) {
      return { line: '', area: '', points: [], lastPoint: null };
    }

    const values = normalizedPoints.map((p) => (typeof p.value === 'number' && !isNaN(p.value) ? p.value : 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const isFlat = max === min;

    // Harmonic wave offsets for flat or constant data so the sparkline remains alive and organic
    const flatHarmonicOffsets = [0.3, 0.45, 0.4, 0.65, 0.55, 0.78, 0.85];

    const points = normalizedPoints.map((p, i) => {
      const x = paddingX + (i / Math.max(1, normalizedPoints.length - 1)) * (width - 2 * paddingX);

      let y;
      if (isFlat) {
        if (p.value === 0) {
          y = height - paddingBottom - 2;
        } else {
          y = height / 2;
        }
      } else {
        const range = max - min;
        const normalizedY = range !== 0 ? (p.value - min) / range : 0.5;
        y = height - paddingBottom - normalizedY * (height - paddingTop - paddingBottom);
      }

      const safeX = isNaN(x) ? paddingX : Math.round(x * 10) / 10;
      const safeY = isNaN(y) ? height / 2 : Math.round(y * 10) / 10;

      return {
        x: safeX,
        y: safeY,
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
  const handleMouseMove = (/** @type {any} */ e) => {
    if (!svgRef.current || !chartGeometry.points.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const relativeX = (e.clientX - rect.left) / rect.width;
    const index = Math.min(
      chartGeometry.points.length - 1,
      Math.max(0, Math.round(relativeX * (chartGeometry.points.length - 1)))
    );
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
  };

  const isDark = variant === 'dark';
  const isLongValue = typeof value === 'string' && value.length >= 7;
  const activePoint = hoveredIndex >= 0 && hoveredIndex < chartGeometry.points.length ? chartGeometry.points[hoveredIndex] : null;
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

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden rounded-[14px] p-4 sm:p-5 flex flex-col justify-between h-full min-h-[142px] select-none ${
          isDark
            ? 'bg-[#16211E] dark:bg-[#16211E] border border-[#273834]'
            : 'bg-white dark:bg-[#16211E] border border-[#E2E1DC] dark:border-[#273834] shadow-subtle'
        } ${className}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="skeleton-shimmer animate-pulse h-3.5 w-24 rounded-lg" />
            <div className="skeleton-shimmer animate-pulse h-7 w-20 rounded-lg" />
          </div>
          <div className="w-24 h-11 skeleton-shimmer animate-pulse rounded-lg" />
        </div>
        <div className="pt-3 flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800/40">
          <div className="skeleton-shimmer animate-pulse h-4 w-16 rounded-full" />
          <div className="skeleton-shimmer animate-pulse h-3 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[14px] p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] select-none group ${
        isDark
          ? 'bg-[#16211E] dark:bg-[#16211E] text-[#F1F5F4] border border-[#273834] shadow-subtle hover:border-[#384E48] hover:shadow-elevated'
          : 'bg-white dark:bg-[#16211E] text-[#1C2321] dark:text-[#F1F5F4] border border-[#E2E1DC] dark:border-[#273834] shadow-subtle hover:border-[#C7C5BB] dark:hover:border-[#384E48] hover:shadow-elevated'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >


      {/* Top Section: Title, Value & Dynamic Interactive Sparkline */}
      <div className="flex items-start justify-between gap-1.5">
        {/* Left Column: Title & Main Number */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-xs font-semibold tracking-tight truncate ${
                isDark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
              }`}
              title={typeof title === 'string' ? title : undefined}
            >
              {title}
            </span>
            {titleAction && (
              <span
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 flex items-center"
              >
                {titleAction}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 flex-wrap sm:flex-nowrap">
            <span
              className={`${
                isLongValue
                  ? 'text-lg sm:text-xl xl:text-2xl'
                  : 'text-xl sm:text-2xl xl:text-3xl'
              } font-bold tracking-tight font-heading tabular-nums leading-tight transition-all duration-150 ${
                isDark ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {loading ? (
                <span className="inline-block w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              ) : (
                value
              )}
            </span>
            {unit && !loading && (
              <span
                className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                  isDark ? 'text-slate-400' : 'text-slate-400 dark:text-slate-400'
                }`}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Fully Dynamic Vector Area Sparkline */}
        <div className="shrink-0 relative flex flex-col items-end pl-0.5 pt-0.5">
          {/* Floating Hover Tooltip */}
          {activePoint && (
            <div
              id={`tooltip-${gradientId}`}
              role="tooltip"
              className="absolute -top-7 right-0 z-30 pointer-events-none px-2.5 py-1 rounded-[12px] text-xs font-bold shadow-xl whitespace-nowrap border animate-in fade-in duration-100"
              style={{
                backgroundColor: isDark ? scheme.tooltipBg : '#0F172A',
                color: isDark ? scheme.tooltipText : '#F8FAFC',
                borderColor: isDark ? scheme.strokeSecondary : '#334155',
              }}
            >
              {activePoint.tooltip}
            </div>
          )}

          <div className="w-16 sm:w-20 md:w-20 xl:w-24 h-8 sm:h-9 lg:h-10 overflow-visible relative">
            <svg
              ref={svgRef}
              viewBox="0 0 104 44"
              tabIndex={0}
              role="img"
              aria-label={`${title || 'Metric'} trend over ${normalizedPoints.length} data points. Starting at ${normalizedPoints[0]?.value ?? 0} ${unit || ''}, current value ${value ?? 0} ${unit || ''} (${movement.isUp ? 'upward' : 'downward'} trend of ${movement.pct}%).`}
              aria-describedby={activePoint ? `tooltip-${gradientId}` : undefined}
              className="w-full h-full overflow-visible cursor-crosshair group-hover:scale-105 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded-lg transition-transform duration-300"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={() => {
                if (chartGeometry.points.length) {
                  setHoveredIndex(chartGeometry.points.length - 1);
                }
              }}
              onBlur={handleMouseLeave}
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
              {chartGeometry.area ? (
                <path
                  d={chartGeometry.area}
                  fill={`url(#spark_grad_${gradientId})`}
                  className="transition-all duration-500 ease-out pointer-events-none"
                />
              ) : null}

              {/* Glowing Line Stroke */}
              {chartGeometry.line ? (
                <path
                  d={chartGeometry.line}
                  fill="none"
                  stroke={scheme.strokeSecondary || scheme.stroke}
                  strokeWidth={variant === 'dark' ? 2.4 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 ease-out pointer-events-none"
                  
                />
              ) : null}

              {/* Data Point Markers (Visible reference dots along trajectory) */}
              {chartGeometry.points.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={idx === 0 || idx === chartGeometry.points.length - 1 ? 2.2 : 1.4}
                  fill={scheme.dotColor || '#ffffff'}
                  stroke={scheme.strokeSecondary || scheme.stroke}
                  strokeWidth="0.8"
                  className="opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                />
              ))}

              {/* Active Pulse Radar Dot on the Latest Point when not hovering */}
              {!activePoint && latestPoint && (
                <g className="animate-in fade-in pointer-events-none">
                  {/* Ping Ring */}
                  <circle
                    cx={latestPoint.x}
                    cy={latestPoint.y}
                    r="4.5"
                    fill="none"
                    stroke={scheme.strokeSecondary || scheme.stroke}
                    strokeWidth="1.2"
                    className="animate-ping opacity-60 origin-center"
                    style={{
                      transformOrigin: `${latestPoint.x}px ${latestPoint.y}px`,
                    }}
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
                <g className="animate-in fade-in duration-150 pointer-events-none">
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

          {/* Start / End Boundary Labels */}
          {normalizedPoints.length >= 2 && (
            <div
              className={`w-full flex justify-between items-center text-[9px] sm:text-xs font-medium tracking-tight px-0.5 mt-0.5 select-none ${
                isDark ? 'text-slate-400' : 'text-slate-400 dark:text-slate-400'
              }`}
            >
              <span>{normalizedPoints[0]?.label || 'Start'}</span>
              <span>{normalizedPoints[normalizedPoints.length - 1]?.label || 'Today'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SparkMetricCard;
