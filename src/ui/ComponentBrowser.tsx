import { useMemo } from 'react';
import { useAtlas } from '../state/store';
import { sceneComponents, searchComponents, CATEGORY_LABEL, type ComponentCategory } from '../data/components';

function Eye({ off }: { off: boolean }) {
  return (
    <span aria-hidden className={`text-sm ${off ? 'opacity-40' : ''}`}>
      {off ? '🚫' : '👁'}
    </span>
  );
}

export function ComponentBrowser() {
  const mode = useAtlas((s) => s.mode);
  const search = useAtlas((s) => s.search);
  const setSearch = useAtlas((s) => s.setSearch);
  const selectedId = useAtlas((s) => s.selectedId);
  const select = useAtlas((s) => s.select);
  const hiddenIds = useAtlas((s) => s.hiddenIds);
  const toggleHidden = useAtlas((s) => s.toggleHidden);
  const setHidden = useAtlas((s) => s.setHidden);

  const scene = mode === 'motherboard' ? 'motherboard' : 'desktop';
  const results = useMemo(
    () => (search.trim() ? searchComponents(search, scene) : sceneComponents(scene)),
    [search, scene],
  );
  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, typeof results>();
    for (const c of results) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }
    return [...map.entries()];
  }, [results]);

  const allIds = useMemo(() => sceneComponents(scene).map((c) => c.id), [scene]);
  const anyHidden = hiddenIds.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 pb-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parts, e.g. “cpu”, “storage”…"
          aria-label="Search components"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400" role="status">
            {results.length} part{results.length === 1 ? '' : 's'}
            {search.trim() ? ` for “${search.trim()}”` : ''}
          </p>
          <button
            onClick={() => setHidden(anyHidden ? [] : allIds)}
            className="text-[11px] font-medium text-teal-300 hover:text-teal-200"
          >
            {anyHidden ? 'Show all' : 'Hide all'}
          </button>
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-3" role="listbox" aria-label="Components">
        {results.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-slate-400">
            No parts match “{search}”. Try “cpu”, “ram”, “power” or “usb”.
          </div>
        )}
        {grouped.map(([cat, list]) => (
          <div key={cat} className="mb-3">
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {CATEGORY_LABEL[cat]}
            </p>
            <ul className="space-y-1">
              {list.map((c) => {
                const hidden = hiddenIds.includes(c.id);
                const active = selectedId === c.id;
                return (
                  <li key={c.id}>
                    <div
                      role="option"
                      aria-selected={active}
                      className={`group flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${
                        active
                          ? 'border-teal-400/60 bg-teal-400/10'
                          : 'border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.07]'
                      }`}
                    >
                      <button
                        onClick={() => select(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') select(c.id);
                        }}
                        className="min-w-0 flex-1 truncate text-left text-[13px] text-slate-200"
                        title={c.function}
                      >
                        <span className={hidden ? 'line-through opacity-50' : ''}>{c.name}</span>
                      </button>
                      <button
                        onClick={() => toggleHidden(c.id)}
                        aria-label={hidden ? `Show ${c.name}` : `Hide ${c.name}`}
                        aria-pressed={!hidden}
                        title={hidden ? 'Show' : 'Hide'}
                        className="rounded-md px-1.5 py-0.5 hover:bg-white/10"
                      >
                        <Eye off={hidden} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
