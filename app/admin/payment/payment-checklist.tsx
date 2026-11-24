'use client';

import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useEffect, useState } from 'react';

export const paymentItems = [
  { key: 'provider', phase: '準備', title: '決済サービスを決定', note: '手数料、入金周期、返金方法、本人確認、対応する支払方法を比較します。' },
  { key: 'test', phase: '実装', title: 'テスト環境で購入できる', note: '実際の請求を発生させず、購入開始から完了まで確認します。' },
  { key: 'success', phase: '実装', title: '購入完了後に利用権を付与', note: '購入した期間・回数だけ有料機能を使える状態にします。' },
  { key: 'failure', phase: '例外', title: '支払い失敗を案内', note: 'カードエラーや操作中断時に、利用権を付けず再試行方法を表示します。' },
  { key: 'duplicate', phase: '安全', title: '二重決済を防止', note: '連続クリックや再読み込みでも、同じ購入を二重処理しないよう確認します。' },
  { key: 'notice', phase: '通知', title: '購入内容を利用者へ通知', note: '金額、プラン、利用期限、問い合わせ先を確認できるようにします。' },
  { key: 'refund', phase: '運用', title: '返金・取消時の処理を確認', note: '返金後の利用権、回数、管理記録が矛盾しないことを確認します。' },
  { key: 'live', phase: '最後', title: '本番環境で少額購入を確認', note: '公開直前に、実決済・通知・利用権・管理画面を1件通して確認します。' },
] as const;

export const paymentStorageKey = 'saitaku-admin-payment-readiness-v1';

export function PaymentChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(paymentStorageKey); if (stored) setChecked(JSON.parse(stored)); } catch { setChecked({}); } setLoaded(true); }, []);
  function toggle(key: string) { setChecked((current) => { const next = { ...current, [key]: !current[key] }; localStorage.setItem(paymentStorageKey, JSON.stringify(next)); return next; }); }
  if (!loaded) return null;
  const done = paymentItems.filter((item) => checked[item.key]).length;
  return <>
    <section className="mt-7 rounded-3xl border border-amber-200 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">決済準備の進捗</h2><p className="mt-1 text-xs text-muted-foreground">チェックは実装・確認が本当に終わった後に付けてください。</p></div><span className={`rounded-full border px-4 py-2 text-sm font-bold ${done === paymentItems.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{done} / {paymentItems.length}項目 完了</span></div><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-amber-100"><div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.round((done / paymentItems.length) * 100)}%` }} /></div></section>
    <section className="mt-5 space-y-4">{paymentItems.map((item, index) => <article key={item.key} className="flex gap-4 rounded-2xl border border-border bg-white p-5"><button type="button" onClick={() => toggle(item.key)} aria-label={`${item.title}を${checked[item.key] ? '未完了' : '完了'}にする`} className="mt-0.5 shrink-0">{checked[item.key] ? <CheckCircle2 className="size-6 text-emerald-700" /> : <CircleDashed className="size-6 text-slate-400" />}</button><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">{item.phase}</span><span className="text-xs font-bold text-muted-foreground">{index + 1}</span><h2 className="font-bold">{item.title}</h2></div><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.note}</p></div></article>)}</section>
    {done === paymentItems.length && <p className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-bold text-emerald-900">決済の主要な動作確認が完了しました。法務文書と利用者向け料金表示が同じ条件になっているか最終照合してください。</p>}
  </>;
}
