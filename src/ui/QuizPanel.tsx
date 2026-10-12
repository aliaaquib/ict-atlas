import { useMemo, useState } from 'react';
import { useAtlas } from '../state/store';
import { QUIZZES, quizById, type QuizQuestion } from '../data/quizzes';
import { componentById } from '../data/components';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ChoiceQuestion({ q, onAnswer }: { q: QuizQuestion; onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle(q.options), [q]);
  const correct = picked === q.answer;
  return (
    <div>
      <p className="font-display text-[15px] font-bold leading-snug text-white">{q.prompt}</p>
      <div className="mt-3 space-y-2">
        {options.map((o) => {
          const isAnswer = o === q.answer;
          const isPicked = o === picked;
          return (
            <button
              key={o}
              disabled={picked !== null}
              onClick={() => {
                setPicked(o);
                onAnswer(o === q.answer);
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors disabled:cursor-default ${
                picked === null
                  ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-teal-400/50 hover:bg-white/[0.06]'
                  : isAnswer
                    ? 'border-teal-400 bg-teal-400/15 text-teal-100'
                    : isPicked
                      ? 'border-red-400 bg-red-400/10 text-red-200'
                      : 'border-white/10 bg-white/[0.02] text-slate-500'
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-3 rounded-lg border p-3 text-[13px] leading-relaxed ${correct ? 'border-teal-400/40 bg-teal-400/[0.07] text-teal-100' : 'border-red-400/40 bg-red-400/[0.07] text-red-100'}`}>
          <p className="font-semibold">{correct ? '✓ Correct!' : '✕ Not quite.'}</p>
          <p className="mt-1 text-slate-300">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

function OrderQuestion({ q, onAnswer }: { q: QuizQuestion; onAnswer: (correct: boolean) => void }) {
  const [order, setOrder] = useState<string[]>(() => shuffle(q.options));
  const [checked, setChecked] = useState(false);
  const correct = checked && order.every((o, i) => o === q.options[i]);

  const move = (i: number, dir: -1 | 1) => {
    if (checked) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <div>
      <p className="font-display text-[15px] font-bold leading-snug text-white">{q.prompt}</p>
      <ol className="mt-3 space-y-1.5">
        {order.map((o, i) => {
          const right = checked && o === q.options[i];
          const wrong = checked && o !== q.options[i];
          return (
            <li
              key={o}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] ${
                right ? 'border-teal-400 bg-teal-400/10 text-teal-100' : wrong ? 'border-red-400/60 bg-red-400/10 text-red-200' : 'border-white/10 bg-white/[0.03] text-slate-200'
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">{i + 1}</span>
              <span className="min-w-0 flex-1">{o}</span>
              {!checked && (
                <span className="flex shrink-0 gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move "${o}" up`} className="rounded bg-white/5 px-1.5 py-0.5 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={`Move "${o}" down`} className="rounded bg-white/5 px-1.5 py-0.5 text-xs disabled:opacity-30">↓</button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!checked ? (
        <button
          onClick={() => {
            setChecked(true);
            onAnswer(order.every((o, i) => o === q.options[i]));
          }}
          className="mt-3 w-full rounded-lg bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-300"
        >
          Check order
        </button>
      ) : (
        <div className={`mt-3 rounded-lg border p-3 text-[13px] leading-relaxed ${correct ? 'border-teal-400/40 bg-teal-400/[0.07] text-teal-100' : 'border-amber-400/40 bg-amber-400/[0.07] text-amber-100'}`}>
          <p className="font-semibold">{correct ? '✓ Perfect order!' : '✕ Check the correct order above.'}</p>
          <p className="mt-1 text-slate-300">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

function QuizRunner({ quizId }: { quizId: string }) {
  const quiz = quizById.get(quizId)!;
  const setActiveQuiz = useAtlas((s) => s.setActiveQuiz);
  const select = useAtlas((s) => s.select);
  const setMode = useAtlas((s) => s.setMode);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const q = quiz.questions[qi];

  const spotlight = (id?: string) => {
    if (!id) return;
    const c = componentById.get(id);
    if (!c) return;
    if (c.scene === 'motherboard') setMode('motherboard');
    else if (c.scene === 'desktop') setMode('desktop');
    window.setTimeout(() => select(id, true), c.scene === 'motherboard' || c.scene === 'desktop' ? 350 : 0);
  };

  const next = () => {
    if (qi + 1 >= quiz.questions.length) setDone(true);
    else {
      setQi(qi + 1);
      setAnswered(false);
    }
  };

  if (done) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="font-display text-4xl font-bold text-teal-300">{pct}%</p>
        <p className="mt-2 text-sm text-slate-300">
          You got {score} of {quiz.questions.length} right.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {pct === 100 ? 'Flawless — true hardware whisperer.' : pct >= 60 ? 'Solid. Review the ones you missed and try again.' : 'Good start — explore the 3D scenes and retry.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setQi(0);
              setScore(0);
              setAnswered(false);
              setDone(false);
            }}
            className="rounded-lg bg-teal-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-300"
          >
            Retry
          </button>
          <button onClick={() => setActiveQuiz(null)} className="rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10">
            All quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-thin flex h-full flex-col overflow-y-auto p-4">
      <button onClick={() => setActiveQuiz(null)} className="self-start text-xs font-medium text-slate-400 hover:text-teal-300">
        ← All quizzes
      </button>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">{quiz.title}</h2>
        <p className="text-xs text-slate-400" role="status">
          {qi + 1}/{quiz.questions.length} · Score {score}
        </p>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${((qi + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }} />
      </div>
      <div className="mt-4" key={q.id}>
        {q.kind === 'order' ? (
          <OrderQuestion q={q} onAnswer={(ok) => { setAnswered(true); if (ok) setScore((s) => s + 1); }} />
        ) : (
          <ChoiceQuestion q={q} onAnswer={(ok) => { setAnswered(true); if (ok) setScore((s) => s + 1); }} />
        )}
      </div>
      {q.componentId && (
        <button onClick={() => spotlight(q.componentId)} className="mt-3 self-start text-[11px] font-medium text-teal-300 hover:text-teal-200">
          🔍 See it in 3D: {componentById.get(q.componentId)?.name}
        </button>
      )}
      {answered && (
        <button onClick={next} className="mt-4 w-full rounded-lg bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-300">
          {qi + 1 >= quiz.questions.length ? 'See results' : 'Next question →'}
        </button>
      )}
    </div>
  );
}

export function QuizPanel() {
  const activeQuiz = useAtlas((s) => s.activeQuiz);
  const setActiveQuiz = useAtlas((s) => s.setActiveQuiz);

  if (activeQuiz) return <QuizRunner quizId={activeQuiz} />;

  return (
    <div className="scroll-thin h-full overflow-y-auto p-4">
      <h2 className="font-display text-lg font-bold text-white">Quizzes</h2>
      <p className="mt-1 text-[13px] text-slate-400">Test yourself — every question explains the answer.</p>
      <div className="mt-4 space-y-2.5">
        {QUIZZES.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveQuiz(q.id)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-colors hover:border-teal-400/50 hover:bg-white/[0.06]"
          >
            <p className="font-display text-[15px] font-bold text-white">{q.title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{q.subtitle}</p>
            <p className="mt-1.5 text-[11px] font-medium text-teal-300">{q.questions.length} questions →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
