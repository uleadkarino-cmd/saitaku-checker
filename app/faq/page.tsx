import { ArrowLeft, CircleHelp, MessageCircleQuestion } from 'lucide-react';

const faqs = [
  {
    question: '現在、どの補助金に対応していますか？',
    answer:
      '現在の正式な確認ルールは、小規模事業者持続化補助金〈一般型・通常枠〉第20回・公募要領第8版を基準にしています。過去回の事業計画も文章を貼り付けて共通項目を確認できますが、過去回固有の期限・様式・特例・経費要件までは保証していません。',
  },
  {
    question: '事業計画はどのように入力しますか？',
    answer:
      '事業計画書のPDF添付は使用せず、申請画面や下書きから文章をコピーして、「1-1. 自社の概要」「1-3. 経営課題」など対応する項目へ個別に貼り付けます。各項目が100点満点で採点されます。経費明細・見積書、必要書類は、それぞれ専用欄へ添付します。',
  },
  {
    question: '申請書のPDFはサイトに保存されますか？',
    answer:
      '現在の無料チェックでは、貼り付けた文章と添付PDFを利用者の端末内で読み取り、PDFファイル自体をサイトへ送信・保存しません。実在情報を含む場合は「実書類テストモード」を利用し、確認後に「保存せず終了」で解析内容を消してください。',
  },
  {
    question: '無料10回は、どのように数えますか？',
    answer:
      'ログイン不要で、同じブラウザーにつき、事業計画書・経費明細・必要書類のチェックを合計10回まで利用できます。Cookieを削除した場合や別のブラウザーを使う場合は、利用回数を引き継げません。文章を振り分けられない場合やPDFを読み取れず解析に失敗した場合は、原則として回数を消費しません。',
  },
  {
    question: '「修正が必要」「確認が必要」「確認できた」の違いは何ですか？',
    answer:
      '「修正が必要」は文字数超過や未入力など、提出前に直す可能性が高い項目です。「確認が必要」は自動判定だけでは十分に判断できず、原資料との照合が必要な項目です。「確認できた」は必要な手がかりを読み取れた項目ですが、内容の正確性や採択を保証するものではありません。',
  },
  {
    question: '文章を貼り付けたのに、内容を確認できないと言われました。',
    answer:
      '文章が正しい項目欄へ貼り付けられているか確認してください。判定は特定の言葉があるかだけでなく、数値、理由、対象、根拠など複数の手がかりを見ます。内容が十分なのに判定が合わない場合は、個人情報を記載せず、お問い合わせから項目名と判定内容をお知らせください。',
  },
  {
    question: '結果の点数は、採択可能性を表しますか？',
    answer:
      '表しません。通常の文章項目は、文章量20点・項目内容と具体性50点・実績値と数値根拠30点の合計で、記載内容を見直しやすくするための目安です。文章量は重複文を除く600文字で満点となり、実績の指標・単位・期間・出典も確認します。目標値のみ、例文の空欄、文の繰り返しは加点を制限します。記載の有無に基づくルール採点のため、事実や意味の妥当性は原資料と照合してください。事業名は30文字以内かを別の基準で確認します。いずれも審査員の評価や採択確率を予測するものではありません。',
  },
  {
    question: 'チェック結果どおりに直せば、不備や不採択を防げますか？',
    answer:
      '本サービスは不備を減らすための補助ツールであり、書類の完全性、補助対象性、採択や交付決定を保証しません。最後は最新の公募要領・公式資料・事務局の案内と照合し、必要に応じて商工会または商工会議所へ確認してください。',
  },
  {
    question: '必要書類は、まとめて添付しますか？',
    answer:
      'いいえ。事業支援計画書（様式4）、決算書類など、書類ごとに分かれた欄へ個別に選択します。申請者区分や特例によって必要書類が異なるため、該当する条件を選んでから確認してください。',
  },
  {
    question: '有料版はいつから、いくらで使えますか？',
    answer:
      '現在は準備中で、料金と開始日は未定です。書類間の詳しい整合性チェック、より具体的な改善アドバイス、結果レポートのPDF保存などを検討しています。決定後に特定商取引法に基づく表記へ掲載します。',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          補助金チェックに戻る
        </a>

        <header className="mt-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CircleHelp className="size-6" />
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">よくある質問</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            PDFを選ぶ前に知っておきたいことと、結果の見方をまとめました。
          </p>
        </header>

        <section className="mt-9 space-y-3" aria-label="よくある質問と回答">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-border bg-white shadow-[0_8px_30px_rgb(7_47_95/5%)] open:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 font-bold marker:hidden sm:p-6">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs text-primary">
                  {index + 1}
                </span>
                <span className="flex-1 leading-7">{faq.question}</span>
                <span aria-hidden="true" className="mt-1 text-xl leading-none text-primary group-open:rotate-45">
                  ＋
                </span>
              </summary>
              <div className="border-t border-border px-5 py-5 pl-14 text-sm leading-7 text-muted-foreground sm:px-6 sm:pl-[4.25rem]">
                {faq.answer}
              </div>
            </details>
          ))}
        </section>

        <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <h2 className="flex items-center gap-2 font-bold">
            <MessageCircleQuestion className="size-5" />
            解決しない場合
          </h2>
          <p className="mt-2 text-sm leading-7">
            PDFや個人情報は送らず、表示された項目名、エラーメッセージ、利用した書類の種類をお問い合わせからお知らせください。
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800"
          >
            お問い合わせへ
          </a>
        </section>
      </div>
    </main>
  );
}
