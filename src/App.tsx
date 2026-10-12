import { useEffect } from 'react';
import { useAtlas } from './state/store';
import { SceneView } from './three/SceneView';
import { TopBar } from './ui/TopBar';
import { ComponentBrowser } from './ui/ComponentBrowser';
import { DetailPanel } from './ui/DetailPanel';
import { SimPanel } from './ui/SimPanel';
import { QuizPanel } from './ui/QuizPanel';
import { TourPicker, TourBar } from './ui/TourBar';

const PANEL = 'rounded-2xl border border-white/10 bg-[#0d131b]/92 shadow-2xl backdrop-blur';

function LabPanel() {
  const labTab = useAtlas((s) => s.labTab);
  const setLabTab = useAtlas((s) => s.setLabTab);
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-white/10 p-2">
        {(['sims', 'quizzes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setLabTab(t)}
            aria-pressed={labTab === t}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              labTab === t ? 'bg-teal-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {t === 'sims' ? 'Simulations' : 'Quizzes'}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">{labTab === 'sims' ? <SimPanel /> : <QuizPanel />}</div>
    </div>
  );
}

function FirstRunHint() {
  const selectedId = useAtlas((s) => s.selectedId);
  const tourId = useAtlas((s) => s.tourId);
  if (selectedId || tourId) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 hidden justify-center lg:flex">
      <p className="rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-[11px] text-slate-400 backdrop-blur">
        Drag to orbit · scroll to zoom · click any component to inspect it · try the Explode slider
      </p>
    </div>
  );
}

export default function App() {
  const mode = useAtlas((s) => s.mode);
  const selectedId = useAtlas((s) => s.selectedId);
  const panel = useAtlas((s) => s.panel);
  const setPanel = useAtlas((s) => s.setPanel);

  // Auto-open the detail sheet on mobile when something is selected.
  useEffect(() => {
    if (selectedId && window.innerWidth < 1024 && mode !== 'lab') setPanel('detail');
  }, [selectedId, mode, setPanel]);

  // Escape closes panels / ends tours / deselects.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = useAtlas.getState();
      if (s.panel) s.setPanel(null);
      else if (s.tourId) s.startTour(null);
      else if (s.selectedId) s.select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0f14] text-slate-100">
      <div className="absolute inset-0">
        <SceneView />
      </div>

      <TopBar />

      {/* Desktop: left explorer panel */}
      {mode !== 'lab' && (
        <aside className={`absolute bottom-4 left-4 top-36 z-20 hidden w-72 flex-col lg:flex ${PANEL}`} aria-label="Component explorer">
          <div className="min-h-0 flex-1">
            <ComponentBrowser />
          </div>
          <div className="border-t border-white/10 py-2">
            <TourPicker />
          </div>
        </aside>
      )}

      {/* Desktop: right detail panel */}
      {mode !== 'lab' && selectedId && (
        <aside className={`absolute bottom-4 right-4 top-36 z-20 hidden w-80 lg:block ${PANEL}`} aria-label="Component details">
          <DetailPanel />
        </aside>
      )}

      {/* Lab mode: right panel (desktop) */}
      {mode === 'lab' && (
        <aside className={`absolute bottom-4 right-4 top-24 z-20 hidden w-[26rem] lg:block ${PANEL}`} aria-label="Software lab">
          <LabPanel />
        </aside>
      )}

      {/* Mobile: bottom sheet */}
      {panel && (
        <div className="absolute inset-x-0 bottom-0 z-40 lg:hidden">
          <div role="dialog" aria-label="Panel" className="mx-2 mb-2 max-h-[62vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d131b]/97 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {mode === 'lab' ? 'Software Lab' : panel === 'browser' ? 'Parts' : 'Details'}
              </p>
              <button
                onClick={() => setPanel(null)}
                aria-label="Close panel"
                className="rounded-lg bg-white/5 px-2 py-1 text-slate-400 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[54vh] overflow-y-auto">
              {mode === 'lab' ? (
                <LabPanel />
              ) : panel === 'browser' ? (
                <div>
                  <div className="max-h-64 overflow-y-auto"><ComponentBrowser /></div>
                  <div className="border-t border-white/10 py-2"><TourPicker /></div>
                </div>
              ) : (
                <DetailPanel />
              )}
            </div>
          </div>
        </div>
      )}

      <TourBar />
      <FirstRunHint />
    </div>
  );
}
