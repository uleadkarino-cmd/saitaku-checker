'use client';

import { CheckCircle2, LoaderCircle, NotebookPen } from 'lucide-react';
import { useState } from 'react';

export function InquiryMemo({
  inquiryId,
  initialMemo,
  initialUpdatedAt,
}: {
  inquiryId: string;
  initialMemo: string;
  initialUpdatedAt: string | null;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [savedMemo, setSavedMemo] = useState(initialMemo);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const changed = memo !== savedMemo;

  async function saveMemo() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: inquiryId, memo }),
      });
      const data = (await response.json()) as {
        updated?: boolean;
        updatedAt?: string;
      };
      if (!response.ok || !data.updated) throw new Error('save_failed');
      setSavedMemo(memo);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch {
      setError('メモを保存できませんでした。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-sky-950">
          <NotebookPen className="size-4" />
          運営者メモ
        </div>
        {updatedAt && (
          <span className="text-[11px] text-sky-900/65">
            最終更新：{new Date(updatedAt).toLocaleString('ja-JP')}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-sky-900/65">
        返信予定や確認事項を記録できます。この内容は利用者には表示されません。
      </p>
      <textarea
        value={memo}
        maxLength={2000}
        rows={3}
        onChange={(event) => setMemo(event.target.value)}
        placeholder="例：9月5日までに返信予定。料金プランの案内を希望。"
        className="mt-3 w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-sky-900/60">
          {memo.length} / 2,000文字
        </span>
        <div className="flex items-center gap-3">
          {!changed && savedMemo && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-4" />
              保存済み
            </span>
          )}
          <button
            type="button"
            disabled={!changed || saving}
            onClick={saveMemo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-800 px-4 text-xs font-bold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            {saving ? '保存中' : 'メモを保存'}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
