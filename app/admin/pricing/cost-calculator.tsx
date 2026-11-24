'use client';

import { Calculator, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Inputs = { fixed: number; perCheck: number; checks: number; monthlySales: number; supportMinutes: number; hourlyCost: number; paymentRate: number; targetMargin: number };
const initial: Inputs = { fixed: 3000, perCheck: 15, checks: 50, monthlySales: 30, supportMinutes: 15, hourlyCost: 1500, paymentRate: 3.6, targetMargin: 50 };
const storageKey = 'saitaku-admin-cost-assumptions-v1';

const fields: Array<{ key: keyof Inputs; label: string; suffix: string; min: number; max?: number }> = [
  { key: 'fixed', label: '月額固定費', suffix: '円', min: 0 },
  { key: 'monthlySales', label: '月間の想定販売数', suffix: '件', min: 1 },
  { key: 'perCheck', label: '1チェックあたりの変動費', suffix: '円', min: 0 },
  { key: 'checks', label: '1購入で使われる想定回数', suffix: '回', min: 0 },
  { key: 'supportMinutes', label: '1購入あたりの対応時間', suffix: '分', min: 0 },
  { key: 'hourlyCost', label: '運営者の時間単価', suffix: '円', min: 0 },
  { key: 'paymentRate', label: '決済手数料率', suffix: '%', min: 0, max: 30 },
  { key: 'targetMargin', label: '目標利益率', suffix: '%', min: 0, max: 90 },
];

export function CostCalculator() {
  const [inputs, setInputs] = useState<Inputs>(initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(storageKey); if (stored) setInputs({ ...initial, ...JSON.parse(stored) }); } catch { setInputs(initial); } }, []);

  const result = useMemo(() => {
    const fixedPerSale = inputs.fixed / Math.max(1, inputs.monthlySales);
    const analysis = inputs.perCheck * inputs.checks;
    const support = (inputs.supportMinutes / 60) * inputs.hourlyCost;
    const baseCost = fixedPerSale + analysis + support;
    const remainingRate = 1 - inputs.paymentRate / 100 - inputs.targetMargin / 100;
    const minimumPrice = remainingRate > 0 ? Math.ceil(baseCost / remainingRate / 100) * 100 : 0;
    return { fixedPerSale, analysis, support, baseCost, minimumPrice };
  }, [inputs]);

  function update(key: keyof Inputs, value: string) { setSaved(false); setInputs((current) => ({ ...current, [key]: Math.max(0, Number(value) || 0) })); }
  function save() { localStorage.setItem(storageKey, JSON.stringify(inputs)); setSaved(true); }
  const yen = (value: number) => `${Math.round(value).toLocaleString('ja-JP')}円`;

  return <section className="mt-7 rounded-3xl border border-cyan-200 bg-cyan-50 p-5 sm:p-7">
    <div className="flex items-start gap-3"><Calculator className="mt-0.5 size-6 shrink-0 text-cyan-700" /><div><h2 className="text-lg font-bold text-cyan-950">簡易採算シミュレーション</h2><p className="mt-1 text-xs leading-6 text-cyan-900/70">初期値は比較用の仮定です。実際の請求額・稼働時間へ置き換えてください。</p></div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{fields.map((field) => <label key={field.key} className="rounded-2xl border border-cyan-200 bg-white p-3"><span className="block text-xs font-bold text-slate-700">{field.label}</span><span className="mt-2 flex items-center gap-2"><input type="number" min={field.min} max={field.max} value={inputs[field.key]} onChange={(event) => update(field.key, event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-right text-sm font-bold outline-none focus:border-cyan-600" /><span className="text-xs text-muted-foreground">{field.suffix}</span></span></label>)}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[['固定費の配分', result.fixedPerSale], ['解析費', result.analysis], ['対応人件費', result.support], ['1件あたり原価', result.baseCost]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-cyan-200 bg-white p-4"><p className="text-xs font-bold text-cyan-800">{label}</p><p className="mt-1 text-xl font-bold text-cyan-950">{yen(Number(value))}</p></div>)}
      <div className="rounded-2xl border border-violet-300 bg-violet-700 p-4 text-white"><p className="text-xs font-bold text-violet-100">最低価格の目安</p><p className="mt-1 text-2xl font-bold">{result.minimumPrice ? yen(result.minimumPrice) : '計算不可'}</p></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-6 text-cyan-950/70">税金、返金、広告費、想定を超える問い合わせなどは別途考慮してください。</p><button type="button" onClick={save} className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-800 px-4 text-xs font-bold text-white hover:bg-cyan-900"><Save className="size-4" />仮定を保存</button></div>{saved && <p className="mt-3 text-right text-xs font-bold text-emerald-700">この端末に保存しました。</p>}
  </section>;
}
