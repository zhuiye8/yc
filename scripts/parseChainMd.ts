/**
 * One-time parser: reads 6 industry chain markdown files,
 * converts heading hierarchy → IndustryGraphNode trees,
 * and outputs TypeScript for src/mock/industryChainGraphData.ts
 *
 * Run: npx tsx scripts/parseChainMd.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- types ----------
interface MdNode {
  name: string;
  level: number;
  children: MdNode[];
}

interface GraphNode {
  id: string;
  name: string;
  status: 'strong' | 'weak' | 'missing';
  enterprises: number;
  talents: number;
  localEnterprises: number;
  localTalents: number;
  children?: GraphNode[];
}

// ---------- seeded RNG for reproducibility ----------
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed >>> 0) / 0x7fffffff;
}

function randStatus(): 'strong' | 'weak' | 'missing' {
  const r = rand();
  if (r < 0.60) return 'strong';
  if (r < 0.85) return 'weak';
  return 'missing';
}

function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ---------- parse markdown headings into tree ----------
function parseMd(content: string): MdNode {
  const lines = content.split('\n');
  const root: MdNode = { name: 'ROOT', level: 0, children: [] };
  const stack: MdNode[] = [root];

  for (const line of lines) {
    const m = line.match(/^(#{1,7})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length;
    const name = m[2].trim();

    const node: MdNode = { name, level, children: [] };

    // Pop stack until we find a parent with lower level
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  return root;
}

// ---------- find node by name in tree ----------
function findNode(node: MdNode, name: string): MdNode | null {
  if (node.name === name) return node;
  for (const child of node.children) {
    const found = findNode(child, name);
    if (found) return found;
  }
  return null;
}

// Find by name prefix match
function findNodeByPrefix(node: MdNode, prefix: string): MdNode | null {
  if (node.name.startsWith(prefix)) return node;
  for (const child of node.children) {
    const found = findNodeByPrefix(child, prefix);
    if (found) return found;
  }
  return null;
}

// ---------- convert MdNode → GraphNode ----------
let nodeCounter = 0;
function mdToGraph(md: MdNode, prefix: string, depth: number = 0): GraphNode {
  const id = `${prefix}-${nodeCounter++}`;
  const enterprises = randInt(5, 200);
  const talents = randInt(10, 400);
  const localRatio = 0.2 + rand() * 0.5;
  const node: GraphNode = {
    id,
    name: md.name,
    status: randStatus(),
    enterprises,
    talents,
    localEnterprises: Math.round(enterprises * localRatio),
    localTalents: Math.round(talents * localRatio),
  };
  if (md.children.length > 0) {
    node.children = md.children.map(c => mdToGraph(c, prefix, depth + 1));
  }
  return node;
}

// ---------- create a synthetic merged root ----------
function makeMergedRoot(name: string, sections: MdNode[], prefix: string): GraphNode {
  const mergedMd: MdNode = { name, level: 0, children: sections };
  return mdToGraph(mergedMd, prefix);
}

// ---------- serialize GraphNode to TS string ----------
function serializeNode(node: GraphNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const parts: string[] = [];
  parts.push(`${pad}{`);
  parts.push(`${pad}  id: '${node.id}', name: '${node.name.replace(/'/g, "\\'")}', status: '${node.status}',`);
  parts.push(`${pad}  enterprises: ${node.enterprises}, talents: ${node.talents}, localEnterprises: ${node.localEnterprises}, localTalents: ${node.localTalents},`);
  if (node.children && node.children.length > 0) {
    parts.push(`${pad}  children: [`);
    for (const child of node.children) {
      parts.push(serializeNode(child, indent + 4) + ',');
    }
    parts.push(`${pad}  ],`);
  }
  parts.push(`${pad}}`);
  return parts.join('\n');
}

// ---------- main ----------
const baseDir = path.resolve(__dirname, '../宜昌产业链六条');

function readFile(filename: string): string {
  return fs.readFileSync(path.join(baseDir, filename), 'utf-8');
}

// Parse all 6 files
const aiTree = parseMd(readFile('人工智能产业链全景图.md'));
const newenergyTree = parseMd(readFile('新能源新材料_产业链全景图.md'));
const yeastTree = parseMd(readFile('酵母发酵与功能成分制造.md'));
const pharmaTree = parseMd(readFile('先进制剂与高端仿制药_产业链全景图.md'));
const shipTree = parseMd(readFile('内河绿色智能船舶制造_产业链全景图.md'));
const wetchemTree = parseMd(readFile('湿电子化学品_产业链全景图.md'));

// ---- AI chain ----
const aiRoot = findNodeByPrefix(aiTree, '人工智能与生成式AI')!;
const aiUpstream = findNodeByPrefix(aiRoot, '上游')!;
const aiMidstream = findNodeByPrefix(aiRoot, '中游')!;
const aiDownstream = findNodeByPrefix(aiRoot, '下游')!;
const aiGovernance = findNodeByPrefix(aiRoot, '治理')!;
// Merge governance as extra child of downstream
aiDownstream.children.push(aiGovernance);

nodeCounter = 0;
const aiData = {
  upstream: mdToGraph(aiUpstream, 'ai'),
  midstream: mdToGraph(aiMidstream, 'ai'),
  downstream: mdToGraph(aiDownstream, 'ai'),
};

// ---- New energy & materials chain ----
const neRoot = findNode(newenergyTree, '新能源新材料')!;
const neBattery = findNode(neRoot, '新能源电池')!;
const neNew = neRoot.children[0]; // ## 新能源
const neOtherSections = neNew.children.filter(c => c.name !== '新能源电池'); // everything under 新能源 except 新能源电池
const neMaterials = findNode(neRoot, '新材料')!;

nodeCounter = 0;
const neData = {
  upstream: mdToGraph(neBattery, 'ne'),
  midstream: makeMergedRoot('其他新能源', neOtherSections, 'ne'),
  downstream: mdToGraph(neMaterials, 'ne'),
};

// ---- Yeast chain ----
const yeastRoot = findNode(yeastTree, '酵母发酵与功能成分制造')!;
const yeastUpstream = findNode(yeastRoot, '关键要素与投入体系')!;
const yeastMidstream = findNode(yeastRoot, '制造与过程工程')!;
const yeastProducts = findNode(yeastRoot, '产品体系与功能成分')!;
const yeastApps = findNode(yeastRoot, '应用场景与产业生态')!;

nodeCounter = 0;
const yeastData = {
  upstream: mdToGraph(yeastUpstream, 'ye'),
  midstream: mdToGraph(yeastMidstream, 'ye'),
  downstream: makeMergedRoot('产品与应用', [yeastProducts, yeastApps], 'ye'),
};

// ---- Pharma chain ----
const pharmaRoot = findNode(pharmaTree, '先进制剂与高端仿制药')!;
const pharmaUpstream = findNode(pharmaRoot, '剂型与给药系统')!;
const pharmaMidstream = findNode(pharmaRoot, '制造工艺与产线')!;
const pharmaAnalysis = findNode(pharmaRoot, '分析检测与等效性评价')!;
const pharmaIndustrial = findNode(pharmaRoot, '产业化配套与工程服务')!;

nodeCounter = 0;
const pharmaData = {
  upstream: mdToGraph(pharmaUpstream, 'ph'),
  midstream: mdToGraph(pharmaMidstream, 'ph'),
  downstream: makeMergedRoot('检测与产业化', [pharmaAnalysis, pharmaIndustrial], 'ph'),
};

// ---- Ship chain ----
const shipRoot = findNode(shipTree, '内河绿色智能船舶制造')!;
const shipUpstream = findNode(shipRoot, '设计与工程制造')!;
const shipMidstream = findNode(shipRoot, '关键系统与核心部件')!;
const shipSmart = findNode(shipRoot, '智能化与航运运营生态')!;
const shipRecycle = findNode(shipRoot, '循环利用与环境治理')!;

nodeCounter = 0;
const shipData = {
  upstream: mdToGraph(shipUpstream, 'sh'),
  midstream: mdToGraph(shipMidstream, 'sh'),
  downstream: makeMergedRoot('智能化与运营', [shipSmart, shipRecycle], 'sh'),
};

// ---- Wet electronic chemicals chain ----
const wetchemRoot = findNodeByPrefix(wetchemTree, '湿电子化学品')!;
const wcProducts = findNodeByPrefix(wetchemRoot, '产品体系')!;
const wcManufacture = findNodeByPrefix(wetchemRoot, '生产制造')!;
const wcSupply = findNodeByPrefix(wetchemRoot, '供应与交付')!;
const wcApplication = findNodeByPrefix(wetchemRoot, '下游工艺应用')!;
const wcRecycle = findNodeByPrefix(wetchemRoot, '回收与环保')!;

nodeCounter = 0;
const wcData = {
  upstream: mdToGraph(wcProducts, 'wc'),
  midstream: makeMergedRoot('制造与供应', [wcManufacture, wcSupply], 'wc'),
  downstream: makeMergedRoot('应用与环保', [wcApplication, wcRecycle], 'wc'),
};

// ---- Count nodes per chain ----
function countNodes(node: GraphNode): number {
  let count = 1;
  if (node.children) {
    for (const c of node.children) count += countNodes(c);
  }
  return count;
}

for (const [name, data] of [['ai', aiData], ['newenergy', neData], ['yeast', yeastData], ['pharma', pharmaData], ['ship', shipData], ['wetchem', wcData]] as [string, typeof aiData][]) {
  const total = countNodes(data.upstream) + countNodes(data.midstream) + countNodes(data.downstream);
  console.error(`${name}: ${total} nodes`);
}

// ---------- output TypeScript ----------
const output: string[] = [];
output.push(`// Auto-generated by scripts/parseChainMd.ts — do not edit manually`);
output.push(`import type { IndustryGraphSet } from './data';`);
output.push(``);
output.push(`export const industryChainGraphData: Record<string, IndustryGraphSet> = {`);

for (const [key, data] of [
  ['ai', aiData],
  ['newenergy', neData],
  ['yeast', yeastData],
  ['pharma', pharmaData],
  ['ship', shipData],
  ['wetchem', wcData],
] as [string, typeof aiData][]) {
  const labels: Record<string, [string, string, string]> = {
    ai: ['上游', '中游', '下游'],
    newenergy: ['新能源电池', '其他新能源', '新材料'],
    yeast: ['关键要素', '制造过程', '产品与应用'],
    pharma: ['剂型给药', '制造工艺', '检测与产业化'],
    ship: ['设计制造', '关键系统', '智能运营'],
    wetchem: ['产品体系', '制造与供应', '应用与环保'],
  };
  const [upLabel, midLabel, downLabel] = labels[key];
  output.push(`  ${key}: {`);
  output.push(`    upstream: {`);
  output.push(`      label: '${upLabel}',`);
  output.push(`      root: ${serializeNode(data.upstream, 6)},`);
  output.push(`    },`);
  output.push(`    midstream: {`);
  output.push(`      label: '${midLabel}',`);
  output.push(`      root: ${serializeNode(data.midstream, 6)},`);
  output.push(`    },`);
  output.push(`    downstream: {`);
  output.push(`      label: '${downLabel}',`);
  output.push(`      root: ${serializeNode(data.downstream, 6)},`);
  output.push(`    },`);
  output.push(`  },`);
}

output.push(`};`);

const outPath = path.resolve(__dirname, '../src/mock/industryChainGraphData.ts');
fs.writeFileSync(outPath, output.join('\n'), 'utf-8');
console.error(`Written to ${outPath}`);
