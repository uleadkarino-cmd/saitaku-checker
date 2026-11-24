'use client';

import { CheckCircle2, CircleDashed, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const checkItems = [
  { key: 'purchased', label: '選んだドメインを取得済み', note: '取得サービスの管理画面で、自分が所有者になっていることを確認します。' },
  { key: 'dns', label: 'DNS設定を登録済み', note: 'サイト接続時に表示される指定値を、ドメイン管理画面へ登録します。' },
  { key: 'ssl', label: 'HTTPS・SSLが有効', note: '本番URLを開き、ブラウザで安全な接続になっていることを確認します。' },
  { key: 'pages', label: '主要ページを本番URLで確認', note: 'トップ、料金、FAQ、規約、プライバシー、特商法表記を確認します。' },
  { key: 'forms', label: 'フォームと購入導線を確認', note: 'お問い合わせ、無料回数、有料購入の一連の動作を確認します。' },
] as const;
const storageKey = 'saitaku-admin-domain-readiness-v1';
type State = { candidates: string[]; selected: number; checks: Record<string, boolean> };
const initial: State = { candidates: ['', '', ''], selected: 0, checks: {} };

export function DomainManager() {
  const [state, setState] = useState<State>(initial); const [loaded, setLoaded] = useState(false); const [saved, setSaved] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(storageKey); if (stored) setState({ ...initial, ...JSON.parse(stored) }); } catch { setState(initial); } setLoaded(true); }, []);
  function persist(next: State) { setState(next); localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(true); }
  if (!loaded) return null;
  const done = checkItems.filter((item) => state.checks[item.key]).length;
  return <>
    <section className="mt-7 rounded-3xl border border-sky-200 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">ドメイン候補</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">候補を記録するだけで、取得や空き状況確認は行いません。</p></div><span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-900">選択中：{state.candidates[state.selected] || '未入力'}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{state.candidates.map((candidate, index) => <label key={index} className={`rounded-2xl border p-4 ${state.selected === index ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}><span className="flex items-center gap-2 text-xs font-bold"><input type="radio" name="domain-candidate" checked={state.selected === index} onChange={() => { setState((current) => ({ ...current, selected: index })); setSaved(false); }} />候補{index + 1}</span><input value={candidate} onChange={(event) => { const candidates = [...state.candidates]; candidates[index] = event.target.value.replace(/^https?:\/\//, '').replace(/\/.*/, '').trim(); setState({ ...state, candidates }); setSaved(false); }} placeholder="例：saitaku.jp" className="mt-3 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-sky-500" /></label>)}</div><div className="mt-4 flex items-center justify-end gap-3"><span className="text-xs font-bold text-emerald-700">{saved ? 'この端末に保存しました' : ''}</span><button type="button" onClick={() => persist(state)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-700 px-4 text-xs font-bold text-white hover:bg-sky-800"><Save className="size-4" />候補を保存</button></div></section>
    <section className="mt-7 rounded-3xl border border-sky-200 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">取得・接続後の確認</h2><p className="mt-1 text-xs text-muted-foreground">実際に完了した項目だけチェックしてください。</p></div><span className={`rounded-full border px-4 py-2 text-sm font-bold ${done === checkItems.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>{done} / {checkItems.length}項目</span></div><div className="mt-5 space-y-3">{checkItems.map((item) => <button key={item.key} type="button" onClick={() => persist({ ...state, checks: { ...state.checks, [item.key]: !state.checks[item.key] } })} className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50">{state.checks[item.key] ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" /> : <CircleDashed className="mt-0.5 size-5 shrink-0 text-slate-400" />}<span><strong className="text-sm">{item.label}</strong><span className="mt-1 block text-xs leading-6 text-muted-foreground">{item.note}</span></span></button>)}</div></section>
  </>;
}
