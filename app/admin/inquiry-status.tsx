'use client';

import { CheckCircle2, CircleDot, LoaderCircle, MailCheck } from 'lucide-react';
import { useState } from 'react';

const options = [
  {
    value: 'unread',
    label: '未対応',
    icon: CircleDot,
    style: 'border-red-200 bg-red-50 text-red-800',
  },
  {
    value: 'working',
    label: '対応中',
    icon: LoaderCircle,
    style: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  {
    value: 'replied',
    label: '返信済み',
    icon: MailCheck,
    style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
] as const;

type Status = (typeof options)[number]['value'];

export function InquiryStatus({
  inquiryId,
  initialStatus,
  initialUpdatedAt,
}: {
  inquiryId: string;
  initialStatus: string;
  initialUpdatedAt: string | null;
}) {
  const normalized = options.some((option) => option.value === initialStatus)
    ? (initialStatus as Status)
    : 'unread';
  const [status, setStatus] = useState<Status>(normalized);
  const [savedStatus, setSavedStatus] = useState<Status>(normalized);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(nextStatus: Status) {
    const previous = status;
    setStatus(nextStatus);
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: inquiryId, status: nextStatus }),
      });
      const data = (await response.json()) as {
        updated?: boolean;
        updatedAt?: string;
      };
      if (!response.ok || !data.updated) throw new Error('save_failed');
      setSavedStatus(nextStatus);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch {
      setStatus(previous);
      setError('保存できませんでした。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground">対応状況</p>
          {updatedAt && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              最終更新：{new Date(updatedAt).toLocaleString('ja-JP')}
            </p>
          )}
        </div>
        {saving ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            保存中
          </span>
        ) : status === savedStatus ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="size-4" />
            保存済み
          </span>
        ) : null}
      </div>
      <div
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label="対応状況を変更"
      >
        {options.map(({ value, label, icon: Icon, style }) => (
          <button
            key={value}
            type="button"
            disabled={saving}
            aria-pressed={status === value}
            onClick={() => status !== value && save(value)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${status === value ? style : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
