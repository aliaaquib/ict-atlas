import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtlas } from '../state/store';
import { SIMS, simById, type SimStep } from '../data/sims';
import { componentById } from '../data/components';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function useSpotlight(step: SimStep | undefined) {
  const mode = useAtlas((s) => s.mode);
  const setMode = useAtlas((s) => s.setMode);
  const select = useAtlas((s) => s.select);
  useEffect(() => {
    if (!step?.spotlight) return;
    const id = step.spotlight;
    const target = componentById.get(id);
    if (!target) return;
    if (step.scene && step.scene !== mode && (mode === 'motherboard') !== (step.scene === 'motherboard')) {
      setMode(step.scene);
      window.setTimeout(() => select(id, true), 450);
    } else {
      select(id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
}

function Stepper({ steps, index, setIndex }: { steps: SimStep[]; index: number; setIndex: (i: number) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Simulation steps">
        {steps.map((s, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            title={s.title}
            className={`h-2 flex-1 rounded-full transition-colors ${i === index ? 'bg-teal-400' : i < index ? 'bg-teal-400/40' : 'bg-white/10 hover:bg-white/20'}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-300">
            Step {index + 1} of {steps.length}
          </p>
          <h3 className="font-display mt-0.5 text-base font-bold text-white">{steps[index].title}</h3>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{steps[index].detail}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={() => setIndex(Math.min(steps.length - 1, index + 1))}
          disabled={index === steps.length - 1}
          className="rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widgets                                                             */
/* ------------------------------------------------------------------ */

function BootWidget({ active }: { active: number }) {
  const nodes = ['Power', 'Firmware', 'POST', 'Bootloader', 'OS loads', 'Login'];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center">
        {nodes.map((n, i) => (
          <div key={n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500 ${
                  i <= active ? 'border-teal-400 bg-teal-400/20 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.4)]' : 'border-white/15 bg-white/5 text-slate-500'
                }`}
              >
                {i < active ? '✓' : i + 1}
              </div>
              <span className={`text-[9px] ${i <= active ? 'text-teal-200' : 'text-slate-500'}`}>{n}</span>
            </div>
            {i < nodes.length - 1 && (
              <div className={`mx-1 mb-5 h-0.5 flex-1 rounded transition-colors duration-500 ${i < active ? 'bg-teal-400' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IpoWidget() {
  const [text, setText] = useState('');
  const [screen, setScreen] = useState('');
  const [phase, setPhase] = useState<'idle' | 'key-cpu' | 'cpu-ram' | 'ram-screen'>('idle');
  const timers = useRef<number[]>([]);

  const send = () => {
    if (!text.trim() || phase !== 'idle') return;
    const ch = text.trim();
    timers.current.forEach(clearTimeout);
    setPhase('key-cpu');
    timers.current.push(window.setTimeout(() => setPhase('cpu-ram'), 700));
    timers.current.push(window.setTimeout(() => setPhase('ram-screen'), 1400));
    timers.current.push(
      window.setTimeout(() => {
        setScreen((s) => (s + ' ' + ch).trim());
        setPhase('idle');
        setText('');
      }, 2100),
    );
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dot = (visible: boolean, path: string) =>
    visible ? (
      <circle r="5" fill="#2dd4bf">
        <animateMotion dur="0.65s" repeatCount="1" path={path} />
      </circle>
    ) : null;

  const node = (x: number, y: number, label: string, lit: boolean) => (
    <g>
      <rect x={x - 42} y={y - 18} width="84" height="36" rx="9" fill={lit ? '#134e4a' : '#151c26'} stroke={lit ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
      <text x={x} y={y + 4} textAnchor="middle" fill={lit ? '#99f6e4' : '#94a3b8'} fontSize="11" fontWeight="600">{label}</text>
    </g>
  );

  const litKey = phase === 'key-cpu', litCpu = phase !== 'idle', litRam = phase === 'cpu-ram' || phase === 'ram-screen', litMon = phase === 'ram-screen';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <svg viewBox="0 0 340 190" className="w-full">
        {node(60, 150, 'Keyboard', litKey)}
        {node(170, 150, 'CPU', litCpu)}
        {node(170, 55, 'RAM', litRam)}
        {node(290, 150, 'Monitor', litMon)}
        <line x1="102" y1="150" x2="128" y2="150" stroke="#334155" strokeWidth="2" />
        <line x1="212" y1="150" x2="248" y2="150" stroke="#334155" strokeWidth="2" />
        <line x1="170" y1="132" x2="170" y2="73" stroke="#334155" strokeWidth="2" />
        {dot(phase === 'key-cpu', 'M 102 150 L 128 150')}
        {dot(phase === 'cpu-ram', 'M 170 132 L 170 73')}
        {dot(phase === 'ram-screen', 'M 170 132 L 170 150 L 248 150')}
        <rect x="252" y="120" width="76" height="26" rx="5" fill="#0b0f14" stroke="#334155" />
        <text x="290" y="137" textAnchor="middle" fill="#5eead4" fontSize="11" fontFamily="monospace">{screen.slice(-10) || '…'}</text>
      </svg>
      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a word, then send it"
          aria-label="Type text to send through the system"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={phase !== 'idle' || !text.trim()}
          className="rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-40"
        >
          Press key ⏎
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Watch the signal travel: keyboard → CPU → RAM → monitor.</p>
    </div>
  );
}

function RamStorageWidget() {
  const [ram, setRam] = useState('My essay draft…');
  const [ssd, setSsd] = useState('Saved files');
  const [power, setPower] = useState(true);
  const [flash, setFlash] = useState(false);

  const cutPower = () => {
    setPower(false);
    setFlash(true);
    window.setTimeout(() => {
      setRam('');
      setFlash(false);
    }, 450);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-lg border p-2.5 transition-all ${flash ? 'animate-pulse border-red-400' : 'border-amber-400/40'} ${!power ? 'opacity-60' : ''}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">RAM · volatile</p>
          <p className="mt-1 min-h-10 font-mono text-xs text-slate-200">{power ? ram || <span className="text-slate-600">(empty)</span> : <span className="text-slate-600">(no power)</span>}</p>
          <p className="mt-1 text-[10px] text-slate-500">{power ? '⚡ needs power' : '✕ wiped'}</p>
        </div>
        <div className="rounded-lg border border-sky-400/40 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-300">SSD · permanent</p>
          <p className="mt-1 min-h-10 font-mono text-xs text-slate-200">{ssd}</p>
          <p className="mt-1 text-[10px] text-slate-500">✓ survives power loss</p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          onClick={() => power && setRam((r) => (r ? r + ' more words…' : 'New unsaved work…'))}
          disabled={!power}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40"
        >
          ✍️ Type (unsaved)
        </button>
        <button
          onClick={() => power && ram && setSsd((s) => (s === 'Saved files' ? ram : s + ' · ' + ram))}
          disabled={!power || !ram}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40"
        >
          💾 Save to SSD
        </button>
        {power ? (
          <button onClick={cutPower} className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/30">
            🔌 Cut power
          </button>
        ) : (
          <button onClick={() => setPower(true)} className="rounded-lg bg-teal-400 px-2.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-300">
            ⚡ Restore power
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Type without saving, then cut the power. What survives?</p>
    </div>
  );
}

function LayersWidget() {
  const layers = [
    { name: 'Applications', desc: 'The programs you use: browser, games, word processor.', color: '#2dd4bf' },
    { name: 'Drivers & utilities', desc: 'Drivers translate OS requests for specific hardware; utilities manage the system.', color: '#38bdf8' },
    { name: 'Operating system', desc: 'Manages memory, files, processes and all hardware access.', color: '#a78bfa' },
    { name: 'Firmware', desc: 'Built into chips; wakes hardware at power-on.', color: '#f59e0b' },
    { name: 'Hardware', desc: 'The physical machine: CPU, RAM, storage, devices.', color: '#f472b6' },
  ];
  const [selected, setSelected] = useState(2);
  const [osRemoved, setOsRemoved] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="space-y-1.5">
        {layers.map((l, i) => {
          const dead = osRemoved && i < 2;
          return (
            <button
              key={l.name}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                dead ? 'border-white/5 bg-white/[0.01] opacity-35' : selected === i ? 'bg-white/[0.07]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
              }`}
              style={selected === i && !dead ? { borderColor: l.color } : undefined}
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-100">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: dead ? '#475569' : l.color }} />
                {l.name}
                {dead && <span className="text-[10px] font-normal text-slate-500">— cannot run</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-slate-300">{layers[selected].desc}</p>
      <button
        onClick={() => setOsRemoved((v) => !v)}
        aria-pressed={osRemoved}
        className={`mt-2 w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${osRemoved ? 'bg-teal-400 text-slate-950' : 'bg-red-500/20 text-red-200 hover:bg-red-500/30'}`}
      >
        {osRemoved ? '↩ Restore the operating system' : '⚠️ Remove the operating system — what breaks?'}
      </button>
      {osRemoved && (
        <p className="mt-2 text-[12px] leading-relaxed text-amber-200/90">
          Without the OS, applications and drivers have nothing to run on. Every layer depends on the ones below it.
        </p>
      )}
    </div>
  );
}

function HwSwWidget() {
  const hops = [
    { label: 'Mouse click', detail: 'You click “Apply filter”. The mouse sends the click to the OS.' },
    { label: 'Application', detail: 'The photo app receives the click and asks the OS for the image data and GPU time.' },
    { label: 'Operating system', detail: 'The OS schedules the work and manages memory for the task.' },
    { label: 'CPU + GPU', detail: 'The CPU coordinates; the GPU recalculates millions of pixels in parallel.' },
    { label: 'PSU + cooling', detail: 'The PSU feeds every chip; coolers keep temperatures safe throughout.' },
    { label: 'Saved to SSD', detail: 'The finished image is written from RAM to the SSD — permanent storage.' },
  ];
  const [hop, setHop] = useState(-1);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const trace = () => {
    timers.current.forEach(clearTimeout);
    setRunning(true);
    setHop(0);
    hops.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setHop(i), i * 900));
    });
    timers.current.push(window.setTimeout(() => setRunning(false), hops.length * 900));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="space-y-1">
        {hops.map((h, i) => (
          <div key={h.label} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-all duration-300 ${i === hop ? 'bg-teal-400/15 text-teal-100' : i < hop ? 'text-slate-400' : 'text-slate-600'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i <= hop ? 'bg-teal-400 text-slate-950' : 'bg-white/10'}`}>{i + 1}</span>
            {h.label}
          </div>
        ))}
      </div>
      <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-slate-300">{hop >= 0 ? hops[hop].detail : 'Press “Trace” to follow one click from your hand to the SSD.'}</p>
      <button
        onClick={trace}
        disabled={running}
        className="mt-2 w-full rounded-lg bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-50"
      >
        {running ? 'Tracing…' : hop >= 0 ? '↻ Trace again' : '▶ Trace a click'}
      </button>
    </div>
  );
}

const WIDGETS: Record<string, (props: { active: number }) => React.JSX.Element> = {
  'sim-boot': ({ active }) => <BootWidget active={active} />,
  'sim-ipo': () => <IpoWidget />,
  'sim-ram-storage': () => <RamStorageWidget />,
  'sim-layers': () => <LayersWidget />,
  'sim-hwsw': () => <HwSwWidget />,
};

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export function SimPanel() {
  const activeSim = useAtlas((s) => s.activeSim);
  const setActiveSim = useAtlas((s) => s.setActiveSim);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [activeSim]);

  if (!activeSim) {
    return (
      <div className="scroll-thin h-full overflow-y-auto p-4">
        <h2 className="font-display text-lg font-bold text-white">Software Lab</h2>
        <p className="mt-1 text-[13px] text-slate-400">Interactive simulations — not emulators, but guided, hands-on models of how computers really work.</p>
        <div className="mt-4 space-y-2.5">
          {SIMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSim(s.id)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-colors hover:border-teal-400/50 hover:bg-white/[0.06]"
            >
              <p className="font-display text-[15px] font-bold text-white">{s.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{s.subtitle}</p>
              <p className="mt-1.5 text-[11px] font-medium text-teal-300">{s.steps.length} steps →</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const sim = simById.get(activeSim)!;
  const step = sim.steps[index];
  const Widget = WIDGETS[sim.id];
  return (
    <SimRunner key={sim.id} simId={sim.id} steps={sim.steps} title={sim.title} index={index} setIndex={setIndex} onBack={() => setActiveSim(null)} widget={<Widget active={index} />} />
  );
}

function SimRunner({ simId, steps, title, index, setIndex, onBack, widget }: {
  simId: string; steps: SimStep[]; title: string; index: number; setIndex: (i: number) => void; onBack: () => void; widget: React.ReactNode;
}) {
  const step = steps[index];
  useSpotlight(step);
  const spotlightName = step.spotlight ? componentById.get(step.spotlight)?.name : null;

  return (
    <div className="scroll-thin flex h-full flex-col overflow-y-auto p-4">
      <button onClick={onBack} className="self-start text-xs font-medium text-slate-400 hover:text-teal-300">
        ← All simulations
      </button>
      <h2 className="font-display mt-1 text-lg font-bold text-white">{title}</h2>
      <div className="mt-3">{widget}</div>
      <div className="mt-4">
        <Stepper steps={steps} index={index} setIndex={setIndex} />
        {spotlightName && (
          <p className="mt-2 text-[11px] text-slate-500">
            🔍 Spotlight: <span className="text-teal-300">{spotlightName}</span> in the 3D view
          </p>
        )}
      </div>
    </div>
  );
}

export function simIds(): string[] {
  return SIMS.map((s) => s.id);
}
export { SIMS };
