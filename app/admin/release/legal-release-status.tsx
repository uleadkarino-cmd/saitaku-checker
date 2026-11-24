'use client';

import { CheckCircle2, FileCheck2, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

const allKeys = [
  'terms_scope', 'terms_disclaimer', 'terms_rules', 'terms_expert',
  'privacy_storage', 'privacy_purpose', 'privacy_external', 'privacy_expert',
  'commerce_operator', 'commerce_payment', 'commerce_refund', 'commerce_expert',
];
const expertKeys = ['terms_expert', 'privacy_expert', 'commerce_expert'];
const storageKey = 'saitaku-admin-legal-progress-v1';

export function LegalReleaseStatus() {
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

  if (!loaded) return null;
  const done = allKeys.filter((key) => checked[key]).length;
  const expertDone = expertKeys.filter((key) => checked[key]).length;
  const complete = done === allKeys.length && expertDone === expertKeys.length;

  return (
    <section className={`mt-7 rounded-3xl border p-5 sm:p-6 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileCheck2 className={`mt-0.5 size-5 shrink-0 ${complete ? 'text-emerald-700' : 'text-rose-700'}`} />
          <div><h2 className={`font-bold ${complete ? 'text-emerald-950' : 'text-rose-950'}`}>法務確認の進捗</h2><p className={`mt-1 text-xs leading-6 ${complete ? 'text-emerald-900/70' : 'text-rose-900/70'}`}>利用規約・プライバシー・特定商取引法表記の確認状況です。</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border bg-white px-4 py-2 text-sm font-bold ${complete ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'}`}>{done} / {allKeys.length}項目</span>
          <span className={`rounded-full border bg-white px-4 py-2 text-sm font-bold ${expertDone === expertKeys.length ? 'border-emerald-200 text-emerald-800' : 'border-amber-200 text-amber-900'}`}>専門家確認 {expertDone} / {expertKeys.length}</span>
        </div>
      </div>

      {complete ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900"><CheckCircle2 className="size-5" />法務確認の記録が揃いました。最終文面へ反映済みか照合してください。</p>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-white p-4 text-sm leading-6 text-rose-950"><ShieldAlert className="mt-0.5 size-5 shrink-0" />残り{allKeys.length - done}項目、うち専門家確認は残り{expertKeys.length - expertDone}件です。すべて完了するまで一般公開の法務準備は未完了です。</p>
      )}
      <a href="/admin/legal" className={`mt-4 inline-flex rounded-xl px-4 py-2 text-xs font-bold text-white ${complete ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'}`}>法務確認リストを開く</a>
    </section>
  );
}
