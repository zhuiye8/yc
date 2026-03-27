/**
 * Dashboard real data from client Excel aggregations.
 * Imported by dashboard components to replace hardcoded mock values.
 */
import { aggregations } from '../../mock/localAggregations';

const agg = aggregations;

// ─── Home Page: Industry Module ──────────────────────────────────────────────
export const industryData = {
  sumTitle: '链上企业总数',
  sumValue: String(agg.totalEnterprises),
};

// ─── Home Page: Talent Module ────────────────────────────────────────────────
export const talentHomeData = {
  sumTitle: '人才总数',
  sumValue: String(agg.totalSkillTalents),
  subStats: [
    { text: '宜昌籍人才总数', value: agg.talentSubStats.yichangNative },
    { text: '领军人才总数', value: agg.talentSubStats.leading || 0 },
    { text: '创新人才总数', value: agg.talentSubStats.innovation },
    { text: '技能人才总数', value: agg.talentSubStats.skill },
  ],
};

// ─── Home Page: Policy Module ────────────────────────────────────────────────
const policyCats = agg.policyCountByCategory;
export const policyHomeData = {
  total: `${agg.totalPolicies}条`,
  totalLabel: '政策总数',
  items: [
    { name: '科技政策数', value: String(policyCats['科技'] || 0) },
    { name: '产业发展政策数', value: String(policyCats['产业发展'] || 0) },
    { name: '综合政策数', value: String(policyCats['综合'] || 0) },
  ],
};

// ─── Industry Page: Indicator ────────────────────────────────────────────────
export const industryIndicator = {
  row1: [
    { title: '缺链数', value: 4 },    // no data source, keep mock
    { title: '强链数', value: 10 },   // no data source, keep mock
  ],
  row2: [
    { title: '产业链数', value: 6 },  // no data source, keep mock
    { title: '企业总数', value: agg.totalEnterprises },
    { title: '人才总数', value: agg.totalSkillTalents },
  ],
};

// ─── Industry Page: Enterprise Table ─────────────────────────────────────────
export const enterpriseTableData = {
  headers: ['企业名', '所属行业'],
  items: agg.topEnterprises.map(e => ({
    name: e.name,
    industry: e.industry || '—',
  })),
};

// ─── Industry Page: Talent Table ─────────────────────────────────────────────
export const talentTableData = {
  headers: ['人才名', '职称', '单位'],
  items: agg.topSkillTalents.map(t => ({
    name: t.name,
    title: t.position || '—',
    field: t.organization || '—',
  })),
};

// ─── Talent Page: Classification Pie ─────────────────────────────────────────
const levelData = agg.talentCountByLevel;
export const classificationData = [
  { name: '领军人才', value: levelData['领军人才'] || 0, color: '#3B82F6' },
  { name: '技能人才', value: levelData['技能人才'] || 12567, color: '#FF8A00' },
  { name: '创新人才', value: levelData['创新人才'] || 12402, color: '#10B981' },
];

// ─── Talent Page: Total Bar ──────────────────────────────────────────────────
export const talentTotalData = {
  items: [
    { name: '人才总数', value: agg.totalSkillTalents },
    { name: '创新人才总数', value: levelData['创新人才'] || 12402 },
    { name: '技能人才总数', value: levelData['技能人才'] || 12567 },
  ],
};

// ─── Talent Page: ValueChain Pie ─────────────────────────────────────────────
const indData = agg.talentCountByIndustry;
const colors6 = ['#3B82F6', '#FF8A00', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
export const valueChainData = Object.entries(indData)
  .filter(([k]) => k !== '其他')
  .slice(0, 6)
  .map(([name, value], i) => ({ name, value, color: colors6[i % 6] }));

// ─── Talent Page: GapCount Bar ───────────────────────────────────────────────
const posData = agg.positionCountByOccupation;
const topPositions = Object.entries(posData).slice(0, 6);
export const gapCountData = {
  categories: topPositions.map(([k]) => k),
  values: topPositions.map(([, v]) => v),
};

// ─── Talent Page: Yichang Distribution ───────────────────────────────────────
const nativeData = agg.talentCountByNativePlace;
const yichangDistricts = Object.entries(nativeData)
  .filter(([k]) => k.startsWith('宜昌市') && k !== '宜昌市')
  .map(([k, v]) => ({ name: k.replace('宜昌市', ''), value: v }))
  .sort((a, b) => b.value - a.value);

export const yichangDistributionData = {
  categories: yichangDistricts.length > 0
    ? yichangDistricts.map(d => d.name)
    : ['枝江市', '宜都市', '秭归县', '当阳市', '长阳县', '五峰县', '兴山县', '远安县', '夷陵区', '西陵区', '伍家岗区'],
  values: yichangDistricts.length > 0
    ? yichangDistricts.map(d => d.value)
    : [366, 285, 249, 225, 179, 93, 81, 58, 53, 24, 9],
};
