import { env } from 'cloudflare:workers';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Globe2,
  Link2,
  LockKeyhole,
  Route,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { QualityReleaseStatus } from './quality-release-status';
import { DecisionReleaseStatus } from './decision-release-status';
import { LegalReleaseStatus } from './legal-release-status';
import { OperationReleaseStatus } from './operation-release-status';
import { OverallReleaseProgress } from './overall-release-progress';
import { PaymentReleaseStatus } from './payment-release-status';
import { LaunchGate } from './launch-gate';

export const dynamic = 'force-dynamic';

type Status = 'done' | 'review' | 'todo';

const items: Array<{ category: string; title: string; note: string; status: Status }> = [
  { category: '基本機能', title: '入力・書類別の確認欄', note: '事業計画は項目ごとの文章貼り付けと個別採点、経費明細・見積書と必要書類はファイル添付で確認できます。', status: 'done' },
  { category: '基本機能', title: '第20回の基本チェック', note: '公募要領第8版を基準に、主要項目を確認します。', status: 'done' },
  { category: '基本機能', title: '過去回PDFの共通項目チェック', note: '公募回を断定せず、読み取れた場合だけ表示します。', status: 'done' },
  { category: '基本機能', title: '評価ポイント・点数・改善助言', note: '項目別に根拠と改善の方向を表示します。', status: 'done' },
  { category: '安全性', title: '無料版の端末内PDF解析', note: 'PDFファイル自体をサイトへ送信・保存しません。', status: 'done' },
  { category: '安全性', title: '無料10回の利用制限', note: '利用者ごとの回数を管理し、解析失敗時は原則消費しません。', status: 'done' },
  { category: '運営', title: 'お問い合わせ受付・管理', note: '対応状況、管理メモ、検索、CSV保存を利用できます。', status: 'done' },
  { category: '公開情報', title: '対応範囲・FAQ・料金比較', note: '利用前に確認できる案内ページを掲載しました。', status: 'done' },
  { category: '公開情報', title: '個人情報・データの取扱い', note: '現在の保存範囲と利用目的を掲載しました。', status: 'done' },
  { category: 'デザイン', title: 'ロゴ・名称・基本デザイン', note: 'サイト名を「テスト」、機能名を「補助金チェック」に変更し、ロゴを削除しました。', status: 'done' },
  { category: '品質', title: '実書類による読み取り精度確認', note: '複数の実例で誤読・見出し振り分け・文字数判定を継続確認します。', status: 'review' },
  { category: '品質', title: '第20回の追加公式資料への対応', note: 'FAQ、参考資料、操作手引き等の公開後にルールを再確認します。', status: 'review' },
  { category: '法務', title: '利用規約・表示内容の専門家確認', note: '現在は草案です。運営者情報と販売条件の確定後に最終確認します。', status: 'review' },
  { category: '運営', title: '問い合わせ対応の運用テスト', note: '受付から返信済みまでの実運用と保管期間を最終確認します。', status: 'review' },
  { category: '販売', title: '有料版の機能・料金・利用期間', note: '提供範囲、価格、回数または期間、解約・返金条件を決定します。', status: 'todo' },
  { category: '販売', title: '決済と購入確認画面', note: '支払方法と、購入条件を一覧確認できる画面を実装します。', status: 'todo' },
  { category: '公開', title: '独自ドメインと一般公開', note: 'ドメインを決定し、最終確認後に公開範囲を切り替えます。', status: 'todo' },
];

const labels: Record<Status, { label: string; className: string }> = {
  done: { label: '完了', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  review: { label: '要確認', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  todo: { label: '未着手', className: 'border-slate-200 bg-slate-100 text-slate-700' },
};

export default async function ReleaseChecklistPage() {
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!viewerEmail || !adminEmail || viewerEmail !== adminEmail) notFound();

  const counts = {
    done: items.filter((item) => item.status === 'done').length,
    review: items.filter((item) => item.status === 'review').length,
    todo: items.filter((item) => item.status === 'todo').length,
  };
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          お問い合わせ管理に戻る
        </a>

        <header className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-800">
            <ShieldCheck className="size-4" />
            運営者専用
          </span>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">リリース準備チェック</h1>
              <p className="mt-3 text-sm leading-7 text-indigo-950/70">一般公開までに必要な準備を、現在の実装状況に合わせて整理しています。</p>
            </div>
            <OverallReleaseProgress />
          </div>
        </header>

        <section className="mt-7 grid grid-cols-3 gap-3">
          {[
            { status: 'done' as const, icon: CheckCircle2, value: counts.done },
            { status: 'review' as const, icon: Clock3, value: counts.review },
            { status: 'todo' as const, icon: CircleDashed, value: counts.todo },
          ].map(({ status, icon: Icon, value }) => (
            <div key={status} className={`rounded-2xl border p-4 text-center ${labels[status].className}`}>
              <Icon className="mx-auto size-5" />
              <div className="mt-2 text-2xl font-bold">{value}</div>
              <div className="text-xs font-bold">{labels[status].label}</div>
            </div>
          ))}
        </section>

        <QualityReleaseStatus />

        <DecisionReleaseStatus />

        <LegalReleaseStatus />

        <OperationReleaseStatus />

        <PaymentReleaseStatus />

        <LaunchGate />

        <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <h2 className="flex items-center gap-2 font-bold"><AlertTriangle className="size-5" />準備画面へのショートカット</h2>
          <p className="mt-1">各項目の詳しい確認や記録は、以下の運営者専用画面から行えます。</p>
          <a href="/admin/sources" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100">公式資料の確認状況を見る<Link2 className="size-4" /></a>
          <a href="/admin/domain" className="mt-3 ml-0 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 sm:ml-2">本番ドメイン移行の準備を見る<Globe2 className="size-4" /></a>
          <a href="/admin/decisions" className="mt-3 ml-0 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 sm:ml-2">公開前に決めることを記録<ClipboardCheck className="size-4" /></a>
          <a href="/admin/legal" className="mt-3 ml-0 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 sm:ml-2">法務確認リストを見る<ShieldCheck className="size-4" /></a>
          <a href="/admin/pricing" className="mt-3 ml-0 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 sm:ml-2">料金案を比較する<WalletCards className="size-4" /></a>
        </section>

        <section className="mt-7 rounded-3xl border border-violet-200 bg-violet-50 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <Route className="mt-0.5 size-5 shrink-0 text-violet-700" />
            <div>
              <h2 className="font-bold text-violet-950">一般公開までの残作業</h2>
              <p className="mt-1 text-xs leading-6 text-violet-900/70">
                上から順に進めます。公式資料の公開待ちと専門家確認の日数は、外部の状況によって変わります。
              </p>
            </div>
          </div>
          <ol className="mt-5 space-y-3">
            {[
              { priority: '最優先', title: '実書類テストと判定調整', time: '2〜3日', note: '匿名化した複数の申請例で、誤判定・見出し・点数・追記例を確認します。' },
              { priority: '公開待ち', title: '第20回の追加公式資料を反映', time: '半日〜1日', note: 'FAQ・参考資料・操作手引きが公開されたら、チェックルールとの差分を反映します。' },
              { priority: '重要', title: '規約・プライバシー・表示の最終確認', time: '1〜3日', note: '運営者情報、免責、返金条件、個人情報の扱いを専門家にも確認します。' },
              { priority: '要決定', title: '有料版の料金と提供範囲を決定', time: '半日', note: '価格、利用期間、回数、無料版との差、返金条件を決めます。' },
              { priority: '実装', title: '決済と購入後の利用権を接続', time: '2〜4日', note: 'テスト決済、購入完了、失敗、解約・返金時の動作を確認します。' },
              { priority: '最後', title: '本番ドメイン接続と公開確認', time: '1〜2日', note: 'DNS・SSL・主要ページを確認してから一般公開へ切り替えます。' },
            ].map((task, index) => (
              <li key={task.title} className="flex gap-3 rounded-2xl border border-violet-200 bg-white p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-700 text-sm font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">{task.priority}</span>
                    <strong className="text-sm text-violet-950">{task.title}</strong>
                    <span className="ml-auto text-[11px] font-bold text-violet-700">{task.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-6 text-violet-950/70">{task.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-violet-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold text-violet-700">無料版を先行公開する場合</p>
              <p className="mt-1 font-bold text-violet-950">残り約3〜7営業日＋公式資料の公開待ち</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold text-violet-700">有料版も同時公開する場合</p>
              <p className="mt-1 font-bold text-violet-950">残り約1〜3週間＋公式資料の公開待ち</p>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-sky-200 bg-sky-50 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-900">
                <Globe2 className="size-4" />
                本番ドメイン移行
              </span>
              <h2 className="mt-3 text-xl font-bold text-sky-950">ドメイン取得後、通常は当日中に設定できます</h2>
              <p className="mt-2 text-sm leading-7 text-sky-950/70">
                DNSやSSL証明書の反映待ちを含め、安全な目安は1〜2日です。現在の限定公開URLは、本番ドメインが安定するまで残しておきます。
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-white px-5 py-3 text-center text-sky-950">
              <strong className="text-2xl">1〜2日</strong>
              <span className="mt-1 block text-[11px] font-bold text-sky-800">安全に見た移行期間</span>
            </div>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="本番ドメイン移行手順">
            {[
              { icon: Globe2, title: '1. ドメインを決めて取得', time: '15〜30分', note: '名称、綴り、更新費用、管理者メールを確認します。' },
              { icon: Link2, title: '2. サイトへ接続', time: '15〜30分', note: '取得したドメインを登録し、案内されたDNS設定を反映します。' },
              { icon: LockKeyhole, title: '3. SSLを確認', time: '数分〜24時間', note: 'httpsで安全に開ける状態になるまで待ちます。' },
              { icon: ClipboardCheck, title: '4. 本番表示を最終確認', time: '30〜60分', note: 'トップ、ログイン、規約、FAQ、チェック画面を確認します。' },
            ].map(({ icon: Icon, title, time, note }) => (
              <li key={title} className="rounded-2xl border border-sky-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-sky-700" />
                  <strong className="text-sm text-sky-950">{title}</strong>
                  <span className="ml-auto text-[11px] font-bold text-sky-700">{time}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-sky-950/70">{note}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl border border-sky-200 bg-white/80 px-4 py-3 text-xs leading-6 text-sky-950">
            現在の状態：ドメイン名の決定待ちです。候補が決まれば、空き状況を確認して接続作業へ進めます。
          </p>
        </section>

        <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900">
                <WalletCards className="size-4" />
                運営費の見通し
              </span>
              <h2 className="mt-3 text-xl font-bold text-emerald-950">今の構成では、契約中のChatGPT/Codex以外の固定費はほぼありません</h2>
              <p className="mt-2 text-sm leading-7 text-emerald-950/70">
                PDFは利用者の端末内で処理し、事業計画も現在はAI APIを使わずに採点しています。利用者のチェック回数に応じたAI料金は、現時点では発生しません。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-center text-emerald-950">
              <strong className="text-2xl">ほぼ0円</strong>
              <span className="mt-1 block text-[11px] font-bold text-emerald-800">現在の追加固定費</span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { title: '限定テスト中', cost: '追加費用ほぼなし', note: 'Sitesのプラン利用枠とCodexの利用枠内で運用します。' },
              { title: '本番ドメイン取得後', cost: 'ドメイン更新費', note: '金額はドメインの種類と取得会社で変わります。毎年の更新費も確認します。' },
              { title: '有料版の販売開始後', cost: '売上に応じた決済手数料', note: 'Stripeの国内カード標準料金は、現在、成功した決済ごとに3.6％です。' },
              { title: '高度なAI採点を追加後', cost: 'AI利用量に応じた従量課金', note: '導入前に1チェック当たりの原価と月額上限を設定します。' },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-bold text-emerald-800">{item.title}</p>
                <p className="mt-1 font-bold text-emerald-950">{item.cost}</p>
                <p className="mt-2 text-xs leading-6 text-emerald-950/70">{item.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
            <a className="text-emerald-800 underline underline-offset-4" href="https://help.openai.com/en/articles/20001339" target="_blank" rel="noreferrer">Sitesの公式案内</a>
            <a className="text-emerald-800 underline underline-offset-4" href="https://stripe.com/jp/pricing" target="_blank" rel="noreferrer">Stripeの公式料金</a>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-emerald-900/70">
            料金や利用上限は変更される場合があります。一般公開前と料金改定時に、各サービスの請求画面と公式情報を再確認します。
          </p>
        </section>

        <section className="mt-7 space-y-3" aria-label="リリース準備項目">
          {items.map((item) => {
            const Icon = item.status === 'done' ? CheckCircle2 : item.status === 'review' ? Clock3 : CircleDashed;
            return (
              <article key={item.title} className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_30px_rgb(7_47_95/4%)]">
                <div className="flex items-start gap-4">
                  <Icon className={`mt-1 size-5 shrink-0 ${item.status === 'done' ? 'text-emerald-700' : item.status === 'review' ? 'text-amber-700' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{item.category}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${labels[item.status].className}`}>{labels[item.status].label}</span>
                    </div>
                    <h2 className="mt-3 font-bold">{item.title}</h2>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{item.note}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <p className="mt-7 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
          <ClipboardCheck className="mt-0.5 size-4 shrink-0" />
          状況基準日：2026年9月4日。機能や公開条件が変わったときに、この一覧も更新します。
        </p>
      </div>
    </main>
  );
}
