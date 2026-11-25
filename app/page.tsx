'use client';

import { useEffect, useRef, useState } from 'react';
import { scorePlanText } from '@/lib/plan-scoring';
import { AiDetailCheck } from '@/components/ai-detail-check';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardCopy,
  FileSearch,
  FileUp,
  HelpCircle,
  ListChecks,
  LoaderCircle,
  LockKeyhole,
  Paperclip,
  PencilLine,
  Plus,
  Printer,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.mjs';

declare global {
  // PDF.js can run its worker logic on the main thread when private hosting
  // prevents a module Worker request from carrying the site login session.
  var pdfjsWorker:
    | { WorkerMessageHandler: typeof WorkerMessageHandler }
    | undefined;
}

const programs = [
  {
    id: 'jizokuka',
    short: '持続化補助金',
    title: '小規模事業者持続化補助金',
    detail: '一般型・通常枠　第20回',
    deadline: '2026年12月15日 17:00',
    tone: 'coral',
    enabled: true,
  },
  {
    id: 'shinmono',
    short: '新事業・ものづくり',
    title: '新事業進出補助金／ものづくり補助金',
    detail: '制度別のチェックルールを準備中です',
    deadline: '準備が整い次第公開',
    tone: 'blue',
    enabled: false,
  },
];

const qualityTestTitles = [
  '十分な文章を正しく評価できる',
  '言い換え表現を読み取れる',
  '市場データの出典を確認できる',
  '見積書と経費明細を読み分けられる',
  '書類ごとの添付不足を正しく示す',
  '個人情報を保存・表示しない',
  '読めないPDFを安全に案内する',
  'スマートフォンでも修正まで進める',
];
const steps = [
  '補助金を選ぶ',
  '基本情報に答える',
  '書類を確認する',
  '結果・直し方を見る',
];
const createEvidenceExcerpt = (value: string) =>
  value
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
      '［メールアドレスを伏字］',
    )
    .replace(/(?:〒\s*)?\d{3}[-ー−]?\d{4}/gu, '［郵便番号を伏字］')
    .replace(/(?:0\d{1,4}[-ー−]?\d{1,4}[-ー−]?\d{3,4})/gu, '［電話番号を伏字］')
    .replace(/\b\d{8,}\b/gu, '［長い番号を伏字］')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 220);
const planFields = [
  {
    id: 'company',
    title: '1-1. 自社の概要',
    hint: '事業内容、主な商品・サービス、沿革、体制などを具体的に記載します。',
  },
  {
    id: 'situation',
    title: '1-2. 現在の売上・利益の状況',
    hint: '売上構成、売上高、売上総利益、顧客数などを数値で記載します。',
  },
  {
    id: 'challenge',
    title: '1-3. 経営課題',
    hint: '現在の課題と、その原因・影響を分けて記載します。',
  },
  {
    id: 'market',
    title: '2-1. 市場の動向',
    hint: '市場規模や成長性を、出典のある客観的なデータとともに記載します。',
  },
  {
    id: 'needs',
    title: '2-2. 顧客ニーズ',
    hint: '対象顧客、困りごと、購買理由を具体的に記載します。',
  },
  {
    id: 'strength',
    title: '3. 自社・商品・サービスの強みと弱み',
    hint: '競合との違い、顧客に選ばれる理由、改善すべき点を記載します。',
  },
  {
    id: 'policy',
    title: '4-1. 経営方針・目標',
    hint: '経営課題を踏まえた方針と、売上高・売上総利益の目標を記載します。',
  },
  {
    id: 'future',
    title: '4-2. 今後のプラン',
    hint: '目標達成までの取組と時期を具体的に記載します。',
  },
  {
    id: 'projectName',
    title: '補助事業で行う事業名',
    hint: '取組内容が伝わる名称を30文字以内で記載します。',
  },
  {
    id: 'summary',
    title: '2-1. 補助事業の概要',
    hint: '誰に、どのような価値を提供する取組かを簡潔に記載します。',
  },
  {
    id: 'purpose',
    title: '2-2. 背景・目的',
    hint: '経営課題と補助事業がどのようにつながるかを記載します。',
  },
  {
    id: 'action',
    title: '2-3. 具体的な取組',
    hint: '実施内容、対象顧客、方法、時期、実施体制を具体的に記載します。',
  },
  {
    id: 'effect',
    title: '4-1. 取組の効果',
    hint: '販路開拓により売上高・売上総利益が増える流れを記載します。',
  },
  {
    id: 'estimate',
    title: '4-2. 効果の試算',
    hint: '客数、単価、販売数などを使い、定量的な目標と計算根拠を記載します。',
  },
];
const planFieldGroups = [
  {
    title: '経営計画',
    description: '自社の現状、市場・顧客、強み、今後の方針を整理します。',
    fields: planFields.slice(0, 8),
  },
  {
    title: '補助事業計画',
    description: '補助金を使って行う取組と、その効果・計算根拠を整理します。',
    fields: planFields.slice(8),
  },
];
const addonOptions = [
  'インボイス特例',
  '賃金引上げ特例・加点',
  '経営力向上計画加点',
  '事業承継加点',
  'くるみん・えるぼし加点',
  '小規模事業者卒業加点',
  '地域別最低賃金引上げ加点',
];
const expenseCategories = [
  '機械装置等費',
  '広報費',
  'ウェブサイト関連費',
  '展示会等出展費',
  '旅費',
  '新商品開発費',
  '借料',
  '委託・外注費',
];
const expenseConsistencyTerms = [
  'チラシ',
  'パンフレット',
  '広告',
  '看板',
  'ウェブ',
  'ホームページ',
  'EC',
  '機械',
  '設備',
  'システム',
  '展示会',
  '出展',
  '旅費',
  '交通費',
  '宿泊',
  '開発',
  '試作',
  'デザイン',
  '撮影',
  '委託',
  '外注',
  '借料',
  'レンタル',
];
const goodDemoText = (focus: string) =>
  `架空事業者「みどり菓子工房」は地域素材を使った焼き菓子を店舗とECで販売しています。${focus}について、直近12か月の販売記録、顧客アンケート、商圏統計を根拠に整理しました。対象は市内在住の30〜50代と地域ギフトを探す法人です。現状値、実施後1年の目標、算出方法を明記し、担当者と実施時期も具体化しています。`;
const goodDemoPlan = Object.fromEntries(
  planFields.map((field) => [field.id, goodDemoText(field.title)]),
);
goodDemoPlan.projectName = '地域素材の焼き菓子販路拡大事業';
const weakDemoPlan: Record<string, string> = {
  company: '地域でお菓子を販売しています。',
  challenge: '新規顧客が少ないことが課題です。',
  action: 'チラシとホームページで宣伝します。',
};
const draftStorageKey = 'saitaku-checker-draft-v1';
const freeCheckLimit = 10;
const draftLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const sectionMatchers = [
  ['company', /自社の概要|企業概要|会社概要/gu],
  [
    'situation',
    /現在の売上(?:・|や)利益の状況|売上や利益の状況|売上・利益の状況/gu,
  ],
  ['challenge', /経営課題/gu],
  ['market', /市場の動向|市場動向/gu],
  ['needs', /顧客ニーズ|顧客のニーズ/gu],
  [
    'strength',
    /自社や自社の提供する商品(?:・|、)サービスの強み(?:・|、)弱み|自社(?:・|、)商品(?:・|、)サービスの強みと弱み|自社の強み|商品・サービスの強み/gu,
  ],
  ['policy', /経営方針(?:・|、)目標|経営方針と目標/gu],
  ['future', /今後のプラン|今後の事業展開/gu],
  ['projectName', /補助事業で行う事業名|補助事業名/gu],
  ['summary', /(?:補助)?事業の概要/gu],
  ['purpose', /背景(?:・|、)目的|取組の背景・目的/gu],
  ['action', /具体的な取組|取組内容/gu],
  ['effect', /取組の効果|補助事業の効果/gu],
  ['estimate', /効果の試算|効果の見込み|売上の試算/gu],
] as const;

function normalizePdfText(text: string) {
  const japanese = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}';
  return text
    .normalize('NFKC')
    .replace(/[‧･]/gu, '・')
    .replace(/[\t ]+/gu, ' ')
    .replace(new RegExp(`([${japanese}])\\s+(?=[${japanese}])`, 'gu'), '$1')
    .replace(/\s*([・、。:：()（）])\s*/gu, '$1')
    .trim();
}

function extractPlanSections(pageTexts: string[]) {
  const pages = pageTexts.map(normalizePdfText);
  const text = pages.join('\n');
  const candidates: { id: string; start: number; end: number }[] = [];
  sectionMatchers.forEach(([id, pattern]) => {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern))
      candidates.push({
        id,
        start: match.index,
        end: match.index + match[0].length,
      });
  });
  candidates.sort((a, b) => a.start - b.start);
  const extracted: Record<string, string> = {};
  candidates.forEach((candidate, index) => {
    const nextStart = candidates[index + 1]?.start ?? text.length;
    const value = text
      .slice(candidate.end, Math.min(nextStart, candidate.end + 6000))
      .replace(/^[\s:：\-–—0-9０-９.．()（）]+/, '')
      .trim();
    if (
      value.length >= 10 &&
      value.length > (extracted[candidate.id]?.length || 0)
    )
      extracted[candidate.id] = value;
  });

  // PDFの目次にも同じ見出しが出るため、実際の入力本文がある
  // 最後の見出しページを優先する。複数ページにまたがる出典も回収する。
  sectionMatchers.forEach(([id, pattern]) => {
    const matchingPages = pages.flatMap((page, pageIndex) => {
      pattern.lastIndex = 0;
      return pattern.test(page) ? [pageIndex] : [];
    });
    const pageIndex = matchingPages.at(-1);
    if (pageIndex === undefined) return;
    const nextHeadingPage = pages.findIndex(
      (page, index) =>
        index > pageIndex &&
        sectionMatchers.some(([nextId, nextPattern]) => {
          if (nextId === id) return false;
          nextPattern.lastIndex = 0;
          return nextPattern.test(page);
        }),
    );
    const endPage =
      nextHeadingPage > pageIndex
        ? nextHeadingPage
        : Math.min(pages.length, pageIndex + 5);
    const headingIndex = pages[pageIndex].search(pattern);
    const firstPage =
      headingIndex >= 0
        ? pages[pageIndex].slice(headingIndex)
        : pages[pageIndex];
    // 次の項目の見出しがページ途中にある場合、その直前までは
    // 現在の項目の続きなので取り込む。
    const nextPagePrefix =
      nextHeadingPage > pageIndex
        ? (() => {
            const positions = sectionMatchers.flatMap(
              ([nextId, nextPattern]) => {
                if (nextId === id) return [];
                nextPattern.lastIndex = 0;
                const match = nextPattern.exec(pages[nextHeadingPage]);
                return match?.index === undefined ? [] : [match.index];
              },
            );
            return positions.length
              ? pages[nextHeadingPage].slice(0, Math.min(...positions))
              : '';
          })()
        : '';
    const pageWindow = [
      firstPage,
      ...pages.slice(pageIndex + 1, endPage),
      nextPagePrefix,
    ]
      .join(' ')
      .replace(/https?:\/\/www\.jizokuka-portal\.info\/\S+/gu, ' ')
      .replace(/\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}/gu, ' ')
      .replace(/\s+/gu, ' ')
      .trim()
      .slice(0, 6000);
    if (pageWindow.length >= 30) {
      const current = extracted[id] || '';
      const rules = fieldRules[id] || [];
      const currentSignals = rules.filter((rule) => rule.test(current)).length;
      const pageSignals = rules.filter((rule) => rule.test(pageWindow)).length;
      // PDF内の文字配置順は見た目の順と異なることがある。
      // 見出し間の範囲とページ範囲を比べ、その項目の確認要素を
      // より多く含む方を採用する。同点なら目次を避けやすいページ範囲を優先。
      if (!current || pageSignals >= currentSignals) extracted[id] = pageWindow;
    }
  });

  // 事業名は次ページに印字されることが多いため、見出し間の長い範囲から
  // 「更新」以降の最後の短い行だけを取り出す。本文全体を事業名にしない。
  const projectHeading = candidates.find(
    (candidate) => candidate.id === 'projectName',
  );
  const summaryHeading = candidates.find(
    (candidate) =>
      candidate.id === 'summary' &&
      (!projectHeading || candidate.start > projectHeading.start),
  );
  if (projectHeading && summaryHeading) {
    const between = text
      .slice(projectHeading.end, summaryHeading.start)
      .replace(/https?:\/\/\S+/gu, ' ')
      .replace(/申請内容確認[^\n]*/gu, ' ')
      .replace(/\d+\s*\/\s*\d+ページ/gu, ' ')
      .trim();
    const afterUpdate =
      between
        .split(/更新/gu)
        .at(-1)
        ?.trim() || '';
    const shortName = afterUpdate
      .replace(/^[\s:：\-–—0-9０-９.．()（）]+/u, '')
      .replace(/\s+/gu, ' ')
      .trim();
    if (shortName.length >= 2 && shortName.length <= 80)
      extracted.projectName = shortName;
  }

  // 電子申請画面から出力したPDFでは、複数の見出しが本文より先に
  // まとめて配置されることがある。単純な見出し間の切り出しが空に
  // なった項目は、見出しがあるページを補助的に使って誤った「未入力」を防ぐ。
  const multiPageFields = new Set([
    'situation',
    'challenge',
    'market',
    'strength',
    'action',
    'estimate',
  ]);
  sectionMatchers.forEach(([id, pattern]) => {
    if ((extracted[id]?.length || 0) >= 20) return;
    const pageIndex = pages.findIndex((page) => {
      pattern.lastIndex = 0;
      return pattern.test(page);
    });
    if (pageIndex < 0) return;
    const pageCount = multiPageFields.has(id) ? 2 : 1;
    const fallback = pages
      .slice(pageIndex, pageIndex + pageCount)
      .join(' ')
      .replace(/https?:\/\/\S+/gu, ' ')
      .replace(/\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}/gu, ' ')
      .replace(/申請内容確認\s*・?\s*小規模事業者持続化補助金[^\n]*/gu, ' ')
      .replace(/\s+/gu, ' ')
      .trim()
      .slice(0, 6000);
    if (fallback.length >= 20) extracted[id] = fallback;
  });
  return extracted;
}

function detectSensitiveInfo(text: string) {
  const checks = [
    ['メールアドレス', /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu],
    ['電話番号・FAX番号', /(?:0\d{1,4}[-ー‐−]?\d{1,4}[-ー‐−]?\d{3,4})/u],
    [
      '郵便番号・住所',
      /(?:〒?\s*\d{3}[-ー‐−]\d{4}|都|道|府|県).{0,30}(?:市|区|町|村)/u,
    ],
    ['マイナンバーらしき12桁の番号', /(?:^|\D)\d{12}(?:\D|$)/u],
    [
      '口座情報らしき記載',
      /(?:銀行|信用金庫|信用組合|農協).{0,30}(?:支店|口座|普通|当座)/u,
    ],
  ] as const;
  return checks
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
}

function detectApplicationRound(text: string) {
  // 過去の採択歴や別枠への申請状況に含まれる「第N回」を公募回と誤認しない。
  // 「一般型・通常枠」と「第N回公募」が近接して明記された場合だけ採用する。
  const match =
    text.match(
      /(?:一般型(?:・通常枠)?|通常枠)[^。\n]{0,80}第\s*([0-9０-９]{1,2})\s*回(?:公募)?/u,
    ) ||
    text.match(
      /第\s*([0-9０-９]{1,2})\s*回公募[^。\n]{0,80}(?:一般型|通常枠)/u,
    );
  if (!match) return null;
  const normalized = match[1].replace(/[０-９]/gu, (digit) =>
    String('０１２３４５６７８９'.indexOf(digit)),
  );
  const round = Number(normalized);
  return Number.isInteger(round) && round > 0 ? round : null;
}

const fieldRules: Record<
  string,
  { label: string; test: (text: string) => boolean }[]
> = {
  company: [
    {
      label: '事業内容・主な商品やサービス',
      test: (text) =>
        /商品|サービス|事業|販売|提供|製造|開発|運営|創業/.test(text),
    },
  ],
  situation: [
    {
      label: '売上・利益などの数値',
      test: (text) => /[0-9０-９][0-9０-９,.，％%万千百億円人件]*/.test(text),
    },
    {
      label: '売上または利益の説明',
      test: (text) => /売上|利益|粗利|客数|単価/.test(text),
    },
  ],
  challenge: [
    {
      label: '課題の内容',
      test: (text) =>
        /課題|不足|不十分|十分(?:で|と)はない|少ない|限られ|減少|低下|弱み|問題|伸び悩|困難|できていない|進んでいない|依存|必要|限界|懸念|改善/.test(
          text,
        ),
    },
    {
      label: '課題の背景・影響',
      test: (text) =>
        /原因|ため|結果|影響|ことから|背景|一方|しかし|現状|これにより|その結果|重なって/.test(
          text,
        ),
    },
  ],
  market: [
    {
      label: '客観的な数値',
      test: (text) => /[0-9０-９][0-9０-９,.，％%万千百億円人件]*/.test(text),
    },
    {
      label: '情報源・調査主体',
      test: (text) =>
        /出\s*典|出\s*所|調\s*査|統\s*計|白\s*書|資\s*料|によると|アンケート|省|庁|自治体|協会|研究所|研究\s*所|機構|e-?Stat|レポート|データ|https?:\/\//i.test(
          text,
        ),
    },
  ],
  needs: [
    {
      label: '対象顧客',
      test: (text) => /顧客|法人|個人|年代|事業者|利用者|観光客/.test(text),
    },
    {
      label: 'ニーズの根拠',
      test: (text) => /アンケート|問い合わせ|要望|購入|実績|調査|声/.test(text),
    },
  ],
  strength: [
    {
      label: '競合との違い',
      test: (text) => /競合|他社|違い|差別化|比較|独自/.test(text),
    },
    {
      label: '選ばれる理由',
      test: (text) => /強み|評価|実績|品質|技術|信頼|選ば/.test(text),
    },
  ],
  policy: [
    {
      label: '数値目標',
      test: (text) => /[0-9０-９][0-9０-９,.，％%万千百億円人件]*/.test(text),
    },
    { label: '達成時期', test: (text) => /年|月|年度|までに|期/.test(text) },
  ],
  future: [
    {
      label: '実施時期',
      test: (text) => /年|月|年度|上期|下期|までに/.test(text),
    },
    {
      label: '実施内容',
      test: (text) => /実施|開始|導入|開発|販売|展開|作成/.test(text),
    },
  ],
  summary: [
    {
      label: '対象顧客',
      test: (text) => /顧客|法人|個人|年代|事業者|利用者/.test(text),
    },
    {
      label: '提供する価値・取組',
      test: (text) => /提供|販売|開発|導入|実施|改善|支援/.test(text),
    },
  ],
  purpose: [
    {
      label: '経営課題とのつながり',
      test: (text) => /課題|背景|目的|解決|改善|ため/.test(text),
    },
  ],
  action: [
    {
      label: '具体的な実施内容',
      test: (text) => /制作|作成|導入|開発|改修|出展|販売|広告|実施/.test(text),
    },
    {
      label: '時期または担当者',
      test: (text) => /年|月|担当|責任者|従業員|外注|委託/.test(text),
    },
  ],
  effect: [
    {
      label: '売上・利益へのつながり',
      test: (text) =>
        /売上|利益|粗利|客数|単価|受注|購買|購入|成約|販売|販路/.test(text),
    },
    {
      label: '効果が生じる理由',
      test: (text) => /ため|ことで|結果|つなが|増加|向上/.test(text),
    },
  ],
  estimate: [
    {
      label: '数値',
      test: (text) => /[0-9０-９][0-9０-９,.，％%万千百億円人件]*/.test(text),
    },
    {
      label: '計算根拠',
      test: (text) => /×|÷|単価|客数|件数|数量|回数|算出|計算/.test(text),
    },
  ],
};

const fieldAdvice: Record<string, string> = {
  company:
    '末尾に「現在の主力商品・売上に占める割合・運営人数」を1文追加すると、事業規模と特徴がより具体的に伝わります。例：主力商品Aが売上の約60％、代表者1名で企画・販売を担当。',
  situation:
    '直近年度だけでなく、前年との増減額または増減率を加えてください。例：売上高は前年比15％増、ただし新規顧客数は横ばい。この比較が経営課題の根拠になります。',
  challenge:
    '「現象→原因→経営への影響」の順に1段落で整理してください。例：新規客が少ない→商品理解の機会が不足→売上拡大が難しい、というつながりです。',
  market:
    '数値の直後に「資料名・発表主体・調査年」を記載してください。例：○○市場調査（○○協会、2025年）によると市場規模は○億円。URLだけより確認しやすくなります。',
  needs:
    '顧客像ごとに、困りごとと根拠を1組ずつ示してください。例：30～50代女性から成分説明への問い合わせが月○件あり、購入前に詳しい説明を求めている。',
  strength:
    '強みを競合比較に置き換えてください。例：一般品は○○であるのに対し、自社品は道産原料・対面説明・購入後支援を組み合わせている、のように違いを示します。',
  policy:
    '目標ごとに「期限・現状値・目標値」をセットで追記してください。例：2027年3月までに月間新規客を現在の○人から○人へ増やす。',
  future:
    '取組を時系列の表現にしてください。例：2026年12月に制作、2027年1月に告知、2月にイベント実施、代表者が効果測定。担当と完了時期まで示します。',
  summary:
    '冒頭を「誰に・何を・どの方法で提供する事業か」の1文にしてください。その後に実施場所、回数、制作物を続けると全体像を短時間で理解できます。',
  purpose:
    '現在の経営課題と補助事業の各取組を1対1で対応させてください。例：商品理解不足に対して体験会、情報不足に対してホームページ改善を行う、と明示します。',
  action:
    '取組ごとに「実施内容・数量・時期・担当・発注先」をそろえてください。例：体験会を市内で3回、各20名、代表者が運営し、会場は○月に予約。',
  effect:
    '取組から成果までを段階で示してください。例：体験会参加者60人→EC訪問30人→購入6人→売上○円、という流れにすると効果を検証できます。',
  estimate:
    '「単価×人数（件数）×回数」の計算式を記載し、各数値の根拠も添えてください。例：平均単価20,000円×新規購入者6人×年3回＝360,000円。',
};

const fieldRewriteExamples: Record<string, string> = {
  company:
    '当社は【地域】で【商品・サービス】を提供しています。主力の【商品名】は売上の約【割合】％を占め、【人数】名の体制で【担当業務】を行っています。',
  situation:
    '直近年度の売上高は【金額】円で、前年の【金額】円から【増減率】％【増加・減少】しました。主な要因は【具体的な理由】です。',
  challenge:
    '現在、【起きている問題】が課題です。原因は【背景・原因】にあり、その結果【売上・顧客・業務への影響】が生じています。',
  market:
    '【資料名】（【発表主体】、【調査年】年）によると、【市場・需要を示す数値】です。この動向から【自社への影響】が見込まれます。',
  needs:
    '主な顧客は【対象顧客】です。【問い合わせ・アンケート・購入実績】で【件数・割合】の要望があり、【具体的な困りごと】への需要を確認しています。',
  strength:
    '競合の【一般的な特徴】に対し、当社は【独自の特徴】を提供できます。【実績・顧客評価】があり、【顧客に選ばれる理由】が強みです。',
  policy:
    '【期限】までに、【指標】を現在の【現状値】から【目標値】へ改善します。そのために【実施方針】へ取り組みます。',
  future:
    '【年月】に【担当者】が【実施内容】を行い、【年月】までに【成果物・完了状態】を完成させます。',
  projectName: '【対象顧客】向け【中心となる取組】による販路開拓',
  summary:
    '【対象顧客】に対し、【商品・サービス】を【提供方法】で届けるため、【具体的な取組】を実施します。',
  purpose:
    '【経営課題】を解決するため、【補助事業の取組】を行います。これにより【期待する変化】を実現します。',
  action:
    '【年月】に【担当者】が【発注先】へ【制作物・設備】を【数量】件発注し、【実施場所・方法】で活用します。',
  effect:
    '【取組】により【対象顧客数】人へ接点を作り、【行動】を【人数】人、購入を【人数】人へつなげ、売上【金額】円を見込みます。',
  estimate:
    '平均単価【金額】円×購入者【人数】人×【回数】回＝売上【合計額】円と算出しました。各数値は【実績・見積・調査】を根拠としています。',
};

const fieldPerspective: Record<string, string> = {
  company:
    '事業者がどのような商品・サービスを、どの体制と経験で提供しているかを確認する項目です。ここが具体的だと、後の強み・課題・補助事業との整合性を判断しやすくなります。',
  situation:
    '売上高・利益・顧客数などの現状を客観的に把握できているかを確認します。単年度の数字だけでなく、前年比較や売上構成が経営課題の根拠になります。',
  challenge:
    '補助事業を行う必要性につながる経営上の問題が明確かを確認します。単なる希望ではなく、現状・原因・影響がつながっていることが重要です。',
  market:
    '外部環境を客観的な資料で捉え、事業機会やリスクを説明できているかを確認します。資料名・発表主体・調査年・数値がそろうと根拠として確認しやすくなります。',
  needs:
    '想定顧客が実際に抱える困りごとや購買理由を把握しているかを確認します。問い合わせ、アンケート、販売実績など、自社で確認した事実が有効です。',
  strength:
    '競合と比べて顧客に選ばれる理由と、改善すべき弱みを認識しているかを確認します。補助事業が強みを生かし、弱みを補う内容になっている必要があります。',
  policy:
    '経営課題を踏まえた将来方針と、測定可能な目標が設定されているかを確認します。目標には期限・現状値・目標値が必要です。',
  future:
    '目標を実現するまでの行動が、時期・担当・順序を含めて実行可能な計画になっているかを確認します。',
  projectName:
    '補助事業の中心的な取組が30文字以内で端的に伝わるかを確認します。名称だけを読んでも、何を行う事業か想像できることが望まれます。',
  summary:
    '補助事業の対象顧客、提供価値、具体的な方法が一貫しているかを確認します。審査する人が最初に事業全体を理解するための要約です。',
  purpose:
    '経営課題と補助事業の必要性が直接結び付いているかを確認します。課題ごとに、どの取組で解決するかが明確であることが重要です。',
  action:
    '補助対象となる取組が具体的で、実施可能かを確認します。内容・数量・時期・担当・発注先が、経費明細や見積書と一致している必要があります。',
  effect:
    '販路開拓の取組が、顧客行動の変化を通じて売上・利益の増加につながるかを確認します。取組と成果の因果関係が重要です。',
  estimate:
    '期待する効果が計算可能な数値で示され、その算出根拠が妥当かを確認します。単価・人数・件数・回数を使った計算式が必要です。',
};

function evaluatePlanField(
  field: (typeof planFields)[number],
  rawText: string,
) {
  const text = rawText.trim();
  if (!text)
    return {
      ...field,
      status: 'danger' as const,
      message:
        '入力がありません。電子申請での入力漏れを防ぐため、この項目の文章を用意してください。',
      missing: [] as string[],
      score: 0,
      scoreBreakdown: [
        { label: '文章量（重複文を除く）', score: 0, max: 20 },
        { label: '項目内容・具体性', score: 0, max: 50 },
        { label: '実績値・数値根拠', score: 0, max: 30 },
      ],
      positives: [] as string[],
      advice: 'この項目の文章を作成してください。',
      rewriteExample: fieldRewriteExamples[field.id],
    };
  if (field.id === 'projectName') {
    if (text.length > 30) {
      const projectScore = Math.max(20, 100 - (text.length - 30) * 4);
      return {
        ...field,
        status: 'danger' as const,
        message: `事業名が${text.length}文字あります。30文字以内に修正してください。`,
        missing: ['30文字以内'],
        score: projectScore,
        scoreBreakdown: [
          { label: '名称の入力', score: 20, max: 20 },
          { label: '30文字以内', score: projectScore - 20, max: 80 },
        ],
        positives: ['事業名の入力を確認'],
        advice:
          '中心となる取組と対象を残し、修飾語を減らして30文字以内にしてください。',
        rewriteExample: fieldRewriteExamples[field.id],
      };
    }
    return {
      ...field,
      status: 'good' as const,
      message: `事業名は${text.length}文字で、30文字以内に収まっています。`,
      missing: [] as string[],
      score: 100,
      scoreBreakdown: [
        { label: '名称の入力', score: 20, max: 20 },
        { label: '30文字以内', score: 80, max: 80 },
      ],
      positives: ['30文字以内', '事業名の入力を確認'],
      advice:
        '取組内容が初見でも伝わる名称になっているか、最後に読み手の視点で確認してください。',
      rewriteExample: fieldRewriteExamples[field.id],
    };
  }
  const rules = fieldRules[field.id] || [];
  const passed = rules
    .filter((rule) => rule.test(text))
    .map((rule) => rule.label);
  const assessment = scorePlanText(field.id, text, passed, rules.length);
  const missing = [
    ...rules.filter(rule => !rule.test(text)).map(rule => rule.label),
    ...assessment.missing,
  ];
  const score = assessment.score;
  return {
    ...field,
    status: score >= 80 && missing.length === 0 ? 'good' as const : 'warning' as const,
    message: score >= 80 && missing.length === 0
      ? '具体的な内容と実績・数値根拠の記載を確認できました。'
      : `記載の充実度は${score}点です。${missing.length ? `「${missing.slice(0, 3).join('」「')}」を補ってください。` : '説明量や根拠の充実を検討してください。'}`,
    missing,
    score,
    scoreBreakdown: assessment.breakdown,
    positives: assessment.positives,
    advice: `${fieldAdvice[field.id] || ''} ${missing.length ? `追加で確認する点：${missing.join('、')}。` : '実績値・出典を原資料と照合してください。'}`,
    rewriteExample: fieldRewriteExamples[field.id],
  };
}

export default function Home() {
  const [selected, setSelected] = useState('jizokuka');
  const [step, setStep] = useState(1);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);
  const [businessType, setBusinessType] = useState('法人');
  const [applicantName, setApplicantName] = useState('');
  const [fiscalHistory, setFiscalHistory] = useState('1期以上');
  const [area, setArea] = useState('商工会議所地区');
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [openPlanGroups, setOpenPlanGroups] = useState<string[]>([
    '経営計画',
  ]);
  const [addons, setAddons] = useState<string[]>([]);
  const [taxStatus, setTaxStatus] = useState('課税事業者');
  const [expenses, setExpenses] = useState([
    { id: 1, category: '機械装置等費', name: '', amount: '' },
  ]);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [industry, setIndustry] = useState('商業・サービス業');
  const [employeeCount, setEmployeeCount] = useState('0');
  const [opened, setOpened] = useState('はい');
  const [largeOwned, setLargeOwned] = useState('いいえ');
  const [overlap, setOverlap] = useState('いいえ');
  const [pastReport, setPastReport] = useState('該当なし');
  const [postalCode, setPostalCode] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [checkMode, setCheckMode] = useState<'guided' | 'finalPdf'>('guided');
  const [guidedPlanFile, setGuidedPlanFile] = useState<File | null>(null);
  const [guidedPlanReading, setGuidedPlanReading] = useState(false);
  const guidedReadVersion = useRef(0);
  const [expenseFiles, setExpenseFiles] = useState<File[]>([]);
  const [requiredDocFiles, setRequiredDocFiles] = useState<
    Record<string, File>
  >({});
  const [expenseFilesChecked, setExpenseFilesChecked] = useState(false);
  const [requiredDocsChecked, setRequiredDocsChecked] = useState(false);
  const [supportingAnalysisState, setSupportingAnalysisState] = useState<
    'idle' | 'running'
  >('idle');
  const [expenseFileAnalysis, setExpenseFileAnalysis] = useState<{
    files: {
      name: string;
      readable: boolean;
      kind: 'quote' | 'expenseDetail' | 'unknown';
      hasAmount: boolean;
      hasItem: boolean;
      hasIssuer: boolean;
      hasDate: boolean;
      terms: string[];
    }[];
  } | null>(null);
  const [requiredDocAnalysis, setRequiredDocAnalysis] = useState<
    Record<
      string,
      {
        readable: boolean;
        expectedContent: boolean;
        applicantMatched: boolean | null;
        periodFound: boolean;
        freshness: 'valid' | 'expired' | 'unknown' | 'notApplicable';
      }
    >
  >({});
  const [resultScope, setResultScope] = useState<
    'plan' | 'expense' | 'documents' | 'all'
  >('plan');
  const [finalResultFilter, setFinalResultFilter] = useState<
    'all' | 'plan' | 'expense' | 'documents'
  >('all');
  const [resultOrder, setResultOrder] = useState<'priority' | 'form'>(
    'priority',
  );
  const [resultStatusFilter, setResultStatusFilter] = useState<
    'all' | 'action' | 'good'
  >('all');
  const [freeChecksUsed, setFreeChecksUsed] = useState(freeCheckLimit);
  const [quotaReady, setQuotaReady] = useState(false);
  const [quotaAuthenticated, setQuotaAuthenticated] = useState(false);
  const [quotaEmail, setQuotaEmail] = useState('');
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisState, setAnalysisState] = useState<
    'idle' | 'running' | 'error'
  >('idle');
  const [analysisError, setAnalysisError] = useState('');
  const [safeTestMode, setSafeTestMode] = useState(true);
  const [planTextAnalysis, setPlanTextAnalysis] = useState<{
    characters: number;
    detectedRound: number | null;
    foundHeadings: string[];
    extractedItems: number;
    sensitiveInfo: string[];
  } | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [resultCopyMessage, setResultCopyMessage] = useState('');
  const [fileValidationMessage, setFileValidationMessage] = useState('');
  const [qualityTestCase, setQualityTestCase] = useState<number | null>(null);
  const program = programs.find((item) => item.id === selected)!;
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('qualityTest');
    const caseNumber = Number(new URLSearchParams(window.location.search).get('qualityCase'));
    if (!['plan', 'expense', 'documents', 'safe-mode'].includes(target || '')) return;
    if (Number.isInteger(caseNumber) && caseNumber >= 1 && caseNumber <= qualityTestTitles.length) {
      setQualityTestCase(caseNumber);
    }
    setSelected('jizokuka');
    setCheckMode('finalPdf');
    setSafeTestMode(true);
    setStep(3);
    window.setTimeout(() => {
      document.getElementById(`quality-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, []);

  useEffect(() => {
    fetch('/api/quota', { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as {
          authenticated?: boolean;
          email?: string;
          used?: number;
        };
        setQuotaAuthenticated(Boolean(data.authenticated));
        setQuotaEmail(data.email || '');
        if (data.authenticated && Number.isFinite(data.used))
          setFreeChecksUsed(
            Math.min(freeCheckLimit, Math.max(0, Number(data.used))),
          );
      })
      .catch(() =>
        setFileValidationMessage(
          '無料チェックの残り回数を確認できませんでした。画面を再読み込みしてください。',
        ),
      )
      .finally(() => setQuotaReady(true));
  }, []);
  const requiredDocs = getRequiredDocs(
    businessType,
    fiscalHistory,
    area,
    addons,
  );
  const freeChecksRemaining = Math.max(freeCheckLimit - freeChecksUsed, 0);
  const requiredDocumentUploadCount = requiredDocs.filter(
    (doc) => requiredDocFiles[doc.title],
  ).length;
  const requiredDocumentsComplete =
    requiredDocs.length > 0 &&
    requiredDocumentUploadCount === requiredDocs.length &&
    requiredDocsChecked;
  const completedCheckGroups =
    (planTextAnalysis ? 1 : 0) +
    (expenseFilesChecked && expenseFiles.length > 0 ? 1 : 0) +
    (requiredDocumentsComplete ? 1 : 0);
  const grossExpenseTotal = expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  );
  const calculationBase =
    taxStatus === '課税事業者'
      ? Math.floor(grossExpenseTotal / 1.1)
      : grossExpenseTotal;
  const subsidyCap =
    500000 +
    (addons.includes('インボイス特例') ? 500000 : 0) +
    (addons.includes('賃金引上げ特例・加点') ? 1500000 : 0);
  const toCalculationBase = (amount: string) =>
    taxStatus === '課税事業者'
      ? Math.floor((Number(amount) || 0) / 1.1)
      : Number(amount) || 0;
  const websiteExpenseBase = expenses
    .filter((expense) => expense.category === 'ウェブサイト関連費')
    .reduce((sum, expense) => sum + toCalculationBase(expense.amount), 0);
  const otherExpenseBase = calculationBase - websiteExpenseBase;
  const otherSubsidy = Math.min(
    Math.floor((otherExpenseBase * 2) / 3),
    subsidyCap,
  );
  const websiteSubsidy = Math.min(
    Math.floor((websiteExpenseBase * 2) / 3),
    500000,
    Math.floor(otherSubsidy / 3),
    Math.floor(subsidyCap / 4),
  );
  const estimatedSubsidy = Math.min(otherSubsidy + websiteSubsidy, subsidyCap);
  const finalRequestedAmount =
    requestedAmount === '' ? estimatedSubsidy : Number(requestedAmount) || 0;
  const employeeLimit = industry === '商業・サービス業' ? 5 : 20;
  const eligibilityWarnings = [
    Number(employeeCount) > employeeLimit
      ? `この業種では、常時使用する従業員数が${employeeLimit}人を超えると小規模事業者の要件外となる可能性があります。`
      : '',
    opened === 'いいえ' ? '申請時点で開業していない事業者は対象外です。' : '',
    largeOwned === 'はい'
      ? '資本金5億円以上の法人による100%保有に該当する場合は対象外です。'
      : '',
    overlap === 'はい'
      ? '国の他制度と同一・類似内容の事業は重複して採択されません。'
      : '',
    pastReport === '未提出・提出後1年未満'
      ? '過去回の事業効果報告が未提出、または提出後の所定期間を満たさない場合は申請制限があります。'
      : '',
  ].filter(Boolean);
  const resultItems = planFields.map((field) => {
    const value = plan[field.id] || '';
    return {
      ...evaluatePlanField(field, value),
      ...(guidedPlanFile && !value.trim() ? { message: 'アップロードしたPDFから、この項目の本文を特定できませんでした。原本の記載と見出しを確認してください。', advice: 'PDF原本にこの項目の記載があるか確認してください。' } : {}),
      evidence:
        value.trim()
          ? createEvidenceExcerpt(value)
          : undefined,
    };
  });
  const planAverageScore = Math.round(
    resultItems.reduce((sum, item) => sum + (item.score || 0), 0) /
      resultItems.length,
  );
  const documentResults =
    checkMode === 'guided'
      ? requiredDocs
          .filter((doc) => doc.required && !uploaded.includes(doc.title))
          .map((doc) => ({
            id: `document-${doc.title}`,
            title: `必須書類：${doc.title}`,
            hint: doc.note,
            status: 'danger' as const,
            message:
              '必須書類として選択されていません。提出前に最新版を準備し、内容と対象期間を確認してください。',
            missing: ['書類ファイル'],
            advice: getRequiredDocumentGuidance(doc.title).advice,
            perspective: getRequiredDocumentGuidance(doc.title).perspective,
          }))
      : requiredDocs.map((doc) => {
          const file = requiredDocFiles[doc.title];
          const analysis = requiredDocAnalysis[doc.title];
          const guidance = getRequiredDocumentGuidance(doc.title);
          if (!file)
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: requiredDocsChecked
                ? ('danger' as const)
                : ('warning' as const),
              message: 'この書類のファイルが選択されていません。',
              missing: ['書類ファイル'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (!requiredDocsChecked)
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'warning' as const,
              message: `「${file.name}」は選択済みです。「必要書類をチェック」を押してください。`,
              missing: ['チェックの実行'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (!analysis?.readable)
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'warning' as const,
              message: `「${file.name}」は画像・Excel・Wordまたは文字情報のないPDFのため、本文を自動確認できませんでした。ファイルを開いて目視確認してください。`,
              missing: guidance.checkpoints,
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (analysis.applicantMatched === false)
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'warning' as const,
              message: `PDF本文から入力した申請者名・事業者名を確認できませんでした。別事業者の書類でないか、表記ゆれや文字の読み取り状態を確認してください。`,
              missing: ['申請者名・事業者名の一致'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (analysis.freshness === 'expired')
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'danger' as const,
              message:
                'PDFから読み取った最新の日付が3か月より前です。申請日時点で有効な証明書を取り直してください。',
              missing: ['発行後3か月以内の証明書'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (analysis.freshness === 'unknown')
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'warning' as const,
              message:
                'PDF本文から発行日を読み取れませんでした。原本で発行日を確認してください。',
              missing: ['発行日の目視確認'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          if (
            !analysis.periodFound &&
            /貸借対照表|損益計算書|決算書|確定申告|法人税申告書/u.test(
              doc.title,
            )
          )
            return {
              id: `document-${doc.title}`,
              title: `必要書類：${doc.title}`,
              hint: doc.note,
              status: 'warning' as const,
              message:
                'PDF本文から対象年・対象年度を明確に確認できませんでした。直近の対象期間の書類か原本で確認してください。',
              missing: ['対象年・対象年度'],
              advice: guidance.advice,
              perspective: guidance.perspective,
            };
          return analysis.expectedContent
            ? {
                id: `document-${doc.title}`,
                title: `必要書類：${doc.title}`,
                hint: doc.note,
                status: 'good' as const,
                message: `PDF本文から「${doc.title}」に対応する表題・記載を確認しました。`,
                missing: [] as string[],
                positives: [
                  `選択欄とPDF本文の書類種類が一致しています`,
                  `文字を読み取れるPDFとして確認できました`,
                  analysis.applicantMatched
                    ? '入力した申請者名・事業者名と一致しています'
                    : '',
                  analysis.freshness === 'valid'
                    ? '読み取った発行日は3か月以内です'
                    : '',
                  analysis.periodFound &&
                  /貸借対照表|損益計算書|決算書|確定申告|法人税申告書/u.test(
                    doc.title,
                  )
                    ? '対象年・対象年度の記載があります'
                    : '',
                ].filter(Boolean),
                advice: guidance.advice,
                perspective: guidance.perspective,
              }
            : {
                id: `document-${doc.title}`,
                title: `必要書類：${doc.title}`,
                hint: doc.note,
                status: 'warning' as const,
                message: `PDF本文から「${doc.title}」に対応する表題を確認できませんでした。別の書類を選択していないか確認してください。`,
                missing: ['書類の種類・表題の確認', ...guidance.checkpoints],
                advice: guidance.advice,
                perspective: guidance.perspective,
              };
        });
  const expenseResults = [] as {
    id: string;
    title: string;
    hint: string;
    status: 'danger' | 'warning' | 'good';
    message: string;
    missing: string[];
    positives?: string[];
    advice?: string;
  }[];
  const planTextForMatching = Object.values(plan).join(' ');
  const incompleteExpenses = expenses.filter(
    (expense) => !expense.name.trim() || (Number(expense.amount) || 0) <= 0,
  );
  if (checkMode === 'finalPdf' && expenseFiles.length > 0) {
    if (!expenseFilesChecked || !expenseFileAnalysis) {
      expenseResults.push({
        id: 'expense-files',
        title: `経費ファイル ${expenseFiles.length}件`,
        hint: '',
        status: 'warning',
        message:
          'ファイルは選択済みです。「経費明細をチェック」を押すと、1件ずつ確認します。',
        missing: ['チェックの実行'],
      });
    } else {
      expenseFileAnalysis.files.forEach((file, index) => {
        const isQuote = file.kind === 'quote';
        const missingSignals = [
          !file.hasAmount ? '金額' : '',
          !file.hasItem ? '品名・内容' : '',
          isQuote && !file.hasIssuer ? '発行者・購入先' : '',
          isQuote && !file.hasDate ? '発行日・見積日' : '',
        ].filter(Boolean);
        const complete = file.readable && missingSignals.length === 0;
        const matchedTerms = file.terms.filter((term) =>
          planTextForMatching.includes(term),
        );
        const hasPlan = planTextForMatching.trim().length > 0;
        const planMismatch =
          hasPlan && file.terms.length > 0 && matchedTerms.length === 0;
        expenseResults.push({
          id: `expense-file-${index}`,
          title: file.name,
          hint: '',
          status:
            complete && !planMismatch && file.kind !== 'unknown'
              ? 'good'
              : 'warning',
          message: !file.readable
            ? '画像・Excel・文字情報のないPDFのため、本文を自動確認できませんでした。ファイルを開いて目視確認してください。'
            : file.kind === 'unknown'
              ? '経費明細または見積書に対応する表題を確認できませんでした。別の種類の書類を選んでいないか確認してください。'
              : planMismatch
                ? `${isQuote ? '見積書' : '経費明細'}の基本項目は確認できましたが、読み取った取組「${file.terms.join('・')}」と事業計画のつながりを確認できませんでした。`
                : complete
                  ? isQuote
                    ? '見積書の金額・品名・発行者・日付を確認できました。'
                    : '経費明細の経費内容・金額を確認できました。見積書は別ファイルとして追加してください。'
                  : `本文は読み取れましたが、${missingSignals.join('・')}を明確に確認できませんでした。`,
          missing: !file.readable
            ? ['金額・品名・発行者・日付の目視確認']
            : file.kind === 'unknown'
              ? ['書類の種類・表題']
              : planMismatch
                ? [
                    ...missingSignals,
                    `${isQuote ? '見積書' : '経費明細'}の取組を事業計画に記載`,
                  ]
                : missingSignals,
          positives: file.readable
            ? [
                file.kind === 'quote'
                  ? '見積書として読み取りました'
                  : file.kind === 'expenseDetail'
                    ? '経費明細として読み取りました'
                    : '',
                file.hasAmount ? '金額の記載があります' : '',
                file.hasItem ? '品名・内容の記載があります' : '',
                isQuote && file.hasIssuer
                  ? '発行者・購入先の記載があります'
                  : '',
                isQuote && file.hasDate ? '発行日・見積日の記載があります' : '',
                matchedTerms.length
                  ? `事業計画と共通する取組語を確認：${matchedTerms.join('・')}`
                  : '',
              ].filter(Boolean)
            : [],
          advice: !hasPlan
            ? '先に事業計画書をチェックすると、この見積書の内容が計画本文にも書かれているか照合できます。'
            : file.terms.length > 0 && matchedTerms.length === 0
              ? `見積書では「${file.terms.join('・')}」に関する取組が読み取れますが、事業計画に同じ手がかりがありません。何を、なぜ導入・実施するのかを計画本文に追記してください。`
              : complete
                ? '事業計画と、品名・数量・税込金額が一致するか最後に原本で照合してください。'
                : '見積書の表題、宛名、発行者、発行日、品名・数量・単価・税込合計を目視で確認し、不足があれば発行元へ再発行を依頼してください。',
        });
      });
    }
  } else if (grossExpenseTotal <= 0)
    expenseResults.push({
      id: 'expense-empty',
      title: '経費明細',
      hint: '',
      status: 'warning',
      message:
        '金額が入力された経費を確認できません。見積書どおりの税込金額を1件ずつ入力してください。',
      missing: ['経費内容・税込金額'],
    });
  else if (incompleteExpenses.length > 0)
    expenseResults.push({
      id: 'expense-incomplete',
      title: '経費明細の入力漏れ',
      hint: '',
      status: 'danger',
      message: `${incompleteExpenses.length}件の経費で、内容または税込金額が不足しています。`,
      missing: ['経費内容・税込金額'],
    });
  else
    expenseResults.push({
      id: 'expense-complete',
      title: '経費明細',
      hint: '',
      status: 'good',
      message:
        'すべての経費に内容と税込金額が入力されています。見積書の記載と一致するか最終確認してください。',
      missing: [],
    });
  if (websiteExpenseBase > 0 && otherExpenseBase <= 0)
    expenseResults.push({
      id: 'expense-web-only',
      title: 'ウェブサイト関連費',
      hint: '',
      status: 'danger',
      message:
        'ウェブサイト関連費だけで申請することはできません。他の対象経費を含む事業計画か確認してください。',
      missing: ['ウェブサイト関連費以外の対象経費'],
    });
  if (finalRequestedAmount > estimatedSubsidy)
    expenseResults.push({
      id: 'expense-over-request',
      title: '補助金申請額',
      hint: '',
      status: 'danger',
      message: `申請額が自動計算の上限を${(finalRequestedAmount - estimatedSubsidy).toLocaleString()}円超えています。`,
      missing: ['申請額の修正'],
    });
  const allResultItems =
    checkMode === 'finalPdf'
      ? resultScope === 'plan'
        ? resultItems
        : resultScope === 'expense'
          ? expenseResults
          : resultScope === 'documents'
            ? documentResults
            : [...resultItems, ...expenseResults, ...documentResults]
      : [...documentResults, ...expenseResults, ...resultItems];
  const dangerCount = allResultItems.filter(
    (item) => item.status === 'danger',
  ).length;
  const warningCount = allResultItems.filter(
    (item) => item.status === 'warning',
  ).length;
  const goodCount = allResultItems.filter(
    (item) => item.status === 'good',
  ).length;
  const priority = { danger: 0, warning: 1, good: 2 } as const;
  const freeResults =
    resultOrder === 'priority'
      ? [...allResultItems].sort((a, b) => {
          const statusDifference = priority[a.status] - priority[b.status];
          if (statusDifference !== 0) return statusDifference;
          const aScore = 'score' in a && typeof a.score === 'number' ? a.score : 101;
          const bScore = 'score' in b && typeof b.score === 'number' ? b.score : 101;
          return aScore - bScore;
        })
      : allResultItems;
  const categoryFilteredResults =
    resultScope !== 'all' || finalResultFilter === 'all'
      ? freeResults
      : freeResults.filter((item) =>
          finalResultFilter === 'documents'
            ? item.id.startsWith('document-')
            : finalResultFilter === 'expense'
              ? item.id.startsWith('expense-')
              : !item.id.startsWith('document-') &&
                !item.id.startsWith('expense-'),
        );
  const displayedResults = categoryFilteredResults.filter((item) =>
    resultStatusFilter === 'action'
      ? item.status !== 'good'
      : resultStatusFilter === 'good'
        ? item.status === 'good'
        : true,
  );
  const visibleActionCount = categoryFilteredResults.filter(
    (item) => item.status !== 'good',
  ).length;
  const visibleGoodCount = categoryFilteredResults.filter(
    (item) => item.status === 'good',
  ).length;
  const finalReviewCategories = [
    { label: '事業計画書', items: resultItems },
    { label: '経費明細', items: expenseResults },
    { label: '必要書類', items: documentResults },
  ].map((category) => ({
    ...category,
    danger: category.items.filter((item) => item.status === 'danger').length,
    warning: category.items.filter((item) => item.status === 'warning').length,
    good: category.items.filter((item) => item.status === 'good').length,
  }));
  const firstReviewCategory = [...finalReviewCategories].sort(
    (a, b) => b.danger - a.danger || b.warning - a.warning,
  )[0];
  const lockedResultCount = 0;

  const copyResultSummary = async () => {
    const shareItems = displayedResults.filter(
      (item) => item.status !== 'good',
    );
    const lines = [
      'テスト（補助金チェック）　確認結果',
      `修正が必要：${dangerCount}件／確認が必要：${warningCount}件／確認できた：${goodCount}件`,
      '',
      ...(shareItems.length
        ? shareItems.flatMap((item, index) =>
            [
              `${index + 1}. ［${item.status === 'danger' ? '修正が必要' : '確認が必要'}］${item.title}`,
              item.message,
              item.advice ? `改善アドバイス：${item.advice}` : '',
              '',
            ].filter(Boolean),
          )
        : ['修正・確認が必要な項目はありません。']),
      '※貼り付けた原文、PDFから読み取った原文、個人情報候補は含めていません。',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setResultCopyMessage('結果をコピーしました');
    } catch {
      setResultCopyMessage(
        'コピーできませんでした。印刷・PDF保存をご利用ください。',
      );
    }
  };

  const saveDraft = () => {
    if (checkMode === 'finalPdf' && safeTestMode) {
      setDraftMessage(
        '実書類テストモード中は保存できません。貼り付けた文章やPDFから読み取った内容は、この画面を閉じると消えます。',
      );
      return;
    }
    const draft = {
      savedAt: Date.now(),
      selected,
      step,
      businessType,
      fiscalHistory,
      area,
      plan,
      addons,
      taxStatus,
      expenses,
      requestedAmount,
      industry,
      employeeCount,
      opened,
      largeOwned,
      overlap,
      pastReport,
      postalCode,
      municipality,
      checkMode,
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    setDraftMessage('この端末に保存しました。30日後に自動削除されます。');
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return setDraftMessage('保存された入力内容はありません。');
      const draft = JSON.parse(raw);
      if (!draft.savedAt || Date.now() - draft.savedAt > draftLifetimeMs) {
        localStorage.removeItem(draftStorageKey);
        return setDraftMessage(
          '保存期限の30日を過ぎたため、入力内容を削除しました。',
        );
      }
      setSelected('jizokuka');
      setStep(
        draft.selected && draft.selected !== 'jizokuka' ? 1 : draft.step || 1,
      );
      setBusinessType(draft.businessType || '法人');
      setFiscalHistory(draft.fiscalHistory || '1期以上');
      setArea(draft.area || '商工会議所地区');
      setPlan(draft.plan || {});
      setAddons(draft.addons || []);
      setTaxStatus(draft.taxStatus || '課税事業者');
      setExpenses(
        draft.expenses || [
          { id: 1, category: '機械装置等費', name: '', amount: '' },
        ],
      );
      setRequestedAmount(draft.requestedAmount || '');
      setIndustry(draft.industry || '商業・サービス業');
      setEmployeeCount(draft.employeeCount || '0');
      setOpened(draft.opened || 'はい');
      setLargeOwned(draft.largeOwned || 'いいえ');
      setOverlap(draft.overlap || 'いいえ');
      setPastReport(draft.pastReport || '該当なし');
      setPostalCode(draft.postalCode || '');
      setMunicipality(draft.municipality || '');
      setCheckMode(draft.checkMode || 'guided');
      setUploaded([]);
      setDraftMessage(
        '保存した入力内容を復元しました。PDFなどのファイルは保存されていません。',
      );
    } catch {
      localStorage.removeItem(draftStorageKey);
      setDraftMessage('保存データを読み込めなかったため削除しました。');
    }
  };

  const moveToPlanField = (fieldId: string) => {
    const targetGroup = planFieldGroups.find((group) =>
      group.fields.some((field) => field.id === fieldId),
    );
    if (targetGroup) {
      setOpenPlanGroups((current) =>
        current.includes(targetGroup.title)
          ? current
          : [...current, targetGroup.title],
      );
    }
    setStep(3);
    window.setTimeout(() => {
      const target = document.getElementById(`plan-field-${fieldId}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target instanceof HTMLTextAreaElement) target.focus();
    }, 120);
  };

  const clearDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setDraftMessage(
      'この端末に保存した入力内容を削除しました。現在の画面入力は残っています。',
    );
  };

  const consumeFreeCheck = async () => {
    try {
      const response = await fetch('/api/quota', { method: 'POST' });
      const data = (await response.json()) as {
        authenticated?: boolean;
        used?: number;
        accepted?: boolean;
      };
      if (data.authenticated && Number.isFinite(data.used))
        setFreeChecksUsed(
          Math.min(freeCheckLimit, Math.max(0, Number(data.used))),
        );
      if (!response.ok || !data.accepted)
        setFileValidationMessage(
          response.status === 401
            ? '利用情報を確認できませんでした。ページを再読み込みしてください。'
            : '無料チェック10回を使い切りました。有料版の案内をご確認ください。',
        );
      return response.ok && Boolean(data.accepted);
    } catch {
      setFileValidationMessage(
        '無料チェックの利用回数を更新できませんでした。通信状態を確認して、もう一度お試しください。',
      );
      return false;
    }
  };

  const filesWithinLimit = (files: File[]) => {
    const oversized = files.filter((file) => file.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      setFileValidationMessage(
        `「${oversized[0].name}」は20MBを超えています。PDFを圧縮または分割してから選び直してください。無料回数は消費されません。`,
      );
      return false;
    }
    setFileValidationMessage('');
    return true;
  };

  const readSupportingPdf = async (file: File) => {
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    )
      return { readable: false, text: '', pages: [] as string[] };
    try {
      const pdfjs = await import('pdfjs-dist');
      globalThis.pdfjsWorker = { WorkerMessageHandler };
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      }).promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' '),
        );
      }
      const text = normalizePdfText(pages.join('\n'));
      return { readable: text.length >= 20, text, pages };
    } catch {
      return { readable: false, text: '', pages: [] as string[] };
    }
  };

  const loadGuidedPlan = async (file: File) => {
    const version = ++guidedReadVersion.current;
    setGuidedPlanReading(true);
    setPlan({});
    setPlanTextAnalysis(null);
    setFileValidationMessage('');
    try {
      const result = await readSupportingPdf(file);
      if (version !== guidedReadVersion.current) return false;
      if (!result.readable) {
        setFileValidationMessage('PDFの文字を読み取れませんでした。画像だけのPDFには対応していません。文字情報のある事業計画書PDFを選び直してください。');
        return false;
      }
      const extracted = extractPlanSections(result.pages);
      if (!Object.values(extracted).some(value => value.trim())) {
        setFileValidationMessage('PDFから計画項目の本文を特定できませんでした。事業計画書の見出しと文字情報を確認してください。');
        return false;
      }
      setPlan(extracted);
      const filled = planFields.filter(field => extracted[field.id]?.trim());
      setPlanTextAnalysis({
        characters: result.text.length,
        detectedRound: null,
        foundHeadings: filled.map(field => field.title),
        extractedItems: filled.length,
        sensitiveInfo: detectSensitiveInfo(result.text),
      });
      return true;
    } finally {
      if (version === guidedReadVersion.current) setGuidedPlanReading(false);
    }
  };

  const checkGuidedDocuments = async () => {
    if (guidedPlanReading) return;
    if (!guidedPlanFile) {
      setFileValidationMessage('事業計画書のPDFを選んでください。');
      return;
    }
    const ready = planTextAnalysis && Object.values(plan).some(value => value.trim());
    if (!ready && !(await loadGuidedPlan(guidedPlanFile))) return;
    setResultScope('all');
    setStep(4);
  };

  const expectedDocumentPattern = (title: string) => {
    if (/様式4|事業支援計画書/u.test(title)) return /様式\s*4|事業支援計画書/u;
    if (/貸借対照表/u.test(title)) return /貸借対照表|資産の部|負債の部/u;
    if (/損益計算書/u.test(title)) return /損益計算書|売上高|営業利益/u;
    if (/確定申告書 第一表/u.test(title))
      return /確定申告書.*第一表|申告書B?第一表|所得税.*第一表/u;
    if (/確定申告書 第二表/u.test(title))
      return /確定申告書.*第二表|申告書B?第二表|所得税.*第二表/u;
    if (/確定申告/u.test(title)) return /確定申告|所得税|申告書/u;
    if (/青色申告決算書|収支内訳書/u.test(title))
      return /青色申告決算書|収支内訳書|売上金額|所得金額/u;
    if (/開業届/u.test(title))
      return /個人事業の開業|開業・廃業等届出書|開業届/u;
    if (/収益事業開始届出書/u.test(title))
      return /収益事業開始届出書|収益事業/u;
    if (/活動計算書/u.test(title)) return /活動計算書|経常収益|経常費用/u;
    if (/法人税申告書 別表一/u.test(title))
      return /法人税.*別表一|別表一.*法人税|各事業年度の所得/u;
    if (/法人税申告書 別表四/u.test(title))
      return /法人税.*別表四|別表四.*法人税|所得の金額の計算/u;
    if (/法人税申告書/u.test(title)) return /法人税|別表一|別表四|確定申告書/u;
    if (/賃金台帳/u.test(title)) return /賃金台帳|基本給|賃金|給与/u;
    if (/雇用条件/u.test(title))
      return /雇用契約|労働条件|所定労働時間|年間休日/u;
    if (/売上台帳/u.test(title)) return /売上台帳|売上高|売上日/u;
    if (/履歴事項全部証明書/u.test(title))
      return /履歴事項全部証明書|会社法人等番号/u;
    if (/インボイス/u.test(title))
      return /適格請求書発行事業者|登録番号|インボイス/u;
    return new RegExp(title.replace(/[（）()・]/gu, '.?').slice(0, 12), 'u');
  };

  const analyzeExpenseFiles = async () => {
    if (
      !quotaReady ||
      !quotaAuthenticated ||
      !expenseFiles.length ||
      supportingAnalysisState === 'running' ||
      freeChecksRemaining <= 0
    )
      return;
    setSupportingAnalysisState('running');
    const results = await Promise.all(expenseFiles.map(readSupportingPdf));
    if (results.some((result) => !result.readable)) {
      setFileValidationMessage('読み取れないPDFが含まれています。文字情報のあるPDFに差し替えてください。無料回数は消費されません。');
      setSupportingAnalysisState('idle');
      return;
    }
    if (!(await consumeFreeCheck())) {
      setSupportingAnalysisState('idle');
      return;
    }
    setExpenseFileAnalysis({
      files: results.map((result, index) => ({
        name: expenseFiles[index].name,
        readable: result.readable,
        kind: /御?見積書|見積番号|見積金額|お見積り|見積有効期限/u.test(
          result.text,
        )
          ? ('quote' as const)
          : /経費明細|経費内訳|補助対象経費/u.test(result.text)
            ? ('expenseDetail' as const)
            : ('unknown' as const),
        hasAmount:
          /(?:¥|￥|金額|合計|税込|税抜|単価)[^。]{0,30}[0-9０-９,，]+|[0-9０-９,，]+\s*円/u.test(
            result.text,
          ),
        hasItem: /品名|内容|摘要|経費|数量|個|式|部|枚|回/u.test(result.text),
        hasIssuer: /発行者|見積先|購入先|会社名|株式会社|有限会社|御中/u.test(
          result.text,
        ),
        hasDate:
          /(?:20[0-9]{2}|令和[0-9０-９]+)年?[\/年.-][0-9０-９]{1,2}/u.test(
            result.text,
          ),
        terms: expenseConsistencyTerms.filter((term) =>
          result.text.includes(term),
        ),
      })),
    });
    setExpenseFilesChecked(true);
    setResultScope('expense');
    setSupportingAnalysisState('idle');
    setStep(4);
  };

  const analyzeRequiredDocuments = async () => {
    if (
      !quotaReady ||
      !quotaAuthenticated ||
      !Object.keys(requiredDocFiles).length ||
      supportingAnalysisState === 'running' ||
      freeChecksRemaining <= 0
    )
      return;
    setSupportingAnalysisState('running');
    const entries = await Promise.all(
      Object.entries(requiredDocFiles).map(async ([title, file]) => {
        const result = await readSupportingPdf(file);
        const isApplicationConfirmation =
          /申請内容確認|経営計画|補助事業計画/u.test(result.text);
        const hasForm4Identity =
          /事業支援計画書/u.test(result.text) &&
          /支援内容|商工会議所名|商工会名|発行日|代表者印/u.test(result.text);
        const expectedContent =
          result.readable &&
          expectedDocumentPattern(title).test(result.text) &&
          (!/事業支援計画書/u.test(title) ||
            (hasForm4Identity && !isApplicationConfirmation));
        const normalizeApplicant = (value: string) =>
          value
            .normalize('NFKC')
            .replace(/株式会社|合同会社|有限会社/gu, '')
            .replace(/[\s　・･.,，．]/gu, '');
        const normalizedApplicant = normalizeApplicant(applicantName);
        const normalizedDocument = normalizeApplicant(result.text);
        const westernDates = [
          ...result.text.matchAll(
            /(20\d{2})[年\/.-](\d{1,2})[月\/.-](\d{1,2})日?/gu,
          ),
        ].map(
          (match) =>
            new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
        );
        const reiwaDates = [
          ...result.text.matchAll(
            /令和\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/gu,
          ),
        ].map(
          (match) =>
            new Date(
              2018 + Number(match[1]),
              Number(match[2]) - 1,
              Number(match[3]),
            ),
        );
        const dates = [...westernDates, ...reiwaDates].filter(
          (date) => !Number.isNaN(date.getTime()) && date <= new Date(),
        );
        const latestDate = dates.sort((a, b) => b.getTime() - a.getTime())[0];
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const freshness = /履歴事項全部証明書/u.test(title)
          ? !latestDate
            ? ('unknown' as const)
            : latestDate >= threeMonthsAgo
              ? ('valid' as const)
              : ('expired' as const)
          : ('notApplicable' as const);
        return [
          title,
          {
            readable: result.readable,
            expectedContent,
            applicantMatched: normalizedApplicant
              ? normalizedDocument.includes(normalizedApplicant)
              : null,
            periodFound: /(?:20\d{2}|令和\s*[0-9０-９]+)\s*(?:年|年度)/u.test(
              result.text,
            ),
            freshness,
          },
        ] as const;
      }),
    );
    if (entries.some(([, result]) => !result.readable)) {
      setFileValidationMessage('読み取れないPDFが含まれています。文字情報のあるPDFに差し替えてください。無料回数は消費されません。');
      setSupportingAnalysisState('idle');
      return;
    }
    if (!(await consumeFreeCheck())) {
      setSupportingAnalysisState('idle');
      return;
    }
    setRequiredDocAnalysis(Object.fromEntries(entries));
    setRequiredDocsChecked(true);
    setResultScope('documents');
    setSupportingAnalysisState('idle');
    setStep(4);
  };

  const startPlanTextAnalysis = async () => {
    const filledFields = planFields.filter(
      (field) => (plan[field.id] || '').trim().length > 0,
    );
    if (
      !quotaReady ||
      !quotaAuthenticated ||
      filledFields.length === 0 ||
      analysisState === 'running' ||
      freeChecksRemaining <= 0
    )
      return;
    const wait = (milliseconds: number) =>
      new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    setAnalysisState('running');
    setAnalysisError('');
    setPlanTextAnalysis(null);
    setAnalysisStage(1);
    try {
      await wait(250);
      setAnalysisStage(2);
      const normalizedText = filledFields
        .map((field) => `${field.title}\n${plan[field.id]}`)
        .join('\n\n');
      const text = normalizedText.replace(/\s+/g, ' ');
      setAnalysisStage(3);
      const sensitiveInfo = detectSensitiveInfo(text);
      setPlanTextAnalysis({
        characters: text.length,
        detectedRound: null,
        foundHeadings: filledFields.map((field) => field.title),
        extractedItems: filledFields.length,
        sensitiveInfo,
      });
      await consumeFreeCheck();
      await wait(250);
      setAnalysisStage(4);
      await wait(450);
      setAnalysisState('idle');
      setResultScope('plan');
      setStep(4);
    } catch {
      setAnalysisState('error');
      setAnalysisError('文章を採点できませんでした。入力内容を確認して、もう一度お試しください。');
    }
  };

  const endWithoutSaving = () => {
    guidedReadVersion.current += 1;
    setGuidedPlanReading(false);
    setPlanTextAnalysis(null);
    setPlan({});
    setGuidedPlanFile(null);
    setUploaded([]);
    setExpenseFiles([]);
    setRequiredDocFiles({});
    setExpenseFilesChecked(false);
    setRequiredDocsChecked(false);
    setExpenseFileAnalysis(null);
    setRequiredDocAnalysis({});
    setSupportingAnalysisState('idle');
    setApplicantName('');
    setAnalysisStage(0);
    setAnalysisState('idle');
    setAnalysisError('');
    setStep(1);
    setDraftMessage(
      '実書類の解析内容を画面から削除しました。端末内の既存の一時保存データには触れていません。',
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="brand-header print:hidden">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 pt-1 sm:h-24 sm:px-8">
          <a
            href="/"
            aria-label="テスト トップへ"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:gap-3.5"
          >
            <span className="text-xl font-bold text-[#072f5f] sm:text-2xl">テスト</span>
            <span className="text-xs font-medium text-[#072f5f] sm:text-sm">
              補助金チェック
            </span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:inline">
              公募要領 第20回・第8版対応
            </span>
            <a
              href="/faq"
              className="inline-flex h-8 items-center rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              よくある質問
            </a>
            <a
              href="/privacy"
              className="inline-flex h-8 items-center rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              データ取扱い
            </a>
            <a
              href="/terms"
              className="hidden h-8 items-center rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            >
              利用規約
            </a>
            <a
              href="/commercial-transactions"
              className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-primary"
            >
              特商法表記
            </a>
            <a
              href="/contact"
              className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="size-4" />
              <span className="hidden sm:inline">お問い合わせ</span>
            </a>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-center text-xs leading-5 text-amber-950 print:hidden">
        <strong>現在はベータ試作版です。</strong>{' '}
        実在情報を含むPDFを試す場合は「実書類テストモード」を有効にしてください。第20回の参考資料・FAQ・操作手引きが公開され、管理者が内容を承認するまでは暫定チェックです。{' '}
        <a href="/coverage" className="font-bold underline underline-offset-4">
          対応範囲を確認
        </a>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-12 print:block print:max-w-none print:px-0 print:py-0">
        <aside className="hidden lg:block print:hidden">
          <p className="mb-5 text-xs font-bold tracking-[0.08em] text-muted-foreground">
            申請前チェック
          </p>
          <ol className="space-y-2" aria-label="チェックの手順">
            {steps.map((label, index) => (
              <li
                key={label}
                className={`step-item ${index + 1 === step ? 'step-active' : ''}`}
              >
                <span>
                  {index + 1 < step ? (
                    <Check className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <p>{label}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-emerald-950">
            <ShieldCheck className="mb-3 size-5 text-emerald-700" />
            <p className="text-sm font-bold">書類は安全に確認</p>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-900/70">
              選択したファイルは保存しません。文章と金額は、利用者が一時保存を押した場合だけ端末内に保存します。
            </p>
          </div>
        </aside>

        <section>
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold text-muted-foreground lg:hidden print:hidden">
            <span className="rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
              {step}
            </span>
            <span>{steps[step - 1]}</span>
            <ChevronRight className="size-3.5" />
            <span>全4ステップ</span>
          </div>
          <div className="mb-6 rounded-2xl border border-border bg-white p-3 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4 print:hidden">
            <p className="text-xs leading-5 text-muted-foreground">
              共有端末では保存しないでください。入力した文章・金額だけをこの端末に30日間保存します。
            </p>
            <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={restoreDraft}
              >
                保存内容を復元
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveDraft}
                disabled={checkMode === 'finalPdf' && safeTestMode}
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                一時保存
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearDraft}
                className="gap-1.5 text-muted-foreground"
              >
                <Trash2 className="size-3.5" />
                保存を削除
              </Button>
            </div>
          </div>
          {draftMessage && (
            <p
              role="status"
              className="mb-6 rounded-xl bg-primary/8 px-4 py-3 text-xs font-medium leading-5 text-primary"
            >
              {draftMessage}
            </p>
          )}

          {step === 1 ? (
            <>
              <Badge
                variant="secondary"
                className="mb-4 gap-1.5 bg-amber-100 text-amber-900"
              >
                <Sparkles className="size-3" /> 公募要領をもとにチェック
              </Badge>
              <h1 className="max-w-2xl font-heading text-3xl font-bold leading-[1.35] tracking-tight sm:text-[38px]">
                申請する補助金を
                <br className="sm:hidden" />
                選んでください
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                あなたに必要な書類だけを、順番にわかりやすくご案内します。
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {programs.map((item) => {
                  const active = selected === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!item.enabled}
                      onClick={() => setSelected(item.id)}
                      aria-pressed={active}
                      className={`program-card ${active ? 'program-card-active' : ''} ${!item.enabled ? 'cursor-not-allowed opacity-65' : ''}`}
                    >
                      <span className={`program-icon ${item.tone}`}>
                        <FileSearch className="size-6" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          {item.short}
                          {!item.enabled && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-[10px] text-amber-900"
                            >
                              準備中
                            </Badge>
                          )}
                        </span>
                        <span className="mt-1.5 block text-[15px] font-bold leading-6">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                        <span className="mt-4 block rounded-lg bg-muted/70 px-3 py-2 text-xs">
                          {item.enabled ? '申請締切' : '利用開始'}{' '}
                          <strong className="ml-1 font-bold">
                            {item.deadline}
                          </strong>
                        </span>
                      </span>
                      <span
                        className={`check-dot ${active ? 'check-dot-active' : ''}`}
                      >
                        {active && (
                          <Check className="size-3.5" strokeWidth={3} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7">
                <p className="mb-3 text-sm font-bold">チェック方法を選ぶ</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCheckMode('guided')}
                    aria-pressed={checkMode === 'guided'}
                    className={`choice-button min-h-20 ${checkMode === 'guided' ? 'choice-active' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <ListChecks className="size-5" />
                      <span>
                        <strong className="block">1つずつ準備</strong>
                        <small className="mt-1 block font-normal text-muted-foreground">
                          初めての申請におすすめ
                        </small>
                      </span>
                    </span>
                    {checkMode === 'guided' && <Check className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckMode('finalPdf')}
                    aria-pressed={checkMode === 'finalPdf'}
                    className={`choice-button min-h-20 ${checkMode === 'finalPdf' ? 'choice-active' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <FileUp className="size-5" />
                      <span>
                        <strong className="block">まとめて確認</strong>
                        <small className="mt-1 block font-normal text-muted-foreground">
                          文章貼り付けと書類添付で確認
                        </small>
                      </span>
                    </span>
                    {checkMode === 'finalPdf' && <Check className="size-4" />}
                  </button>
                </div>
              </div>
              <Card className="mt-6 border-0 bg-[#f8f5ef] shadow-none ring-0">
                <CardContent className="flex items-start gap-3 text-sm leading-6 text-[#554d42]">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white font-serif text-xs font-bold shadow-sm">
                    i
                  </span>
                  <p>
                    まだ補助金が決まっていない場合も、いくつかの質問から対象になりそうな制度を確認できます。
                  </p>
                </CardContent>
              </Card>
              <Footer onNext={() => setStep(2)} />
            </>
          ) : step === 2 ? (
            <>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 bg-white text-primary"
              >
                {program.short}
              </Badge>
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-[38px]">
                あなたの事業について
                <br className="sm:hidden" />
                教えてください
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                回答に合わせて、必要書類とチェック項目を絞り込みます。
              </p>
              <div className="mt-8 space-y-5">
                <Question
                  number="1"
                  title="事業者の種類は？"
                  options={['法人', '個人事業主', 'NPO法人']}
                  value={businessType}
                  onChange={setBusinessType}
                />
                <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                  <label htmlFor="applicant-name" className="font-bold">
                    申請者名・事業者名{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      （任意）
                    </span>
                  </label>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    入力すると、必要書類PDFの名義と照合します。この項目は一時保存されません。
                  </p>
                  <Input
                    id="applicant-name"
                    value={applicantName}
                    onChange={(event) => {
                      setApplicantName(event.target.value);
                      setRequiredDocsChecked(false);
                    }}
                    placeholder="例：株式会社〇〇／山田太郎"
                    autoComplete="off"
                    className="mt-3 max-w-lg"
                  />
                </div>
                {selected === 'jizokuka' ? (
                  <>
                    <Question
                      number="2"
                      title="決算・確定申告を迎えた回数は？"
                      options={['まだ0回', '1期以上']}
                      value={fiscalHistory}
                      onChange={setFiscalHistory}
                    />
                    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          3
                        </span>
                        <div>
                          <h2 className="font-bold">所在地から相談先を探す</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            番地は入力しません。郵便番号または市区町村までで検索します。
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
                        <label className="text-xs font-bold text-muted-foreground">
                          郵便番号
                          <Input
                            inputMode="numeric"
                            value={postalCode}
                            onChange={(event) =>
                              setPostalCode(
                                event.target.value
                                  .replace(/[^0-9-]/g, '')
                                  .slice(0, 8),
                              )
                            }
                            placeholder="123-4567"
                            className="mt-2"
                          />
                        </label>
                        <label className="text-xs font-bold text-muted-foreground">
                          都道府県・市区町村
                          <Input
                            value={municipality}
                            onChange={(event) =>
                              setMunicipality(event.target.value)
                            }
                            placeholder="例：東京都新宿区"
                            className="mt-2"
                          />
                        </label>
                      </div>
                      {(postalCode || municipality) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href="https://www.shokokai.or.jp/?page_id=1754"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-xs font-bold hover:border-primary hover:text-primary"
                          >
                            商工会を公式検索
                          </a>
                          <a
                            href="https://www.jcci.or.jp/ccisearch/?page=cciSearch"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-xs font-bold hover:border-primary hover:text-primary"
                          >
                            商工会議所を公式検索
                          </a>
                        </div>
                      )}
                    </div>
                    <Question
                      number="4"
                      title="事業所はどちらの地区ですか？"
                      options={['商工会地区', '商工会議所地区', 'わからない']}
                      value={area}
                      onChange={setArea}
                    />
                    <fieldset className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                      <legend className="sr-only">希望する特例・加点</legend>
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          5
                        </span>
                        <div>
                          <h2 className="font-bold">希望する特例・加点は？</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            複数選べます。まだ決めていない場合は空欄で進められます。
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {addonOptions.map((option) => {
                          const active = addons.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={active}
                              onClick={() =>
                                setAddons((current) =>
                                  active
                                    ? current.filter((item) => item !== option)
                                    : [...current, option],
                                )
                              }
                              className={`choice-button ${active ? 'choice-active' : ''}`}
                            >
                              <span>{option}</span>
                              {active && <Check className="size-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <Question
                      number="6"
                      title="消費税の区分は？"
                      options={[
                        '課税事業者',
                        '免税事業者・簡易課税',
                        'わからない',
                      ]}
                      value={taxStatus}
                      onChange={setTaxStatus}
                    />
                    <div className="pt-3">
                      <Badge variant="secondary" className="mb-3">
                        申請資格の簡易診断
                      </Badge>
                      <h2 className="text-xl font-bold">
                        対象となる事業者か確認
                      </h2>
                    </div>
                    <Question
                      number="7"
                      title="主な業種は？"
                      options={[
                        '商業・サービス業',
                        '宿泊業・娯楽業',
                        '製造業その他',
                      ]}
                      value={industry}
                      onChange={setIndustry}
                    />
                    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          8
                        </span>
                        <label htmlFor="employees" className="font-bold">
                          常時使用する従業員は何人ですか？
                        </label>
                      </div>
                      <Input
                        id="employees"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={employeeCount}
                        onChange={(event) =>
                          setEmployeeCount(event.target.value)
                        }
                        className="mt-4 max-w-40"
                      />
                    </div>
                    <Question
                      number="9"
                      title="申請時点ですでに開業していますか？"
                      options={['はい', 'いいえ']}
                      value={opened}
                      onChange={setOpened}
                    />
                    <Question
                      number="10"
                      title="資本金5億円以上の法人に100%保有されていますか？"
                      options={['いいえ', 'はい', 'わからない']}
                      value={largeOwned}
                      onChange={setLargeOwned}
                    />
                    <Question
                      number="11"
                      title="国の他補助金と同じ・似た取組を申請していますか？"
                      options={['いいえ', 'はい', 'わからない']}
                      value={overlap}
                      onChange={setOverlap}
                    />
                    <Question
                      number="12"
                      title="過去の持続化補助金の事業効果報告は？"
                      options={[
                        '該当なし',
                        '提出済み・期間経過',
                        '未提出・提出後1年未満',
                      ]}
                      value={pastReport}
                      onChange={setPastReport}
                    />
                    {eligibilityWarnings.length > 0 && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950">
                        <p className="font-bold">
                          この回答では書類チェックへ進めません
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6">
                          {eligibilityWarnings.map((warning) => (
                            <li key={warning} className="flex gap-2">
                              <span>・</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-xs leading-5">
                          回答に誤りがないか確認し、不明な場合は地域の商工会・商工会議所へ相談してください。
                        </p>
                        <a
                          href={
                            area === '商工会地区'
                              ? 'https://official.jizokukanb.com/'
                              : 'https://r6.jizokukahojokin.info/'
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm font-bold underline underline-offset-4"
                        >
                          公式の相談案内を確認する
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Question
                      number="2"
                      title="申請する事業枠は？"
                      options={[
                        '革新的新製品・サービス枠',
                        '新事業進出枠',
                        'グローバル枠',
                      ]}
                      value={area}
                      onChange={setArea}
                    />
                    <Question
                      number="3"
                      title="提出できる決算書は何期分ですか？"
                      options={['3期分', '1〜2期分', '創業後1年未満']}
                      value={fiscalHistory}
                      onChange={setFiscalHistory}
                    />
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="h-12 gap-2"
                >
                  <ArrowLeft /> 戻る
                </Button>
                <Button
                  size="lg"
                  disabled={eligibilityWarnings.length > 0}
                  onClick={() => setStep(3)}
                  className="h-12 gap-2 rounded-xl px-6 text-[15px]"
                >
                  必要書類を確認する <ArrowRight />
                </Button>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 bg-white text-primary"
              >
                {businessType}・{area}
              </Badge>
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-[38px]">
                {checkMode === 'finalPdf' ? (
                  '書類の種類ごとに確認'
                ) : (
                  <>
                    必要書類を1つずつ
                    <br className="sm:hidden" />
                    確認しましょう
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {checkMode === 'finalPdf'
                  ? '事業計画は文章を貼り付け、経費明細・必要書類は分けて添付してチェックします。'
                  : 'まずは必須書類です。ファイルを選ぶと、揃った書類として表示します。'}
              </p>
              {checkMode === 'finalPdf' && qualityTestCase && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
                  <div>
                    <p className="text-xs font-bold text-blue-700">品質テスト {qualityTestCase} / {qualityTestTitles.length}</p>
                    <p className="mt-1 text-sm font-bold">{qualityTestTitles[qualityTestCase - 1]}</p>
                  </div>
                  <a href={`/admin/quality#quality-test-${qualityTestCase}`} className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800">
                    <ClipboardCheck className="size-4" />判定を記録する
                  </a>
                </div>
              )}
              {checkMode === 'finalPdf' && (
                <label id="quality-safe-mode" className="mt-5 flex scroll-mt-6 cursor-pointer items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                  <input
                    type="checkbox"
                    checked={safeTestMode}
                    onChange={(event) => setSafeTestMode(event.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--primary)]"
                  />
                  <span>
                    <strong className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="size-4" />
                      実書類テストモード（推奨）
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-emerald-900/80">
                      貼り付けた文章とPDFは端末内だけで解析し、一時保存とAI詳細チェックを無効にします。結果画面の「保存せず終了」で解析内容を消去できます。
                    </span>
                  </span>
                </label>
              )}
              {checkMode === 'finalPdf' && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <p className="text-sm font-bold">
                      無料チェックは合計{freeCheckLimit}回
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {quotaAuthenticated
                        ? quotaEmail ? `ログイン利用者ごとに管理します（${quotaEmail}）。` : 'ログイン不要で利用できます。回数はこのブラウザーごとに管理します。'
                        : quotaReady
                          ? '利用情報を確認できませんでした。ページを再読み込みしてください。'
                          : '残り回数を確認しています。'}
                      解析失敗は数えません。
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white text-primary">
                    {quotaReady ? `残り${freeChecksRemaining}回` : '確認中'}
                  </Badge>
                </div>
              )}
              {checkMode === 'finalPdf' && freeChecksRemaining <= 3 && (
                <div
                  role="status"
                  className={`mt-3 rounded-2xl border p-4 ${freeChecksRemaining === 0 ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-sky-200 bg-sky-50 text-sky-950'}`}
                >
                  <p className="text-sm font-bold">
                    {freeChecksRemaining === 0
                      ? '無料チェックを使い切りました'
                      : `無料チェックは残り${freeChecksRemaining}回です`}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {freeChecksRemaining === 0
                      ? '引き続き書類を詳しく確認したい場合は、有料版のご案内をご確認ください。料金は正式決定後に掲載します。'
                      : '提出直前の再確認に残しておくことをおすすめします。有料版では、書類間の整合性や詳しい改善案も確認できる予定です。'}
                  </p>
                </div>
              )}
              {checkMode === 'finalPdf' && (
                <section className="mt-5 rounded-2xl border border-border bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">全体の確認状況</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        3種類すべてが完了すると、提出前の確認がひと通り終了です。
                      </p>
                    </div>
                    <span className="text-xl font-bold tabular-nums text-primary">
                      {Math.round((completedCheckGroups / 3) * 100)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(completedCheckGroups / 3) * 100}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {[
                      {
                        label: '事業計画書',
                        done: Boolean(planTextAnalysis),
                        detail: planTextAnalysis
                          ? 'チェック完了'
                          : Object.values(plan).some((value) => value.trim())
                            ? '項目入力済み・未チェック'
                            : '文章未入力',
                      },
                      {
                        label: '経費明細・見積書',
                        done: expenseFilesChecked && expenseFiles.length > 0,
                        detail: expenseFilesChecked
                          ? `${expenseFiles.length}件チェック完了`
                          : expenseFiles.length
                            ? `${expenseFiles.length}件選択済み・未チェック`
                            : 'ファイル未選択',
                      },
                      {
                        label: '必要書類',
                        done: requiredDocumentsComplete,
                        detail: requiredDocumentsComplete
                          ? `${requiredDocs.length}件チェック完了`
                          : `${requiredDocumentUploadCount}/${requiredDocs.length}件添付`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl border p-3 ${item.done ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-muted/20'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid size-5 place-items-center rounded-full ${item.done ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}
                          >
                            {item.done ? <Check className="size-3" /> : '−'}
                          </span>
                          <p className="text-xs font-bold">{item.label}</p>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {fileValidationMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold leading-6 text-red-900"
                >
                  {fileValidationMessage}
                </div>
              )}
              {checkMode === 'finalPdf' && completedCheckGroups === 3 && (
                <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      3種類のチェックが完了しました
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-900">
                      すべての結果を修正優先度順にまとめます。追加の無料回数は消費しません。
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="mt-3 gap-2 sm:mt-0"
                    onClick={() => {
                      setResultScope('all');
                      setFinalResultFilter('all');
                      setStep(4);
                    }}
                  >
                    <ClipboardCheck className="size-4" />
                    まとめて最終確認
                  </Button>
                </div>
              )}
              {checkMode === 'finalPdf' && (
                <div className="mt-5 space-y-4">
                  <section id="quality-plan" className="scroll-mt-6 rounded-2xl border border-primary/25 bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                        1
                      </span>
                      <div>
                        <h2 className="font-bold">事業計画書のチェック</h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          項目ごとに文章を貼り付け、それぞれ100点満点で採点します。空欄の項目も結果で分かります。
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">事業計画の入力進捗</p>
                          <p className="mt-1 text-xs text-muted-foreground">未入力の項目も採点結果で確認できます。</p>
                        </div>
                        <strong className="text-xl tabular-nums text-primary">
                          {planFields.filter((field) => (plan[field.id] || '').trim()).length} / {planFields.length}項目
                        </strong>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(planFields.filter((field) => (plan[field.id] || '').trim()).length / planFields.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 space-y-5">
                      {planFieldGroups.map((group, groupIndex) => {
                        const enteredCount = group.fields.filter((field) => (plan[field.id] || '').trim()).length;
                        return (
                          <details
                            key={group.title}
                            open={openPlanGroups.includes(group.title)}
                            onToggle={(event) => {
                              const isOpen = event.currentTarget.open;
                              setOpenPlanGroups((current) =>
                                isOpen
                                  ? current.includes(group.title)
                                    ? current
                                    : [...current, group.title]
                                  : current.filter((title) => title !== group.title),
                              );
                            }}
                            className="group overflow-hidden rounded-2xl border border-border bg-white"
                          >
                            <summary className="flex cursor-pointer list-none items-center gap-3 bg-muted/25 p-4 marker:hidden sm:p-5">
                              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{groupIndex + 1}</span>
                              <span className="min-w-0 flex-1">
                                <strong className="block text-sm">{group.title}</strong>
                                <small className="mt-1 block leading-5 text-muted-foreground">{group.description}</small>
                              </span>
                              <span className="shrink-0 text-xs font-bold text-primary">{enteredCount} / {group.fields.length}項目</span>
                              <span aria-hidden="true" className="text-xl text-primary group-open:rotate-45">＋</span>
                            </summary>
                            <div className="space-y-4 border-t border-border p-4 sm:p-5">
                              {group.fields.map((field) => {
                                const value = plan[field.id] || '';
                                const criteria =
                                  field.id === 'projectName'
                                    ? ['30文字以内', '取組内容と対象が伝わる名称']
                                    : (fieldRules[field.id] || []).map((rule) => rule.label);
                                return (
                                  <label key={field.id} className="block rounded-2xl border border-border bg-muted/15 p-4">
                                    <span className="flex flex-wrap items-center justify-between gap-2">
                                      <strong className="text-sm">{field.title}</strong>
                                      <span className="text-[11px] tabular-nums text-muted-foreground">{value.length.toLocaleString()}文字</span>
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{field.hint}</span>
                                    <span className="mt-3 block text-[11px] font-bold text-primary">採点で確認するポイント</span>
                                    <span className="mt-2 flex flex-wrap gap-1.5">
                                      {criteria.map((criterion) => (
                                        <span key={criterion} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                                          {criterion}
                                        </span>
                                      ))}
                                    </span>
                                    <textarea
                                      id={`plan-field-${field.id}`}
                                      value={value}
                                      onChange={(event) => {
                                        setPlan((current) => ({ ...current, [field.id]: event.target.value }));
                                        setAnalysisStage(0);
                                        setAnalysisState('idle');
                                        setAnalysisError('');
                                        setPlanTextAnalysis(null);
                                      }}
                                      rows={field.id === 'projectName' ? 2 : 6}
                                      maxLength={field.id === 'projectName' ? 100 : 6000}
                                      placeholder={`${field.title}の文章を貼り付けてください`}
                                      className="mt-3 w-full rounded-xl border border-border bg-white p-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                                    />
                                    <span className="mt-2 block text-[11px] leading-5 text-muted-foreground">
                                      {field.id === 'projectName'
                                        ? '30文字以内が要件です。'
                                        : '文章量は140文字以上をアプリ上の具体性の目安としています。公募要領の文字数要件ではありません。'}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={startPlanTextAnalysis}
                        disabled={
                          !quotaReady ||
                          !quotaAuthenticated ||
                          !Object.values(plan).some((value) => value.trim()) ||
                          analysisState === 'running' ||
                          freeChecksRemaining <= 0
                        }
                        className="gap-2"
                      >
                        {analysisState === 'running' ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <FileSearch />
                        )}
                        事業計画をチェック
                      </Button>
                    </div>
                    {analysisState === 'error' && (
                      <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-900">
                        <p className="font-bold">文章を確認できませんでした</p>
                        <p className="mt-1">{analysisError}</p>
                        <p className="mt-1 font-bold">
                          無料回数は消費されていません。
                        </p>
                      </div>
                    )}
                  </section>
                  <section id="quality-expense" className="scroll-mt-6 rounded-2xl border border-amber-200 bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 font-bold text-amber-900">
                        2
                      </span>
                      <div>
                        <h2 className="font-bold">
                          経費明細・見積書のチェック
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          経費明細、見積書、相見積書をまとめて選択できます。1ファイル20MB以内です。
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-amber-400 bg-white px-4 text-sm font-bold text-amber-900 hover:bg-amber-50">
                        <Upload className="size-4" />
                        経費ファイルを選ぶ
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(event) => {
                            const files = Array.from(event.target.files || []);
                            if (!filesWithinLimit(files)) return;
                            setExpenseFiles(files);
                            setExpenseFilesChecked(false);
                            setExpenseFileAnalysis(null);
                          }}
                        />
                      </label>
                      {expenseFiles.length > 0 && (
                        <span className="text-xs font-bold text-amber-900">
                          {expenseFiles.length}件選択済み
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !quotaReady ||
                          !quotaAuthenticated ||
                          expenseFiles.length === 0 ||
                          freeChecksRemaining <= 0 ||
                          supportingAnalysisState === 'running'
                        }
                        onClick={analyzeExpenseFiles}
                      >
                        {supportingAnalysisState === 'running' ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <FileSearch />
                        )}
                        経費明細をチェック
                      </Button>
                    </div>
                    {expenseFiles.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {expenseFiles.map((file, index) => (
                          <li
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950"
                          >
                            <Paperclip className="size-3.5 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              aria-label={`${file.name}を選択から外す`}
                              onClick={() => {
                                setExpenseFiles((files) =>
                                  files.filter(
                                    (_, fileIndex) => fileIndex !== index,
                                  ),
                                );
                                setExpenseFilesChecked(false);
                                setExpenseFileAnalysis(null);
                              }}
                              className="grid size-7 shrink-0 place-items-center rounded-md text-amber-900 hover:bg-amber-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 rounded-lg bg-white/80 px-3 py-3">
                      <p className="text-[11px] font-bold text-amber-950">
                        各ファイルで確認すること
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                        宛名・発行者・発行日 ／ 品名・数量・単価 ／ 税込合計 ／
                        事業計画・経費明細との一致
                      </p>
                    </div>
                  </section>
                  <section id="quality-documents" className="scroll-mt-6 rounded-2xl border border-sky-200 bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-100 font-bold text-sky-900">
                        3
                      </span>
                      <div>
                        <h2 className="font-bold">必要書類のチェック</h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          書類の種類ごとに添付してください。PDFは表題を読み取ります。1ファイル20MB以内です。
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {requiredDocs.map((doc) => {
                        const guidance = getRequiredDocumentGuidance(doc.title);
                        return (
                          <div
                            key={doc.title}
                            className="rounded-xl border border-border bg-muted/20 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold">{doc.title}</p>
                                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                  {requiredDocFiles[doc.title]?.name ||
                                    doc.note}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-bold hover:border-primary">
                                  <Paperclip className="size-3.5" />
                                  {requiredDocFiles[doc.title]
                                    ? '変更'
                                    : '選ぶ'}
                                  <input
                                    type="file"
                                    accept={
                                      /貸借対照表|損益計算書/u.test(doc.title)
                                        ? undefined
                                        : '.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png'
                                    }
                                    className="sr-only"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      if (file && filesWithinLimit([file])) {
                                        setRequiredDocFiles((current) => ({
                                          ...current,
                                          [doc.title]: file,
                                        }));
                                        setRequiredDocsChecked(false);
                                        setRequiredDocAnalysis((current) => {
                                          const next = { ...current };
                                          delete next[doc.title];
                                          return next;
                                        });
                                      }
                                    }}
                                  />
                                </label>
                                {requiredDocFiles[doc.title] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRequiredDocFiles((current) => {
                                        const next = { ...current };
                                        delete next[doc.title];
                                        return next;
                                      });
                                      setRequiredDocAnalysis((current) => {
                                        const next = { ...current };
                                        delete next[doc.title];
                                        return next;
                                      });
                                      setRequiredDocsChecked(false);
                                    }}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-muted-foreground hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="size-3.5" />
                                    外す
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 rounded-lg bg-white/80 px-3 py-2">
                              <p className="text-[11px] font-bold text-sky-950">
                                この書類で確認すること
                              </p>
                              <ul className="mt-1 grid gap-1 text-[11px] leading-5 text-muted-foreground sm:grid-cols-3">
                                {guidance.checkpoints.map((item) => (
                                  <li key={item} className="flex gap-1.5">
                                    <Check className="mt-1 size-3 shrink-0 text-sky-700" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 gap-2"
                      disabled={
                        !quotaReady ||
                        !quotaAuthenticated ||
                        Object.keys(requiredDocFiles).length === 0 ||
                        freeChecksRemaining <= 0 ||
                        supportingAnalysisState === 'running'
                      }
                      onClick={analyzeRequiredDocuments}
                    >
                      {supportingAnalysisState === 'running' ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <FileSearch />
                      )}
                      必要書類をチェック
                    </Button>
                  </section>
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    選択したファイルは端末内だけで扱い、一時保存やAI詳細チェックには含めません。
                  </p>
                </div>
              )}
              {checkMode === 'guided' && (
                <>
                  <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
                    <span className="mr-1 text-xs font-bold text-primary">
                      匿名デモ
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlan(weakDemoPlan);
                        setUploaded([]);
                        setExpenses([
                          {
                            id: 1,
                            category: '広報費',
                            name: 'チラシ制作',
                            amount: '220000',
                          },
                        ]);
                      }}
                    >
                      不備が多い例
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlan(goodDemoPlan);
                        setUploaded(
                          requiredDocs
                            .filter((doc) => doc.required)
                            .map((doc) => doc.title),
                        );
                        setExpenses([
                          {
                            id: 1,
                            category: '機械装置等費',
                            name: '焼き菓子包装機',
                            amount: '440000',
                          },
                          {
                            id: 2,
                            category: '広報費',
                            name: '商品案内リーフレット',
                            amount: '165000',
                          },
                          {
                            id: 3,
                            category: 'ウェブサイト関連費',
                            name: 'EC商品ページ改修',
                            amount: '110000',
                          },
                        ]);
                      }}
                    >
                      比較的良い例
                    </Button>
                    <span className="text-[11px] text-muted-foreground">
                      実在の会社情報は含みません
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                    <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                      {uploaded.length + (guidedPlanFile ? 1 : 0)}
                    </span>
                    <p>
                      <strong>{uploaded.length + (guidedPlanFile ? 1 : 0)}件</strong> 確認済み ／ 全
                      {requiredDocs.length + 1}件
                    </p>
                  </div>
                  <article className={`document-row mt-5 ${guidedPlanFile ? 'document-done' : ''}`}>
                    <span className={`doc-number ${guidedPlanFile ? 'doc-number-done' : ''}`}>
                      {guidedPlanFile ? <Check className="size-4" /> : 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold">事業計画書（様式2・3）のPDF</h2>
                        <Badge variant="destructive" className="h-5">必須</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        PDF本文を項目ごとに読み取り、提出前の確認結果に反映します。
                      </p>
                      {guidedPlanFile && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                          <Paperclip className="size-3.5 shrink-0" />
                          <span className="break-all">{guidedPlanFile.name}</span>
                        </p>
                      )}
                    </div>
                    <label className={`upload-button ${guidedPlanFile ? 'upload-done' : ''} ${guidedPlanReading ? 'pointer-events-none opacity-50' : ''}`}>
                      <Upload className="size-4" />
                      <span>{guidedPlanFile ? '変更' : '選ぶ'}</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        disabled={guidedPlanReading}
                        className="sr-only"
                        aria-label="事業計画書（様式2・3）のPDFを選ぶ"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file || !filesWithinLimit([file])) return;
                          setGuidedPlanFile(file);
                          void loadGuidedPlan(file);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </article>
                  {guidedPlanReading && <p role="status" className="mt-3 text-sm font-bold text-primary">PDFの本文を読み取っています…</p>}
                  {!guidedPlanReading && guidedPlanFile && planTextAnalysis && <p role="status" className="mt-3 text-sm font-bold text-primary">PDFから{planTextAnalysis.extractedItems}項目の本文を読み取りました。詳細チェックを利用できます。</p>}
                  <div className="mt-5 space-y-3">
                    {requiredDocs.map((doc, index) => {
                      const done = uploaded.includes(doc.title);
                      return (
                        <article
                          key={doc.title}
                          className={`document-row ${done ? 'document-done' : ''}`}
                        >
                          <span
                            className={`doc-number ${done ? 'doc-number-done' : ''}`}
                          >
                            {done ? <Check className="size-4" /> : index + 2}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-bold">{doc.title}</h2>
                              {doc.required && (
                                <Badge variant="destructive" className="h-5">
                                  必須
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {doc.note}
                            </p>
                            {done && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                                <Paperclip className="size-3.5" />{' '}
                                ファイルを確認しました
                              </p>
                            )}
                          </div>
                          <label
                            className={`upload-button ${done ? 'upload-done' : ''}`}
                          >
                            <Upload className="size-4" />
                            <span>{done ? '変更' : '選ぶ'}</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept={
                                /貸借対照表|損益計算書/u.test(doc.title)
                                  ? undefined
                                  : '.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png'
                              }
                              onChange={(event) => {
                                if (event.target.files?.length)
                                  setUploaded((items) =>
                                    items.includes(doc.title)
                                      ? items
                                      : [...items, doc.title],
                                  );
                              }}
                            />
                          </label>
                        </article>
                      );
                    })}
                  </div>
                  <Card className="mt-5 border-amber-200 bg-amber-50 shadow-none ring-0">
                    <CardContent className="text-xs leading-6 text-amber-950">
                      <strong>ご注意：</strong>
                      事業計画書PDFは端末内で読み取ります。その他の書類は選択状態だけを表示します。書類の内容は送信・保存しません。
                    </CardContent>
                  </Card>
                  <div className="mt-10 border-t border-border pt-9">
                    <Badge variant="secondary" className="mb-3">
                      経費明細
                    </Badge>
                    <h2 className="text-2xl font-bold">
                      見積りの内容を1件ずつ入力
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      見積書どおりの税込金額を入力してください。現在の設定：
                      {taxStatus}
                    </p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {expenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className="rounded-2xl border border-border bg-white p-4 sm:p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-bold">経費 {index + 1}</p>
                          {expenses.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`経費${index + 1}を削除`}
                              onClick={() =>
                                setExpenses((current) =>
                                  current.filter(
                                    (item) => item.id !== expense.id,
                                  ),
                                )
                              }
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_0.8fr]">
                          <label className="text-xs font-bold text-muted-foreground">
                            経費区分
                            <select
                              value={expense.category}
                              onChange={(event) =>
                                setExpenses((current) =>
                                  current.map((item) =>
                                    item.id === expense.id
                                      ? {
                                          ...item,
                                          category: event.target.value,
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-3 focus:ring-ring/20"
                            >
                              {expenseCategories.map((category) => (
                                <option key={category}>{category}</option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs font-bold text-muted-foreground">
                            内容
                            <Input
                              value={expense.name}
                              onChange={(event) =>
                                setExpenses((current) =>
                                  current.map((item) =>
                                    item.id === expense.id
                                      ? { ...item, name: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              placeholder="例：チラシ5,000部の印刷"
                              className="mt-2"
                            />
                          </label>
                          <label className="text-xs font-bold text-muted-foreground">
                            税込金額
                            <Input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={expense.amount}
                              onChange={(event) =>
                                setExpenses((current) =>
                                  current.map((item) =>
                                    item.id === expense.id
                                      ? { ...item, amount: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              placeholder="0"
                              className="mt-2"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={() =>
                      setExpenses((current) => [
                        ...current,
                        {
                          id: Date.now(),
                          category: '機械装置等費',
                          name: '',
                          amount: '',
                        },
                      ])
                    }
                  >
                    <Plus /> 経費を追加
                  </Button>
                  <div className="mt-5 grid gap-3 rounded-2xl bg-[#f0f6f3] p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">
                        入力した税込合計
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">
                        {grossExpenseTotal.toLocaleString()}円
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">
                        補助対象計算用の金額
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                        {calculationBase.toLocaleString()}円
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        標準税率10%として仮計算
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-primary/20 bg-white p-5 sm:p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">
                          アプリの自動計算
                        </p>
                        <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                          {estimatedSubsidy.toLocaleString()}円
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          補助率2/3・現在の上限
                          {(subsidyCap / 10000).toLocaleString()}万円で仮計算
                        </p>
                      </div>
                      <label className="text-xs font-bold text-muted-foreground">
                        最終的に申請する金額
                        <Input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={
                            requestedAmount === ''
                              ? estimatedSubsidy
                              : requestedAmount
                          }
                          onChange={(event) =>
                            setRequestedAmount(event.target.value)
                          }
                          className="mt-2 h-11 text-base font-bold"
                        />
                        <span className="mt-1.5 block font-normal">
                          自動計算額を参考に調整できます
                        </span>
                      </label>
                    </div>
                    {finalRequestedAmount > estimatedSubsidy && (
                      <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-800">
                        自動計算できる金額を超えています。対象外経費や上限額を再確認してください。
                      </p>
                    )}
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="h-12 gap-2"
                    >
                      <ArrowLeft /> 戻る
                    </Button>
                    <Button
                      size="lg"
                      onClick={checkGuidedDocuments}
                      disabled={!guidedPlanFile || guidedPlanReading}
                      className="h-12 gap-2 rounded-xl px-6 text-[15px]"
                    >
                      {guidedPlanReading ? 'PDFを読み取り中…' : '入力内容をチェックする'} <ArrowRight />
                    </Button>
                  </div>
                </>
              )}
              {checkMode === 'finalPdf' && (
                <div className="mt-8 border-t border-border pt-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setStep(2)}
                    className="h-12 gap-2"
                  >
                    <ArrowLeft /> 戻る
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-5 hidden border-b-2 border-primary pb-3 print:block">
                <p className="text-xl font-bold">
                  テスト（補助金チェック）
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  チェック結果レポート
                </p>
              </div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 bg-white text-primary"
              >
                チェック結果
              </Badge>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-[38px]">
                  {checkMode === 'finalPdf'
                    ? resultScope === 'plan'
                      ? '事業計画書の結果'
                      : resultScope === 'expense'
                        ? '経費明細の結果'
                        : resultScope === 'documents'
                          ? '必要書類の結果'
                          : '提出前の最終確認'
                    : '提出前に確認すること'}
                </h1>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyResultSummary}
                    className="gap-2"
                  >
                    <ClipboardCopy className="size-4" />
                    結果をコピー
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    className="gap-2"
                  >
                    <Printer className="size-4" />
                    印刷・PDF保存
                  </Button>
                </div>
              </div>
              {resultCopyMessage && (
                <p
                  role="status"
                  className="mt-3 text-xs font-bold text-primary print:hidden"
                >
                  {resultCopyMessage}
                </p>
              )}
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                修正の優先度、評価点、良い点、改善アドバイスを分けて表示します。
              </p>
              {planTextAnalysis &&
                (resultScope === 'plan' || resultScope === 'all') && (
                  <p className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-950">
                    通常の文章項目は「文章量 20点・項目内容と具体性 50点・実績値と数値根拠 30点」で計算します。文章量は重複文を除く600文字で満点です。実績の指標・単位・期間・出典を確認し、目標値だけの場合や例文の空欄・繰り返しがある場合は加点を制限します。記載の有無をルールで確認するため、事実の正確性や文章の意味の妥当性は原資料と照合してください。点数は文章を見直すための目安で、採択確率や審査結果の予測ではありません。
                  </p>
                )}
              {planTextAnalysis &&
                (resultScope === 'plan' || resultScope === 'all') && (
                  <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-emerald-800">全項目の平均</p>
                      <p className="mt-1 text-xl font-bold tabular-nums">
                        {planAverageScore}点
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-800">{guidedPlanFile ? 'PDFから読み取った文章' : '貼り付けた文章'}</p>
                      <p className="mt-1 font-bold">
                        {planTextAnalysis.characters.toLocaleString()}文字
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-800">入力済み項目</p>
                      <p className="mt-1 font-bold">
                        {planTextAnalysis.foundHeadings.length} / {planFields.length}項目
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-800">個別採点</p>
                      <p className="mt-1 font-bold">
                        {planTextAnalysis.extractedItems} / {planFields.length}項目
                      </p>
                    </div>
                  </div>
                )}
              {planTextAnalysis &&
                (resultScope === 'plan' || resultScope === 'all') &&
                planTextAnalysis.sensitiveInfo.length > 0 && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                    <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">
                        個人情報らしき記載を検出しました
                      </p>
                      <p className="mt-1 text-xs leading-5">
                        検出候補：{planTextAnalysis.sensitiveInfo.join('、')}
                        。内容や値は画面に表示しません。確認後は「保存せず終了」で貼り付け文章を消去してください。
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-amber-900/80">
                        自動検出には見逃しや誤検出があります。
                      </p>
                    </div>
                  </div>
                )}
              {checkMode === 'finalPdf' && resultScope === 'all' && (
                <section className="mt-6 rounded-2xl border border-primary/20 bg-white p-5 sm:p-6">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-xs font-bold text-primary">
                      最初に確認する分野
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {firstReviewCategory.danger +
                        firstReviewCategory.warning >
                      0
                        ? firstReviewCategory.label
                        : '大きな不備候補はありません'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {firstReviewCategory.danger > 0
                        ? `「修正が必要」が${firstReviewCategory.danger}件あります。赤い結果から順に直してください。`
                        : firstReviewCategory.warning > 0
                          ? `「確認が必要」が${firstReviewCategory.warning}件あります。原本や公募要領と照合してください。`
                          : '3分野とも確認できました。提出前に原本と最終照合してください。'}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {finalReviewCategories.map((category, index) => {
                      const filter = (
                        ['plan', 'expense', 'documents'] as const
                      )[index];
                      return (
                        <button
                          type="button"
                          key={category.label}
                          onClick={() => setFinalResultFilter(filter)}
                          className={`rounded-xl border p-4 text-left transition hover:border-primary ${finalResultFilter === filter || (category.label === firstReviewCategory.label && finalResultFilter === 'all' && category.danger + category.warning > 0) ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}`}
                        >
                          <p className="text-sm font-bold">{category.label}</p>
                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span className="font-bold text-red-700">
                              修正 {category.danger}
                            </span>
                            <span className="font-bold text-amber-800">
                              確認 {category.warning}
                            </span>
                            <span className="font-bold text-emerald-700">
                              確認済み {category.good}
                            </span>
                          </div>
                          <span className="mt-3 block text-[11px] font-bold text-primary">
                            この分野だけ表示
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <ResultSummary
                  tone="danger"
                  count={dangerCount}
                  label="修正が必要"
                />
                <ResultSummary
                  tone="warning"
                  count={warningCount}
                  label="確認が必要"
                />
                <ResultSummary
                  tone="good"
                  count={goodCount}
                  label="確認できた"
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                数字は、全{allResultItems.length}
                個のチェック項目を「修正・確認・確認できた」に分類した件数です。同じ文章でも確認する観点が異なる場合は、別の項目として数えます。
              </p>
              <div className="mt-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground">
                    無料で確認できるチェック結果
                  </p>
                  <div
                    className="flex rounded-lg border border-border bg-white p-1"
                    role="group"
                    aria-label="結果の並び順"
                  >
                    <button
                      type="button"
                      onClick={() => setResultOrder('priority')}
                      aria-pressed={resultOrder === 'priority'}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${resultOrder === 'priority' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      修正優先度・低得点順
                    </button>
                    <button
                      type="button"
                      onClick={() => setResultOrder('form')}
                      aria-pressed={resultOrder === 'form'}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${resultOrder === 'form' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      申請書の順番
                    </button>
                  </div>
                </div>
                {resultScope === 'all' && (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="結果を分野で絞り込む"
                  >
                    {[
                      {
                        id: 'all',
                        label: `すべて（${allResultItems.length}）`,
                      },
                      {
                        id: 'plan',
                        label: `事業計画書（${resultItems.length}）`,
                      },
                      {
                        id: 'expense',
                        label: `経費明細（${expenseResults.length}）`,
                      },
                      {
                        id: 'documents',
                        label: `必要書類（${documentResults.length}）`,
                      },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        type="button"
                        size="sm"
                        variant={
                          finalResultFilter === filter.id
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() =>
                          setFinalResultFilter(
                            filter.id as typeof finalResultFilter,
                          )
                        }
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                )}
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="結果を判定で絞り込む"
                >
                  {[
                    {
                      id: 'all',
                      label: `すべて（${categoryFilteredResults.length}）`,
                    },
                    {
                      id: 'action',
                      label: `要修正・要確認（${visibleActionCount}）`,
                    },
                    {
                      id: 'good',
                      label: `確認できた（${visibleGoodCount}）`,
                    },
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      type="button"
                      size="sm"
                      variant={
                        resultStatusFilter === filter.id
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        resultStatusFilter === filter.id
                          ? 'border border-primary/20 text-primary'
                          : ''
                      }
                      aria-pressed={resultStatusFilter === filter.id}
                      onClick={() =>
                        setResultStatusFilter(
                          filter.id as typeof resultStatusFilter,
                        )
                      }
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                {displayedResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onEditPlanField={moveToPlanField}
                  />
                ))}
                {displayedResults.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-950">
                    この条件に該当する結果はありません。
                  </div>
                )}
                {lockedResultCount > 0 && (
                  <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-5 text-center">
                    <LockKeyhole className="mx-auto size-5 text-amber-800" />
                    <p className="mt-2 font-bold text-amber-950">
                      このほか{lockedResultCount}件の確認結果があります
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-900/80">
                      書類間の不整合、経費の必要性、不足する根拠、短い修正例は詳細チェックで確認できます。
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                <strong>チェック結果について：</strong>
                本サービスは書類の不備防止を支援するもので、補助金の採択や提出書類の完全性を保証するものではありません。最終確認は最新の公募要領と事務局の案内に従ってください。
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 print:hidden">
                <div>
                  <p className="text-sm font-bold">無料チェック利用状況</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    3種類のチェックを合計{freeCheckLimit}
                    回まで利用できます。解析失敗では回数を消費しません。
                  </p>
                </div>
                <Badge variant="outline" className="bg-white text-primary">
                  残り{freeChecksRemaining}回
                </Badge>
              </div>
              {freeChecksRemaining <= 3 && (
                <div
                  role="status"
                  className={`mt-3 rounded-2xl border p-4 print:hidden ${freeChecksRemaining === 0 ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-sky-200 bg-sky-50 text-sky-950'}`}
                >
                  <p className="text-sm font-bold">
                    {freeChecksRemaining === 0
                      ? '無料チェックを使い切りました'
                      : `無料チェックは残り${freeChecksRemaining}回です`}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {freeChecksRemaining === 0
                      ? '引き続き書類を詳しく確認したい場合は、有料版のご案内をご確認ください。料金は正式決定後に掲載します。'
                      : '提出直前の再確認に残しておくことをおすすめします。有料版では、書類間の整合性や詳しい改善案も確認できる予定です。'}
                  </p>
                </div>
              )}
              <AiDetailCheck
                disabled={(checkMode === 'finalPdf' && safeTestMode) || guidedPlanReading}
                reading={guidedPlanReading}
                input={{
                  program: `${program.title} ${program.detail}`,
                  businessType,
                  addons,
                  plan: planFields.map(field => ({ title: field.title, text: plan[field.id] || '' })),
                  expenses: expenses.map(({ category, name, amount }) => ({ category, name, amount })),
                }}
              />
              <section className="mt-7 rounded-2xl border border-border bg-white p-5 sm:p-6 print:hidden">
                <Badge variant="secondary" className="mb-3">
                  試用アンケート
                </Badge>
                <h2 className="text-lg font-bold">
                  この結果は分かりやすかったですか？
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  1分で回答できます。詳しい感想は後日のヒアリングでも伺います。
                </p>
                <div
                  className="mt-4 flex flex-wrap gap-2"
                  role="group"
                  aria-label="分かりやすさを5段階で評価"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFeedbackScore(score)}
                      aria-pressed={feedbackScore === score}
                      className={`grid size-10 place-items-center rounded-full border text-sm font-bold transition ${feedbackScore === score ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:border-primary'}`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <label className="mt-5 block text-xs font-bold text-muted-foreground">
                  困った箇所・納得できなかった結果
                  <Textarea
                    value={feedbackNote}
                    onChange={(event) => setFeedbackNote(event.target.value)}
                    placeholder="例：経費の指摘理由が分かりにくかった"
                    className="mt-2 min-h-24"
                  />
                </label>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="outline" disabled={!feedbackScore}>
                    回答内容を確認
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    試作版では回答を送信・保存しません
                  </span>
                </div>
              </section>
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6 print:hidden">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep(3)}
                  className="h-12 gap-2"
                >
                  <ArrowLeft /> 入力を直す
                </Button>
                <Button
                  size="lg"
                  onClick={endWithoutSaving}
                  className="h-12 gap-2 rounded-xl px-6 text-[15px]"
                >
                  結果を保存せず終了 <Check />
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
              <AiDetailCheck
                disabled={(checkMode === 'finalPdf' && safeTestMode) || guidedPlanReading}
                reading={guidedPlanReading}
                input={{
                  program: `${program.title} ${program.detail}`,
                  businessType,
                  addons,
                  plan: planFields.map(field => ({ title: field.title, text: plan[field.id] || '' })),
                  expenses: expenses.map(({ category, name, amount }) => ({ category, name, amount })),
                }}
              />
          )}
        </section>
      </div>
    </main>
  );
}

function ResultSummary({
  tone,
  count,
  label,
}: {
  tone: 'danger' | 'warning' | 'good';
  count: number;
  label: string;
}) {
  return (
    <div className={`result-summary result-${tone}`}>
      <strong className="text-2xl tabular-nums">{count}</strong>
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

type DisplayResult = {
  id: string;
  title: string;
  status: 'danger' | 'warning' | 'good';
  message: string;
  missing: string[];
  score?: number;
  positives?: string[];
  advice?: string;
  perspective?: string;
  evidence?: string;
  scoreBreakdown?: { label: string; score: number; max: number }[];
  rewriteExample?: string;
};

function ResultCard({
  result,
  onEditPlanField,
}: {
  result: DisplayResult;
  onEditPlanField?: (fieldId: string) => void;
}) {
  const [exampleCopied, setExampleCopied] = useState(false);
  const category = result.id.startsWith('document-')
    ? '必要書類'
    : result.id.startsWith('expense-')
      ? '経費明細'
      : '事業計画書';
  const perspective =
    result.perspective ||
    (result.id.startsWith('document-')
      ? '申請者区分や選択した特例に応じた書類がそろい、発行日・対象期間・記載内容が要件を満たすかを確認します。ファイルの有無だけでなく、最新版か、申請者名や対象年度が一致するかも重要です。'
      : result.id.startsWith('expense-')
        ? '経費が補助事業の実施に直接必要で、対象経費区分・上限・ウェブサイト関連費の制限を満たすかを確認します。経費明細、見積書、事業計画の品名・数量・金額が一致している必要があります。'
        : fieldPerspective[result.id] ||
          '記載内容が公募要領の審査項目と対応し、数値や根拠を第三者が確認できる状態かを確認します。');
  const statusLabel =
    result.status === 'danger'
      ? '修正が必要'
      : result.status === 'warning'
        ? '確認が必要'
        : '確認できた';
  const reportParams = new URLSearchParams({
    subject: 'result-feedback',
    item: result.title,
    status: statusLabel,
  });
  return (
    <article className="break-inside-avoid rounded-2xl border border-border bg-white p-5 font-medium text-slate-950 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-muted/50 font-semibold text-slate-800">
          {category}
        </Badge>
        <Badge
          variant={result.status === 'danger' ? 'destructive' : 'outline'}
          className={
            result.status === 'warning'
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : result.status === 'good'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : ''
          }
        >
          {statusLabel}
        </Badge>
        <h2 className="font-bold">{result.title}</h2>
        {typeof result.score === 'number' && (
          <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-sm font-bold tabular-nums text-primary">
            {result.score}点 / 100点
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-medium leading-7 text-slate-900">
        {result.message}
      </p>
      {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-800">
          <div className="flex items-center justify-between gap-3">
            <strong>点数の内訳</strong>
            <span className="font-bold tabular-nums">
              合計 {result.score ?? 0} / 100点
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {result.scoreBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span className="tabular-nums">
                    {item.score} / {item.max}点
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(0, Math.min(100, (item.score / item.max) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 leading-5 text-slate-600">
            この点数は文章の具体性を確認する目安です。採択可能性を示すものではありません。
          </p>
        </div>
      )}
      {result.evidence && (
        <details className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-3 text-xs text-blue-950">
          <summary className="cursor-pointer font-bold">
            貼り付け文章から確認した箇所
          </summary>
          <p className="mt-2 whitespace-pre-wrap break-words leading-6">
            {result.evidence}
            {result.evidence.length >= 220 ? '…' : ''}
          </p>
          <p className="mt-2 text-[11px] text-blue-950">
            メールアドレス・郵便番号・電話番号・長い番号は自動で伏字にしています。表示内容が貼り付けた文章と一致するか確認してください。
          </p>
        </details>
      )}
      {result.positives && result.positives.length > 0 && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-6 text-emerald-950">
          <strong>評価できる点</strong>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.positives.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      {result.advice && (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-xs leading-6 text-slate-950">
          <strong>改善アドバイス</strong>
          <p className="mt-1">{result.advice}</p>
        </div>
      )}
      {result.rewriteExample && result.status !== 'good' && (
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-3 text-xs leading-6 text-violet-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>追記・書き直し例</strong>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-violet-300 bg-white text-xs text-violet-950 hover:bg-violet-100"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.rewriteExample!);
                  setExampleCopied(true);
                  window.setTimeout(() => setExampleCopied(false), 2000);
                } catch {
                  setExampleCopied(false);
                }
              }}
              aria-label={`${result.title}の追記・書き直し例をコピー`}
            >
              {exampleCopied ? (
                <Check className="size-3.5" />
              ) : (
                <ClipboardCopy className="size-3.5" />
              )}
              {exampleCopied ? 'コピーしました' : '例文をコピー'}
            </Button>
          </div>
          <p className="mt-1">{result.rewriteExample}</p>
          <p className="mt-2 text-[11px] text-violet-800">
            【　】内を実際の数値や内容に置き換え、事実に基づいて調整してください。
          </p>
        </div>
      )}
      {result.missing.length > 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
          <strong>追加するとよい内容：</strong>
          {result.missing.join('、')}
        </p>
      )}
      <div className="mt-3 rounded-lg bg-muted/60 px-3 py-3 text-xs leading-6">
        <strong>公募要領の観点</strong>
        <p className="mt-1">{perspective}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        {category === '事業計画書' && onEditPlanField && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 sm:w-auto"
            onClick={() => onEditPlanField(result.id)}
          >
            <PencilLine className="size-4" />
            この項目を修正する
          </Button>
        )}
        <a
          href={`/contact?${reportParams.toString()}`}
          className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-white px-4 text-xs font-bold text-slate-800 transition hover:border-primary/30 hover:bg-muted sm:w-auto"
        >
          この判定を報告する
        </a>
      </div>
    </article>
  );
}

function getRequiredDocumentGuidance(title: string) {
  if (/様式4|事業支援計画書/u.test(title))
    return {
      checkpoints: [
        '申請者名・事業者名が一致',
        '発行元の商工会・商工会議所を確認',
        '申請締切前に発行された最新版',
      ],
      advice:
        '様式4は申請者が作る書類ではなく、地域の商工会・商工会議所へ早めに発行依頼します。申請締切とは別に発行受付締切があるため、日付と発行元を原本で確認してください。',
      perspective:
        '事業支援計画書（様式4）は、地域の商工会・商工会議所による確認を受けたことを示す必須書類です。申請者名、発行元、発行日が今回の申請と対応していることを確認します。',
    };
  if (/履歴事項全部証明書/u.test(title))
    return {
      checkpoints: [
        '申請者の法人名・所在地が一致',
        '発行から3か月以内',
        '全ページが欠けずに含まれる',
      ],
      advice:
        'PDFの表題だけでなく、法人名・本店所在地・発行日を申請内容と照合してください。発行日から申請日まで3か月を超える場合は取り直しが必要です。',
      perspective:
        '履歴事項全部証明書は法人の実在と基本情報を確認する資料です。申請日時点で発行後3か月以内であり、申請システムの法人名・所在地と一致することが重要です。',
    };
  if (/貸借対照表|損益計算書|決算書/u.test(title))
    return {
      checkpoints: [
        '直近1期分の対象年度',
        '法人名・事業者名が一致',
        '貸借対照表と損益計算書が両方そろう',
      ],
      advice:
        '決算期、法人名、ページの抜けを確認してください。貸借対照表または損益計算書が作成されていない場合は、公募要領で指定された代替書類を準備します。',
      perspective:
        '決算書は事業の継続実態と直近の経営状況を確認する資料です。直近1期分であること、申請者名が一致すること、必要な計算書類が一式そろうことを確認します。',
    };
  if (/確定申告/u.test(title))
    return {
      checkpoints: [
        '直近年分の申告書',
        '氏名・事業者名が一致',
        '指定ページと決算書類がそろう',
      ],
      advice:
        '第一表・第二表、収支内訳書または青色申告決算書など、申告区分に応じた全ページを確認してください。マイナンバーは提出用PDFで見えない状態にします。',
      perspective:
        '確定申告書は事業実態と直近の所得・売上を確認する資料です。対象年、申請者名、税務署の受付を示す情報、必要ページの不足がないかを確認します。',
    };
  if (/売上台帳/u.test(title))
    return {
      checkpoints: [
        '開業後の売上日・金額を記載',
        '申請者名または屋号が分かる',
        '集計期間と合計額が明確',
      ],
      advice:
        '取引日、内容、金額が分かる形で作成し、合計額を記載してください。通帳だけでは売上の内容が分かりにくいため、売上台帳として整理した資料を添付します。',
      perspective:
        '決算期を迎えていない事業者は、開業済みで売上が発生していることを売上台帳で確認します。日付・内容・金額と申請者との対応が分かることが重要です。',
    };
  if (/インボイス/u.test(title))
    return {
      checkpoints: [
        '登録番号または申請状況を確認',
        '申請者名が一致',
        '通知書・受信通知の全体を添付',
      ],
      advice:
        '登録済みの場合は登録通知書、手続中の場合はe-Taxの受信通知など、現在の状態を確認できる資料を選んでください。',
      perspective:
        'インボイス特例の適用可否を確認する資料です。適格請求書発行事業者の登録番号または登録申請中であることが、今回の申請者と対応している必要があります。',
    };
  return {
    checkpoints: [
      '申請者名・事業者名が一致',
      '対象期間・発行日が要件内',
      '全ページが欠けずに含まれる',
    ],
    advice:
      '書類の表題だけでなく、申請者名、対象期間、発行日、ページの抜けを原本で確認してください。複数ページの場合は1つのPDFにまとめると確認しやすくなります。',
    perspective:
      '選択した特例・加点に必要な証拠書類として、今回の申請者と内容が対応し、対象期間や発行日の条件を満たすことを確認します。',
  };
}

function getRequiredDocs(
  businessType: string,
  fiscalHistory: string,
  area: string,
  addons: string[],
) {
  const docs = [
    {
      title: '事業支援計画書（様式4）',
      required: true,
      note:
        area === '商工会議所地区'
          ? '商工会議所から発行を受けたPDF。発行受付締切は申請締切より前です。'
          : '商工会から発行を受けます。申請システムへの反映も確認します。',
    },
  ];
  if (businessType === '法人') {
    if (fiscalHistory === 'まだ0回')
      docs.push({
        title: '売上台帳',
        required: true,
        note: '開業後に売上が発生していることが分かる資料。',
      });
    else
      docs.push(
        {
          title: '貸借対照表',
          required: true,
          note: '直近1期分。対象年度と法人名を確認します。',
        },
        {
          title: '損益計算書',
          required: true,
          note: '直近1期分。作成していない場合は公募要領で指定された代替書類を確認します。',
        },
      );
    if (fiscalHistory === 'まだ0回')
      docs.push({
        title: '履歴事項全部証明書',
        required: true,
        note: '申請日から3か月以内に発行されたもの。',
      });
  } else if (businessType === '個人事業主') {
    if (fiscalHistory === 'まだ0回')
      docs.push(
        {
          title: '開業届',
          required: true,
          note: '開業日と申請者名が記載された税務署提出用の書類。',
        },
        {
          title: '売上台帳',
          required: true,
          note: '開業後の売上日・内容・金額が分かる資料。',
        },
      );
    else
      docs.push(
        {
          title: '確定申告書 第一表',
          required: true,
          note: '直近年分。マイナンバーは黒塗りして提出します。',
        },
        {
          title: '確定申告書 第二表',
          required: true,
          note: '直近年分。第一表とは別の欄に添付します。',
        },
        {
          title: '青色申告決算書 または 収支内訳書',
          required: true,
          note: '申告区分に応じて、どちらか一方の全ページを添付します。',
        },
      );
  } else {
    if (fiscalHistory === 'まだ0回')
      docs.push(
        {
          title: '収益事業開始届出書',
          required: true,
          note: '収益事業の開始日と法人名が分かる資料。',
        },
        {
          title: '売上台帳',
          required: true,
          note: '開始後の売上日・内容・金額が分かる資料。',
        },
      );
    else
      docs.push(
        {
          title: '貸借対照表',
          required: true,
          note: '直近1期分。対象年度と法人名を確認します。',
        },
        {
          title: '活動計算書',
          required: true,
          note: '直近1期分。経常収益・費用が分かる資料。',
        },
        {
          title: '法人税申告書 別表一',
          required: true,
          note: '直近1期分。法人名と事業年度を確認します。',
        },
        {
          title: '法人税申告書 別表四',
          required: true,
          note: '直近1期分。別表一とは別の欄に添付します。',
        },
      );
    if (fiscalHistory === 'まだ0回')
      docs.push({
        title: '履歴事項全部証明書',
        required: true,
        note: '申請日から3か月以内に発行されたもの。',
      });
  }
  if (addons.includes('インボイス特例'))
    docs.push({
      title: 'インボイス登録通知書等',
      required: true,
      note: '登録済みの場合は登録通知書、e-Taxで手続中の場合は登録申請データの受信通知。',
    });
  if (addons.includes('賃金引上げ特例・加点') && businessType === '法人')
    docs.push(
      {
        title: '法人税申告書 別表一',
        required: true,
        note: '赤字事業者として特例を希望する場合に、直近1期分を提出します。',
      },
      {
        title: '法人税申告書 別表四',
        required: true,
        note: '別表一とは別の欄に添付します。',
      },
    );
  if (addons.includes('経営力向上計画加点'))
    docs.push({
      title: '経営力向上計画の認定書',
      required: true,
      note: '公募要領で定める基準日までに認定を受けたもの。',
    });
  if (addons.includes('事業承継加点')) {
    docs.push(
      {
        title: '事業承継診断票（様式10）',
        required: true,
        note: '様式4と同時に商工会・商工会議所へ発行依頼します。',
      },
      {
        title: '代表者の確認書類',
        required: true,
        note: '代表者の生年月日など、要件を確認できる書類。',
      },
      {
        title: '後継者候補の確認書類',
        required: true,
        note: '後継者候補の実在と代表者との関係を確認できる書類。',
      },
    );
  }
  if (addons.includes('くるみん・えるぼし加点'))
    docs.push({
      title: '基準適合一般事業主認定通知書',
      required: true,
      note: 'くるみん認定またはえるぼし認定の通知書。',
    });
  if (addons.includes('小規模事業者卒業加点'))
    docs.push({
      title: '最新の労働者名簿',
      required: true,
      note: '労働基準法に基づく、常時使用する従業員分の名簿。',
    });
  if (addons.includes('地域別最低賃金引上げ加点'))
    docs.push(
      {
        title: '賃金台帳',
        required: true,
        note: '該当従業員の連続3か月分を添付します。',
      },
      {
        title: '雇用条件の確認書類',
        required: true,
        note: '所定労働時間・年間休日・賃金条件が分かる書類。',
      },
    );
  return docs.filter(
    (doc, index, items) =>
      items.findIndex((item) => item.title === doc.title) === index,
  );
}

function Question({
  number,
  title,
  options,
  value,
  onChange,
}: {
  number: string;
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {number}
        </span>
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`choice-button ${value === option ? 'choice-active' : ''}`}
          >
            <span>{option}</span>
            {value === option && <Check className="size-4" />}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Footer({ onNext }: { onNext: () => void }) {
  return (
    <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
      <p className="text-center text-xs text-muted-foreground sm:text-left">
        入力内容は「一時保存」を押した場合だけ、この端末に保存されます
      </p>
      <Button
        size="lg"
        onClick={onNext}
        className="h-12 gap-2 rounded-xl px-6 text-[15px] shadow-[0_8px_20px_rgb(19_94_78/18%)]"
      >
        この補助金で始める <ArrowRight />
      </Button>
    </div>
  );
}
