'use client';

import { useEffect, useState } from 'react';

type QualityRecord = { status?: string; sampleCount?: number };

export function OverallReleaseProgress() {
  const [progress, setProgress] = useState(59);
  const [completed, setCompleted] = useState(10);

  useEffect(() => {
    let extra = 0;
    try {
      const quality = JSON.parse(localStorage.getItem('saitaku-quality-test-records-v1') || '[]') as QualityRecord[];
      if (Array.isArray(quality) && quality.filter((record) => record.status === 'passed' && Number(record.sampleCount) >= 3).length === 8 && !quality.some((record) => record.status === 'needs_work')) extra += 1;
      const decisions = (JSON.parse(localStorage.getItem('saitaku-admin-launch-decisions-v1') || '{}') as { values?: Record<string, string> }).values || {};
      if (['price', 'period', 'checks', 'refund', 'operator', 'representative', 'address', 'contact'].every((key) => decisions[key]?.trim())) extra += 1;
      const legal = JSON.parse(localStorage.getItem('saitaku-admin-legal-progress-v1') || '{}') as Record<string, boolean>;
      if (['terms_scope', 'terms_disclaimer', 'terms_rules', 'terms_expert', 'privacy_storage', 'privacy_purpose', 'privacy_external', 'privacy_expert', 'commerce_operator', 'commerce_payment', 'commerce_refund', 'commerce_expert'].every((key) => legal[key])) extra += 1;
      const operations = JSON.parse(localStorage.getItem('saitaku-admin-operation-test-v1') || '{}') as Record<string, boolean>;
      if (['send', 'receive', 'status', 'memo', 'reply', 'close', 'export'].every((key) => operations[key])) extra += 1;
      const payment = JSON.parse(localStorage.getItem('saitaku-admin-payment-readiness-v1') || '{}') as Record<string, boolean>;
      if (['provider', 'test', 'success', 'failure', 'duplicate', 'notice', 'refund', 'live'].every((key) => payment[key])) extra += 1;
      const domain = JSON.parse(localStorage.getItem('saitaku-admin-domain-readiness-v1') || '{}') as { candidates?: string[]; selected?: number; checks?: Record<string, boolean> };
      const selectedDomain = domain.candidates?.[domain.selected || 0]?.trim();
      if (selectedDomain && ['purchased', 'dns', 'ssl', 'pages', 'forms'].every((key) => domain.checks?.[key])) extra += 1;
    } catch { extra = 0; }
    const nextCompleted = 10 + extra;
    setCompleted(nextCompleted);
    setProgress(Math.round((nextCompleted / 17) * 100));
  }, []);

  return <div className="min-w-72">
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-center"><div className="text-3xl font-bold text-emerald-700">85%</div><div className="mt-1 text-[11px] font-bold text-muted-foreground">ベータ機能</div></div>
      <div className="rounded-2xl border border-indigo-200 bg-white px-5 py-4 text-center"><div className="text-3xl font-bold text-indigo-800">{progress}%</div><div className="mt-1 text-[11px] font-bold text-muted-foreground">一般公開準備</div></div>
    </div>
    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>
    <p className="mt-2 text-[11px] leading-5 text-indigo-900/65">全17項目のうち{completed}項目が完了です。端末内の進捗記録を反映しています。</p>
  </div>;
}
