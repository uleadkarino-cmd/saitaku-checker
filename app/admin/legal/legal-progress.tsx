'use client';

import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const items = [
  { key: 'terms_scope', document: '利用規約', label: '提供範囲と実際の機能が一致' },
  { key: 'terms_disclaimer', document: '利用規約', label: '非保証・免責の内容を確認' },
  { key: 'terms_rules', document: '利用規約', label: '禁止事項・利用停止条件を確認' },
  { key: 'terms_expert', document: '利用規約', label: '専門家の確認が完了' },
  { key: 'privacy_storage', document: 'プライバシー', label: '保存範囲・保存期間を確認' },
  { key: 'privacy_purpose', document: 'プライバシー', label: '利用目的・削除方法を確認' },
  { key: 'privacy_external', document: 'プライバシー', label: '外部送信先・委託先を確認' },
  { key: 'privacy_expert', document: 'プライバシー', label: '専門家の確認が完了' },
  { key: 'commerce_operator', document: '特定商取引法表記', label: '販売事業者・連絡先を確定' },
  { key: 'commerce_payment', document: '特定商取引法表記', label: '価格・支払・提供時期を確定' },
  { key: 'commerce_refund', document: '特定商取引法表記', label: '返金・不具合対応を確定' },
  { key: 'commerce_expert', document: '特定商取引法表記', label: '専門家の確認が完了' },
] as const;

const storageKey = 'saitaku-admin-legal-progress-v1';

export function LegalProgress() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setChecked(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      setChecked({});
    }
    setLoaded(true);
  }, []);

  const done = useMemo(() => items.filter((item) => checked[item.key]).length, [checked]);

  function toggle(key: string) {
    setChecked((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  if (!loaded) return null;

  return (
    <section className="mt-7 rounded-3xl border border-rose-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold">法務確認の進捗</h2><p className="mt-1 text-xs text-muted-foreground">チェックはこの端末に自保存されます。</p></div>
        <span className={`rounded-full border px-4 py-2 text-sm font-bold ${done === items.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{done} / {items.length}項目 完了</span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-rose-600 transition-all" style={{ width: `${Math.round((done / items.length) * 100)}%` }} /></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {['利用規約', 'プライバシー', '特定商取引法表記'].map((document) => (
          <div key={document} className="rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold">{document}</h3>
            <div className="mt-3 space-y-2">
              {items.filter((item) => item.document === document).map((item) => (
                <label key={item.key} className="flex cursor-pointer items-start gap-2 rounded-xl p-2 text-xs leading-5 hover:bg-slate-50">
                  <input type="checkbox" checked={Boolean(checked[item.key])} onChange={() => toggle(item.key)} className="sr-only" />
                  {checked[item.key] ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-400" />}
                  <span className={checked[item.key] ? 'font-bold text-emerald-900' : 'text-slate-700'}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {done === items.length && <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">法務確認12項目が完了しました。公開する最終文面に修正が反映されているか、もう一度照合してください。</p>}
    </section>
  );
}
