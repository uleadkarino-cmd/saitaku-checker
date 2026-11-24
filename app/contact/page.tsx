'use client';

import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [category, setCategory] = useState('操作方法について');
  const [diagnosticsAllowed, setDiagnosticsAllowed] = useState(false);
  const [deviceSummary, setDeviceSummary] = useState('確認中');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paidFeatures, setPaidFeatures] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentReference, setSentReference] = useState('');
  const [sendError, setSendError] = useState('');
  const [resultReportPrefilled, setResultReportPrefilled] = useState(false);

  useEffect(() => {
    setDeviceSummary(
      `${navigator.platform || '不明なOS'} / ${navigator.userAgent}`,
    );
    const params = new URLSearchParams(window.location.search);
    if (params.get('subject') === 'paid-plan') {
      setCategory('料金・購入について');
    }
    if (params.get('subject') === 'result-feedback') {
      const item = (params.get('item') || '項目名を確認できませんでした').slice(
        0,
        120,
      );
      const status = (params.get('status') || '判定不明').slice(0, 30);
      setCategory('チェック結果について');
      setMessage(
        `判定項目：${item}\n表示された判定：${status}\n\n実際の内容と異なる点：\n`,
      );
      setResultReportPrefilled(true);
    }
    if (params.get('subject') === 'quality-feedback') {
      try {
        const raw = localStorage.getItem('saitaku-quality-feedback-draft');
        const draft = raw ? JSON.parse(raw) as {
          number?: number;
          area?: string;
          title?: string;
          sampleCount?: number;
          note?: string;
        } : null;
        if (draft) {
          setCategory('チェック結果について');
          setMessage(
            [
              `品質テスト：${draft.number || '-'} / 8`,
              `分野：${String(draft.area || '').slice(0, 40)}`,
              `テスト項目：${String(draft.title || '').slice(0, 120)}`,
              `確認した事業者数：${Math.min(3, Math.max(0, Number(draft.sampleCount) || 0))}${Number(draft.sampleCount) >= 3 ? '以上' : ''}`,
              '',
              '確認メモ：',
              String(draft.note || '').slice(0, 500) || '（未入力）',
              '',
              '希望する修正：',
            ].join('\n'),
          );
          setResultReportPrefilled(true);
        }
        localStorage.removeItem('saitaku-quality-feedback-draft');
      } catch {
        localStorage.removeItem('saitaku-quality-feedback-draft');
      }
    }
  }, []);

  const isBugReport = category === '不具合の報告';
  const isPaidPlan = category === '料金・購入について';
  const paidFeatureOptions = [
    '書類間の整合性チェック',
    '詳しい改善アドバイス',
    '結果レポートのPDF保存',
    'チェック回数の追加',
  ];

  const submitInquiry = async () => {
    setSending(true);
    setSendError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          replyEmail: email,
          category,
          paidFeatures: isPaidPlan ? paidFeatures : [],
          message,
          diagnostics: isBugReport && diagnosticsAllowed ? deviceSummary : null,
        }),
      });
      const data = (await response.json()) as {
        accepted?: boolean;
        reference?: string;
        error?: string;
      };
      if (!response.ok || !data.accepted)
        throw new Error(data.error || 'send_failed');
      setSentReference(data.reference || '受付済み');
      setReviewing(false);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '';
      setSendError(
        reason === 'too_many_requests'
          ? '短時間に送信できる件数を超えました。時間を置いてからお試しください。'
          : reason === 'signin_required'
            ? '送信するにはログインしてください。'
            : '送信できませんでした。通信状態を確認して、もう一度お試しください。',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          補助金チェックに戻る
        </a>
        <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_rgb(52_64_58/6%)] sm:p-9">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">お問い合わせ</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            操作方法やチェック結果についてご連絡ください。正式版では受付後に確認メールをお送りします。
          </p>
          {resultReportPrefilled && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-6 text-blue-950">
              選択した判定または品質テストの内容を入力しました。必要な説明だけを追記してください。申請書本文や個人情報は入力しないでください。
            </div>
          )}
          <div className="mt-7 space-y-5">
            <label className="block text-sm font-bold">
              お問い合わせ種別
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option>操作方法について</option>
                <option>チェック結果について</option>
                <option>料金・購入について</option>
                <option>不具合の報告</option>
                <option>その他</option>
              </select>
            </label>
            {isPaidPlan && (
              <fieldset className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <legend className="px-1 text-sm font-bold text-amber-950">
                  有料版で使いたい機能（複数選択可）
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {paidFeatureOptions.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-5 text-amber-950"
                    >
                      <input
                        type="checkbox"
                        checked={paidFeatures.includes(feature)}
                        onChange={() =>
                          setPaidFeatures((current) =>
                            current.includes(feature)
                              ? current.filter((item) => item !== feature)
                              : [...current, feature],
                          )
                        }
                        className="mt-0.5 size-4 accent-[var(--primary)]"
                      />
                      {feature}
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-amber-900">
                  料金はまだ決定していません。希望機能を今後のプラン設計に反映します。
                </p>
              </fieldset>
            )}
            <label className="block text-sm font-bold">
              氏名{' '}
              <span className="font-normal text-muted-foreground">
                （任意）
              </span>
              <Input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setReviewing(false);
                }}
                placeholder="補助金 花子"
                className="mt-2"
              />
            </label>
            <label className="block text-sm font-bold">
              返信先メールアドレス
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setReviewing(false);
                }}
                placeholder="name@example.com"
                className="mt-2"
              />
            </label>
            <label className="block text-sm font-bold">
              お問い合わせ内容
              <Textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.currentTarget.value);
                  setReviewing(false);
                }}
                placeholder={
                  isPaidPlan
                    ? '利用したい場面や希望する料金などを入力してください'
                    : 'お困りの状況を入力してください'
                }
                className="mt-2 min-h-36"
              />
            </label>
            {isBugReport && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs leading-6 text-sky-950">
                <p className="font-bold">不具合調査用の技術情報</p>
                <p className="mt-1 break-words">
                  端末・OS・ブラウザ：{deviceSummary}
                </p>
                <p>
                  発生したエラーの内容、発生日時、画面名を添付します。氏名、申請内容、入力した文章、閲覧履歴は含めません。
                </p>
                <label className="mt-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={diagnosticsAllowed}
                    onChange={(event) =>
                      setDiagnosticsAllowed(event.target.checked)
                    }
                    className="mt-1 size-4 accent-[var(--primary)]"
                  />
                  上記の技術情報を問い合わせに添付することに同意します。
                </label>
              </div>
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
              <strong>書類を添付しないでください。</strong>{' '}
              マイナンバー、口座情報、申請書全文などの機密情報は入力しないでください。
            </div>
            <label className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 size-4 accent-[var(--primary)]"
              />
              入力内容に機密情報が含まれていないことを確認しました。
            </label>
            <Button
              type="button"
              onClick={() => setReviewing(true)}
              disabled={
                !confirmed ||
                message.trim().length < 10 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              }
              className="h-11 gap-2 rounded-xl px-5"
            >
              <Send />
              入力内容を確認する
            </Button>
            {reviewing && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-6 text-emerald-950"
              >
                <p className="font-bold">入力内容を確認できました</p>
                {isPaidPlan && (
                  <p className="mt-1">
                    希望機能：
                    {paidFeatures.length ? paidFeatures.join('、') : '選択なし'}
                  </p>
                )}
                <p className="mt-1">
                  内容に問題がなければ、下のボタンで送信してください。
                </p>
                <Button
                  type="button"
                  disabled={sending}
                  onClick={submitInquiry}
                  className="mt-3 h-10 gap-2 rounded-lg px-4"
                >
                  <Send />
                  {sending ? '送信中…' : 'この内容で送信する'}
                </Button>
              </div>
            )}
            {sentReference && (
              <div
                role="status"
                className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950"
              >
                <p className="font-bold">お問い合わせを受け付けました</p>
                <p className="mt-1 text-xs">受付番号：{sentReference}</p>
                <p className="mt-1 text-xs">
                  確認メールの自動送信は、正式版で対応予定です。
                </p>
              </div>
            )}
            {sendError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-900"
              >
                {sendError}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              メールアドレスと10文字以上のお問い合わせ内容を入力してください。
            </p>
            <p className="text-[11px] text-muted-foreground">
              送信内容は問い合わせ対応のために保存します。1日に送信できる件数には上限があります。
            </p>
            <a
              href="/privacy"
              className="inline-flex text-xs font-bold text-primary underline underline-offset-4"
            >
              個人情報・データの取扱いを確認する
            </a>
            <a
              href="/terms"
              className="ml-4 inline-flex text-xs font-bold text-primary underline underline-offset-4"
            >
              利用規約を確認する
            </a>
            <a
              href="/faq"
              className="ml-4 inline-flex text-xs font-bold text-primary underline underline-offset-4"
            >
              よくある質問を見る
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
