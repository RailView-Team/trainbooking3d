import React, { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Mouse, Move3d, X } from 'lucide-react'
import CoachViewer3D from './CoachViewer3D'

export default function ImmersiveCoachExperience({
  trainId,
  coachId,
  classCode,
  fromCode,
  toCode,
  date,
  price,
  selectedSeats,
  availabilityData,
  onToggleSeat,
  onContinue,
  onExit,
}) {
  const [previewSeat, setPreviewSeat] = useState(null)
  const className = useMemo(() => ({
    '1A': 'First AC', '2A': 'Second AC', '3A': 'Third AC', SL: 'Sleeper',
    EC: 'Executive Chair', CC: 'AC Chair', '2S': 'Second Seating',
  }[classCode] || classCode), [classCode])
  const coachLabel = availabilityData?.coaches?.find((coach) => String(coach.coachId) === String(coachId) || String(coach.coachNumber) === String(coachId))?.coachNumber || coachId

  const isSelectable = previewSeat?.status === 'available' || previewSeat?.status === 'RAC'
  const isSelected = previewSeat && selectedSeats.includes(previewSeat.id)
  const formatDate = date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

  return (
    <div className="fixed inset-0 z-[55] overflow-hidden bg-[#09111f] text-white">
      <CoachViewer3D
        classCode={classCode}
        coachId={coachId}
        selectedSeats={selectedSeats}
        price={price}
        onToggleSeat={onToggleSeat}
        availabilityData={availabilityData}
        onPreviewSeat={setPreviewSeat}
        immersive
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-[#07111f]/95 via-[#07111f]/55 to-transparent px-4 pb-16 pt-4 sm:px-7">
        <div className="pointer-events-auto flex items-center gap-3">
          <button onClick={onExit} className="flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-[#0b1828]/80 px-3 text-sm font-semibold text-white backdrop-blur hover:bg-[#13243a]">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">AeroRail immersive coach</p>
            <p className="mt-1 text-sm font-bold sm:text-base">Train {trainId} · {fromCode} → {toCode}</p>
            <p className="text-xs text-white/55">{className} · Coach {coachLabel} · {formatDate}</p>
          </div>
        </div>
        <button onClick={onExit} aria-label="Exit 3D view" className="pointer-events-auto rounded-full border border-white/15 bg-[#0b1828]/80 p-2 text-white/70 backdrop-blur hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="pointer-events-none absolute bottom-5 left-4 flex max-w-[calc(100%-2rem)] flex-wrap items-end gap-3 sm:left-7">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0b1828]/85 px-4 py-3 text-xs text-white/70 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center gap-2 font-bold text-white"><Move3d className="h-4 w-4 text-sky-300" /> Walk through the coach</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1"><span><b className="text-white">WASD</b> move</span><span><Mouse className="mr-1 inline h-3 w-3" />drag to look</span></div>
        </div>
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1828]/85 px-4 py-3 text-[11px] font-semibold text-white/70 shadow-2xl backdrop-blur-md">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />Available</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />RAC</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-500" />Booked</span>
        </div>
      </div>

      <aside className={`absolute bottom-5 right-4 w-[min(21rem,calc(100%-2rem))] rounded-2xl border border-white/10 bg-[#0b1828]/92 p-5 shadow-2xl backdrop-blur-xl transition-all sm:right-7 ${previewSeat ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-90'}`}>
        {previewSeat ? (
          <>
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Seat information</p><h2 className="mt-1 text-2xl font-black">Seat {previewSeat.id}</h2></div>
              <button onClick={() => setPreviewSeat(null)} aria-label="Close seat details" className="text-white/45 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-sm">
              <div><p className="text-white/45">Type</p><p className="mt-1 font-semibold">{previewSeat.type}</p></div>
              <div><p className="text-white/45">Position</p><p className="mt-1 font-semibold">{previewSeat.pos}</p></div>
              <div><p className="text-white/45">Status</p><p className={`mt-1 font-semibold ${previewSeat.status === 'available' ? 'text-emerald-300' : previewSeat.status === 'RAC' ? 'text-amber-300' : 'text-slate-300'}`}>{previewSeat.status === 'occupied' ? 'Booked' : previewSeat.status}</p></div>
              <div><p className="text-white/45">Fare</p><p className="mt-1 font-semibold">₹{price}</p></div>
            </div>
            {isSelectable ? (
              <button onClick={() => onToggleSeat(previewSeat.id)} className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl font-bold transition-colors ${isSelected ? 'border border-white/15 bg-white/10 text-white' : 'bg-sky-500 text-slate-950 hover:bg-sky-400'}`}>
                {isSelected ? 'Remove seat' : 'Select seat'} <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </button>
            ) : <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/55">This seat is already booked.</p>}
          </>
        ) : (
          <div className="text-sm"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Your selection</p><p className="mt-2 font-semibold text-white/75">Click a physical seat to inspect it.</p></div>
        )}
        {selectedSeats.length > 0 && <button onClick={onContinue} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-slate-950 hover:bg-sky-100">Continue with {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} <ArrowRight className="h-4 w-4" /></button>}
      </aside>
    </div>
  )
}
