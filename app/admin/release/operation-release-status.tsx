'use client';

import { CheckCircle2, MessagesSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

const keys = ['send', 'receive', 'status', 'memo', 'reply', 'close', 'export'];
const storageKey = 'saitaku-admin-operation-test-v1';

export function OperationReleaseStatus() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(storageKey); if (stored) setChecked(JSON.parse(stored)); } catch { setChecked({}); } setLoaded(true); }, []);
  if (!loaded) return null;
  const done = keys.filter((key) => checked[key]).length;
  const complete = done === keys.length;
  return <section className={`mt-7 rounded-3xl border p-5 sm:p-6 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'}`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><MessagesSquare className={`mt-0.5 size-5 ${complete ? 'text-emerald-700' : 'text-blue-700'}`} /><div><h2 className="font-bold">お問い合わせ運用テスト</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">送信から返信済み・CSV保存までの動作確認です。</p></div></div><span className={`rounded-full border bg-white px-4 py-2 text-sm font-bold ${complete ? 'border-emerald-200 text-emerald-800' : 'border-blue-200 text-blue-800'}`}>{done} / {keys.length}項目</span></div>{complete && <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900"><CheckCircle2 className="size-5" />一連の問い合わせ対応を確認済みです。</p>}<a href="/admin/operations" className={`mt-4 inline-flex rounded-xl px-4 py-2 text-xs font-bold text-white ${complete ? 'bg-emerald-700' : 'bg-blue-700'}`}>{complete ? '記録を確認する' : '運用テストを始める'}</a></section>;
}
