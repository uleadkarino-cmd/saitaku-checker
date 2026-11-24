'use client';
import { CheckCircle2, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
const keys = ['provider', 'test', 'success', 'failure', 'duplicate', 'notice', 'refund', 'live'];
const storageKey = 'saitaku-admin-payment-readiness-v1';
export function PaymentReleaseStatus() {
  const [checked, setChecked] = useState<Record<string, boolean>>({}); const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(storageKey); if (stored) setChecked(JSON.parse(stored)); } catch { setChecked({}); } setLoaded(true); }, []);
  if (!loaded) return null; const done = keys.filter((key) => checked[key]).length; const complete = done === keys.length;
  return <section className={`mt-7 rounded-3xl border p-5 sm:p-6 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><WalletCards className={`mt-0.5 size-5 ${complete ? 'text-emerald-700' : 'text-amber-700'}`} /><div><h2 className="font-bold">決済導入</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">購入・利用権・例外処理・返金の準備状況です。</p></div></div><span className={`rounded-full border bg-white px-4 py-2 text-sm font-bold ${complete ? 'border-emerald-200 text-emerald-800' : 'border-amber-200 text-amber-900'}`}>{done} / {keys.length}項目</span></div>{complete && <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900"><CheckCircle2 className="size-5" />決済の主要確認を完了しています。</p>}<a href="/admin/payment" className={`mt-4 inline-flex rounded-xl px-4 py-2 text-xs font-bold text-white ${complete ? 'bg-emerald-700' : 'bg-amber-700'}`}>{complete ? '記録を確認する' : '決済準備を確認する'}</a></section>;
}
