import { useEffect } from 'react';
import { useAtlas } from '../state/store';
import { TOURS, tourById } from '../data/tours';
import { componentById } from '../data/components';

export function TourPicker() {
  const mode = useAtlas((s) => s.mode);
  const startTour = useAtlas((s) => s.startTour);
  const scene = mode === 'motherboard' ? 'motherboard' : 'desktop';
  const tours = TOURS.filter((t) => t.scene === scene);
  if (tours.length === 0) return null;
  return (
    <div className="px-3 pb-2">
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Guided tours</p>
      <div className="space-y-1.5">
        {tours.map((t) => (
          <button
            key={t.id}
            onClick={() => startTour(t.id)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-left hover:border-teal-400/50"
          >
            <p className="text-[13px] font-semibold text-slate-100">{t.title}</p>
            <p className="text-[11px] text-slate-500">{t.steps.length} stops</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Bottom tour bar: narration + prev/next + progress, spotlights each stop. */
export function TourBar() {
  const tourId = useAtlas((s) => s.tourId);
  const tourStep = useAtlas((s) => s.tourStep);
  const setTourStep = useAtlas((s) => s.setTourStep);
  const startTour = useAtlas((s) => s.startTour);
  const select = useAtlas((s) => s.select);
  const setMode = useAtlas((s) => s.setMode);
  const mode = useAtlas((s) => s.mode);

  const tour = tourId ? tourById.get(tourId) : undefined;

  useEffect(() => {
    if (!tour) return;
    const step = tour.steps[tourStep];
    if (!step) return;
    const c = componentById.get(step.componentId);
    if (!c) return;
    if (c.scene !== mode && (mode === 'motherboard') !== (c.scene === 'motherboard')) {
      setMode(c.scene);
      window.setTimeout(() => select(step.componentId, true), 450);
    } else {
      select(step.componentId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, tourStep]);

  if (!tour) return null;
  const step = tour.steps[tourStep];
  const last = tourStep >= tour.steps.length - 1;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-teal-400/30 bg-[#0d131b]/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-300">
              {tour.title} · stop {tourStep + 1} of {tour.steps.length}
            </p>
            <h3 className="font-display mt-0.5 truncate text-base font-bold text-white">{step.title}</h3>
          </div>
          <button
            onClick={() => startTour(null)}
            aria-label="End tour"
            className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{step.narration}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setTourStep(Math.max(0, tourStep - 1))}
            disabled={tourStep === 0}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            ← Back
          </button>
          {!last ? (
            <button
              onClick={() => setTourStep(tourStep + 1)}
              className="rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-300"
            >
              Next stop →
            </button>
          ) : (
            <button
              onClick={() => startTour(null)}
              className="rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-300"
            >
              Finish tour ✓
            </button>
          )}
          <div className="ml-1 flex flex-1 gap-1">
            {tour.steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= tourStep ? 'bg-teal-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
