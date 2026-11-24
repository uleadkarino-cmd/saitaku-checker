import assert from 'node:assert/strict';
import { scorePlanText } from '../lib/plan-scoring.ts';
const score = (text) => scorePlanText('effect', text, ['売上', '効果'], 2);
const goal = '2027年3月までに顧客の購入を増やし売上300万円を目標とします。';
const actual = '直近2025年度の販売台帳を集計した実績は売上200万円で、前年150万円から増加しました。';
assert.ok(score(goal + actual).score > score(goal).score);
assert.ok(score(goal).missing.some(s => s.includes('実績値')));
assert.ok(!score(actual).missing.some(s => s.includes('実績値')));
assert.equal(score('2025年に開業しました。').breakdown[2].score, 0);
assert.ok(score('売上300万円を目標とします。').missing.some(s => s.includes('実績値')));
assert.ok(score(goal.repeat(30)).score <= score(goal).score);
assert.ok(score('売上【金額】円を目指します。'.repeat(30)).score <= 25);
const short = score(actual);
const complete = score(actual + '対象顧客は市内の子育て世帯であり、購入時の相談に対応するため店舗で代表者が新しい商品説明会を実施します。' + goal);
assert.ok(complete.score > short.score);
for (const result of [short, complete, score(goal), score('')]) {
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.equal(result.score, result.breakdown.reduce((sum, b) => sum + b.score, 0));
}
console.log('採点検証: すべて成功');
