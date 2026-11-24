'use client';

import { CheckCircle2, CircleDashed, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

const fields = [
  ['price', '有料版の価格'],
  ['period', '利用期間'],
  ['checks', 'チェック回数'],
  ['refund', '返金条件'],
  ['operator', '事業者名または氏名'],
  ['representative', '代表者名'],
  ['address', '所在地'],
  ['contact', '連絡先'],
] as const;

const storageKey = 'saitaku-admin-launch-decisions-v1';

export function DecisionReleaseStatus() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setValues((JSON.parse(stored) as { values?: Record<string, string> }).values || {});
    } catch {
      setValues({});
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  const missing = fields.filter(([key]) => !values[key]?.trim());
  const decided = fields.length - missing.length;
  const complete = missing.length === 0;

  return (
    <section className={`mt-7 rounded-3xl border p-5 sm:p-6 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-violet-200 bg-violet-50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ClipboardList className={`mt-0.5 size-5 shrink-0 ${complete ? 'text-emerald-700' : 'text-violet-700'}`} />
          <div><h2 className={`font-bold ${complete ? 'text-emerald-950' : 'text-violet-950'}`}>公開前の決定事項</h2><p className={`mt-1 text-xs leading-6 ${complete ? 'text-emerald-900/70' : 'text-violet-900/70'}`}>料金・販売条件・運営者情報の入力状況です。</p></div>
        </div>
        <div className={`rounded-full border bg-white px-4 py-2 text-sm font-bold ${complete ? 'border-emerald-200 text-emerald-800' : 'border-violet-200 text-violet-800'}`}>{decided} / {fields.length}件 決定済み</div>
      </div>

      {complete ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900"><CheckCircle2 className="size-5" />必要な基本情報が揃いました。法務文書と販売画面へ正式反映してください。</p>
      ) : (
        <div className="mt-4 rounded-2xl border border-violet-200 bg-white p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-violet-950"><CircleDashed className="size-4" />未決定の項目</p>
          <p className="mt-2 text-xs leading-6 text-violet-900/70">{missing.map(([, label]) => label).join('、')}</p>
        </div>
      )}
      <a href="/admin/decisions" className={`mt-4 inline-flex rounded-xl px-4 py-2 text-xs font-bold text-white ${complete ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-violet-700 hover:bg-violet-800'}`}>{complete ? '決定内容を確認する' : '未決定事項を入力する'}</a>
    </section>
  );
}
