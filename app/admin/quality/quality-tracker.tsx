'use client';

import { ArrowRight, CheckCircle2, CircleDashed, Download, FileSearch, RotateCcw, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type TestCase = {
  area: string;
  title: string;
  input: string;
  pass: string;
  target: 'plan' | 'expense' | 'documents' | 'safe-mode';
};

type TestStatus = 'untested' | 'passed' | 'needs_work';
type TestRecord = { status: TestStatus; note: string; sampleCount: number; updatedAt?: string };

const storageKey = 'saitaku-quality-test-records-v1';

const statusOptions: Array<{ value: TestStatus; label: string }> = [
  { value: 'untested', label: '未確認' },
  { value: 'passed', label: '合格' },
  { value: 'needs_work', label: '要改善' },
];

function emptyRecords(count: number): TestRecord[] {
  return Array.from({ length: count }, () => ({ status: 'untested', note: '', sampleCount: 0 }));
}

export function QualityTracker({ testCases }: { testCases: TestCase[] }) {
  const [records, setRecords] = useState<TestRecord[]>(() => emptyRecords(testCases.length));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as TestRecord[];
        if (Array.isArray(parsed)) {
          setRecords(testCases.map((_, index) => ({
            status: parsed[index]?.status || 'untested',
            note: parsed[index]?.note || '',
            sampleCount: Math.min(3, Math.max(0, Number(parsed[index]?.sampleCount) || 0)),
            updatedAt: parsed[index]?.updatedAt,
          })));
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    setLoaded(true);
  }, [testCases]);

  useEffect(() => {
    if (loaded) localStorage.setItem(storageKey, JSON.stringify(records));
  }, [loaded, records]);

  const counts = useMemo(
    () => ({
      passed: records.filter((record) => record.status === 'passed' && record.sampleCount >= 3).length,
      needsWork: records.filter((record) => record.status === 'needs_work').length,
      untested: records.filter((record) => record.status !== 'needs_work' && !(record.status === 'passed' && record.sampleCount >= 3)).length,
    }),
    [records],
  );
  const nextTestIndex = useMemo(() => {
    const needsWorkIndex = records.findIndex((record) => record.status === 'needs_work');
    if (needsWorkIndex >= 0) return needsWorkIndex;
    return records.findIndex((record) => !(record.status === 'passed' && record.sampleCount >= 3));
  }, [records]);

  function updateRecord(index: number, patch: Partial<TestRecord>) {
    setRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index
          ? { ...record, ...patch, updatedAt: new Date().toISOString() }
          : record,
      ),
    );
  }

  function resetRecords() {
    if (!window.confirm('8件すべての確認状況とメモを未確認に戻しますか？')) return;
    setRecords(emptyRecords(testCases.length));
  }

  function exportCsv() {
    const escapeCell = (value: unknown) => {
      let text = String(value ?? '').replace(/\r?\n/g, ' ');
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [
      ['番号', '分野', 'テスト項目', '判定', '確認した事業者数', '確認メモ', '最終更新日時'],
      ...testCases.map((test, index) => {
        const record = records[index] || { status: 'untested', note: '', sampleCount: 0 };
        const validated = record.status === 'passed' && record.sampleCount >= 3;
        const status = validated
          ? '合格'
          : record.status === 'needs_work'
            ? '要改善'
            : record.status === 'passed'
              ? '追加確認中'
              : '未確認';
        const updatedAt = record.updatedAt
          ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.updatedAt))
          : '';
        return [index + 1, test.area, test.title, status, record.sampleCount >= 3 ? '3以上' : record.sampleCount, record.note, updatedAt];
      }),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('/', '-');
    link.href = url;
    link.download = `テスト_品質テスト記録_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function reportNeedsWork(index: number) {
    const test = testCases[index];
    const record = records[index];
    localStorage.setItem(
      'saitaku-quality-feedback-draft',
      JSON.stringify({
        number: index + 1,
        area: test.area.slice(0, 40),
        title: test.title.slice(0, 120),
        status: record.status,
        sampleCount: Math.min(3, Math.max(0, record.sampleCount || 0)),
        note: record.note.slice(0, 500),
      }),
    );
    window.location.href = '/contact?subject=quality-feedback';
  }

  return (
    <>
      <section className="mt-7 grid gap-3 sm:grid-cols-4" aria-label="品質テスト進捗">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">全項目</p><p className="mt-1 text-2xl font-bold">{testCases.length}件</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">合格</p><p className="mt-1 text-2xl font-bold text-emerald-950">{counts.passed}件</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-xs font-bold text-rose-700">要改善</p><p className="mt-1 text-2xl font-bold text-rose-950">{counts.needsWork}件</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">未確認</p><p className="mt-1 text-2xl font-bold text-amber-950">{counts.untested}件</p></div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>記録はこの端末のブラウザ内だけに保存され、書類本文は保存しません。</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-3 py-2 font-bold text-white hover:bg-blue-800">
            <Download className="size-3.5" />記録をCSV保存
          </button>
          <button type="button" onClick={resetRecords} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 font-bold hover:bg-slate-50">
            <RotateCcw className="size-3.5" />記録をリセット
          </button>
        </div>
      </div>

      <section className={`mt-4 rounded-2xl border p-4 text-sm leading-7 ${counts.passed === testCases.length && counts.needsWork === 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-blue-200 bg-blue-50 text-blue-950'}`}>
        <strong>{counts.passed === testCases.length && counts.needsWork === 0 ? '品質確認は完了です' : `公開条件の完了まで、あと${testCases.length - counts.passed}件の合格が必要です`}</strong>
        <p className="mt-1 text-xs opacity-75">8項目すべてが合格になると、公開準備画面の「実書類による読み取り精度確認」が完了として反映されます。</p>
        <a href="/admin/release" className="mt-2 inline-flex font-bold underline underline-offset-4">公開準備への反映を見る</a>
      </section>

      {loaded && nextTestIndex >= 0 && (
        <section className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4" aria-label="次に確認する品質テスト">
          <div>
            <p className="text-xs font-bold text-violet-700">次に確認する項目 {nextTestIndex + 1} / {testCases.length}</p>
            <h2 className="mt-1 font-bold text-violet-950">{testCases[nextTestIndex].title}</h2>
            <p className="mt-1 text-xs leading-6 text-violet-900/70">
              {records[nextTestIndex]?.status === 'needs_work'
                ? '要改善の項目を優先しています。修正後、同じ条件でもう一度確認してください。'
                : records[nextTestIndex]?.status === 'passed'
                  ? `現在${records[nextTestIndex]?.sampleCount || 0}事業者で確認済みです。3事業者に達するまで追加確認します。`
                  : 'まだ確認していない項目です。匿名化した実例でテストを始めてください。'}
            </p>
          </div>
          <a
            href={`/?qualityTest=${testCases[nextTestIndex].target}&qualityCase=${nextTestIndex + 1}#quality-${testCases[nextTestIndex].target}`}
            className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-full bg-violet-700 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800 sm:mt-0"
          >
            次のテストを始める <ArrowRight className="size-3.5" />
          </a>
        </section>
      )}

      {loaded && nextTestIndex < 0 && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-5" />すべての品質テストが完了しました</p>
          <p className="mt-1 text-xs leading-6 text-emerald-900/75">CSVを保存し、公開準備画面で反映結果を確認してください。</p>
        </section>
      )}

      <section className="mt-7 space-y-4" aria-label="品質テスト一覧">
        {testCases.map((test, index) => {
          const record = records[index] || { status: 'untested', note: '', sampleCount: 0 };
          const isValidated = record.status === 'passed' && record.sampleCount >= 3;
          const badgeClass = isValidated
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : record.status === 'needs_work'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-amber-200 bg-amber-50 text-amber-800';
          return (
            <article id={`quality-test-${index + 1}`} key={test.title} className="scroll-mt-6 rounded-2xl border border-border bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{test.area}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}>
                      {record.status === 'passed' && !isValidated ? `追加確認中（${record.sampleCount}/3）` : statusOptions.find((option) => option.value === record.status)?.label}
                    </span>
                  </div>
                  <h2 className="mt-3 font-bold">{test.title}</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-xs leading-6"><strong className="flex items-center gap-2"><FileSearch className="size-4" />テストする内容</strong><p className="mt-1 text-muted-foreground">{test.input}</p></div>
                    <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-950"><strong className="flex items-center gap-2"><CheckCircle2 className="size-4" />合格条件</strong><p className="mt-1 text-emerald-900/75">{test.pass}</p></div>
                  </div>
                  <a
                    href={`/?qualityTest=${test.target}&qualityCase=${index + 1}#quality-${test.target}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:border-blue-300 hover:bg-blue-100"
                  >
                    このテストを実行する <ArrowRight className="size-3.5" />
                  </a>
                  <div className="mt-4">
                    <p className="text-xs font-bold">確認結果</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateRecord(index, { status: option.value })}
                          aria-pressed={record.status === option.value}
                          className={`rounded-full border px-3 py-2 text-xs font-bold transition ${record.status === option.value ? 'border-blue-700 bg-blue-700 text-white' : 'border-border bg-white hover:border-blue-300 hover:bg-blue-50'}`}
                        >
                          {option.value === 'passed' && <CheckCircle2 className="mr-1 inline size-3.5" />}
                          {option.value === 'needs_work' && <TriangleAlert className="mr-1 inline size-3.5" />}
                          {option.value === 'untested' && <CircleDashed className="mr-1 inline size-3.5" />}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <label className="text-xs font-bold text-blue-950" htmlFor={`quality-samples-${index}`}>確認した事業者数</label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <select
                        id={`quality-samples-${index}`}
                        value={record.sampleCount}
                        onChange={(event) => updateRecord(index, { sampleCount: Number(event.target.value) })}
                        className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value={0}>0事業者</option>
                        <option value={1}>1事業者</option>
                        <option value={2}>2事業者</option>
                        <option value={3}>3事業者以上</option>
                      </select>
                      <p className="text-xs leading-6 text-blue-900/70">同じ項目を異なる3事業者で確認すると、合格として公開準備へ反映されます。</p>
                    </div>
                  </div>
                  <label className="mt-4 block text-xs font-bold" htmlFor={`quality-note-${index}`}>確認メモ（個人情報や書類本文は記入しない）</label>
                  <textarea
                    id={`quality-note-${index}`}
                    value={record.note}
                    onChange={(event) => updateRecord(index, { note: event.target.value.slice(0, 500) })}
                    rows={3}
                    maxLength={500}
                    placeholder="例：出典は正しく検出。URL表記だけ誤判定したため要調整。"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">{record.note.length} / 500文字</p>
                  {record.status === 'needs_work' && (
                    <button
                      type="button"
                      onClick={() => reportNeedsWork(index)}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 hover:border-rose-300 hover:bg-rose-100"
                    >
                      この要改善を修正依頼として送る <ArrowRight className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
