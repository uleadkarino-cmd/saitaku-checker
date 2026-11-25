'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, LockKeyhole, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parseReport, type ReviewInput, type ReviewReport } from '@/lib/ai-review';

type Props = { input: Omit<ReviewInput, 'consent'>; disabled: boolean };
export function AiDetailCheck({ input, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [connection, setConnection] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [local, setLocal] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [generatedAt, setGeneratedAt] = useState('');
  const activeRequest = useRef<AbortController | null>(null);
  const reportElement = useRef<HTMLElement | null>(null);
  const fingerprint = JSON.stringify(input);
  useEffect(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setRunning(false); setReport(null); setError(''); setOpen(false); setConsent(false);
    return () => { activeRequest.current?.abort(); activeRequest.current = null; };
  }, [fingerprint, disabled]);
  async function checkConnection() {
    setConnection('loading'); setError('');
    try {
      const response = await fetch('/api/ai-review', { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
      const data = await response.json() as { error?: string; local?: boolean; configured?: boolean };
      if (!response.ok) throw new Error(data.error || '接続状況を確認できません。');
      setLocal(Boolean(data.local)); setConnection(data.configured ? 'ready' : 'missing');
    } catch { setConnection('error'); setError('接続状況を確認できません。もう一度お試しください。'); }
  }
  async function runReview() {
    if (!consent || disabled || running || connection !== 'ready') return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setRunning(true); setOpen(false); setError(''); setReport(null);
    const timer = window.setTimeout(() => controller.abort(), 70_000);
    try {
      const response = await fetch('/api/ai-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, consent: true }), signal: controller.signal,
      });
      const data = await response.json() as { error?: string; report?: unknown; generatedAt: string };
      if (!response.ok) throw new Error(data.error || '解析できませんでした。もう一度お試しください。');
      if (activeRequest.current !== controller || controller.signal.aborted) return;
      setReport(parseReport(data.report)); setGeneratedAt(data.generatedAt);
    } catch (cause) {
      if (activeRequest.current !== controller) return;
      setError(controller.signal.aborted ? '解析を中止しました。時間を置いて再試行してください。' : cause instanceof Error ? cause.message : '解析結果を取得できませんでした。');
    } finally {
      window.clearTimeout(timer);
      if (activeRequest.current === controller) { activeRequest.current = null; setRunning(false); }
    }
  }
  function printReport() {
    const target = window.open('', '_blank');
    if (!target || !reportElement.current) { setError('印刷画面を開けませんでした。ポップアップを許可して再実行してください。'); return; }
    target.document.title = 'AI詳細チェック 結果レポート';
    const style = target.document.createElement('style');
    style.textContent = 'body{font-family: sans-serif;color:#172b4d;line-height:1.8;max-width:800px;margin:32px auto;padding:0 24px}h2{font-size:24px}h3{font-size:18px}article{border-top:1px solid #ccc;margin-top:24px;padding-top:16px;break-inside:avoid}p{white-space:pre-wrap}button{display:none}@page{margin:18mm}';
    target.document.head.appendChild(style);
    const clone = reportElement.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button').forEach(element => element.remove());
    target.document.body.appendChild(clone);
    target.focus(); target.print();
  }
  const hasPlan = input.plan.some(field => field.text.trim());
  return <>
    <section className="premium-card print:hidden" aria-busy={running}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><LockKeyhole className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <Badge className="mb-2 bg-amber-400 text-amber-950">詳細チェック</Badge>
          <h2 className="text-xl font-bold">AIで、採択審査の観点まで詳しく確認</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">市場・顧客ニーズの根拠、計画と経費の整合性、売上目標の計算根拠を確認し、考えるための質問と短い修正例を示します。</p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {['計画の説明と根拠の確認', '経費の必要性・整合性', '不足する数値・根拠', '結果レポートのPDF保存'].map(label => <li key={label} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{label}</li>)}
          </ul>
          <Button disabled={disabled || running || !hasPlan} onClick={() => { setConsent(false); setOpen(true); void checkConnection(); }} className="mt-5 h-11 rounded-xl px-5">
            {running ? <><LoaderCircle className="mr-2 size-4 animate-spin" />AIで解析中…</> : report ? 'もう一度詳細チェックする' : '詳細チェックを見る'}
          </Button>
          {running && <Button variant="outline" className="ml-2 mt-5" onClick={() => activeRequest.current?.abort()}>中止</Button>}
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{disabled ? '実書類テストモード中はAI送信を無効にしています。' : !hasPlan ? '計画の文章を入力、またはPDFから読み込むと利用できます。' : '送信前に内容を確認できます。メール認証・購入手続きはありません。'}</p>
          {running && <p role="status" className="mt-2 text-sm">解析には1分ほどかかる場合があります。</p>}
          {error && <p role="alert" className="mt-3 text-sm font-bold text-red-800">{error}</p>}
        </div>
      </div>
    </section>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>AI詳細チェックの利用確認</DialogTitle><DialogDescription className="leading-6">送信先はOpenAIです。計画の文章、経費の区分・内容・金額、事業者区分、特例・加点を送信します。</DialogDescription></DialogHeader>
        {connection === 'loading' && <p role="status">接続設定を確認しています…</p>}
        {connection === 'missing' && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7">
          <p className="font-bold">AI接続の設定が必要です</p>
          {local ? <><p>管理者がOpenAI APIキーを取得し、プロジェクト直下の <code>.dev.vars</code> に設定して開発サーバーを再起動してください。</p><pre className="overflow-x-auto rounded bg-white p-2 text-xs">{'OPENAI_API_KEY=取得したキー\nOPENAI_MODEL=gpt-4.1-mini'}</pre><p>キーはチャットやGitHubに貼らないでください。</p><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="font-bold underline">OpenAIでAPIキーを作成</a></> : <p>管理者にAI接続の設定を依頼してください。</p>}
          <Button variant="outline" className="mt-3" onClick={() => void checkConnection()}>設定を再確認</Button>
        </div>}
        {connection === 'error' && <div><p role="alert" className="text-sm text-red-800">{error}</p><Button variant="outline" onClick={() => void checkConnection()}>再確認</Button></div>}
        <details className="rounded-xl border p-3 text-sm"><summary className="cursor-pointer font-bold">送信する内容を確認</summary><div className="mt-3 max-h-52 space-y-3 overflow-auto whitespace-pre-wrap break-words"><p>{input.program} / {input.businessType}</p><p>特例・加点：{input.addons.join('、') || 'なし'}</p>{input.plan.filter(field => field.text.trim()).map(field => <div key={field.title}><strong>{field.title}</strong><p>{field.text}</p></div>)}{input.expenses.map((expense, index) => <p key={index}>{expense.category} / {expense.name || '内容未入力'} / {expense.amount || '金額未入力'}円</p>)}</div></details>
        <p className="text-sm leading-6">PDFファイル自体や氏名・メールアドレスの専用入力欄は送信しません。ただし、計画の本文や経費の内容に含まれる個人情報は送信されます。不要な情報を削除してから実行してください。</p>
        <p className="text-sm leading-6 text-muted-foreground">このアプリでは送信内容・解析結果をサーバーや端末に保存しません。OpenAIへのリクエストは保存無効で送信します。提供先での取扱いは <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer" className="underline">OpenAIのデータ取扱い</a> を確認してください。APIの利用料金は設定したキーの所有者に発生します。</p>
        <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0" />上記の内容を確認し、AI解析のために送信することに同意します。</label>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>戻る</Button><Button disabled={!consent || connection !== 'ready' || running || disabled || !hasPlan} onClick={() => void runReview()}>同意してAIチェックを実行</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    {report && <section ref={reportElement} className="mt-7 rounded-2xl border border-blue-200 bg-white p-5 sm:p-6" aria-label="AI詳細チェックの結果" aria-live="polite">
      <h2 className="text-xl font-bold">AI詳細チェック 結果レポート</h2>
      <p className="mt-2 text-sm text-muted-foreground">{input.program} / {generatedAt ? new Date(generatedAt).toLocaleString('ja-JP') : ''}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{report.summary}</p>
      <p className="mt-3 text-sm leading-6 text-amber-900">文章・数値の一般的な整合性レビューです。最新の公募要領との照合や採択可否の判定は行っていません。修正例の【要確認】は実際の情報に置き換えてください。</p>
      <Button variant="outline" className="mt-4 print:hidden" onClick={printReport}><Printer className="mr-2 size-4" />結果をPDF保存・印刷</Button>
      <p className="mt-2 text-sm text-muted-foreground print:hidden">印刷画面で「PDFに保存」を選択してください。</p>
      {report.findings.map((finding, index) => <article key={index} className="mt-5 break-inside-avoid border-t pt-5">
        <h3 className="font-bold">{finding.topic} <span className="text-sm">（優先度：{({ high: '高', medium: '中', low: '低' })[finding.priority]}）</span></h3>
        {([['確認した根拠', finding.evidence], ['考えるための質問', finding.question], ['改善案', finding.suggestion], ['短い修正例', finding.example]] as const).map(([label, text]) => <div key={label} className="mt-3 text-sm leading-7"><strong>{label}</strong><p className="whitespace-pre-wrap break-words">{text}</p></div>)}
      </article>)}
    </section>}
  </>;
}
