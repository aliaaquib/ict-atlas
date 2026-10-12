import { useAtlas } from '../state/store';
import type { Mode } from '../state/store';

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'desktop', label: 'Desktop Explorer', hint: 'Full computer, inside and out' },
  { id: 'motherboard', label: 'Motherboard Lab', hint: 'Every socket and connector' },
  { id: 'lab', label: 'Software Lab', hint: 'Boot, memory and software simulations' },
];

export function TopBar() {
  const mode = useAtlas((s) => s.mode);
  const setMode = useAtlas((s) => s.setMode);
  const explodeTarget = useAtlas((s) => s.explodeTarget);
  const setExplodeTarget = useAtlas((s) => s.setExplodeTarget);
  const isolate = useAtlas((s) => s.isolate);
  const setIsolate = useAtlas((s) => s.setIsolate);
  const rotate = useAtlas((s) => s.rotate);
  const setRotate = useAtlas((s) => s.setRotate);
  const reset = useAtlas((s) => s.reset);
  const panel = useAtlas((s) => s.panel);
  const setPanel = useAtlas((s) => s.setPanel);
  const selectedId = useAtlas((s) => s.selectedId);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d131b]/90 px-3 py-2 shadow-lg backdrop-blur">
          <span className="font-display text-sm font-bold tracking-wide text-teal-300">ICT&nbsp;ATLAS</span>
          <span className="hidden text-[11px] text-slate-400 sm:inline">Cambridge ICT · interactive 3D</span>
        </div>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#0d131b]/90 p-1 shadow-lg backdrop-blur" aria-label="Views">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.hint}
              aria-pressed={mode === m.id}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                mode === m.id ? 'bg-teal-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0d131b]/90 p-1 shadow-lg backdrop-blur lg:hidden">
          <button
            onClick={() => setPanel(panel === 'browser' ? null : 'browser')}
            aria-pressed={panel === 'browser'}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${panel === 'browser' ? 'bg-teal-400 text-slate-950' : 'text-slate-300'}`}
          >
            Parts
          </button>
          <button
            onClick={() => setPanel(panel === 'detail' ? null : 'detail')}
            aria-pressed={panel === 'detail'}
            disabled={!selectedId}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${panel === 'detail' ? 'bg-teal-400 text-slate-950' : 'text-slate-300'}`}
          >
            Details
          </button>
        </div>
      </div>

      {mode !== 'lab' && (
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 self-start rounded-xl border border-white/10 bg-[#0d131b]/90 px-3 py-2 shadow-lg backdrop-blur">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-medium">Explode</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(explodeTarget * 100)}
              onChange={(e) => setExplodeTarget(Number(e.target.value) / 100)}
              className="h-1.5 w-28 cursor-pointer accent-teal-400 sm:w-36"
              aria-label="Exploded view amount"
            />
            <span className="w-9 text-right tabular-nums text-slate-400">{Math.round(explodeTarget * 100)}%</span>
          </label>
          <span className="h-4 w-px bg-white/10" aria-hidden />
          <button
            onClick={() => setIsolate(!isolate)}
            aria-pressed={isolate}
            disabled={!selectedId}
            title="Show only the selected component"
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
              isolate ? 'bg-teal-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Isolate
          </button>
          <button
            onClick={() => setRotate(!rotate)}
            aria-pressed={rotate}
            title="Slow auto-rotation"
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              rotate ? 'bg-teal-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Rotate
          </button>
          <button
            onClick={reset}
            title="Reset selection, visibility, explode and camera"
            className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      )}
    </header>
  );
}
