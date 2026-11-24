'use client';

import { CheckCircle2, CircleDashed, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const fields = [
  { key: 'price', group: '料金', label: '有料版の価格（税込）', placeholder: '例：4,980円' },
  { key: 'period', group: '料金', label: '利用できる期間', placeholder: '例：購入日から30日間' },
  { key: 'checks', group: '料金', label: '有料版のチェック回数', placeholder: '例：1申請につき30回' },
  { key: 'refund', group: '販売条件', label: 'キャンセル・返金条件', placeholder: '例：解析開始後は返金不可' },
  { key: 'operator', group: '運営者情報', label: '事業者名または氏名', placeholder: '特定商取引法表記に掲載する名称' },
  { key: 'representative', group: '運営者情報', label: '代表者名', placeholder: '法人の場合に入力' },
  { key: 'address', group: '運営者情報', label: '所在地', placeholder: '請求があった場合に遅滞なく開示する場合は、その方針も確認' },
  { key: 'contact', group: '運営者情報', label: '連絡先', placeholder: '公開用のメールアドレスまたは電話番号' },
] as const;

type Values = Record<(typeof fields)[number]['key'], string>;
const emptyValues = Object.fromEntries(fields.map((field) => [field.key, ''])) as Values;
const storageKey = 'saitaku-admin-launch-decisions-v1';

export function DecisionManager() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [savedAt, setSavedAt] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { values?: Partial<Values>; savedAt?: string };
        setValues({ ...emptyValues, ...parsed.values });
        setSavedAt(parsed.savedAt || '');
      }
    } catch {
      // 読み取れない保存データは使わず、安全に空欄から始めます。
    }
    setLoaded(true);
  }, []);

  const decided = useMemo(() => fields.filter((field) => values[field.key].trim()).length, [values]);

  function save() {
    const now = new Date().toLocaleString('ja-JP');
    localStorage.setItem(storageKey, JSON.stringify({ values, savedAt: now }));
    setSavedAt(now);
  }

  if (!loaded) return <p className="mt-7 text-sm text-muted-foreground">保存内容を確認しています…</p>;

  return (
    <>
      <section className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-200 bg-white p-4"><p className="text-xs font-bold text-indigo-700">決定済み</p><p className="mt-1 text-2xl font-bold text-indigo-950">{decided} / {fields.length}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="text-xs font-bold text-amber-700">未決定</p><p className="mt-1 text-2xl font-bold text-amber-950">{fields.length - decided}項目</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-600">保存場所</p><p className="mt-1 text-sm font-bold text-slate-900">この端末のブラウザ内</p></div>
      </section>

      <section className="mt-7 space-y-6">
        {['料金', '販売条件', '運営者情報'].map((group) => (
          <div key={group} className="rounded-3xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">{group}</h2>
            <div className="mt-4 space-y-4">
              {fields.filter((field) => field.group === group).map((field) => {
                const complete = Boolean(values[field.key].trim());
                return (
                  <label key={field.key} className="block rounded-2xl border border-slate-200 p-4">
                    <span className="flex items-center gap-2 text-sm font-bold">{complete ? <CheckCircle2 className="size-4 text-emerald-700" /> : <CircleDashed className="size-4 text-amber-700" />}{field.label}</span>
                    <input value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} className="mt-3 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-4 mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-lg">
        <p className="text-xs text-indigo-950/70">{savedAt ? `最終保存：${savedAt}` : 'まだ保存されていません'}</p>
        <button type="button" onClick={save} className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-bold text-white hover:bg-indigo-800"><Save className="size-4" />この端末に保存</button>
      </div>
    </>
  );
}
