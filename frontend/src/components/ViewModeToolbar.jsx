import React from 'react';
import { Box, Map, DoorOpen, Footprints, Move3d } from 'lucide-react';

/**
 * ViewModeToolbar — styled toggle bar for switching between 3D Walkthrough and 2D Seat Map views.
 *
 * Props:
 *  viewMode        — '2d' | '3d'
 *  onViewModeChange(mode) — callback when user clicks a mode button
 *  onReenterCoach  — (optional) resets 3D camera to coach entrance
 *  variant         — 'light' (default, for seat-selection page bg) | 'dark' (for immersive overlay)
 */
export default function ViewModeToolbar({
  viewMode = '2d',
  onViewModeChange,
  onReenterCoach,
  variant = 'light',
}) {
  const is3D = viewMode === '3d';
  const dark = variant === 'dark';

  // --- Palette ---
  const wrapperBg = dark
    ? 'bg-[#0b1828]/80 border-white/15 backdrop-blur'
    : 'bg-white border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]';

  const activeBtnClass = dark
    ? 'bg-emerald-500 text-slate-950 shadow-lg'
    : 'bg-emerald-600 text-white shadow-md';

  const inactiveBtnClass = dark
    ? 'text-white/60 hover:bg-white/10 hover:text-white'
    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700';

  const actionBtnClass = dark
    ? 'border-white/15 text-white/70 hover:bg-white/10 hover:text-white'
    : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700';

  const badgeClass = dark
    ? 'bg-white/10 text-white/60 border-white/15'
    : 'bg-stone-50 text-stone-500 border-stone-200';

  const dotLabelClass = dark ? 'text-white/60' : 'text-stone-500';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${wrapperBg}`}
    >
      {/* ── 3D / 2D Toggle ─────────────────────────── */}
      <div className={`flex items-center rounded-xl p-1 ${dark ? 'bg-white/5' : 'bg-stone-100'}`}>
        <button
          onClick={() => onViewModeChange('3d')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            is3D ? activeBtnClass : inactiveBtnClass
          }`}
        >
          <Box className="h-4 w-4" />
          <span className="hidden sm:inline">3D Walkthrough View</span>
          <span className="sm:hidden">3D</span>
        </button>
        <button
          onClick={() => onViewModeChange('2d')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            !is3D ? activeBtnClass : inactiveBtnClass
          }`}
        >
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">2D Seat Map</span>
          <span className="sm:hidden">2D</span>
        </button>
      </div>

      {/* ── Re-enter Coach (3D only) ───────────────── */}
      {is3D && onReenterCoach && (
        <button
          onClick={onReenterCoach}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${actionBtnClass}`}
        >
          <DoorOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Re-enter Coach</span>
        </button>
      )}

      {/* ── Walk Mode badge (3D only) ──────────────── */}
      {is3D && (
        <div
          className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold md:flex ${badgeClass}`}
        >
          <Footprints className="h-4 w-4" />
          Walk Mode: First-Person 3D
        </div>
      )}

      {/* ── Spacer ─────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Legend ──────────────────────────────────── */}
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold ${dotLabelClass}`}>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-stone-400" />
          Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Window / Special
        </span>
      </div>
    </div>
  );
}
