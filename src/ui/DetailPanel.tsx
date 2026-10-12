import { useAtlas } from '../state/store';
import { componentById, CATEGORY_LABEL } from '../data/components';
import { tourById } from '../data/tours';

export function DetailPanel() {
  const selectedId = useAtlas((s) => s.selectedId);
  const select = useAtlas((s) => s.select);
  const setMode = useAtlas((s) => s.setMode);
  const hiddenIds = useAtlas((s) => s.hiddenIds);
  const toggleHidden = useAtlas((s) => s.toggleHidden);
  const isolate = useAtlas((s) => s.isolate);
  const setIsolate = useAtlas((s) => s.setIsolate);
  const requestCamera = useAtlas((s) => s.requestCamera);
  const setPanel = useAtlas((s) => s.setPanel);
  const tourId = useAtlas((s) => s.tourId);

  const c = selectedId ? componentById.get(selectedId) : undefined;
  if (!c) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="font-display text-sm font-semibold text-slate-300">Nothing selected</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Tap any component in the 3D view, or pick one from the parts list, to learn what it does.
        </p>
      </div>
    );
  }

  const hidden = hiddenIds.includes(c.id);
  const related = c.related.map((id) => componentById.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof componentById.get>>[];

  const goRelated = (id: string) => {
    const target = componentById.get(id);
    if (!target) return;
    if (target.scene !== c.scene) setMode(target.scene);
    // select after the mode switch has remounted the scene
    window.setTimeout(() => select(id), target.scene !== c.scene ? 350 : 0);
  };

  return (
    <div className="scroll-thin flex h-full flex-col overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-300">{CATEGORY_LABEL[c.category]}</p>
          <h2 className="font-display mt-1 text-lg font-bold leading-tight text-white">{c.name}</h2>
          {c.aliases.length > 0 && <p className="mt-0.5 text-[11px] text-slate-500">also called: {c.aliases.join(', ')}</p>}
        </div>
        <button
          onClick={() => {
            select(null);
            setPanel(null);
          }}
          aria-label="Close details"
          className="rounded-lg bg-white/5 px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{c.description}</p>

      <div className="mt-3 rounded-lg border border-teal-400/25 bg-teal-400/[0.07] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-300">What it does</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-200">{c.function}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setIsolate(!isolate)}
          aria-pressed={isolate}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${isolate ? 'bg-teal-400 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
        >
          {isolate ? 'Exit isolate' : 'Isolate'}
        </button>
        <button
          onClick={() => toggleHidden(c.id)}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          {hidden ? 'Show' : 'Hide'}
        </button>
        <button
          onClick={() => select(c.id, true)}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          Focus camera
        </button>
      </div>

      {c.examples.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Real-world examples</p>
          <ul className="mt-1.5 space-y-1">
            {c.examples.map((e) => (
              <li key={e} className="text-[13px] text-slate-300">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Connected to</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => goRelated(r.id)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-200"
                title={r.scene !== c.scene ? `Open in ${r.scene === 'motherboard' ? 'Motherboard Lab' : 'Desktop Explorer'}` : r.function}
              >
                {r.name}{r.scene !== c.scene ? ' ↗' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {c.syllabus.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Cambridge ICT topics</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {c.syllabus.map((s) => (
              <span key={s} className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">{s}</span>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-slate-600">Topic mapping for study guidance, not an official endorsement.</p>
        </div>
      )}

      {tourId && tourById.get(tourId) && (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[11px] text-slate-500">
          You’re on the “{tourById.get(tourId)!.title}” tour — use the tour bar below to continue.
        </p>
      )}
    </div>
  );
}
