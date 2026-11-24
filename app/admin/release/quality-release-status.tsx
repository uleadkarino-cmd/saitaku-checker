'use client';

import { CheckCircle2, ClipboardCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

type TestRecord = { status?: 'untested' | 'passed' | 'needs_work'; sampleCount?: number };

const storageKey = 'saitaku-quality-test-records-v1';
const totalTests = 8;

export function QualityReleaseStatus() {
  const [passed, setPassed] = useState(0);
  const [needsWork, setNeedsWork] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]') as TestRecord[];
      if (Array.isArray(parsed)) {
        setPassed(parsed.filter((record) => record.status === 'passed' && Number(record.sampleCount) >= 3).length);
        setNeedsWork(parsed.filter((record) => record.status === 'needs_work').length);
      }
    } catch {
      setPassed(0);
      setNeedsWork(0);
    }
    setLoaded(true);
  }, []);

  const complete = passed === totalTests && needsWork === 0;

  return (
    <section className={`mt-7 rounded-3xl border p-5 sm:p-6 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'}`} aria-label="品質テストの公開準備への反映">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {complete ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" /> : <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />}
          <div>
            <h2 className={`font-bold ${complete ? 'text-emerald-950' : 'text-blue-950'}`}>実書類テストの反映状況</h2>
            <p className={`mt-1 text-sm leading-7 ${complete ? 'text-emerald-900/75' : 'text-blue-900/75'}`}>
              {!loaded
                ? 'この端末に保存された品質テスト結果を確認しています。'
                : complete
                  ? '8項目すべてを3事業者以上で確認し、合格しました。「実書類による読み取り精度確認」を完了として数えられます。'
                  : `3事業者以上で合格 ${passed}/8件・要改善 ${needsWork}件です。すべての項目が条件を満たすまで、この公開条件は「要確認」のままです。`}
            </p>
          </div>
        </div>
        <div className={`rounded-2xl border bg-white px-5 py-3 text-center ${complete ? 'border-emerald-200 text-emerald-950' : 'border-blue-200 text-blue-950'}`}>
          <strong className="text-sm">{complete ? '条件達成' : '要確認'}</strong>
          <span className="mt-1 block text-[11px] font-bold">公開準備への反映</span>
        </div>
      </div>
      {needsWork > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-6 text-rose-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />要改善の項目を修正し、同じ条件でもう一度テストしてから合格へ変更してください。
        </p>
      )}
      <a href="/admin/quality" className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold text-white ${complete ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'}`}>
        品質テストを確認する
      </a>
    </section>
  );
}
