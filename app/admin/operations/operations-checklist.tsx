'use client';

import { CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export const operationItems = [
  { key: 'send', title: 'テスト問い合わせを送信', note: '公開画面から、返信可能なテスト用メールアドレスで送信します。', href: '/contact', action: 'お問い合わせ画面を開く' },
  { key: 'receive', title: '管理画面への受付を確認', note: '送信内容、日時、種別が正しく表示されることを確認します。', href: '/admin', action: 'お問い合わせ管理を開く' },
  { key: 'status', title: '対応状況を変更', note: '未対応から対応中へ変更し、再読み込み後も保持されることを確認します。', href: '/admin', action: '管理画面で確認' },
  { key: 'memo', title: '管理メモを保存', note: '個人情報を必要以上に記載せず、引継ぎに必要な内容だけを保存します。', href: '/admin', action: '管理画面で確認' },
  { key: 'reply', title: '実際に返信', note: '案内内容、返信元、署名、回答時間が利用者にとって分かりやすいか確認します。', href: '/admin', action: '返信先を確認' },
  { key: 'close', title: '返信済みに変更', note: '返信後に完了状態へ変更し、一覧で判別できることを確認します。', href: '/admin', action: '管理画面で確認' },
  { key: 'export', title: 'CSVを保存して確認', note: '文字化けせず、表計算ソフトで安全に開けることを確認します。', href: '/admin', action: '管理画面で保存' },
] as const;

export const operationStorageKey = 'saitaku-admin-operation-test-v1';

export function OperationsChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(operationStorageKey);
      if (stored) setChecked(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      setChecked({});
    }
    setLoaded(true);
  }, []);

  function toggle(key: string) {
    setChecked((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(operationStorageKey, JSON.stringify(next));
      return next;
    });
  }

  if (!loaded) return null;
  const done = operationItems.filter((item) => checked[item.key]).length;

  return (
    <>
      <section className="mt-7 rounded-3xl border border-blue-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">運用テストの進捗</h2><p className="mt-1 text-xs text-muted-foreground">上から順に1件の問い合わせを最後まで処理します。</p></div><span className={`rounded-full border px-4 py-2 text-sm font-bold ${done === operationItems.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>{done} / {operationItems.length}項目 完了</span></div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.round((done / operationItems.length) * 100)}%` }} /></div>
      </section>

      <section className="mt-5 space-y-4" aria-label="問い合わせ運用テスト項目">
        {operationItems.map((item, index) => (
          <article key={item.key} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
            <button type="button" onClick={() => toggle(item.key)} aria-label={`${item.title}を${checked[item.key] ? '未完了' : '完了'}にする`} className="mt-0.5 shrink-0">{checked[item.key] ? <CheckCircle2 className="size-6 text-emerald-700" /> : <CircleDashed className="size-6 text-slate-400" />}</button>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-blue-700">手順{index + 1}</span><h2 className="font-bold">{item.title}</h2></div><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.note}</p><a href={item.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900">{item.action}<ExternalLink className="size-3.5" /></a></div>
          </article>
        ))}
      </section>

      {done === operationItems.length && <p className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-bold text-emerald-900">問い合わせ対応の一連の運用を確認できました。実際にかかった返信時間と、改善点を管理メモへ残してください。</p>}
    </>
  );
}
