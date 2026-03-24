/**
 * @input antd 组件, ReactECharts, echarts, { useNavigate } from 'react-router-dom', mock/data 多个数据集
 * @output { Industry } 产业页组件
 * @position 业务页面（最复杂），产业链树图谱 + 3D 金字塔/柱状图/环形图 + 企业列表 + 中国地图 + 创新资源弧形布局
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Row, Col, Tabs, Tag, Button, Space, Cascader, Drawer, Descriptions, Statistic, Progress, Typography, Input, Badge, Table, App, List, Avatar, Timeline } from 'antd';
import {
  SearchOutlined,
  BankOutlined,
  PlusOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ArrowDownOutlined,
  RightOutlined,
  BellOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  BulbOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import { enterprises, industryGraphDataMap, industryOverviewDataMap, enterpriseList, enterpriseNews, keyTechnologies, coreTalents, patentLayout, cooperativeOrgs, industryChainColorConfig } from '../mock/data';
import type { IndustryGraphNode, IndustryGraphSet } from '../mock/data';

const { Text, Paragraph } = Typography;

const statusColorMap: Record<string, string> = {
  strong: industryChainColorConfig.status.strong,
  weak: industryChainColorConfig.status.weak,
  missing: industryChainColorConfig.status.missing,
};
const statusLabelMap: Record<string, string> = { strong: '强链', weak: '弱链', missing: '缺链' };
type StreamKey = 'upstream' | 'midstream' | 'downstream';

// 各产业链的三列标题映射
const sectionHeaderMap: Record<string, [string, string, string]> = {
  ai: ['上游', '中游', '下游'],
  newenergy: ['新能源电池', '其他新能源', '新材料'],
  yeast: ['关键要素', '制造过程', '产品与应用'],
  pharma: ['剂型给药', '制造工艺', '检测与产业化'],
  ship: ['设计制造', '关键系统', '智能运营'],
  wetchem: ['产品体系', '制造与供应', '应用与环保'],
};
// ========== 创新资源指标卡片配置（弧形环绕） ==========
const innovationLeftItems = [
  { label: '创新人才', key: 'innovationTalent', unit: '位', route: '/talent' },
  { label: '创新机构', key: 'innovationOrg', unit: '家', route: 'enterprises' },
  { label: '双创载体', key: 'dualCreation', unit: '个', route: 'enterprises' },
  { label: '产业园区', key: 'industrialPark', unit: '个', route: 'enterprises' },
  { label: '科研项目', key: 'researchProject', unit: '项', route: '/tech' },
];
const innovationRightItems = [
  { label: '科技成果', key: 'techAchievement', unit: '项', route: '/tech' },
  { label: '知识产权', key: 'intellectualProperty', unit: '件', route: '/tech' },
  { label: '技术标准', key: 'techStandard', unit: '项', route: '/tech' },
  { label: '产业政策', key: 'industrialPolicy', unit: '条', route: '/policy' },
  { label: '科技文献', key: 'techLiterature', unit: '篇', route: '/tech' },
];
// 弧形偏移：上下大、中间小，形成 )/( 曲线
const innovationArcOffsets = [24, 8, 0, 8, 24];

// count-up hook for innovation indicator animation
function useInnovationCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// 创新资源指标卡片子组件（弧形排列，无图标色块）
const InnovationCard: React.FC<{
  label: string; value: number; unit: string;
  side: 'left' | 'right'; arcOffset: number;
  onClick?: () => void; active: boolean; flash: boolean;
}> = ({ label, value, unit, side, arcOffset, onClick, active, flash }) => {
  const displayValue = useInnovationCountUp(value);
  const [hovered, setHovered] = useState(false);

  const hoverTransform = side === 'left' ? 'translateX(6px)' : 'translateX(-6px)';
  const numStyle: React.CSSProperties = {
    fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px',
    color: active ? '#1E6FFF' : '#bfbfbf',
    animation: flash ? 'innovationPulse 0.4s ease' : 'none',
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 14, padding: '14px 20px',
        boxShadow: hovered ? '0 4px 16px rgba(0,120,255,0.14)' : '0 2px 12px rgba(0,120,255,0.08)',
        transition: 'all 0.2s ease',
        cursor: active ? 'pointer' : 'default',
        transform: hovered && active ? hoverTransform : 'none',
        width: 270,
        ...(side === 'left' ? { marginRight: arcOffset } : { marginLeft: arcOffset }),
      }}
    >
      {side === 'left' ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
          <span style={numStyle}>{active ? displayValue.toLocaleString() : '--'}</span>
          <span style={{ fontSize: 15, color: '#5b8db8' }}>（{unit}）</span>
          <span style={{ fontSize: 16, color: '#5b8db8' }}>{label}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 16, color: '#5b8db8', whiteSpace: 'nowrap' }}>{label}（{unit}）</span>
          <span style={numStyle}>{active ? displayValue.toLocaleString() : '--'}</span>
        </div>
      )}
    </div>
  );
};

// 递归将 IndustryGraphNode 转为 ECharts tree data（矩形边框样式）
// maxDepth: 截断深度（undefined=全展开），depth: 当前递归深度
function toEChartsTree(node: IndustryGraphNode, maxDepth?: number, depth = 0): object {
  const nodeColor = statusColorMap[node.status];
  const textColor = node.status === 'missing' ? '#999' : nodeColor;
  const truncated = maxDepth !== undefined
    && depth >= maxDepth
    && node.children && node.children.length > 0;

  return {
    name: node.name,
    itemStyle: {
      color: '#fff',
      borderColor: nodeColor,
      borderWidth: 1.5,
      borderType: node.status === 'missing' ? 'dashed' : 'solid',
    },
    label: truncated
      ? {
          formatter: `{name|${node.name}} {plus|⊕}`,
          rich: {
            name: { color: textColor, fontSize: 12, fontWeight: 500 },
            plus: { color: '#2468F2', fontSize: 14, fontWeight: 700, padding: [0, 0, 0, 4] },
          },
        }
      : { color: textColor },
    children: truncated
      ? undefined
      : node.children?.map(c => toEChartsTree(c, maxDepth, depth + 1)),
  };
}

// 递归收集所有节点到 map
function collectNodes(node: IndustryGraphNode, map: Record<string, IndustryGraphNode>) {
  map[node.name] = node;
  node.children?.forEach(c => collectNodes(c, map));
}

const Industry: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedChainKey, setSelectedChainKey] = useState('ai');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnterprise] = useState<typeof enterprises[0] | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const [chinaMapRegistered, setChinaMapRegistered] = useState(false);
  const [popoverNode, setPopoverNode] = useState<IndustryGraphNode | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapChartRef = useRef<ReactECharts>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>('湖北省');
  const innovationMapRef = useRef<ReactECharts>(null);
  const [enterpriseDetailVisible, setEnterpriseDetailVisible] = useState(false);
  const [selectedEnterpriseDetail, setSelectedEnterpriseDetail] = useState<typeof enterpriseList[0] | null>(null);
  const [enterpriseDetailTab, setEnterpriseDetailTab] = useState('basic');
  const [innovationFlash, setInnovationFlash] = useState(false);

  // 三棵树聚焦交互
  const [focusedTree, setFocusedTree] = useState<StreamKey | null>(null);
  const [popoverStream, setPopoverStream] = useState<StreamKey | null>(null);
  const treeRefs = useRef<Record<StreamKey, ReactECharts | null>>({
    upstream: null, midstream: null, downstream: null,
  });

  // 创新资源数据 - 按省份
  const innovationDataByProvince: Record<string, {
    innovationTalent: number; innovationOrg: number; dualCreation: number; industrialPark: number; researchProject: number;
    techAchievement: number; intellectualProperty: number; techStandard: number; industrialPolicy: number; techLiterature: number;
  }> = {
    '湖北省': { innovationTalent: 1118633, innovationOrg: 105843, dualCreation: 302, industrialPark: 8073, researchProject: 84116, techAchievement: 63553, intellectualProperty: 1620077, techStandard: 19756, industrialPolicy: 4870, techLiterature: 2401038 },
    '广东省': { innovationTalent: 1856420, innovationOrg: 168920, dualCreation: 485, industrialPark: 12560, researchProject: 125680, techAchievement: 98650, intellectualProperty: 2850000, techStandard: 32450, industrialPolicy: 6890, techLiterature: 3650000 },
    '江苏省': { innovationTalent: 1620350, innovationOrg: 145680, dualCreation: 420, industrialPark: 10850, researchProject: 112350, techAchievement: 86540, intellectualProperty: 2450000, techStandard: 28650, industrialPolicy: 5980, techLiterature: 3120000 },
    '浙江省': { innovationTalent: 1350680, innovationOrg: 125430, dualCreation: 380, industrialPark: 9560, researchProject: 98560, techAchievement: 72350, intellectualProperty: 2180000, techStandard: 24560, industrialPolicy: 5120, techLiterature: 2680000 },
    '北京市': { innovationTalent: 1980560, innovationOrg: 186540, dualCreation: 520, industrialPark: 8650, researchProject: 156800, techAchievement: 125680, intellectualProperty: 3250000, techStandard: 45680, industrialPolicy: 8560, techLiterature: 4560000 },
    '上海市': { innovationTalent: 1650420, innovationOrg: 156890, dualCreation: 450, industrialPark: 7850, researchProject: 135680, techAchievement: 105420, intellectualProperty: 2860000, techStandard: 38560, industrialPolicy: 7250, techLiterature: 3850000 },
    '四川省': { innovationTalent: 985630, innovationOrg: 86540, dualCreation: 265, industrialPark: 6850, researchProject: 68540, techAchievement: 52680, intellectualProperty: 1250000, techStandard: 15680, industrialPolicy: 3650, techLiterature: 1850000 },
    '山东省': { innovationTalent: 1125680, innovationOrg: 98650, dualCreation: 298, industrialPark: 8250, researchProject: 78560, techAchievement: 62540, intellectualProperty: 1580000, techStandard: 18560, industrialPolicy: 4250, techLiterature: 2150000 },
    '安徽省': { innovationTalent: 756840, innovationOrg: 68540, dualCreation: 185, industrialPark: 5680, researchProject: 52680, techAchievement: 38560, intellectualProperty: 980000, techStandard: 12560, industrialPolicy: 2850, techLiterature: 1280000 },
    '河南省': { innovationTalent: 685420, innovationOrg: 56840, dualCreation: 165, industrialPark: 5250, researchProject: 45680, techAchievement: 32560, intellectualProperty: 850000, techStandard: 10560, industrialPolicy: 2450, techLiterature: 1050000 },
    '湖南省': { innovationTalent: 725680, innovationOrg: 62540, dualCreation: 175, industrialPark: 5450, researchProject: 48560, techAchievement: 35680, intellectualProperty: 920000, techStandard: 11560, industrialPolicy: 2650, techLiterature: 1150000 },
    '陕西省': { innovationTalent: 658420, innovationOrg: 58650, dualCreation: 158, industrialPark: 4850, researchProject: 52680, techAchievement: 42560, intellectualProperty: 780000, techStandard: 9860, industrialPolicy: 2350, techLiterature: 1350000 },
    '福建省': { innovationTalent: 625680, innovationOrg: 52680, dualCreation: 145, industrialPark: 4560, researchProject: 38560, techAchievement: 28560, intellectualProperty: 720000, techStandard: 8650, industrialPolicy: 2150, techLiterature: 980000 },
    '辽宁省': { innovationTalent: 565420, innovationOrg: 48560, dualCreation: 135, industrialPark: 4250, researchProject: 35680, techAchievement: 25680, intellectualProperty: 650000, techStandard: 7860, industrialPolicy: 1950, techLiterature: 920000 },
    '天津市': { innovationTalent: 485680, innovationOrg: 42560, dualCreation: 118, industrialPark: 3650, researchProject: 32560, techAchievement: 22560, intellectualProperty: 580000, techStandard: 6850, industrialPolicy: 1750, techLiterature: 850000 },
    '重庆市': { innovationTalent: 525680, innovationOrg: 45680, dualCreation: 125, industrialPark: 3850, researchProject: 35680, techAchievement: 24560, intellectualProperty: 620000, techStandard: 7250, industrialPolicy: 1850, techLiterature: 880000 },
    '河北省': { innovationTalent: 586320, innovationOrg: 52480, dualCreation: 142, industrialPark: 4680, researchProject: 38560, techAchievement: 28650, intellectualProperty: 680000, techStandard: 8250, industrialPolicy: 2050, techLiterature: 920000 },
    '山西省': { innovationTalent: 325680, innovationOrg: 28560, dualCreation: 82, industrialPark: 2850, researchProject: 22560, techAchievement: 16540, intellectualProperty: 385000, techStandard: 4650, industrialPolicy: 1250, techLiterature: 520000 },
    '内蒙古自治区': { innovationTalent: 218560, innovationOrg: 18650, dualCreation: 56, industrialPark: 1950, researchProject: 15680, techAchievement: 10560, intellectualProperty: 265000, techStandard: 3250, industrialPolicy: 860, techLiterature: 380000 },
    '吉林省': { innovationTalent: 385420, innovationOrg: 32560, dualCreation: 95, industrialPark: 2650, researchProject: 28560, techAchievement: 22680, intellectualProperty: 425000, techStandard: 5250, industrialPolicy: 1350, techLiterature: 650000 },
    '黑龙江省': { innovationTalent: 425680, innovationOrg: 36540, dualCreation: 108, industrialPark: 3050, researchProject: 32560, techAchievement: 25680, intellectualProperty: 480000, techStandard: 5860, industrialPolicy: 1450, techLiterature: 720000 },
    '江西省': { innovationTalent: 398560, innovationOrg: 34680, dualCreation: 98, industrialPark: 3250, researchProject: 26560, techAchievement: 18560, intellectualProperty: 420000, techStandard: 5060, industrialPolicy: 1380, techLiterature: 580000 },
    '广西壮族自治区': { innovationTalent: 345680, innovationOrg: 28960, dualCreation: 85, industrialPark: 2850, researchProject: 22680, techAchievement: 15680, intellectualProperty: 365000, techStandard: 4350, industrialPolicy: 1150, techLiterature: 485000 },
    '海南省': { innovationTalent: 125680, innovationOrg: 10560, dualCreation: 38, industrialPark: 1250, researchProject: 8560, techAchievement: 5680, intellectualProperty: 128000, techStandard: 1650, industrialPolicy: 520, techLiterature: 185000 },
    '贵州省': { innovationTalent: 285640, innovationOrg: 22680, dualCreation: 68, industrialPark: 2150, researchProject: 18560, techAchievement: 12560, intellectualProperty: 285000, techStandard: 3450, industrialPolicy: 950, techLiterature: 385000 },
    '云南省': { innovationTalent: 318560, innovationOrg: 26540, dualCreation: 75, industrialPark: 2450, researchProject: 20560, techAchievement: 14560, intellectualProperty: 325000, techStandard: 3850, industrialPolicy: 1050, techLiterature: 450000 },
    '西藏自治区': { innovationTalent: 28560, innovationOrg: 2650, dualCreation: 8, industrialPark: 320, researchProject: 2560, techAchievement: 1250, intellectualProperty: 18500, techStandard: 380, industrialPolicy: 150, techLiterature: 35000 },
    '甘肃省': { innovationTalent: 225680, innovationOrg: 18560, dualCreation: 52, industrialPark: 1650, researchProject: 16560, techAchievement: 12680, intellectualProperty: 218000, techStandard: 2850, industrialPolicy: 780, techLiterature: 385000 },
    '青海省': { innovationTalent: 68560, innovationOrg: 5860, dualCreation: 18, industrialPark: 580, researchProject: 5260, techAchievement: 3250, intellectualProperty: 52000, techStandard: 860, industrialPolicy: 280, techLiterature: 95000 },
    '宁夏回族自治区': { innovationTalent: 85640, innovationOrg: 7560, dualCreation: 22, industrialPark: 750, researchProject: 6560, techAchievement: 4250, intellectualProperty: 68000, techStandard: 1050, industrialPolicy: 350, techLiterature: 125000 },
    '新疆维吾尔自治区': { innovationTalent: 168560, innovationOrg: 14560, dualCreation: 42, industrialPark: 1350, researchProject: 12560, techAchievement: 8560, intellectualProperty: 165000, techStandard: 2150, industrialPolicy: 620, techLiterature: 256000 },
    '台湾省': { innovationTalent: 856420, innovationOrg: 72560, dualCreation: 215, industrialPark: 5250, researchProject: 68560, techAchievement: 52680, intellectualProperty: 1250000, techStandard: 15680, industrialPolicy: 3250, techLiterature: 1580000 },
    '香港特别行政区': { innovationTalent: 425680, innovationOrg: 38560, dualCreation: 128, industrialPark: 2850, researchProject: 35680, techAchievement: 28560, intellectualProperty: 650000, techStandard: 8560, industrialPolicy: 1850, techLiterature: 920000 },
    '澳门特别行政区': { innovationTalent: 35680, innovationOrg: 3250, dualCreation: 12, industrialPark: 380, researchProject: 2860, techAchievement: 1850, intellectualProperty: 28000, techStandard: 520, industrialPolicy: 180, techLiterature: 52000 },
  };

  useEffect(() => {
    fetch('/china-map.json')
      .then(res => res.json())
      .then(json => {
        json.features = (json.features || []).filter((f: { properties?: { name?: string; adchar?: string }; id?: string }) => {
          const n = f.properties?.name || '';
          // 过滤南海诸岛和十段线/九段线
          if (n.includes('南海') || n.includes('段线') || n.includes('九段') || n.includes('十段')) return false;
          // 过滤海南省附近小岛的 features（id 以 100000_JD 开头的是九段线）
          if (f.id && String(f.id).startsWith('100000_JD')) return false;
          return true;
        });
        echarts.registerMap('chinaFiltered', json);
        setChinaMapRegistered(true);
      })
      .catch(() => console.warn('Failed to load china map data'));
  }, []);

  const hotTags = ['氢气制备', '磷化工', '锂电材料', '生物制药', '智能传感器', '碳纤维', '光伏材料', '精细化工'];

  const currentGraphData: IndustryGraphSet = industryGraphDataMap[selectedChainKey] || industryGraphDataMap.ai;
  const currentOverview = industryOverviewDataMap[selectedChainKey] || industryOverviewDataMap.ai;

  // 节点查找表
  const nodeMap = useMemo(() => {
    const map: Record<string, IndustryGraphNode> = {};
    const gd = currentGraphData;
    collectNodes(gd.upstream.root, map);
    collectNodes(gd.midstream.root, map);
    collectNodes(gd.downstream.root, map);
    return map;
  }, [currentGraphData]);

  // Cascader onChange → 取第一级 value 作为产业链 key
  const onCascaderChange = (value: (string | number)[]) => {
    if (!value || value.length === 0) {
      setSelectedChainKey('ai'); // default
    } else {
      setSelectedChainKey(value[0] as string);
    }
    setPopoverNode(null);
    setFocusedTree(null);
  };

  // ==================== 产业图谱：3 棵 ECharts Tree ====================
  const getSingleTreeOption = (streamKey: StreamKey) => {
    const root = currentGraphData[streamKey].root;
    const isFocused = focusedTree === streamKey;

    return {
      tooltip: { show: false },
      series: [{
        type: 'tree',
        data: [toEChartsTree(root, isFocused ? undefined : 2)],
        orient: 'LR' as const,
        top: '8%', bottom: '5%', left: '10%', right: '10%',
        symbol: 'rect', symbolSize: [90, 28],
        initialTreeDepth: isFocused ? 99 : 2,
        edgeShape: 'polyline',
        edgeForkPosition: '63%',
        label: { fontSize: 12, fontWeight: 500, position: 'inside' as const },
        lineStyle: { color: '#c0c8d4', width: 1 },
        emphasis: { focus: 'descendant' },
        expandAndCollapse: isFocused,
        roam: isFocused,
      }],
    };
  };

  const handleTreeNodeClick = (streamKey: StreamKey) =>
    (params: { name?: string; event?: { offsetX?: number; offsetY?: number; event?: { offsetX?: number; offsetY?: number } } }) => {
      const name = params.name;
      if (!name) return;
      const nd = nodeMap[name];
      if (!nd) return;

      // 点击非聚焦树的有子节点节点 → 切换聚焦
      if (focusedTree !== streamKey && nd.children && nd.children.length > 0) {
        setFocusedTree(streamKey);
        setPopoverNode(null);
        return;
      }

      // 点击聚焦树或叶节点 → 显示弹窗
      setPopoverNode(nd);
      setPopoverStream(streamKey);
      const ox = params.event?.event?.offsetX ?? params.event?.offsetX ?? 300;
      const oy = params.event?.event?.offsetY ?? params.event?.offsetY ?? 200;
      setPopoverPos({ x: ox, y: oy });
    };

  // 聚焦切换时触发 resize，让未重建的树适应新容器宽度
  useEffect(() => {
    const timer = setTimeout(() => {
      (['upstream', 'midstream', 'downstream'] as StreamKey[]).forEach(sk => {
        treeRefs.current[sk]?.getEchartsInstance()?.resize();
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [focusedTree]);

  // ==================== 产业总览图表 ====================

  // 金字塔图 - 3D 立体感（与人才总览对齐）
  const getPyramidOption = () => {
    const data = currentOverview.institutionType;
    const mainColors = ['#F5943A', '#F5C244', '#3CC8B4', '#2A8AF6'];
    const darkColors = ['#D47A2A', '#C9A030', '#2BA89A', '#1E6FD4'];
    const lightColors = ['#F8B06A', '#F8D86A', '#6EDED0', '#5AA8F8'];
    const n = data.length;
    const topY = 25, bottomY = 270;
    const cx = 0;
    const topHalfW = 5;
    const bottomHalfW = 130;
    const totalH = bottomY - topY;
    const rowH = totalH / n;
    const gap = 4;
    const depth = 8;
    const children: object[] = [];
    for (let i = 0; i < n; i++) {
      const y1 = topY + i * rowH + (i > 0 ? gap : 0);
      const y2 = topY + (i + 1) * rowH;
      const hw1 = topHalfW + (bottomHalfW - topHalfW) * ((y1 - topY) / totalH);
      const hw2 = topHalfW + (bottomHalfW - topHalfW) * ((y2 - topY) / totalH);
      // 左侧面高光
      children.push({ type: 'polygon', shape: { points: [
        [cx - hw1, y1], [cx - hw1 - depth, y1 + depth],
        [cx - hw2 - depth, y2 + depth], [cx - hw2, y2],
      ]}, style: { fill: lightColors[i] }, z2: 8 });
      // 底面阴影
      children.push({ type: 'polygon', shape: { points: [
        [cx - hw2, y2], [cx - hw2 - depth, y2 + depth],
        [cx + hw2 - depth, y2 + depth], [cx + hw2, y2],
      ]}, style: { fill: darkColors[i] }, z2: 8 });
      // 正面梯形
      children.push({ type: 'polygon', shape: { points: [
        [cx - hw1, y1], [cx + hw1, y1],
        [cx + hw2, y2], [cx - hw2, y2],
      ]}, style: { fill: mainColors[i] }, z2: 10 });
      // 标注线 + 文字
      const midY = (y1 + y2) / 2;
      const lineStartX = cx + hw2 + 8;
      const lineEndX = cx + bottomHalfW + 30;
      children.push({ type: 'line', shape: { x1: lineStartX, y1: midY, x2: lineEndX, y2: midY }, style: { stroke: mainColors[i], lineWidth: 1.5 }, z2: 10 });
      children.push({ type: 'text', x: lineEndX + 8, y: midY - 10, style: { text: data[i].name, fill: '#333', fontSize: 15, fontWeight: 600 }, z2: 10 });
      children.push({ type: 'text', x: lineEndX + 8, y: midY + 6, style: { text: data[i].value.toLocaleString() + ' 家', fill: mainColors[i], fontSize: 14, fontWeight: 500 }, z2: 10 });
    }
    return {
      graphic: [{
        type: 'group',
        left: '38%',
        top: 0,
        children,
      }],
    };
  };

  // 产业机构分布柱状图 — 3D 立体感（与人才总览对齐）
  const industryBarColors = ['#2A8AF6', '#F5C244', '#3CC8B4', '#2A8AF6', '#F5C244', '#3CC8B4', '#2A8AF6', '#F5C244'];
  const industryBarDarkColors = ['#1E6FD4', '#C9A030', '#2BA89A', '#1E6FD4', '#C9A030', '#2BA89A', '#1E6FD4', '#C9A030'];
  const industryBarLightColors = ['#5AA8F8', '#F8D86A', '#6EDED0', '#5AA8F8', '#F8D86A', '#6EDED0', '#5AA8F8', '#F8D86A'];
  const getProvinceBarOption = () => ({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}家' },
    xAxis: { type: 'category', data: currentOverview.provinceEnterprise.map(d => d.name), axisLabel: { fontSize: 13, color: '#666' } },
    yAxis: { type: 'value', name: '企业数', nameTextStyle: { fontSize: 14 }, axisLabel: { fontSize: 13, color: '#999' }, splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
    series: [{
      type: 'custom',
      data: currentOverview.provinceEnterprise.map((d, i) => [i, d.value]),
      renderItem: (params: { dataIndex: number }, api: { value: (dim: number) => number; coord: (val: [number, number]) => number[]; size: (val: [number, number]) => number[] }) => {
        const idx = params.dataIndex;
        const val = api.value(1);
        const start = api.coord([api.value(0), 0]);
        const end = api.coord([api.value(0), val]);
        const barW = api.size([1, 0])[0] * 0.5;
        const x = start[0] - barW / 2;
        const y = end[1];
        const w = barW;
        const h = start[1] - end[1];
        const dp = 7;
        const ci = idx % industryBarColors.length;
        return {
          type: 'group',
          children: [
            { type: 'polygon', shape: { points: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] }, style: { fill: industryBarColors[ci] } },
            { type: 'polygon', shape: { points: [[x, y], [x + w, y], [x + w + dp, y - dp], [x + dp, y - dp]] }, style: { fill: industryBarLightColors[ci] } },
            { type: 'polygon', shape: { points: [[x + w, y], [x + w + dp, y - dp], [x + w + dp, y + h - dp], [x + w, y + h]] }, style: { fill: industryBarDarkColors[ci] } },
            { type: 'text', x: x + w / 2 - 10, y: y - dp - 16, style: { text: String(val), fill: '#666', fontSize: 12 } },
          ],
        };
      },
    }],
    grid: { left: 60, right: 30, bottom: 30, top: 30 },
  });

  const getTalentPieOption = () => {
    const talentColors = currentOverview.talentType.map(d => d.itemStyle.color);
    const darkTalentColors = talentColors.map(c => {
      const r = Math.max(0, parseInt(c.slice(1, 3), 16) - 50);
      const g = Math.max(0, parseInt(c.slice(3, 5), 16) - 50);
      const b = Math.max(0, parseInt(c.slice(5, 7), 16) - 50);
      return `rgb(${r},${g},${b})`;
    });
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: 0, textStyle: { fontSize: 14 } },
      series: [
        // 底层阴影环（模拟厚度）
        {
          type: 'pie', radius: ['35%', '65%'], center: ['50%', '48%'],
          data: currentOverview.talentType.map((d, i) => ({
            ...d,
            itemStyle: { color: darkTalentColors[i] },
          })),
          label: { show: false },
          tooltip: { show: false },
          silent: true,
          animation: false,
        },
        // 上层主环
        {
          type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
          data: currentOverview.talentType.map((d, i) => ({
            ...d,
            itemStyle: {
              color: talentColors[i],
              shadowBlur: 10,
              shadowOffsetY: 4,
              shadowColor: 'rgba(0,0,0,0.15)',
            },
          })),
          label: { formatter: '{b}\n{c}人', fontSize: 14 },
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        },
      ],
    };
  };

  const provinceFullName: Record<string, string> = {
    '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
    '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省',
    '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省', '福建': '福建省', '江西': '江西省',
    '山东': '山东省', '河南': '河南省', '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省',
    '海南': '海南省', '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '陕西': '陕西省',
    '甘肃': '甘肃省', '青海': '青海省', '台湾': '台湾省',
    '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '西藏': '西藏自治区',
    '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
    '香港': '香港特别行政区', '澳门': '澳门特别行政区',
  };
  const getChinaMapOption = () => {
    const mappedData = currentOverview.provinceTalent.map(d => ({
      name: provinceFullName[d.name] || d.name,
      value: d.value,
    }));
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name?: string; value?: number; data?: { value?: number } }) => {
          const val = p.data?.value ?? p.value ?? 0;
          return `${p.name || ''}: ${val}人`;
        },
      },
      visualMap: { min: 0, max: Math.max(...mappedData.map(d => d.value), 100), left: 'left', top: 'bottom', text: ['高', '低'], calculable: true, inRange: { color: ['#e0f3ff', '#2468F2'] } },
      geo: {
        map: 'chinaFiltered',
        roam: true,
        zoom: 1.6,
        center: [105, 35],
        itemStyle: { areaColor: '#e8f4fc', borderColor: '#91c7e8', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#2468F2' }, label: { show: true, color: '#333', fontSize: 14 } },
        label: { show: false },
      },
      series: [{
        name: '人才分布',
        type: 'map',
        geoIndex: 0,
        data: mappedData,
      }],
    };
  };

  const getTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['专利', '标准', '项目', '成果'], textStyle: { fontSize: 14 } },
    xAxis: { type: 'category', data: ['2021', '2022', '2023', '2024', '2025'], axisLabel: { fontSize: 13 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 13 } },
    series: [
      { name: '专利', type: 'line', smooth: true, data: [820, 932, 901, 1234, 1456] },
      { name: '标准', type: 'line', smooth: true, data: [23, 34, 45, 56, 78] },
      { name: '项目', type: 'line', smooth: true, data: [56, 78, 89, 112, 145] },
      { name: '成果', type: 'line', smooth: true, data: [34, 45, 67, 89, 123] },
    ],
  });

  const getNetworkOption = () => ({
    tooltip: {},
    series: [{
      type: 'graph', layout: 'force', roam: true,
      label: { show: true, fontSize: 13 },
      force: { repulsion: 300, edgeLength: 100 },
      data: [
        { name: '人福医药', symbolSize: 60, category: 0, itemStyle: { color: '#2468F2' } },
        { name: '安琪酵母', symbolSize: 55, category: 0, itemStyle: { color: '#2468F2' } },
        { name: '三峡大学', symbolSize: 45, category: 1, itemStyle: { color: '#52c41a' } },
        { name: '三峡实验室', symbolSize: 50, category: 1, itemStyle: { color: '#52c41a' } },
        { name: '宜化集团', symbolSize: 50, category: 0, itemStyle: { color: '#2468F2' } },
        { name: '兴发集团', symbolSize: 48, category: 0, itemStyle: { color: '#2468F2' } },
        { name: '湖北中医药大学', symbolSize: 35, category: 1, itemStyle: { color: '#52c41a' } },
        { name: '中科院武汉分院', symbolSize: 40, category: 1, itemStyle: { color: '#52c41a' } },
      ],
      links: [
        { source: '人福医药', target: '三峡大学' }, { source: '人福医药', target: '三峡实验室' },
        { source: '安琪酵母', target: '三峡大学' }, { source: '安琪酵母', target: '湖北中医药大学' },
        { source: '宜化集团', target: '三峡实验室' }, { source: '宜化集团', target: '兴发集团' },
        { source: '兴发集团', target: '中科院武汉分院' }, { source: '三峡大学', target: '三峡实验室' },
      ],
      categories: [{ name: '企业' }, { name: '高校/科研机构' }],
    }],
    legend: { data: ['企业', '高校/科研机构'], bottom: 10, textStyle: { fontSize: 14 } },
  });

  // ==================== 创新资源图表 ====================

  // 创新资源中心地图（带立体阴影效果）
  const getInnovationMapOption = () => {
    const allProvinces = Object.keys(innovationDataByProvince);
    const mapData = allProvinces.map(p => ({
      name: p,
      value: innovationDataByProvince[p].innovationTalent,
    }));
    // 通过 geo.regions 对选中省份强制着色，不依赖 ECharts select 状态
    const regions = selectedProvince ? [{
      name: selectedProvince,
      itemStyle: { areaColor: '#2468F2', borderColor: '#ffffff', borderWidth: 2 },
      label: { show: true, color: '#333', fontSize: 12 },
    }] : [];
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 35, 80, 0.88)',
        borderColor: 'rgba(36, 104, 242, 0.4)',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 13 },
        padding: [6, 12],
        borderRadius: 6,
        formatter: (p: { name?: string; value?: number }) => `${p.name || ''}<br/>创新人才: ${(p.value || 0).toLocaleString()}`,
      },
      geo: {
        map: 'chinaFiltered',
        roam: true,
        zoom: 1.6,
        center: [105, 35],
        selectedMode: false,
        itemStyle: {
          areaColor: '#d4e8f7',
          borderColor: '#a8c8e8',
          borderWidth: 1,
          shadowColor: 'rgba(30, 80, 160, 0.35)',
          shadowOffsetX: 3,
          shadowOffsetY: 5,
          shadowBlur: 12,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#2468F2',
            shadowColor: 'rgba(36, 104, 242, 0.7)',
            shadowOffsetX: 4,
            shadowOffsetY: 8,
            shadowBlur: 20,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: { show: true, color: '#333', fontSize: 12 },
        },
        label: { show: false },
        regions,
      },
      series: [{
        name: '创新资源',
        type: 'map',
        geoIndex: 0,
        selectedMode: false,
        data: mapData,
      }],
    };
  };

  // 处理地图点击
  const handleInnovationMapClick = (params: { name?: string }) => {
    const provinceName = params.name;
    if (provinceName && innovationDataByProvince[provinceName]) {
      setSelectedProvince(provinceName === selectedProvince ? null : provinceName);
      setInnovationFlash(true);
      setTimeout(() => setInnovationFlash(false), 500);
    }
  };

  // 创新人才区域分布柱状图
  const getInnovationTalentBarOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['北京', '上海', '广东', '江苏', '浙江', '湖北', '山东', '四川'], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '万人', axisLabel: { fontSize: 12 } },
    series: [{ type: 'bar', data: [198, 165, 186, 162, 135, 112, 113, 99], itemStyle: { color: '#2468F2' } }],
    grid: { left: 50, right: 20, bottom: 30, top: 30 },
  });

  // 创新机构区域分布柱状图
  const getInnovationOrgBarOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['北京', '上海', '广东', '江苏', '浙江', '湖北', '山东', '四川'], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '家', axisLabel: { fontSize: 12 } },
    series: [{ type: 'bar', data: [18654, 15689, 16892, 14568, 12543, 10584, 9865, 8654], itemStyle: { color: '#52c41a' } }],
    grid: { left: 60, right: 20, bottom: 30, top: 30 },
  });

  // 创新趋势折线图
  const getInnovationTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['创新人才', '创新机构', '科研项目', '科技成果'], textStyle: { fontSize: 12 }, top: 0 },
    xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024', '2025'], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 12 } },
    series: [
      { name: '创新人才', type: 'line', smooth: true, data: [85, 92, 105, 118, 132, 152], itemStyle: { color: '#2468F2' } },
      { name: '创新机构', type: 'line', smooth: true, data: [7.2, 8.1, 9.2, 10.1, 11.5, 12.8], itemStyle: { color: '#52c41a' } },
      { name: '科研项目', type: 'line', smooth: true, data: [5.6, 6.2, 7.1, 7.8, 8.9, 10.2], itemStyle: { color: '#faad14' } },
      { name: '科技成果', type: 'line', smooth: true, data: [4.2, 4.8, 5.5, 6.1, 7.2, 8.5], itemStyle: { color: '#722ed1' } },
    ],
    grid: { left: 50, right: 20, bottom: 30, top: 50 },
  });

  // 技术热点分布热力图
  const getTechHotspotOption = () => ({
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: ['生物医药', '新材料', '新能源', '智能制造', '大数据', '绿色化工'], axisLabel: { fontSize: 11 }, splitArea: { show: true } },
    yAxis: { type: 'category', data: ['基础研究', '应用研究', '技术开发', '产业化', '市场推广'], axisLabel: { fontSize: 11 }, splitArea: { show: true } },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'vertical', left: 0, top: 'center', inRange: { color: ['#e0f3ff', '#91c7e8', '#2468F2', '#1a3e7a'] } },
    series: [{
      name: '热度',
      type: 'heatmap',
      data: [
        [0, 0, 85], [0, 1, 92], [0, 2, 78], [0, 3, 65], [0, 4, 45],
        [1, 0, 72], [1, 1, 88], [1, 2, 95], [1, 3, 82], [1, 4, 58],
        [2, 0, 68], [2, 1, 82], [2, 2, 90], [2, 3, 88], [2, 4, 72],
        [3, 0, 55], [3, 1, 75], [3, 2, 85], [3, 3, 78], [3, 4, 62],
        [4, 0, 62], [4, 1, 78], [4, 2, 82], [4, 3, 70], [4, 4, 55],
        [5, 0, 75], [5, 1, 85], [5, 2, 80], [5, 3, 72], [5, 4, 48],
      ],
      label: { show: true, fontSize: 10 },
    }],
    grid: { left: 120, right: 20, bottom: 30, top: 10 },
  });

  // 当前选中省份的数据
  const currentProvinceData = selectedProvince ? innovationDataByProvince[selectedProvince] : null;

  // 毛玻璃卡片样式
  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  };

  // ==================== Tab 内容 ====================

  const tabItems = [
    {
      key: 'graph',
      label: '产业图谱',
      children: (
        <div>
          <Row gutter={16}>
            <Col xs={24} lg={18}>
              <Card bodyStyle={{ padding: 8, position: 'relative' }} style={{ ...glassCardStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 8px 0' }}>
                  <Cascader
                    options={[
                      { value: 'ai', label: '人工智能' },
                      { value: 'newenergy', label: '新能源新材料' },
                      { value: 'yeast', label: '酵母发酵与功能成分制造' },
                      { value: 'pharma', label: '先进制剂与高端仿制药' },
                      { value: 'ship', label: '内河绿色智能船舶制造' },
                      { value: 'wetchem', label: '湿电子化学品' },
                    ]}
                    defaultValue={['ai']}
                    changeOnSelect
                    placeholder="请选择产业链"
                    style={{ width: 240 }}
                    onChange={(v) => onCascaderChange(v as (string | number)[])}
                  />
                  <Space size={16}>
                    <Space size={4}><span style={{ display: 'inline-block', width: 12, height: 12, border: `2px solid ${statusColorMap.strong}`, background: '#fff' }} /><Text style={{ fontSize: 13 }}>强链</Text></Space>
                    <Space size={4}><span style={{ display: 'inline-block', width: 12, height: 12, border: `2px solid ${statusColorMap.weak}`, background: '#fff' }} /><Text style={{ fontSize: 13 }}>弱链</Text></Space>
                    <Space size={4}><span style={{ display: 'inline-block', width: 12, height: 12, border: `2px dashed ${statusColorMap.missing}`, background: '#fff' }} /><Text style={{ fontSize: 13 }}>缺链</Text></Space>
                  </Space>
                </div>
                <div style={{ display: 'flex', alignItems: 'stretch', height: 620 }}>
                  {(['upstream', 'midstream', 'downstream'] as StreamKey[]).map((sk, idx) => {
                    const isFocused = focusedTree === sk;
                    const anyFocused = focusedTree !== null;
                    const flex = anyFocused ? (isFocused ? '66%' : '15%') : '33.33%';
                    const headers = sectionHeaderMap[selectedChainKey] || ['上游', '中游', '下游'];

                    return (
                      <React.Fragment key={sk}>
                        {idx > 0 && (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, flexShrink: 0,
                            color: '#bfc8d6', fontSize: 22, userSelect: 'none',
                          }}>›</div>
                        )}
                        <div style={{
                          flexBasis: flex, flexShrink: 0, flexGrow: 0,
                          transition: 'flex-basis 0.4s cubic-bezier(0.4,0,0.2,1)',
                          position: 'relative', minWidth: 0,
                        }}>
                          {/* 列标题 */}
                          <div style={{
                            textAlign: 'center', padding: '6px 0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}>
                            <span style={{ width: 24, height: 1, background: '#d0d5dd', display: 'inline-block' }} />
                            <Text strong style={{ fontSize: 15 }}>{headers[idx]}</Text>
                            <span style={{ width: 24, height: 1, background: '#d0d5dd', display: 'inline-block' }} />
                            {isFocused && (
                              <Button type="text" size="small" onClick={() => setFocusedTree(null)}
                                style={{ color: '#999', padding: '0 4px' }}>收起</Button>
                            )}
                          </div>
                          {/* 图表 */}
                          <div style={{ overflow: 'hidden' }}>
                            <ReactECharts
                              ref={(r) => { treeRefs.current[sk] = r; }}
                              key={`${selectedChainKey}-${sk}-${focusedTree === sk}`}
                              option={getSingleTreeOption(sk)}
                              style={{ height: 580 }}
                              onEvents={{ click: handleTreeNodeClick(sk) }}
                              notMerge
                            />
                          </div>
                          {/* 弹窗 */}
                          {popoverNode && popoverStream === sk && (
                            <div style={{
                              position: 'absolute', left: Math.min(popoverPos.x + 10, 500), top: Math.min(popoverPos.y - 20, 420),
                              background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16,
                              boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, width: 280,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong style={{ fontSize: 17 }}>{popoverNode.name}</Text>
                                <Tag color={statusColorMap[popoverNode.status]}>{statusLabelMap[popoverNode.status]}</Tag>
                              </div>
                              <div style={{ lineHeight: 2.2 }}>
                                <div>企业 <Text strong>{popoverNode.enterprises}</Text> 家 &nbsp;|&nbsp; 人才 <Text strong>{popoverNode.talents}</Text> 人</div>
                                <div>本地企业 <Text strong>{popoverNode.localEnterprises}</Text> 家 &nbsp;|&nbsp; 本地人才 <Text strong>{popoverNode.localTalents}</Text> 人</div>
                              </div>
                              <Space style={{ marginTop: 12 }} wrap>
                                <Button type="link" onClick={() => { setPopoverNode(null); setActiveTab('enterprises'); }}>相关企业（找企业）</Button>
                                <Button type="link" onClick={() => { setPopoverNode(null); navigate('/talent'); }}>相关人才（找人才）</Button>
                              </Space>
                              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                <Button type="primary" size="small" icon={<PlusOutlined />}
                                  onClick={() => { message.success(`已将"${popoverNode.name}"相关企业加入清单`); setPopoverNode(null); }}>加入清单</Button>
                                <Button type="text" size="small" onClick={() => setPopoverNode(null)} style={{ color: '#999' }}>关闭</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
              <Card title={<><ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: 6 }} />预警系数</>} size="small" style={{ marginBottom: 12, ...glassCardStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 28 }}>72.5</Text>
                  <Tag color="orange" icon={<ArrowDownOutlined />}>-3.2%</Tag>
                </div>
                <Progress percent={72.5} strokeColor={{ '0%': '#faad14', '100%': '#ff4d4f' }} showInfo={false} />
                <Text type="secondary">较上月下降3.2%，需关注弱链环节</Text>
              </Card>
              <Card title={<><HomeOutlined style={{ color: '#52c41a', marginRight: 6 }} />本地化率</>} size="small" style={{ marginBottom: 12, ...glassCardStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 28, color: '#2468F2' }}>46.8%</Text>
                  <Tag color="green">+2.1%</Tag>
                </div>
                <Progress percent={46.8} strokeColor="#2468F2" showInfo={false} />
                <Text type="secondary">本地企业占比，较上月提升2.1%</Text>
              </Card>
              <Card title={<><BookOutlined style={{ color: '#2468F2', marginRight: 6 }} />图例说明</>} size="small" style={{ flex: 1, ...glassCardStyle }}>
                <Space direction="vertical" size={8}>
                  <Space><Badge color={statusColorMap.strong} /><Text>强链 — 产业基础好</Text></Space>
                  <Space><Badge color={statusColorMap.weak} /><Text>弱链 — 需加强</Text></Space>
                  <Space><Badge color={statusColorMap.missing} /><Text>缺链 — 需引进补链</Text></Space>
                </Space>
              </Card>
            </Col>
          </Row>
          {/* 链上企业、链上人才、闭环动作 */}
          <Row gutter={16} style={{ marginTop: 16 }} align="stretch">
            <Col xs={24} md={8} style={{ display: 'flex' }}>
              <Card
                size="small"
                title={<Text strong style={{ color: '#2468F2', fontSize: 16 }}>链上企业</Text>}
                extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.success('已批量加入清单')}>批量加入清单</Button>}
                bodyStyle={{ padding: 0 }}
                style={{ flex: 1, ...glassCardStyle }}
              >
                <Table
                  dataSource={enterpriseList.slice(0, 5)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  showHeader={true}
                  columns={[
                    { title: '企业', dataIndex: 'name', key: 'name', ellipsis: true,
                      render: (text: string) => <Text style={{ color: '#333' }}>{text}</Text>
                    },
                    { title: '创新', dataIndex: 'id', key: 'score', width: 60, align: 'center' as const,
                      render: (_: string, __: typeof enterpriseList[0], index: number) => {
                        const scores = [92, 88, 75, 82, 85];
                        return <Tag color="blue">{scores[index]}</Tag>;
                      }
                    },
                  ]}
                />
                <div style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                  <a onClick={() => setActiveTab('enterprises')} style={{ color: '#2468F2' }}>查看全部企业 <RightOutlined /></a>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex' }}>
              <Card
                size="small"
                title={<Text strong style={{ color: '#2468F2', fontSize: 16 }}>链上人才</Text>}
                extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.success('已批量加入清单')}>批量加入清单</Button>}
                bodyStyle={{ padding: 0 }}
                style={{ flex: 1, ...glassCardStyle }}
              >
                <Table
                  dataSource={coreTalents.slice(0, 5)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  showHeader={true}
                  columns={[
                    { title: '人才', dataIndex: 'name', key: 'name', width: 80,
                      render: (text: string) => <Text style={{ color: '#333' }}>{text}</Text>
                    },
                    { title: '职称', dataIndex: 'title', key: 'title', width: 100,
                      render: (text: string) => <Tag color="purple">{text}</Tag>
                    },
                    { title: '领域', dataIndex: 'field', key: 'field', ellipsis: true },
                  ]}
                />
                <div style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                  <a onClick={() => navigate('/talent')} style={{ color: '#2468F2' }}>查看全部人才 <RightOutlined /></a>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex' }}>
              <Card title={<><SafetyCertificateOutlined style={{ color: '#722ed1', marginRight: 6 }} />闭环动作</>} size="small" bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column' }} style={{ flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }}>
                <Row gutter={[8, 8]} style={{ flex: 1 }}>
                  {[
                    { title: '候选清单', icon: <PlusOutlined />, image: '/images/banner-bg3.png' },
                    { title: '产业报告', icon: <FileTextOutlined />, image: '/images/banner-bg4.png' },
                  ].map((item, idx) => (
                    <Col span={12} key={idx} style={{ display: 'flex' }}>
                      <div onClick={() => {
                        if (item.title === '候选清单') { navigate('/list'); }
                        else { navigate('/reports'); }
                      }} style={{
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 14,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.42)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        minHeight: 132,
                        maxHeight: 200,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(238,246,255,0.78) 60%, rgba(231,242,255,0.86) 100%)',
                        padding: 10,
                        transition: 'all 0.25s ease',
                      }}>
                        <Text style={{ position: 'relative', zIndex: 1, color: '#2E3B55', fontSize: 16, fontWeight: 600, lineHeight: 1.2, padding: '0 2px', marginBottom: 5 }}>
                          {item.title}
                        </Text>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'radial-gradient(95% 72% at 12% 10%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0) 60%), linear-gradient(145deg, rgba(118,162,238,0.12) 0%, rgba(118,162,238,0) 56%)',
                          opacity: 0.42,
                          pointerEvents: 'none',
                        }} />
                        <div style={{
                          position: 'relative',
                          zIndex: 1,
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 4px 6px',
                        }}>
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: '86%',
                              height: '86%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 8px rgba(62,113,201,0.16))',
                            }}
                          />
                        </div>
                        <div style={{
                          position: 'absolute',
                          right: 10,
                          bottom: 7,
                          zIndex: 1,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#5A86D6',
                          lineHeight: 1,
                          background: 'rgba(216,232,255,0.96)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.78), 0 1px 2px rgba(90,134,214,0.12)',
                        }}>
                          <PlusOutlined style={{ fontSize: 13, fontWeight: 700 }} />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'overview',
      label: '产业总览',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {[
              { title: '产业链条数', value: currentOverview.chainCount, color: '#2468F2', icon: <BankOutlined /> },
              { title: '强链', value: currentOverview.strong, color: statusColorMap.strong, icon: <CheckCircleOutlined /> },
              { title: '弱链', value: currentOverview.weak, color: statusColorMap.weak, icon: <ExclamationCircleOutlined /> },
              { title: '缺链', value: currentOverview.missing, color: statusColorMap.missing, icon: <CloseCircleOutlined /> },
              { title: '企业总数', value: currentOverview.enterprises, color: '#2468F2', suffix: '家', icon: <BankOutlined /> },
              { title: '人才总数', value: currentOverview.talents, color: '#722ed1', suffix: '人', icon: <TeamOutlined /> },
            ].map((item, idx) => (
              <Col xs={12} sm={8} md={4} key={idx}>
                <Card size="small" bodyStyle={{ textAlign: 'center', padding: '16px 8px' }} style={{ ...glassCardStyle }}>
                  <Statistic title={item.title} value={item.value} suffix={item.suffix} valueStyle={{ color: item.color }} prefix={item.icon} />
                </Card>
              </Col>
            ))}
          </Row>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={<><BankOutlined style={{ color: '#2468F2', marginRight: 6 }} />产业机构类型</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts key={selectedChainKey + '-pyramid'} option={getPyramidOption()} style={{ height: 320 }} notMerge />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<><EnvironmentOutlined style={{ color: '#13c2c2', marginRight: 6 }} />产业机构分布</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts key={selectedChainKey + '-bar'} option={getProvinceBarOption()} style={{ height: 320 }} notMerge />
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={<><TeamOutlined style={{ color: '#722ed1', marginRight: 6 }} />产业人才类型</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts key={selectedChainKey + '-pie'} option={getTalentPieOption()} style={{ height: 360 }} notMerge />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<><EnvironmentOutlined style={{ color: '#eb2f96', marginRight: 6 }} />产业人才区域分布</>} size="small" style={{ ...glassCardStyle }}>
                {chinaMapRegistered ? (
                  <ReactECharts ref={mapChartRef} key={selectedChainKey + '-map'} option={getChinaMapOption()} style={{ height: 360 }} notMerge />
                ) : (
                  <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text type="secondary">地图加载中...</Text></div>
                )}
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title={<><NodeIndexOutlined style={{ marginRight: 6 }} />创新要素趋势</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getTrendOption()} style={{ height: 360 }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<><ApartmentOutlined style={{ marginRight: 6 }} />合作网络</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getNetworkOption()} style={{ height: 360 }} />
                <div style={{ textAlign: 'center', marginTop: 4 }}><Text type="secondary">产业链主体合作关系网络图（基于专利合作、项目合作数据）</Text></div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'innovation',
      label: '创新资源',
      children: (
        <div>
          {/* 创新资源弧形环绕布局 */}
          <div style={{
            borderRadius: 16, padding: '16px 0 8px', marginBottom: 16, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(160deg, #e8f1ff 0%, #f0f7ff 30%, #ddeeff 60%, #e4f0ff 100%)',
            border: '1px solid rgba(36,104,242,0.08)',
          }}>
            {/* 选中省份标签 */}
            {selectedProvince && (
              <div style={{ position: 'absolute', top: 12, left: 20, zIndex: 5 }}>
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 12px' }}>当前：{selectedProvince}</Tag>
              </div>
            )}

            <div className="innovation-arc-layout" style={{ display: 'flex', alignItems: 'center', minHeight: 420 }}>
              {/* 左侧 5 项 — 弧形偏移形成 ) 曲线 */}
              <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0', alignItems: 'flex-end' }}>
                {innovationLeftItems.map((item, idx) => (
                  <InnovationCard
                    key={item.key}
                    label={item.label}
                    value={currentProvinceData ? (currentProvinceData as Record<string, number>)[item.key] : 0}
                    unit={item.unit}
                    side="left"
                    arcOffset={innovationArcOffsets[idx]}
                    active={!!currentProvinceData}
                    flash={innovationFlash}
                    onClick={() => currentProvinceData && (item.route === 'enterprises' ? setActiveTab('enterprises') : navigate(item.route))}
                  />
                ))}
              </div>

              {/* 中间地图 */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ filter: 'drop-shadow(0 6px 16px rgba(30,80,160,0.18))' }}>
                  {chinaMapRegistered ? (
                    <ReactECharts
                      ref={innovationMapRef}
                      option={getInnovationMapOption()}
                      style={{ height: 440 }}
                      onEvents={{ click: handleInnovationMapClick }}
                      notMerge
                    />
                  ) : (
                    <div style={{ height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">地图加载中...</Text>
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧 5 项 — 弧形偏移形成 ( 曲线 */}
              <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0', alignItems: 'flex-start' }}>
                {innovationRightItems.map((item, idx) => (
                  <InnovationCard
                    key={item.key}
                    label={item.label}
                    value={currentProvinceData ? (currentProvinceData as Record<string, number>)[item.key] : 0}
                    unit={item.unit}
                    side="right"
                    arcOffset={innovationArcOffsets[idx]}
                    active={!!currentProvinceData}
                    flash={innovationFlash}
                    onClick={() => currentProvinceData && navigate(item.route)}
                  />
                ))}
              </div>
            </div>

            {/* 底部说明 */}
            <div style={{
              textAlign: 'center', fontSize: 12, color: 'rgba(78,89,105,0.6)', padding: '4px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <span>点击省份查看数据</span>
              <span style={{ color: 'rgba(36,104,242,0.3)' }}>|</span>
              <span>点击指标跳转页面</span>
            </div>
          </div>

          {/* 下方图表 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={<><TeamOutlined style={{ marginRight: 6 }} />创新人才区域分布</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getInnovationTalentBarOption()} style={{ height: 260 }} notMerge />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<><BankOutlined style={{ marginRight: 6 }} />创新机构区域分布</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getInnovationOrgBarOption()} style={{ height: 260 }} notMerge />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title={<><FireOutlined style={{ marginRight: 6, color: '#fa541c' }} />技术热点分布热力图</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getTechHotspotOption()} style={{ height: 420 }} notMerge />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<><NodeIndexOutlined style={{ marginRight: 6 }} />创新趋势</>} size="small" style={{ ...glassCardStyle }}>
                <ReactECharts option={getInnovationTrendOption()} style={{ height: 420 }} notMerge />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'enterprises',
      label: '企业列表',
      children: (
        <div>
          {/* 企业列表表格 */}
          <Card size="small" style={{ marginBottom: 16, ...glassCardStyle }}>
            <Table
              dataSource={enterpriseList}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              onRow={(record) => ({
                onClick: () => { setSelectedEnterpriseDetail(record); setEnterpriseDetailVisible(true); },
                style: { cursor: 'pointer' },
              })}
              columns={[
                { title: '企业名', dataIndex: 'name', key: 'name', width: 200,
                  render: (text: string) => <a style={{ color: '#2468F2', fontWeight: 500 }}>{text}</a>
                },
                { title: '法人', dataIndex: 'legalPerson', key: 'legalPerson', width: 100 },
                { title: '经营状态', dataIndex: 'status', key: 'status', width: 90,
                  render: (status: string) => <Tag color={status === '存续' ? 'green' : 'orange'}>{status}</Tag>
                },
                { title: '所属行业', dataIndex: 'industry', key: 'industry', width: 120 },
                { title: '区域', dataIndex: 'region', key: 'region', width: 180 },
                { title: '产业链', dataIndex: 'industryChain', key: 'industryChain', width: 100,
                  render: (text: string) => <Tag color="blue">{text}</Tag>
                },
                { title: '企业类型', dataIndex: 'type', key: 'type', width: 120,
                  render: (text: string) => <Tag color="purple">{text}</Tag>
                },
                { title: '操作', key: 'action', width: 100,
                  render: (_: unknown, record: typeof enterpriseList[0]) => (
                    <Button type="primary" size="small" icon={<PlusOutlined />}
                      onClick={(e) => { e.stopPropagation(); message.success(`已将「${record.name}」加入招商候选清单`); }}>
                      加入清单
                    </Button>
                  ),
                },
              ]}
            />
          </Card>

          {/* 下方聚合数据 */}
          <Row gutter={16}>
            {/* 最新动态 */}
            <Col xs={24} md={8}>
              <Card title={<><BellOutlined style={{ marginRight: 6, color: '#2468F2' }} />最新动态 <Tag color="blue">{enterpriseNews.length}</Tag></>} size="small" style={{ height: 420, ...glassCardStyle }} bodyStyle={{ padding: 12, overflow: 'auto', maxHeight: 360 }}>
                <Timeline
                  items={enterpriseNews.map(item => ({
                    color: item.type === '科研动态' ? 'blue' : item.type === '政策动态' ? 'green' : 'gray',
                    children: (
                      <div style={{ marginBottom: 8 }}>
                        <a style={{ fontSize: 13, color: '#333' }}>{item.title}</a>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>{item.source} · {item.date}</Text></div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>

            {/* 关键技术词云 */}
            <Col xs={24} md={8}>
              <Card title={<><BulbOutlined style={{ marginRight: 6, color: '#52c41a' }} />关键技术</>} size="small" style={{ height: 420, ...glassCardStyle }} bodyStyle={{ padding: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {keyTechnologies.map((tech, idx) => (
                    <Tag key={idx} color={['blue', 'cyan', 'geekblue', 'purple'][idx % 4]}
                      style={{ fontSize: Math.max(12, Math.min(18, tech.value / 6)), padding: '4px 10px', margin: 2 }}>
                      {tech.name}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>

            {/* 核心人才 */}
            <Col xs={24} md={8}>
              <Card title={<><TeamOutlined style={{ marginRight: 6, color: '#722ed1' }} />核心人才</>} size="small" style={{ height: 420, ...glassCardStyle }} bodyStyle={{ padding: 0, overflow: 'auto', maxHeight: 360 }}>
                <List
                  dataSource={coreTalents}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 16px' }}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2468F2' }} />}
                        title={<Text strong>{item.name}</Text>}
                        description={<Text type="secondary" style={{ fontSize: 12 }}>{item.institution}</Text>}
                      />
                      <Tag color="blue">{item.title}</Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }} align="stretch">
            {/* 专利布局 */}
            <Col xs={24} md={12} style={{ display: 'flex' }}>
              <Card title={<><BookOutlined style={{ marginRight: 6, color: '#fa8c16' }} />专利布局</>} size="small" style={{ flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }} bodyStyle={{ flex: 1, padding: 12 }}>
                <ReactECharts
                    option={{
                      tooltip: { trigger: 'item', formatter: '{b}: {c}件' },
                      series: [{
                        type: 'treemap',
                        data: patentLayout.map((p, idx) => ({
                          name: p.name,
                          value: p.value,
                          itemStyle: { color: p.color },
                          label: { color: idx >= 4 ? '#1D2129' : '#fff' },
                        })),
                        label: { show: true, fontSize: 14 },
                        breadcrumb: { show: false },
                      }],
                    }}
                  style={{ height: '100%', minHeight: 340 }}
                  notMerge
                />
              </Card>
            </Col>

            {/* 竞合机构 */}
            <Col xs={24} md={12} style={{ display: 'flex' }}>
              <Card title={<><ApartmentOutlined style={{ marginRight: 6, color: '#13c2c2' }} />竞合机构</>} size="small" bodyStyle={{ padding: 0 }} style={{ flex: 1, ...glassCardStyle }}>
                <List
                  dataSource={cooperativeOrgs}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 16px' }}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BankOutlined />} style={{ backgroundColor: item.type === '高校' ? '#52c41a' : item.type === '科研院所' ? '#722ed1' : '#2468F2' }} />}
                        title={<Text strong style={{ fontSize: 13 }}>{item.name}</Text>}
                        description={<Text type="secondary" style={{ fontSize: 11 }}>{item.type}</Text>}
                      />
                      <Tag color="blue">合作 {item.cooperation} 次</Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  // 毛玻璃卡片样式
  return (
    <div className="industry-page">
      <Card bodyStyle={{ padding: '24px 24px 16px' }} style={{ marginBottom: 16, ...glassCardStyle }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2468F2', marginBottom: 24, fontSize: 32, fontWeight: 600 }}>找产业</h2>
          <div className="search-hero-wrapper" style={{ maxWidth: 560, margin: '0 auto' }}>
            <Input.Search
              placeholder="搜索产业链、产业环节、企业..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={v => { if (v.trim()) message.info(`正在搜索"${v}"...`); }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ marginRight: 8 }}>热门搜索：</Text>
            {hotTags.map(tag => (
              <Tag key={tag} style={{ cursor: 'pointer', marginBottom: 8, padding: '4px 14px'}} color="blue"
                onClick={() => { setSearchValue(tag); message.info(`正在搜索"${tag}"...`); }}><span style={{fontSize:'16px'}}><span style={{fontSize:'16px'}}>{tag}</span></span></Tag>
            ))}
          </div>
        </div>
      </Card>
      <Card bodyStyle={{ padding: '0 16px 16px' }} style={{ ...glassCardStyle }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
      <Drawer title={selectedEnterprise?.name} width={480} open={drawerVisible} onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { message.success(`已将 ${selectedEnterprise?.name} 加入招商候选清单`); setDrawerVisible(false); }}>加入清单</Button>
            <Button icon={<FileTextOutlined />} onClick={() => { message.loading('正在生成企业尽调报告...', 2); setTimeout(() => message.success('企业尽调报告生成完成'), 2000); }}>生成报告</Button>
          </Space>
        }>
        {selectedEnterprise && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="所属产业">{selectedEnterprise.industry}</Descriptions.Item>
              <Descriptions.Item label="企业规模">{selectedEnterprise.scale}</Descriptions.Item>
              <Descriptions.Item label="所在区域">{selectedEnterprise.area}</Descriptions.Item>
              <Descriptions.Item label="员工人数">{selectedEnterprise.employees}人</Descriptions.Item>
              <Descriptions.Item label="年营收">{selectedEnterprise.revenue}</Descriptions.Item>
              <Descriptions.Item label="专利数量">{selectedEnterprise.patents}件</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="创新能力评估" style={{ marginTop: 16 }}>
              <Progress percent={selectedEnterprise.innovationScore} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
              <Paragraph type="secondary" style={{ marginTop: 8 }}>基于专利数量、研发投入、成果转化等指标综合评估</Paragraph>
            </Card>
            <Card size="small" title="关联信息" style={{ marginTop: 16 }}>
              <Space wrap>
                <Tag icon={<TeamOutlined />}>核心人才 12人</Tag>
                <Tag icon={<FileTextOutlined />}>相关政策 5项</Tag>
                <Tag icon={<BankOutlined />}>上下游企业 23家</Tag>
              </Space>
            </Card>
          </>
        )}
      </Drawer>

      {/* 企业详情抽屉 */}
      <Drawer
        title={selectedEnterpriseDetail?.name}
        width={720}
        open={enterpriseDetailVisible}
        onClose={() => setEnterpriseDetailVisible(false)}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { message.success(`已将「${selectedEnterpriseDetail?.name}」加入招商候选清单`); }}>加入清单</Button>
            <Button icon={<FileTextOutlined />} onClick={() => { message.loading('正在生成企业尽调报告...', 2); setTimeout(() => message.success('报告生成完成'), 2000); }}>生成报告</Button>
          </Space>
        }
      >
        {selectedEnterpriseDetail && (
          <>
            {/* 企业简介 */}
            <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <Avatar size={64} icon={<BankOutlined />} style={{ backgroundColor: '#2468F2', flexShrink: 0 }} />
                <div>
                  <Text strong style={{ fontSize: 16 }}>{selectedEnterpriseDetail.name}</Text>
                  <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}>
                    {selectedEnterpriseDetail.introduction}
                  </Paragraph>
                </div>
              </div>
            </Card>

            {/* 详情标签页 */}
            <Tabs activeKey={enterpriseDetailTab} onChange={setEnterpriseDetailTab} items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <div>
                    <Card title="机构简介" size="small" style={{ marginBottom: 16 }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label={<><MailOutlined /> email</>}>info@{selectedEnterpriseDetail.name.slice(0, 4)}.com</Descriptions.Item>
                        <Descriptions.Item label={<><LinkOutlined /> 官网</>}><a>http://www.{selectedEnterpriseDetail.name.slice(0, 4)}.com</a></Descriptions.Item>
                        <Descriptions.Item label={<><EnvironmentOutlined /> 地址</>} span={2}>{selectedEnterpriseDetail.address}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                    <Card title="工商信息" size="small">
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="法定代表人">{selectedEnterpriseDetail.legalPerson}</Descriptions.Item>
                        <Descriptions.Item label="经营状态"><Tag color="green">{selectedEnterpriseDetail.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="成立日期">{selectedEnterpriseDetail.foundDate}</Descriptions.Item>
                        <Descriptions.Item label="注册资本">{selectedEnterpriseDetail.registeredCapital}</Descriptions.Item>
                        <Descriptions.Item label="所属行业">{selectedEnterpriseDetail.industry}</Descriptions.Item>
                        <Descriptions.Item label="企业类型">{selectedEnterpriseDetail.type}</Descriptions.Item>
                        <Descriptions.Item label="所属产业链" span={2}><Tag color="blue">{selectedEnterpriseDetail.industryChain}</Tag></Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                ),
              },
              {
                key: 'monitor',
                label: '动态监测',
                children: (
                  <Card size="small">
                    <Timeline
                      items={[
                        { color: 'blue', children: <><Text>发布2025年度社会责任报告</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2026-01-10</Text></> },
                        { color: 'green', children: <><Text>获批国家级绿色工厂</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2025-12-28</Text></> },
                        { color: 'blue', children: <><Text>与三峡大学签署产学研合作协议</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2025-12-15</Text></> },
                        { color: 'orange', children: <><Text>完成新一轮技术改造项目</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2025-11-20</Text></> },
                        { color: 'blue', children: <><Text>参加第五届进博会</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2025-11-05</Text></> },
                      ]}
                    />
                  </Card>
                ),
              },
              {
                key: 'tech',
                label: '科技创新',
                children: (
                  <div>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={8}><Card size="small"><Statistic title="专利总数" value={189} suffix="件" valueStyle={{ color: '#2468F2' }} /></Card></Col>
                      <Col span={8}><Card size="small"><Statistic title="软著数量" value={56} suffix="件" valueStyle={{ color: '#52c41a' }} /></Card></Col>
                      <Col span={8}><Card size="small"><Statistic title="研发投入" value={3.2} suffix="亿" valueStyle={{ color: '#722ed1' }} /></Card></Col>
                    </Row>
                    <Card title="核心技术" size="small">
                      <Space wrap>
                        {['精细磷化工工艺', '绿色合成技术', '废水循环利用', '智能化生产系统', '节能降碳技术'].map(t => (
                          <Tag key={t} color="blue">{t}</Tag>
                        ))}
                      </Space>
                    </Card>
                  </div>
                ),
              },
              {
                key: 'partners',
                label: '竞合机构',
                children: (
                  <List
                    dataSource={cooperativeOrgs.slice(0, 4)}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<BankOutlined />} style={{ backgroundColor: '#2468F2' }} />}
                          title={item.name}
                          description={<><Tag>{item.type}</Tag> 合作项目 {item.cooperation} 个</>}
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: 'talents',
                label: '技术骨干',
                children: (
                  <List
                    dataSource={coreTalents.slice(0, 4)}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                          title={<>{item.name} <Tag color="blue">{item.title}</Tag></>}
                          description={<>{item.institution} · {item.field}</>}
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
            ]} />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Industry;
