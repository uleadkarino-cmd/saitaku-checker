// Local rubric: detects writing evidence, not the truth of submitted claims.
export function scorePlanText(fieldId: string, raw: string, passed: string[], ruleCount: number) {
  const text = raw.normalize('NFKC');
  const sentences = text.split(/[。！？!?\n]+/u).map(s => s.trim()).filter(Boolean);
  const unique = [...new Set(sentences)];
  const effectiveLength = unique.join('').replace(/\s/g, '').length;
  const numeric = /\d[\d,.]*\s*(?:億円|万円|千円|円|%|人|名|件|社|回|個|台|時間)/u;
  const metric = /売上|利益|粗利|客数|顧客数|受注|成約|購入|販売|契約|生産|作業時間|問い合わせ|回答|市場規模|満足度/u;
  const measured = unique.filter(s => numeric.test(s) && metric.test(s));
  // A date or future target alone is not a historical business result.
  const actual = measured.filter(s => /実績|前年|昨年|直近|過去|現在|現状|達成|だった|でした|となった|となりました|記録/u.test(s)
    && (!/目標|見込|予定|計画|目指/u.test(s) || /現在|現状|前年|昨年|直近/u.test(s)));
  const datedActual = actual.some(s => /20\d{2}年|\d+年度|前年|昨年|直近.{0,8}(?:月|年)|月間|年間/u.test(s));
  const source = unique.some(s => /調査|アンケート|販売台帳|会計|決算|集計|記録|出典|統計|白書|見積/u.test(s) && numeric.test(s));
  const comparison = actual.some(s => /前年比|比較|から|対し|増加|減少|増|減/u.test(s) && (s.match(/\d[\d,.]*\s*(?:億円|万円|円|%|人|件|社)/gu) || []).length >= 2);
  const causal = unique.some(s => s.length >= 40 && /ため|により|ことで|原因|背景|その結果|これにより/u.test(s));
  const execution = unique.some(s => /導入|制作|販売|実施|開発|提供|改善/u.test(s) && /担当|代表|従業員|委託|店舗|地域|オンライン|\d+月/u.test(s));
  const target = unique.some(s => /顧客|利用者|法人|個人|事業者|観光客|女性|男性|世帯/u.test(s) && s.length >= 30);
  const timedGoal = measured.some(s => /目標|見込|目指|までに/u.test(s) && /20\d{2}年|\d+月|年度/u.test(s));
  const calculation = unique.some(s => /\d[\d,.]*\s*(?:円|万円|人|件|回)/u.test(s) && /[×*]/u.test(s) && /[=＝]|算出/u.test(s));
  const planField = ['policy', 'future', 'summary', 'action', 'effect', 'estimate'].includes(fieldId);
  const checks = [
    { label: '対象・顧客の具体的な説明', ok: target },
    { label: '原因と取組・効果のつながり', ok: causal },
    { label: '方法・体制・時期の説明', ok: execution },
  ];
  const evidence = [
    { label: '指標と単位を伴う実績値（目標値だけでは不可）', ok: actual.length > 0 },
    { label: '実績の対象期間', ok: datedActual },
    { label: '数値の出典・集計根拠', ok: source },
    { label: planField ? '期限付き数値目標または試算式' : '実績の比較・増減', ok: planField ? timedGoal || calculation : comparison },
  ];
  const lengthScore = Math.min(20, Math.floor(effectiveLength / 30));
  const contentScore = Math.floor((ruleCount ? passed.length / ruleCount : 0) * 20)
    + checks.filter(c => c.ok).length * 10;
  let evidenceScore = evidence.filter(c => c.ok).length * 7.5;
  const missing = [...checks, ...evidence].filter(c => !c.ok).map(c => c.label);
  // Cap the awarded evidence itself, so displayed breakdown always sums to total.
  if (!actual.length) evidenceScore = Math.min(evidenceScore, 5);
  const placeholder = /【|】|○○|〇〇|\d+\s*(?:円|人|件)?\s*を入力/u.test(text);
  const repetition = sentences.length > 2 && unique.length / sentences.length < 0.7;
  if (placeholder) missing.push('例文の空欄・仮置き表現を実際の情報へ置換');
  if (repetition) missing.push('同じ文の繰り返しを整理');
  const penalty = placeholder || repetition;
  const breakdown = [
    { label: '文章量（重複文を除く）', score: penalty ? Math.min(5, lengthScore) : lengthScore, max: 20 },
    { label: '項目内容・具体性', score: penalty ? Math.min(20, contentScore) : contentScore, max: 50 },
    { label: '実績値・数値根拠', score: penalty ? 0 : evidenceScore, max: 30 },
  ];
  return { score: breakdown.reduce((sum, b) => sum + b.score, 0), breakdown, missing,
    positives: [...checks, ...evidence].filter(c => c.ok).map(c => `${c.label}の記載を検出しました`) };
}
