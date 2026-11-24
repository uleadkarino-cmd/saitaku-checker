'use client';

import { ArrowRight, CheckCircle2, Circle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const options = [
  { id: 'application', badge: 'おすすめ候補', title: '1申請パック', price: '3,980円（税込）', period: '購入日から30日間', checks: '1申請につき50回まで', limit: '30日間・50回まで', fit: '自分で1件の申請を仕上げたい事業者', merits: ['料金と利用範囲が分かりやすい', '申請期間中に繰り返し修正しやすい'], caution: '1申請の識別方法と、別申請への流用防止を決める必要があります。' },
  { id: 'period', badge: '比較候補', title: '30日パス', price: '5,980円（税込）', period: '購入日から30日間', checks: '期間内100回まで', limit: '30日間・上限100回', fit: '複数書類を頻繁に確認したい事業者', merits: ['回数を気にせず使いやすい', '追加書類の確認にも対応しやすい'], caution: '大量利用時の解析費を抑える上限と、公平利用条件が必要です。' },
  { id: 'topup', badge: '比較候補', title: '追加回数パック', price: '1,980円（税込）', period: '購入日から30日間', checks: '追加20回', limit: '追加20回・30日間', fit: '無料10回で不足した利用者', merits: ['購入の心理的な負担が比較的小さい', '無料版から自然に案内しやすい'], caution: '少額決済の手数料負担と、再購入の管理が増えます。' },
] as const;

const storageKey = 'saitaku-admin-pricing-candidate-v1';

export function PricingOptions() {
  const [selected, setSelected] = useState('');
  const [saved, setSaved] = useState(false);
  const [reflected, setReflected] = useState(false);
  useEffect(() => { setSelected(localStorage.getItem(storageKey) || ''); }, []);
  function save() { if (!selected) return; localStorage.setItem(storageKey, selected); setSaved(true); }
  function reflectDecision() {
    const option = options.find((item) => item.id === selected);
    if (!option) return;
    const decisionKey = 'saitaku-admin-launch-decisions-v1';
    let current: { values?: Record<string, string> } = {};
    try { current = JSON.parse(localStorage.getItem(decisionKey) || '{}'); } catch { current = {}; }
    const now = new Date().toLocaleString('ja-JP');
    localStorage.setItem(decisionKey, JSON.stringify({ values: { ...(current.values || {}), price: option.price, period: option.period, checks: option.checks }, savedAt: now }));
    localStorage.setItem(storageKey, selected);
    setSaved(true);
    setReflected(true);
  }

  return <>
    <section className="mt-7 grid gap-5 lg:grid-cols-3" aria-label="料金案比較">
      {options.map((option) => {
        const active = selected === option.id;
        return <button key={option.id} type="button" onClick={() => { setSelected(option.id); setSaved(false); }} className={`text-left rounded-3xl border p-5 transition sm:p-6 ${active ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100' : 'border-border bg-white hover:border-violet-200'}`}>
          <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${option.id === 'application' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>{option.badge}</span>{active ? <CheckCircle2 className="size-5 text-violet-700" /> : <Circle className="size-5 text-slate-300" />}</div>
          <h2 className="mt-4 text-lg font-bold">{option.title}</h2><p className="mt-2 text-2xl font-bold text-violet-900">{option.price}</p><p className="mt-1 text-sm font-bold text-muted-foreground">{option.limit}</p>
          <div className="mt-4 rounded-2xl bg-white p-3 text-xs leading-6"><strong>向いている人：</strong>{option.fit}</div>
          <ul className="mt-4 space-y-2 text-xs leading-6 text-slate-700">{option.merits.map((merit) => <li key={merit} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />{merit}</li>)}</ul>
          <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-6 text-amber-900"><strong>決定前の確認：</strong>{option.caution}</p>
        </button>;
      })}
    </section>
    <div className="sticky bottom-4 mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-lg"><p className="text-xs leading-6 text-violet-950/70">{selected ? `${options.find((option) => option.id === selected)?.title}を選択中です。` : '比較する案を1つ選んでください。'}{saved && ' 候補として保存しました。'}{reflected && ' 価格・期間・回数を決定事項へ反映しました。'}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={!selected} onClick={save} className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-300 bg-white px-4 text-sm font-bold text-violet-900 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-4" />候補として保存</button><button type="button" disabled={!selected} onClick={reflectDecision} className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-bold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">決定事項へ反映<ArrowRight className="size-4" /></button></div></div>
  </>;
}
