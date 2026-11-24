'use client';

import { AlertTriangle, CheckCircle2, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';

type Gate = { label: string; href: string; complete: boolean; waiting?: boolean };
type QualityRecord = { status?: string; sampleCount?: number };

export function LaunchGate() {
  const [gates, setGates] = useState<Gate[]>([]);

  useEffect(() => {
    const read = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
    const quality = read('saitaku-quality-test-records-v1') as QualityRecord[];
    const decisions = (read('saitaku-admin-launch-decisions-v1') as { values?: Record<string, string> }).values || {};
    const legal = read('saitaku-admin-legal-progress-v1') as Record<string, boolean>;
    const operations = read('saitaku-admin-operation-test-v1') as Record<string, boolean>;
    const payment = read('saitaku-admin-payment-readiness-v1') as Record<string, boolean>;
    const domain = read('saitaku-admin-domain-readiness-v1') as { candidates?: string[]; selected?: number; checks?: Record<string, boolean> };
    const all = (values: Record<string, boolean>, keys: string[]) => keys.every((key) => values[key]);
    setGates([
      { label: '実書類の品質テスト', href: '/admin/quality', complete: Array.isArray(quality) && quality.filter((record) => record.status === 'passed' && Number(record.sampleCount) >= 3).length === 8 && !quality.some((record) => record.status === 'needs_work') },
      { label: '料金・運営者情報の決定', href: '/admin/decisions', complete: ['price', 'period', 'checks', 'refund', 'operator', 'representative', 'address', 'contact'].every((key) => decisions[key]?.trim()) },
      { label: '法務・専門家確認', href: '/admin/legal', complete: all(legal, ['terms_scope', 'terms_disclaimer', 'terms_rules', 'terms_expert', 'privacy_storage', 'privacy_purpose', 'privacy_external', 'privacy_expert', 'commerce_operator', 'commerce_payment', 'commerce_refund', 'commerce_expert']) },
      { label: 'お問い合わせ運用テスト', href: '/admin/operations', complete: all(operations, ['send', 'receive', 'status', 'memo', 'reply', 'close', 'export']) },
      { label: '決済導入と本番購入テスト', href: '/admin/payment', complete: all(payment, ['provider', 'test', 'success', 'failure', 'duplicate', 'notice', 'refund', 'live']) },
      { label: '本番ドメイン接続確認', href: '/admin/domain', complete: Boolean(domain.candidates?.[domain.selected || 0]?.trim()) && all(domain.checks || {}, ['purchased', 'dns', 'ssl', 'pages', 'forms']) },
      { label: '第20回の追加公式資料を反映', href: '/admin/sources', complete: false, waiting: true },
    ]);
  }, []);

  const incomplete = gates.filter((gate) => !gate.complete);
  return <section className="mt-7 space-y-4">
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"><h2 className="flex items-center gap-2 font-bold text-emerald-950"><CheckCircle2 className="size-5" />今できること：限定公開版の試用</h2><p className="mt-2 text-sm leading-7 text-emerald-900/75">ご自身と許可したテスト利用者による動作確認は可能です。無料チェック、文章入力、書類添付、お問い合わせ管理を試せます。</p><a href="/" className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">限定公開版を試す</a></div>
    <div className={`rounded-3xl border p-5 sm:p-6 ${incomplete.length === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <h2 className={`flex items-center gap-2 font-bold ${incomplete.length === 0 ? 'text-emerald-950' : 'text-amber-950'}`}>{incomplete.length === 0 ? <CheckCircle2 className="size-5" /> : <LockKeyhole className="size-5" />}一般公開・有料販売：{incomplete.length === 0 ? '公開可能' : 'まだ準備中'}</h2>
      {incomplete.length > 0 && <><p className="mt-2 text-sm leading-7 text-amber-950/75">次の{incomplete.length}項目が残っています。すべて完了してから公開範囲を変更します。</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{incomplete.map((gate) => <a key={gate.label} href={gate.href} className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white p-3 text-xs font-bold text-amber-950 hover:bg-amber-100"><span className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" />{gate.label}</span>{gate.waiting && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">公式公開待ち</span>}</a>)}</div></>}
    </div>
  </section>;
}
