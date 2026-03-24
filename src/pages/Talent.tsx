/**
 * @input antd 组件, ReactECharts, echarts, { useNavigate } from 'react-router-dom', { talents } from '../mock/data'
 * @output { Talent } 人才页组件
 * @position 业务页面，科技风力导向图谱（BFS 四级分层）+ 3D 金字塔/柱状图 + 人才列表 + 中国地图 + 合作机构
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Tabs, Tag, Table, Button, Space, Select, Input, Drawer, Descriptions, Avatar, Statistic, Typography, List, Badge, Rate, Divider, Timeline, App, Cascader, Modal } from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserOutlined,
  TrophyOutlined,
  BookOutlined,
  LinkOutlined,
  GlobalOutlined,
  BankOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  SearchOutlined,
  MailOutlined,
  FireOutlined,
  ApartmentOutlined,
  CloseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import { talents } from '../mock/data';

const { Title, Text } = Typography;

const Talent: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('graph');
  const [talentDetailVisible, setTalentDetailVisible] = useState(false);
  const [selectedTalentDetail, setSelectedTalentDetail] = useState<typeof talentListData[0] | null>(null);
  const [talentDetailTab, setTalentDetailTab] = useState('basic');
  const [chinaMapRegistered, setChinaMapRegistered] = useState(false);
  const mapChartRef = useRef<ReactECharts>(null);

  // 人才图谱状态
  const [graphSearchValue, setGraphSearchValue] = useState('');
  const [graphSearchedTalent, setGraphSearchedTalent] = useState<string | null>(null);
  const [graphPopoverVisible, setGraphPopoverVisible] = useState(false);
  const [graphPopoverData, setGraphPopoverData] = useState<{ name: string; field: string; institution: string; title: string; hIndex: number } | null>(null);
  const [graphPopoverPos, setGraphPopoverPos] = useState({ x: 0, y: 0 });
  const graphChartRef = useRef<ReactECharts>(null);

  // 注册中国地图
  useEffect(() => {
    fetch('/china-map.json')
      .then(res => res.json())
      .then(json => {
        json.features = (json.features || []).filter((f: { properties?: { name?: string; adchar?: string }; id?: string }) => {
          const n = f.properties?.name || '';
          // 过滤南海诸岛和十段线/九段线
          if (n.includes('南海') || n.includes('段线') || n.includes('九段') || n.includes('十段')) return false;
          if (f.id && String(f.id).startsWith('100000_JD')) return false;
          return true;
        });
        echarts.registerMap('chinaFiltered', json);
        setChinaMapRegistered(true);
      })
      .catch(() => console.warn('Failed to load china map data'));
  }, []);

  // 筛选状态
  const [filterIndustry, setFilterIndustry] = useState<(string | number)[]>(['all']);
  const [filterOrgType, setFilterOrgType] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [filterTalentType, setFilterTalentType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<(string | number)[]>([]);
  const [filterWorkLocation, setFilterWorkLocation] = useState<string>('all');

  // 搜索状态
  const [searchValue, setSearchValue] = useState('');
  const hotTags = ['院士', '生物医药', '新材料', '人工智能', '博士后', '高级工程师', '领军人才', '宜昌籍'];

  // 人才列表数据（扩展）
  const talentListData = [
    { id: 'tl1', name: '王建国', gender: '男', institution: '中国科学院', orgType: '科研院所', field: '生物医药', industryChain: '生命健康', hIndex: 68, tags: ['宜昌籍', '领军人才'], region: '西陵区', introduction: '中国科学院院士，长期从事生物医药研究，在基因治疗领域取得突破性成果。' },
    { id: 'tl2', name: '李明华', gender: '男', institution: '武汉大学', orgType: '高校', field: '新材料', industryChain: '新能源新材料', hIndex: 45, tags: ['创新人才'], region: '伍家岗区', introduction: '武汉大学教授，专注于高性能纤维材料研发，主持多项国家重点项目。' },
    { id: 'tl3', name: '张晓峰', gender: '男', institution: '华中科技大学', orgType: '高校', field: '智能制造', industryChain: '汽车及装备制造', hIndex: 38, tags: ['宜昌籍', '创新人才'], region: '夷陵区', introduction: '华中科技大学研究员，在智能传感器和工业物联网领域具有深厚积累。' },
    { id: 'tl4', name: '刘芳', gender: '女', institution: '三峡大学', orgType: '高校', field: '绿色化工', industryChain: '绿色化工', hIndex: 28, tags: ['创新人才'], region: '点军区', introduction: '三峡大学教授，从事绿色催化和生物基材料研究，发表论文98篇。' },
    { id: 'tl5', name: '陈伟', gender: '男', institution: '三峡集团', orgType: '企业', field: '清洁能源', industryChain: '新能源新材料', hIndex: 22, tags: ['技能人才'], region: '猇亭区', introduction: '三峡集团高级工程师，参与多个大型水电站建设，在清洁能源领域经验丰富。' },
    { id: 'tl6', name: '赵丽娜', gender: '女', institution: '三峡大学', orgType: '高校', field: '生物医药', industryChain: '生命健康', hIndex: 18, tags: ['宜昌籍', '创新人才'], region: '西陵区', introduction: '三峡大学副教授，研究方向为药物递送系统，在纳米医学领域有创新成果。' },
    { id: 'tl7', name: '周建华', gender: '男', institution: '中国工程院', orgType: '科研院所', field: '生物制药', industryChain: '生命健康', hIndex: 75, tags: ['宜昌籍', '领军人才'], region: '伍家岗区', introduction: '中国工程院院士，疫苗研发领域权威专家，曾获国家科技进步一等奖。' },
    { id: 'tl8', name: '孙明辉', gender: '男', institution: '兴发集团', orgType: '企业', field: '精细化工', industryChain: '绿色化工', hIndex: 15, tags: ['技能人才'], region: '猇亭区', introduction: '兴发集团技术总监，在磷化工领域拥有20年经验，主导多项技术改造。' },
    { id: 'tl9', name: '吴婷婷', gender: '女', institution: '安琪酵母', orgType: '企业', field: '生物发酵', industryChain: '生命健康', hIndex: 20, tags: ['创新人才'], region: '伍家岗区', introduction: '安琪酵母研发中心主任，在酵母发酵技术领域取得多项专利。' },
    { id: 'tl10', name: '郑强', gender: '男', institution: '中船重工710所', orgType: '科研院所', field: '船舶动力', industryChain: '汽车及装备制造', hIndex: 32, tags: ['宜昌籍', '创新人才'], region: '西陵区', introduction: '中船重工710所研究员，在舰船电力推进系统领域具有核心技术优势。' },
  ];

  // 合作机构数据
  const cooperativeOrgsData = [
    { id: 'co1', name: '中国地质大学（武汉）', type: '高校', cooperation: 28 },
    { id: 'co2', name: '武汉大学', type: '高校', cooperation: 23 },
    { id: 'co3', name: '华中科技大学', type: '高校', cooperation: 19 },
    { id: 'co4', name: '中科院武汉分院', type: '科研院所', cooperation: 17 },
    { id: 'co5', name: '三峡实验室', type: '科研院所', cooperation: 15 },
  ];

  // 合作人才数据
  const cooperativeTalentsData = [
    { id: 'ct1', name: '李国璋', title: '教授级高工', institution: '兴发集团', field: '精细化工' },
    { id: 'ct2', name: '张志刚', title: '研究员', institution: '三峡实验室', field: '新材料' },
    { id: 'ct3', name: '陈明辉', title: '高级工程师', institution: '宜化集团', field: '化工工程' },
    { id: 'ct4', name: '刘伟', title: '教授', institution: '武汉纺织大学', field: '纺织材料' },
  ];

  // 人才图谱数据 - 节点和连接
  const graphTalentNodes = [
    // 中心人才（蓝色）
    { id: 'gt1', name: '王建国', field: '生物医药', institution: '中国科学院', title: '院士', hIndex: 68, category: 0 },
    // 一级关联人才（红色 - 紧密合作）
    { id: 'gt2', name: '周建华', field: '生物制药', institution: '中国工程院', title: '院士', hIndex: 75, category: 1 },
    { id: 'gt3', name: '赵丽娜', field: '生物医药', institution: '三峡大学', title: '副教授', hIndex: 18, category: 1 },
    { id: 'gt4', name: '吴婷婷', field: '生物发酵', institution: '安琪酵母', title: '研发主任', hIndex: 20, category: 1 },
    { id: 'gt5', name: '陈志明', field: '药物化学', institution: '武汉大学', title: '教授', hIndex: 52, category: 1 },
    // 二级关联人才（橙色 - 间接合作）
    { id: 'gt6', name: '李明华', field: '新材料', institution: '武汉大学', title: '教授', hIndex: 45, category: 2 },
    { id: 'gt7', name: '张晓峰', field: '智能制造', institution: '华中科技大学', title: '研究员', hIndex: 38, category: 2 },
    { id: 'gt8', name: '刘芳', field: '绿色化工', institution: '三峡大学', title: '教授', hIndex: 28, category: 2 },
    { id: 'gt9', name: '陈伟', field: '清洁能源', institution: '三峡集团', title: '高级工程师', hIndex: 22, category: 2 },
    { id: 'gt10', name: '孙明辉', field: '精细化工', institution: '兴发集团', title: '技术总监', hIndex: 15, category: 2 },
    { id: 'gt11', name: '郑强', field: '船舶动力', institution: '中船重工710所', title: '研究员', hIndex: 32, category: 2 },
    // 三级关联人才（浅蓝色 - 领域相关）
    { id: 'gt12', name: '黄伟杰', field: '基因治疗', institution: '北京大学', title: '教授', hIndex: 58, category: 3 },
    { id: 'gt13', name: '林小红', field: '蛋白质工程', institution: '清华大学', title: '研究员', hIndex: 48, category: 3 },
    { id: 'gt14', name: '何志强', field: '细胞生物学', institution: '复旦大学', title: '教授', hIndex: 42, category: 3 },
    { id: 'gt15', name: '马丽萍', field: '免疫学', institution: '上海交大', title: '教授', hIndex: 55, category: 3 },
    { id: 'gt16', name: '钱学文', field: '生物信息', institution: '浙江大学', title: '副教授', hIndex: 35, category: 3 },
    { id: 'gt17', name: '孔德明', field: '药理学', institution: '中山大学', title: '教授', hIndex: 40, category: 3 },
    { id: 'gt18', name: '曹雪梅', field: '分子生物', institution: '南京大学', title: '研究员', hIndex: 38, category: 3 },
    { id: 'gt19', name: '徐国栋', field: '生物化工', institution: '天津大学', title: '教授', hIndex: 44, category: 3 },
    { id: 'gt20', name: '杨明珠', field: '制药工程', institution: '四川大学', title: '副教授', hIndex: 28, category: 3 },
    { id: 'gt21', name: '吕建华', field: '生物技术', institution: '华东理工', title: '教授', hIndex: 36, category: 3 },
    { id: 'gt22', name: '范晓东', field: '药物递送', institution: '同济大学', title: '研究员', hIndex: 32, category: 3 },
    { id: 'gt23', name: '沈志伟', field: '纳米医学', institution: '厦门大学', title: '教授', hIndex: 46, category: 3 },
    { id: 'gt24', name: '程雅琴', field: '抗体工程', institution: '中科院上海', title: '研究员', hIndex: 50, category: 3 },
    { id: 'gt25', name: '韩晓明', field: '疫苗研发', institution: '军事医学院', title: '教授', hIndex: 62, category: 3 },
    { id: 'gt26', name: '贾云飞', field: '临床药学', institution: '协和医学院', title: '主任医师', hIndex: 38, category: 3 },
  ];

  const graphTalentLinks = [
    // 中心人才的一级连接
    { source: 'gt1', target: 'gt2' }, { source: 'gt1', target: 'gt3' }, { source: 'gt1', target: 'gt4' }, { source: 'gt1', target: 'gt5' },
    // 一级人才的二级连接
    { source: 'gt2', target: 'gt6' }, { source: 'gt2', target: 'gt7' }, { source: 'gt3', target: 'gt8' }, { source: 'gt4', target: 'gt9' },
    { source: 'gt5', target: 'gt10' }, { source: 'gt5', target: 'gt11' },
    // 二级人才的三级连接
    { source: 'gt6', target: 'gt12' }, { source: 'gt6', target: 'gt13' }, { source: 'gt7', target: 'gt14' }, { source: 'gt7', target: 'gt15' },
    { source: 'gt8', target: 'gt16' }, { source: 'gt8', target: 'gt17' }, { source: 'gt9', target: 'gt18' }, { source: 'gt9', target: 'gt19' },
    { source: 'gt10', target: 'gt20' }, { source: 'gt10', target: 'gt21' }, { source: 'gt11', target: 'gt22' }, { source: 'gt11', target: 'gt23' },
    // 一级人才之间的连接
    { source: 'gt2', target: 'gt5' }, { source: 'gt3', target: 'gt4' },
    // 三级人才的额外连接
    { source: 'gt12', target: 'gt24' }, { source: 'gt13', target: 'gt25' }, { source: 'gt14', target: 'gt26' },
    { source: 'gt1', target: 'gt24' }, { source: 'gt1', target: 'gt25' },
  ];

  const talentRelationColors = {
    search: '#4facfe',
    close: '#3b82f6',
    indirect: '#1d4ed8',
    related: 'rgba(30, 58, 138, 0.6)',
    line: 'rgba(100, 130, 200, 0.25)',
    lineEmphasis: 'rgba(147, 210, 255, 0.95)',
  };

  const talentRelationCategoryColorMap: Record<number, string> = {
    0: talentRelationColors.search,
    1: talentRelationColors.close,
    2: talentRelationColors.indirect,
    3: talentRelationColors.related,
  };

  const getTalentRelationCategoryColor = (category?: number) => talentRelationCategoryColorMap[category ?? 3] || talentRelationColors.related;

  // 人才图谱配置
  const getTalentGraphOption = () => {
    const centerTalent = graphSearchedTalent || '王建国';
    const categories = [
      { name: '搜索人才', itemStyle: { color: '#4facfe' } },
      { name: '紧密合作', itemStyle: { color: '#3b82f6' } },
      { name: '间接合作', itemStyle: { color: '#1d4ed8' } },
      { name: '领域相关', itemStyle: { color: 'rgba(30, 58, 138, 0.6)' } },
    ];

    // BFS 从搜索人才出发，动态计算每个节点的层级
    const centerNode = graphTalentNodes.find(n => n.name === centerTalent);
    const centerId = centerNode?.id || 'gt1';
    const adj: Record<string, string[]> = {};
    graphTalentNodes.forEach(n => { adj[n.id] = []; });
    graphTalentLinks.forEach(l => { adj[l.source]?.push(l.target); adj[l.target]?.push(l.source); });
    const dist: Record<string, number> = {};
    const queue = [centerId];
    dist[centerId] = 0;
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const nb of (adj[cur] || [])) {
        if (dist[nb] === undefined) {
          dist[nb] = dist[cur] + 1;
          queue.push(nb);
        }
      }
    }
    // 距离 → 类别：0=搜索人才, 1=紧密合作, 2=间接合作, 3+=领域相关
    const nodeIdCategoryMap: Record<string, number> = {};
    graphTalentNodes.forEach(n => {
      const d = dist[n.id];
      nodeIdCategoryMap[n.id] = d === 0 ? 0 : d === 1 ? 1 : d === 2 ? 2 : 3;
    });

    const links = graphTalentLinks.map(link => {
      const srcCat = nodeIdCategoryMap[link.source] ?? 3;
      const tgtCat = nodeIdCategoryMap[link.target] ?? 3;
      const minCat = Math.min(srcCat, tgtCat);
      const lineWidth = minCat === 0 ? 2.5 : minCat === 1 ? 1.5 : 1;
      const lineColor = minCat === 0 ? 'rgba(79, 172, 254, 0.7)' : minCat === 1 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(100, 130, 200, 0.25)';
      return { ...link, lineStyle: { width: lineWidth, color: lineColor } };
    });

    const getNodeStyle = (node: typeof graphTalentNodes[0]) => {
      const cat = nodeIdCategoryMap[node.id] ?? 3;
      if (cat === 0) return {
        symbolSize: 70,
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: '#4facfe' }, { offset: 1, color: '#1a56db' },
          ]),
          shadowBlur: 30, shadowColor: 'rgba(79, 172, 254, 0.8)',
          borderColor: '#7dd3fc', borderWidth: 3,
        },
        label: { show: true, fontSize: 14, color: '#fff', fontWeight: 'bold' as const, textShadowColor: 'rgba(79, 172, 254, 0.9)', textShadowBlur: 8 },
      };
      if (cat === 1) return {
        symbolSize: 46,
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1e40af' },
          ]),
          shadowBlur: 20, shadowColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#60a5fa', borderWidth: 2,
        },
        label: { show: true, fontSize: 12, color: '#bfdbfe', fontWeight: 500 as const },
      };
      if (cat === 2) return {
        symbolSize: 34,
        itemStyle: {
          color: 'rgba(29, 78, 216, 0.85)',
          shadowBlur: 12, shadowColor: 'rgba(29, 78, 216, 0.5)',
          borderColor: 'rgba(147, 197, 253, 0.6)', borderWidth: 1.5,
        },
        label: { show: true, fontSize: 11, color: '#93c5fd', fontWeight: 500 as const },
      };
      return {
        symbolSize: 24,
        itemStyle: {
          color: 'rgba(30, 58, 138, 0.6)',
          shadowBlur: 6, shadowColor: 'rgba(30, 58, 138, 0.4)',
          borderColor: 'rgba(147, 197, 253, 0.35)', borderWidth: 1,
        },
        label: { show: true, fontSize: 10, color: 'rgba(148, 163, 184, 0.8)', fontWeight: 500 as const },
      };
    };

    const nodes = graphTalentNodes.map(node => {
      const style = getNodeStyle(node);
      const isCenter = nodeIdCategoryMap[node.id] === 0;
      return {
        id: node.id,
        name: node.name,
        symbolSize: style.symbolSize,
        category: nodeIdCategoryMap[node.id] ?? 3,
        itemStyle: style.itemStyle,
        label: style.label,
        value: node.hIndex,
        field: node.field,
        institution: node.institution,
        title: node.title,
        hIndex: node.hIndex,
        ...(isCenter ? { x: 450, y: 330, fixed: true } : {}),
      };
    });
    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 500,
      tooltip: { show: false },
      legend: { show: false },
      series: [{
        type: 'graph',
        layout: 'force',
        data: nodes,
        links,
        categories,
        roam: true,
        draggable: true,
        edgeSymbol: ['none', 'none'],
        force: { repulsion: 800, gravity: 0.08, edgeLength: [80, 200], friction: 0.6, layoutAnimation: true },
        label: { show: true, position: 'inside', fontSize: 12, color: '#fff', fontWeight: 500 },
        lineStyle: { curveness: 0.15, opacity: 0.8 },
        emphasis: {
          focus: 'adjacency',
          blurScope: 'global',
          itemStyle: {
            shadowBlur: 50, shadowColor: 'rgba(79, 172, 254, 1)',
            borderColor: '#ffffff', borderWidth: 3,
          },
          lineStyle: { width: 4, color: 'rgba(147, 210, 255, 0.95)', shadowBlur: 8, shadowColor: 'rgba(147, 210, 255, 0.8)' },
          label: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
        },
        blur: {
          itemStyle: { opacity: 0.1 },
          lineStyle: { opacity: 0.05 },
        },
      }],
    };
  };

  // 图谱节点点击处理
  const handleGraphClick = (params: { dataType?: string; data?: { name?: string; field?: string; institution?: string; title?: string; hIndex?: number }; event?: { offsetX?: number; offsetY?: number } }) => {
    if (params.dataType === 'node' && params.data) {
      const { name, field, institution, title, hIndex } = params.data;
      if (name) {
        setGraphPopoverData({ name, field: field || '', institution: institution || '', title: title || '', hIndex: hIndex || 0 });
        setGraphPopoverPos({ x: params.event?.offsetX || 300, y: params.event?.offsetY || 200 });
        setGraphPopoverVisible(true);
      }
    }
  };

  // 图谱搜索处理
  const handleGraphSearch = (value: string) => {
    if (value.trim()) {
      const found = graphTalentNodes.find(n => n.name.includes(value));
      if (found) {
        setGraphSearchedTalent(found.name);
        message.success(`已定位到人才「${found.name}」`);
      } else {
        message.warning(`未找到人才「${value}」`);
      }
    }
  };

  // 选中人才的合作人才（右侧面板用）
  const getGraphRelatedTalents = () => {
    const centerName = graphSearchedTalent || '王建国';
    const centerNode = graphTalentNodes.find(n => n.name === centerName);
    if (!centerNode) return [];
    const relatedIds = graphTalentLinks
      .filter(l => l.source === centerNode.id || l.target === centerNode.id)
      .map(l => l.source === centerNode.id ? l.target : l.source);
    return graphTalentNodes.filter(n => relatedIds.includes(n.id)).slice(0, 6);
  };

  // 研究方向分布图配置（横向柱状图）
  const getFieldDistributionOption = () => {
    const fieldData = [
      { name: '其他', value: 8 },
      { name: '生物技术', value: 10 },
      { name: '人工智能', value: 12 },
      { name: '清洁能源', value: 15 },
      { name: '绿色化工', value: 18 },
      { name: '智能制造', value: 22 },
      { name: '新材料', value: 28 },
      { name: '生物医药', value: 35 },
    ];
    const colors = ['#8c8c8c', '#faad14', '#13c2c2', '#eb2f96', '#fa8c16', '#722ed1', '#52c41a', '#2468F2'];
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}人' },
      xAxis: { type: 'value', axisLabel: { fontSize: 13 } },
      yAxis: { type: 'category', data: fieldData.map(d => d.name), axisLabel: { fontSize: 13 } },
      series: [{
        name: '研究方向',
        type: 'bar',
        data: fieldData.map((d, i) => ({ value: d.value, itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] } })),
        barWidth: 16,
        label: { show: true, position: 'right', fontSize: 12, color: '#666' },
      }],
      grid: { left: 80, right: 40, bottom: 20, top: 10 },
    };
  };

  // 研究方向趋势图配置
  const getFieldTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['论文发表', '专利申请', '项目合作'], top: 0, textStyle: { fontSize: 16 } },
    xAxis: { type: 'category', data: ['2021', '2022', '2023', '2024', '2025'], axisLabel: { fontSize: 16 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 16 } },
    series: [
      { name: '论文发表', type: 'line', smooth: true, data: [12, 18, 25, 32, 28], itemStyle: { color: '#2468F2' } },
      { name: '专利申请', type: 'line', smooth: true, data: [5, 8, 12, 15, 18], itemStyle: { color: '#52c41a' } },
      { name: '项目合作', type: 'line', smooth: true, data: [3, 5, 8, 12, 15], itemStyle: { color: '#fa8c16' } },
    ],
    grid: { left: 40, right: 20, bottom: 30, top: 40 },
  });

  // 人才分类数据（金字塔）- 领军人才、创新人才、技能人才
  const talentTypeData = [
    { name: '领军人才', value: 698 },
    { name: '创新人才', value: 38730 },
    { name: '技能人才', value: 523386 },
  ];

  // 人才区域分布数据
  const talentProvinceData = [
    { name: '江苏', value: 58200 }, { name: '北京', value: 52800 }, { name: '广东', value: 48500 },
    { name: '山东', value: 42300 }, { name: '上海', value: 38600 }, { name: '浙江', value: 35400 },
    { name: '湖北', value: 32100 }, { name: '辽宁', value: 28500 }, { name: '河南', value: 25800 },
    { name: '四川', value: 22400 },
  ];

  // 人才分类金字塔图（带尖角，居中）
  const getPyramidOption = () => {
    const data = talentTypeData;
    const mainColors = ['#F5943A', '#3CC8B4', '#2A8AF6'];
    const darkColors = ['#D47A2A', '#2BA89A', '#1E6FD4'];
    const lightColors = ['#F8B06A', '#6EDED0', '#5AA8F8'];
    const n = data.length;
    const topY = 25, bottomY = 270;
    const cx = 0; // 相对于 group 的中心
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
      children.push({ type: 'text', x: lineEndX + 8, y: midY + 6, style: { text: data[i].value.toLocaleString() + ' 人', fill: mainColors[i], fontSize: 14, fontWeight: 500 }, z2: 10 });
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

  // 人才区域分布柱状图 — 3D 立体感
  const barColors = ['#2A8AF6', '#F5C244', '#3CC8B4', '#2A8AF6', '#F5C244', '#3CC8B4', '#2A8AF6', '#F5C244', '#3CC8B4', '#2A8AF6'];
  const barDarkColors = ['#1E6FD4', '#C9A030', '#2BA89A', '#1E6FD4', '#C9A030', '#2BA89A', '#1E6FD4', '#C9A030', '#2BA89A', '#1E6FD4'];
  const barLightColors = ['#5AA8F8', '#F8D86A', '#6EDED0', '#5AA8F8', '#F8D86A', '#6EDED0', '#5AA8F8', '#F8D86A', '#6EDED0', '#5AA8F8'];
  const getProvinceBarOption = () => ({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}人' },
    xAxis: { type: 'category', data: talentProvinceData.map(d => d.name), axisLabel: { fontSize: 13, color: '#666' } },
    yAxis: { type: 'value', name: '人数', axisLabel: { fontSize: 13, color: '#999' }, splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
    series: [{
      type: 'custom',
      data: talentProvinceData.map((d, i) => [i, d.value]),
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
        const depth = 7;
        const ci = idx % barColors.length;
        return {
          type: 'group',
          children: [
            // 正面
            { type: 'polygon', shape: { points: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] }, style: { fill: barColors[ci] } },
            // 顶面高光
            { type: 'polygon', shape: { points: [[x, y], [x + w, y], [x + w + depth, y - depth], [x + depth, y - depth]] }, style: { fill: barLightColors[ci] } },
            // 右侧面阴影
            { type: 'polygon', shape: { points: [[x + w, y], [x + w + depth, y - depth], [x + w + depth, y + h - depth], [x + w, y + h]] }, style: { fill: barDarkColors[ci] } },
            // 数值标签
            { type: 'text', x: x + w / 2 - 10, y: y - depth - 16, style: { text: (val / 10000).toFixed(1) + '万', fill: '#666', fontSize: 12 } },
          ],
        };
      },
    }],
    grid: { left: 60, right: 30, bottom: 30, top: 40 },
  });

  // 省份全称映射
  const provinceFullName: Record<string, string> = {
    '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
    '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省',
    '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省', '福建': '福建省', '江西': '江西省',
    '山东': '山东省', '河南': '河南省', '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省',
    '海南': '海南省', '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '陕西': '陕西省',
    '甘肃': '甘肃省', '青海': '青海省', '台湾': '台湾省',
    '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '西藏': '西藏自治区',
    '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
  };

  // 人才区域分布（全国地图数据）
  const talentMapData = [
    { name: '湖北', value: 32100 }, { name: '北京', value: 52800 }, { name: '上海', value: 38600 },
    { name: '广东', value: 48500 }, { name: '江苏', value: 58200 }, { name: '浙江', value: 35400 },
    { name: '四川', value: 22400 }, { name: '山东', value: 42300 }, { name: '陕西', value: 18200 },
    { name: '安徽', value: 15800 }, { name: '湖南', value: 14500 }, { name: '河南', value: 25800 },
    { name: '辽宁', value: 28500 }, { name: '重庆', value: 12800 }, { name: '天津', value: 11500 },
    { name: '福建', value: 10800 }, { name: '吉林', value: 8500 }, { name: '黑龙江', value: 7800 },
    { name: '江西', value: 6500 }, { name: '河北', value: 9200 }, { name: '山西', value: 5800 },
    { name: '云南', value: 5200 }, { name: '广西', value: 4800 }, { name: '贵州', value: 4200 },
    { name: '甘肃', value: 3500 }, { name: '内蒙古', value: 3200 }, { name: '新疆', value: 2800 },
    { name: '海南', value: 2200 }, { name: '宁夏', value: 1800 }, { name: '青海', value: 1200 },
  ];

  // 中国地图配置
  const getChinaMapOption = () => {
    const mappedData = talentMapData.map(d => ({
      name: provinceFullName[d.name] || d.name,
      value: d.value,
    }));
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name?: string; value?: number; data?: { value?: number } }) => {
          const val = p.data?.value ?? p.value ?? 0;
          return `${p.name || ''}: ${val.toLocaleString()}人`;
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...mappedData.map(d => d.value), 100),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: { color: ['#e0f3ff', '#2468F2'] },
      },
      geo: {
        map: 'chinaFiltered',
        roam: true,
        zoom: 1.6,
        center: [105, 35],
        itemStyle: { areaColor: '#e8f4fc', borderColor: '#91c7e8', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#2468F2' }, label: { show: true, color: '#333', fontSize: 16 } },
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

  // 供需匹配数据
  const supplyDemandData = [
    { field: '生物医药研发', supply: 45, demand: 120, gap: 75, status: 'critical' },
    { field: 'AI/算法工程', supply: 28, demand: 85, gap: 57, status: 'critical' },
    { field: '新能源技术', supply: 56, demand: 90, gap: 34, status: 'warning' },
    { field: '智能制造', supply: 89, demand: 110, gap: 21, status: 'warning' },
    { field: '绿色化工', supply: 67, demand: 75, gap: 8, status: 'normal' },
  ];

  // 供需匹配 - 推荐人才弹窗
  const [recommendField, setRecommendField] = useState<string | null>(null);

  // 按方向关键词匹配推荐人才
  const getRecommendTalents = (field: string) => {
    const keywordMap: Record<string, string[]> = {
      '生物医药研发': ['生物医药', '生物制药', '生物发酵'],
      'AI/算法工程': ['人工智能', '智能制造'],
      '新能源技术': ['清洁能源', '新材料'],
      '智能制造': ['智能制造', '船舶动力'],
      '绿色化工': ['绿色化工', '精细化工'],
    };
    const keywords = keywordMap[field] || [field];
    return talentListData.filter(t => keywords.some(k => t.field.includes(k) || k.includes(t.field)));
  };

  // 毛玻璃卡片样式
  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div>
      {/* 找人才搜索框 */}
      <Card bodyStyle={{ padding: '24px 24px 16px' }} style={{ marginBottom: 16, ...glassCardStyle }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2468F2', marginBottom: 24, fontSize: 32, fontWeight: 600 }}>找人才</h2>
          <div className="search-hero-wrapper" style={{ maxWidth: 560, margin: '0 auto' }}>
            <Input.Search
              placeholder="搜索人才姓名、研究方向、所属机构..."
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
              <Tag key={tag} style={{ cursor: 'pointer', marginBottom: 8, padding: '4px 14px' }} color="blue"
                onClick={() => { setSearchValue(tag); message.info(`正在搜索"${tag}"...`); }}><span style={{fontSize:'16px'}}>{tag}</span></Tag>
            ))}
          </div>
        </div>
      </Card>

      <Row gutter={16}>
        {/* 主视图 */}
        <Col xs={24}>
          <Card bodyStyle={{ padding: 0, minHeight: 680 }} style={{ ...glassCardStyle }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ padding: '0 16px' }} tabBarExtraContent={
              <Space wrap size={[8, 8]}>
                <Cascader
                  options={[
                    { value: 'all', label: '全部产业链' },
                    { value: 'chemical', label: '绿色化工', children: [
                      { value: 'chem-phosphorus', label: '磷化工' }, { value: 'chem-fine', label: '精细化工' }, { value: 'chem-new-material', label: '化工新材料' }, { value: 'chem-bio', label: '生物化工', disabled: true },
                    ]},
                    { value: 'energy', label: '新能源新材料', children: [
                      { value: 'energy-solar', label: '光伏材料' }, { value: 'energy-battery', label: '锂电材料' }, { value: 'energy-hydrogen', label: '氢能', disabled: true }, { value: 'energy-composite', label: '先进复合材料' },
                    ]},
                    { value: 'bio', label: '生命健康', children: [
                      { value: 'bio-pharma', label: '化学制药' }, { value: 'bio-tcm', label: '中药制剂' }, { value: 'bio-device', label: '医疗器械' }, { value: 'bio-reagent', label: '生物试剂', disabled: true },
                    ]},
                    { value: 'auto', label: '汽车及装备制造', children: [
                      { value: 'auto-ev', label: '新能源汽车' }, { value: 'auto-parts', label: '汽车零部件' }, { value: 'auto-smart', label: '智能网联汽车', disabled: true },
                    ]},
                    { value: 'bigdata', label: '算力及大数据', children: [
                      { value: 'bd-center', label: '数据中心' }, { value: 'bd-ai', label: '人工智能' }, { value: 'bd-cloud', label: '云计算' }, { value: 'bd-blockchain', label: '区块链', disabled: true },
                    ]},
                    { value: 'culture', label: '文化旅游', children: [
                      { value: 'culture-scenic', label: '文旅景区' }, { value: 'culture-hotel', label: '酒店民宿' }, { value: 'culture-creative', label: '文创产品' }, { value: 'culture-show', label: '演艺娱乐', disabled: true }, { value: 'culture-service', label: '旅游服务', disabled: true },
                    ]},
                  ]}
                  value={filterIndustry as string[]}
                  onChange={(val) => setFilterIndustry(val || ['all'])}
                  changeOnSelect
                  expandTrigger="hover"
                  placeholder="产业链"
                  style={{ width: 180 }}
                />
                <Select
                  value={filterOrgType}
                  onChange={setFilterOrgType}
                  style={{ width: 120 }}
                  options={[
                    { value: 'all', label: '全部机构' },
                    { value: 'university', label: '高校' },
                    { value: 'research', label: '科研院所' },
                    { value: 'enterprise', label: '企业' },
                  ]}
                />
                <Select
                  value={filterOrigin}
                  onChange={setFilterOrigin}
                  style={{ width: 120 }}
                  options={[
                    { value: 'all', label: '全部籍贯' },
                    { value: 'yichang', label: '宜昌籍' },
                    { value: 'non-yichang', label: '非宜昌籍' },
                    { value: 'unknown', label: '未知' },
                  ]}
                />
                <Select
                  value={filterTalentType}
                  onChange={setFilterTalentType}
                  style={{ width: 120 }}
                  options={[
                    { value: 'all', label: '全部类型' },
                    { value: 'leading', label: '领军人才' },
                    { value: 'innovative', label: '创新人才' },
                    { value: 'skilled', label: '技能人才' },
                  ]}
                />
                <Cascader
                  options={[
                    { value: 'all', label: '全部区域' },
                    { value: 'urban', label: '城区', children: [
                      { value: 'xiling', label: '西陵区' },
                      { value: 'wujiagang', label: '伍家岗区' },
                      { value: 'dianjun', label: '点军区' },
                      { value: 'xiaoting', label: '猇亭区' },
                      { value: 'yiling', label: '夷陵区' },
                    ]},
                    { value: 'county-city', label: '县市', children: [
                      { value: 'dangyang', label: '当阳市' },
                      { value: 'zhijiang', label: '枝江市' },
                      { value: 'yidu', label: '宜都市' },
                    ]},
                    { value: 'county', label: '县', children: [
                      { value: 'yuanan', label: '远安县' },
                      { value: 'xingshan', label: '兴山县' },
                      { value: 'zigui', label: '秭归县' },
                      { value: 'changyang', label: '长阳土家族自治县' },
                      { value: 'wufeng', label: '五峰土家族自治县' },
                    ]},
                  ]}
                  value={filterRegion as string[]}
                  onChange={(val) => setFilterRegion(val || [])}
                  changeOnSelect
                  expandTrigger="hover"
                  placeholder="人才区域"
                  style={{ width: 140 }}
                />
                <Select
                  value={filterWorkLocation}
                  onChange={setFilterWorkLocation}
                  style={{ width: 130 }}
                  options={[
                    { value: 'all', label: '全部工作地' },
                    { value: 'yichang', label: '宜昌工作' },
                    { value: 'non-yichang', label: '非宜昌工作' },
                  ]}
                />
              </Space>
            }>
              {/* 人才图谱 */}
              <Tabs.TabPane tab={<><ApartmentOutlined /> 人才图谱</>} key="graph">
                <div style={{ padding: 16 }}>
                  {/* 图谱 + 当前人才/合作人才 */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    {/* 左侧图谱 */}
                    <Col xs={24} lg={16}>
                      <Card size="small" bodyStyle={{ padding: 8, position: 'relative' }} style={{ height: 700, background: 'radial-gradient(ellipse at center, #0d2137 0%, #050e1f 70%)', border: '1px solid rgba(100, 180, 255, 0.15)', borderRadius: 16 }}>
                        {/* 顶部：搜索框 + 图例标签（同一行） */}
                        <div style={{ position: 'absolute', top: 10, left: 12, right: 12, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'rgba(5, 14, 31, 0.8)', borderRadius: 20,
                            padding: '3px 3px 3px 14px',
                            border: '1px solid rgba(79, 172, 254, 0.3)',
                            width: 280,
                          }}>
                            <Input
                              placeholder="搜索人才姓名..."
                              value={graphSearchValue}
                              onChange={e => setGraphSearchValue(e.target.value)}
                              onPressEnter={() => handleGraphSearch(graphSearchValue)}
                              style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', fontSize: 13, color: '#bfdbfe' }}
                            />
                            <Button
                              type="primary"
                              shape="circle"
                              size="small"
                              icon={<SearchOutlined />}
                              onClick={() => handleGraphSearch(graphSearchValue)}
                              style={{ width: 28, height: 28, minWidth: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none' }}
                            />
                          </div>
                          <Space size={6}>
                            <Tag color="#4facfe" style={{ margin: 0 }}>搜索人才</Tag>
                            <Tag color="#3b82f6" style={{ margin: 0 }}>紧密合作</Tag>
                            <Tag color="#1d4ed8" style={{ margin: 0 }}>间接合作</Tag>
                            <Tag color="#1e3a8a" style={{ margin: 0 }}>领域相关</Tag>
                          </Space>
                        </div>
                        <ReactECharts
                          key={graphSearchedTalent || 'default'}
                          ref={graphChartRef}
                          option={getTalentGraphOption()}
                          style={{ height: 660 }}
                          onEvents={{ click: handleGraphClick }}
                          notMerge
                        />
                        {/* 节点弹窗 */}
                        {graphPopoverVisible && graphPopoverData && (
                          <div style={{
                            position: 'absolute',
                            left: Math.min(graphPopoverPos.x + 10, 450),
                            top: Math.min(graphPopoverPos.y - 20, 350),
                            background: 'rgba(8, 20, 45, 0.92)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(79, 172, 254, 0.35)',
                            borderRadius: 16,
                            padding: '20px 24px',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(79, 172, 254, 0.1), inset 0 1px 0 rgba(255,255,255,0.07)',
                            zIndex: 100,
                            minWidth: 280,
                            animation: 'fadeInScale 0.22s ease-out',
                          }}>
                            {/* 顶部：头像 + 姓名职称 + 关闭 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 0 }}>
                              <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, fontWeight: 700, color: '#fff',
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                                flexShrink: 0,
                              }}>
                                {graphPopoverData.name.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{graphPopoverData.name}</div>
                                <span style={{ fontSize: 12, color: '#60a5fa' }}>{graphPopoverData.title}</span>
                              </div>
                              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setGraphPopoverVisible(false)} style={{ color: 'rgba(148,163,184,0.7)' }} />
                            </div>
                            {/* 分割线 */}
                            <div style={{ borderTop: '1px solid rgba(79, 172, 254, 0.2)', margin: '12px 0' }} />
                            {/* 信息行 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', minWidth: 56 }}>职称</span>
                                <span style={{ fontSize: 13, color: '#ffffff' }}>{graphPopoverData.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', minWidth: 56 }}>单位</span>
                                <span style={{ fontSize: 13, color: '#93c5fd' }}>{graphPopoverData.institution}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', minWidth: 56 }}>研究方向</span>
                                <span style={{
                                  fontSize: 12, color: '#60a5fa', padding: '2px 10px', borderRadius: 12,
                                  background: 'rgba(79, 172, 254, 0.15)', border: '1px solid rgba(79, 172, 254, 0.4)',
                                }}>{graphPopoverData.field}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', minWidth: 56 }}>H指数</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>&#9733; {graphPopoverData.hIndex}</span>
                              </div>
                            </div>
                            {/* 底部按钮 */}
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button
                                onClick={() => { setGraphPopoverVisible(false); setActiveTab('talentlist'); message.info(`正在查看「${graphPopoverData.name}」详情...`); }}
                                style={{
                                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontSize: 13, fontWeight: 600,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                              ><EyeOutlined /> 查看详情</button>
                              <button
                                onClick={() => { message.success(`已将「${graphPopoverData.name}」加入引才清单`); setGraphPopoverVisible(false); }}
                                style={{
                                  flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                                  background: 'transparent', border: '1px solid rgba(79, 172, 254, 0.5)', color: '#60a5fa', fontSize: 13, fontWeight: 600,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                              ><PlusOutlined /> 加入清单</button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </Col>

                    {/* 右侧：当前人才 + 合作人才 */}
                    <Col xs={24} lg={8}>
                      <div style={{ height: 700, display: 'flex', flexDirection: 'column' }}>
                        {/* 当前人才信息 */}
                        <Card size="small" title={<><UserOutlined style={{ marginRight: 6 }} />当前人才</>} style={{ marginBottom: 16, flexShrink: 0, ...glassCardStyle }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#2468F2' }} />
                            <div>
                              <Text strong style={{ fontSize: 16 }}>{graphSearchedTalent || '王建国'}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 16 }}>
                                {graphTalentNodes.find(n => n.name === (graphSearchedTalent || '王建国'))?.institution}
                              </Text>
                            </div>
                          </div>
                          <Descriptions column={2} size="small">
                            <Descriptions.Item label="研究方向">
                              <Tag color="blue">{graphTalentNodes.find(n => n.name === (graphSearchedTalent || '王建国'))?.field}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="H指数">
                              <Tag color="gold">{graphTalentNodes.find(n => n.name === (graphSearchedTalent || '王建国'))?.hIndex}</Tag>
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>

                        {/* 合作人才 - 填充剩余空间，滚动浏览 */}
                        <Card size="small" title={<><TeamOutlined style={{ marginRight: 6 }} />合作人才</>} bodyStyle={{ padding: 0, overflowY: 'auto', flex: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }}>
                          <List
                            size="small"
                            dataSource={getGraphRelatedTalents()}
                            renderItem={(item) => (
                              <List.Item style={{ padding: '8px 16px' }}>
                                <List.Item.Meta
                                  avatar={<Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: getTalentRelationCategoryColor(item.category) }} />}
                                  title={<Text style={{ fontSize: 16 }}>{item.name}</Text>}
                                  description={<Text type="secondary" style={{ fontSize: 16 }}>{item.institution}</Text>}
                                />
                                <Tag color="blue" style={{ fontSize: 16 }}>{item.field}</Tag>
                              </List.Item>
                            )}
                          />
                        </Card>
                      </div>
                    </Col>
                  </Row>

                  {/* 研究方向分布 + 研究方向趋势 */}
                  <Row gutter={16} style={{ marginBottom: 16 }} align="stretch">
                    <Col xs={24} md={12} style={{ display: 'flex' }}>
                      <Card size="small" title={<span style={{ fontSize: 20, fontWeight: 700 }}><BookOutlined style={{ marginRight: 6, color: '#2468F2', fontSize: 18 }} />研究方向分布</span>} style={{ flex: 1, ...glassCardStyle }}>
                        <ReactECharts option={getFieldDistributionOption()} style={{ height: 200 }} notMerge />
                      </Card>
                    </Col>
                    <Col xs={24} md={12} style={{ display: 'flex' }}>
                      <Card size="small" title={<span style={{ fontSize: 20, fontWeight: 700 }}><FireOutlined style={{ marginRight: 6, color: '#fa541c', fontSize: 18 }} />研究方向趋势</span>} style={{ flex: 1, ...glassCardStyle }}>
                        <ReactECharts option={getFieldTrendOption()} style={{ height: 200 }} notMerge />
                      </Card>
                    </Col>
                  </Row>

                  {/* 高端人才榜 + 紧缺方向 + 闭环动作 */}
                  <Row gutter={16} align="stretch">
                    {/* 高端人才榜 */}
                    <Col xs={24} md={8} style={{ display: 'flex' }}>
                      <Card title={<><TrophyOutlined style={{ color: '#faad14' }} /> 高端人才榜</>} size="small" bodyStyle={{ padding: 12 }} style={{ flex: 1, ...glassCardStyle }}>
                        <List
                          dataSource={talents.slice(0, 4)}
                          renderItem={(item, index) => (
                            <List.Item style={{ padding: '10px 0' }}>
                              <Space>
                                <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : index === 2 ? '#faad14' : '#8c8c8c', fontSize: 13, fontWeight: 600 }} />
                                <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#2468F2' }} />
                                <div>
                                  <Text strong style={{ fontSize: 18 }}>{item.name}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 14 }}>{item.field}</Text>
                                </div>
                              </Space>
                              <Tag color={item.level === '顶尖' ? 'purple' : 'blue'} style={{ fontSize: 14, padding: '2px 10px' }}>{item.level}</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>

                    {/* 紧缺方向 */}
                    <Col xs={24} md={8} style={{ display: 'flex' }}>
                      <Card title={<><FireOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />紧缺方向Top</>} size="small" bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column', flex: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          {['生物医药研发', 'AI/算法工程', '新能源技术', '智能制造', '绿色化工'].map((item, index) => (
                            <div key={item} style={{ flex: 1, display: 'flex', alignItems: 'center', borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none', padding: '0 4px' }}>
                              <Tag color={index === 0 ? '#f5222d' : index === 1 ? '#fa541c' : index === 2 ? '#fa8c16' : index === 3 ? '#faad14' : '#2468F2'} style={{ fontSize: 14, fontWeight: 700, minWidth: 28, textAlign: 'center', padding: '2px 8px' }}>{index + 1}</Tag>
                              <Text style={{ fontSize: 18, fontWeight: 500, marginLeft: 8 }}>{item}</Text>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>

                    {/* 闭环动作 */}
                    <Col xs={24} md={8} style={{ display: 'flex' }}>
                      <Card title={<><LinkOutlined style={{ color: '#722ed1', marginRight: 6 }} />闭环动作</>} size="small" bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column', flex: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }}>
                        <Row gutter={[8, 8]} style={{ flex: 1 }}>
                          {[
                            { title: '人才清单列表', image: '/images/banner-bg3.png' },
                            { title: '人才相关报告', image: '/images/banner-bg4.png' },
                          ].map((item, idx) => (
                            <Col span={12} key={idx} style={{ display: 'flex' }}>
                              <div
                                onClick={() => {
                                  if (item.title === '人才清单列表') {
                                    navigate('/list');
                                  } else {
                                    navigate('/reports');
                                  }
                                }}
                                style={{
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
                                }}
                              >
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
              </Tabs.TabPane>

              {/* 人才总览 */}
              <Tabs.TabPane tab={<><GlobalOutlined /> 人才总览</>} key="overview">
                <div style={{ padding: 16 }}>
                  {/* 统计指标卡片 */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={12} md={8}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', padding: '20px 16px' }} style={{ ...glassCardStyle }}>
                        <Statistic title="人才总数" value={562814} suffix="人" valueStyle={{ color: '#2468F2', fontSize: 28 }} prefix={<TeamOutlined />} />
                      </Card>
                    </Col>
                    <Col xs={12} md={8}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', padding: '20px 16px' }} style={{ ...glassCardStyle }}>
                        <Statistic title="重点人才总数" value={39428} suffix="人" valueStyle={{ color: '#722ed1', fontSize: 28 }} prefix={<TrophyOutlined />} />
                      </Card>
                    </Col>
                    <Col xs={12} md={8}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', padding: '20px 16px' }} style={{ ...glassCardStyle }}>
                        <Statistic title="活跃人才总数" value={128560} suffix="人" valueStyle={{ color: '#52c41a', fontSize: 28 }} prefix={<FireOutlined />} />
                      </Card>
                    </Col>
                  </Row>

                  {/* 人才分类金字塔 + 人才区域分布柱状图 */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={12}>
                      <Card title={<><SolutionOutlined style={{ color: '#2468F2', marginRight: 6 }} />人才分类</>} size="small" style={{ ...glassCardStyle }}>
                        <ReactECharts option={getPyramidOption()} style={{ height: 320 }} notMerge />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title={<><EnvironmentOutlined style={{ color: '#13c2c2', marginRight: 6 }} />人才区域分布</>} size="small" style={{ ...glassCardStyle }}>
                        <ReactECharts option={getProvinceBarOption()} style={{ height: 320 }} notMerge />
                      </Card>
                    </Col>
                  </Row>

                  {/* 人才区域分布地图 */}
                  <Row gutter={16}>
                    <Col span={24}>
                      <Card title={<><EnvironmentOutlined style={{ color: '#13c2c2', marginRight: 6 }} />人才区域分布</>} size="small" style={{ ...glassCardStyle }}>
                        {chinaMapRegistered ? (
                          <ReactECharts ref={mapChartRef} option={getChinaMapOption()} style={{ height: 450 }} notMerge />
                        ) : (
                          <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text type="secondary">地图加载中...</Text>
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tabs.TabPane>

              {/* 供需匹配 */}
              <Tabs.TabPane tab={<><TeamOutlined /> 供需匹配</>} key="match">
                <div style={{ padding: 16 }}>
                  <Table
                    dataSource={supplyDemandData}
                    rowKey="field"
                    columns={[
                      { title: '紧缺方向', dataIndex: 'field', key: 'field' },
                      { title: '现有供给', dataIndex: 'supply', key: 'supply', render: (v) => <Tag color="blue">{v}人</Tag> },
                      { title: '预测需求', dataIndex: 'demand', key: 'demand', render: (v) => <Tag color="orange">{v}人</Tag> },
                      { title: '缺口', dataIndex: 'gap', key: 'gap', render: (v, record: typeof supplyDemandData[0]) => <Tag color={record.status === 'critical' ? 'red' : record.status === 'warning' ? 'orange' : 'green'}>{v}人</Tag> },
                      { title: '推荐人才', key: 'action', render: (_: unknown, record: typeof supplyDemandData[0]) => <Button type="link" size="small" onClick={() => setRecommendField(record.field)}>查看推荐</Button> },
                    ]}
                    pagination={false}
                  />
                  <Divider />
                  <Title level={5}>推荐引才方向</Title>
                  <Row gutter={16}>
                    {['生物医药研发', 'AI/算法工程', '新能源技术'].map((field, idx) => (
                      <Col span={8} key={idx}>
                        <Card size="small" hoverable style={{ ...glassCardStyle }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong style={{ fontSize: 16 }}>{field}</Text>
                            <Text type="secondary">紧缺程度：<Rate disabled defaultValue={5 - idx} style={{ fontSize: 16 }} /></Text>
                            <Button size="small" type="primary" onClick={() => { message.loading(`正在生成 ${field} 领域引才建议...`, 2); setTimeout(() => message.success('引才建议报告生成完成'), 2000); }}>生成引才建议</Button>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Modal
                    title={`${recommendField ?? ''} — 推荐人才`}
                    open={!!recommendField}
                    onCancel={() => setRecommendField(null)}
                    footer={null}
                    width={680}
                  >
                    {recommendField && (
                      <List
                        dataSource={getRecommendTalents(recommendField)}
                        locale={{ emptyText: '暂无匹配人才' }}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button type="link" size="small" onClick={() => { setSelectedTalentDetail(item); setTalentDetailVisible(true); }}>查看详情</Button>,
                              <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => message.success(`已将 ${item.name} 加入引才清单`)}>加入清单</Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2468F2' }} />}
                              title={<><Text strong style={{ fontSize: 16 }}>{item.name}</Text> <Tag color="blue" style={{ marginLeft: 8 }}>{item.field}</Tag></>}
                              description={<><Text type="secondary">{item.institution}</Text> <Text type="secondary" style={{ marginLeft: 12 }}>H指数: {item.hIndex}</Text> {item.tags.map(tag => <Tag key={tag} color={tag === '宜昌籍' ? 'green' : tag === '领军人才' ? 'purple' : tag === '创新人才' ? 'blue' : 'orange'} style={{ marginLeft: 4 }}>{tag}</Tag>)}</>}
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Modal>
                </div>
              </Tabs.TabPane>

              {/* 人才列表 */}
              <Tabs.TabPane tab={<><SolutionOutlined /> 人才列表</>} key="talentlist">
                <div style={{ padding: 16 }}>
                  {/* 人才列表表格 */}
                  <Card size="small" style={{ marginBottom: 16, ...glassCardStyle }}>
                    <Table
                      dataSource={talentListData}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      onRow={(record) => ({
                        onClick: () => { setSelectedTalentDetail(record); setTalentDetailVisible(true); },
                        style: { cursor: 'pointer' },
                      })}
                      columns={[
                        { title: '姓名', dataIndex: 'name', key: 'name', width: 100,
                          render: (text: string) => <a style={{ color: '#2468F2', fontWeight: 500 }}>{text}</a>
                        },
                        { title: '性别', dataIndex: 'gender', key: 'gender', width: 60 },
                        { title: '单位名称', dataIndex: 'institution', key: 'institution', width: 160 },
                        { title: '研究方向', dataIndex: 'field', key: 'field', width: 100,
                          render: (text: string) => <Tag color="blue">{text}</Tag>
                        },
                        { title: '所属产业链', dataIndex: 'industryChain', key: 'industryChain', width: 120,
                          render: (text: string) => <Tag color="cyan">{text}</Tag>
                        },
                        { title: '人才分类', dataIndex: 'tags', key: 'tags', width: 160,
                          render: (tags: string[]) => (
                            <Space size={4} wrap>
                              {tags.map(tag => (
                                <Tag key={tag} color={tag === '宜昌籍' ? 'green' : tag === '领军人才' ? 'purple' : tag === '创新人才' ? 'blue' : 'orange'}>{tag}</Tag>
                              ))}
                            </Space>
                          )
                        },
                        { title: 'H指数', dataIndex: 'hIndex', key: 'hIndex', width: 80,
                          render: (h: number) => <Tag color={h > 50 ? 'gold' : h > 30 ? 'blue' : 'default'}>{h}</Tag>
                        },
                        { title: '操作', key: 'action', width: 100,
                          render: (_: unknown, record: typeof talentListData[0]) => (
                            <Button type="primary" size="small" icon={<PlusOutlined />}
                              onClick={(e) => { e.stopPropagation(); message.success(`已将「${record.name}」加入引才清单`); }}>
                              加入清单
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>


      {/* 人才列表详情抽屉 */}
      <Drawer
        title={selectedTalentDetail?.name}
        width={720}
        open={talentDetailVisible}
        onClose={() => setTalentDetailVisible(false)}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { message.success(`已将「${selectedTalentDetail?.name}」加入引才清单`); }}>加入清单</Button>
            <Button icon={<FileTextOutlined />} onClick={() => { message.loading('正在生成人才报告...', 2); setTimeout(() => message.success('报告生成完成'), 2000); }}>生成报告</Button>
          </Space>
        }
      >
        {selectedTalentDetail && (
          <>
            {/* 人才简介 */}
            <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#2468F2', flexShrink: 0 }} />
                <div>
                  <Space>
                    <Text strong style={{ fontSize: 18 }}>{selectedTalentDetail.name}</Text>
                    <Text type="secondary">({selectedTalentDetail.gender})</Text>
                    {selectedTalentDetail.tags.map(tag => (
                      <Tag key={tag} color={tag === '宜昌籍' ? 'green' : tag === '领军人才' ? 'purple' : tag === '创新人才' ? 'blue' : 'orange'}>{tag}</Tag>
                    ))}
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">{selectedTalentDetail.institution}</Text>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 16, color: '#666' }}>
                    {selectedTalentDetail.introduction}
                  </div>
                </div>
              </div>
            </Card>

            {/* 详情标签页 */}
            <Tabs activeKey={talentDetailTab} onChange={setTalentDetailTab} items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <div>
                    <Card title="人才简介" size="small" style={{ marginBottom: 16 }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label={<><MailOutlined /> 邮箱</>}>talent@{selectedTalentDetail.institution.slice(0, 4)}.edu.cn</Descriptions.Item>
                        <Descriptions.Item label={<><LinkOutlined /> 主页</>}><a>http://www.{selectedTalentDetail.institution.slice(0, 4)}.edu.cn</a></Descriptions.Item>
                        <Descriptions.Item label={<><EnvironmentOutlined /> 区域</>}>{selectedTalentDetail.region}</Descriptions.Item>
                        <Descriptions.Item label={<><BankOutlined /> 机构类型</>}>{selectedTalentDetail.orgType}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                    <Card title="学术信息" size="small">
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="研究方向"><Tag color="blue">{selectedTalentDetail.field}</Tag></Descriptions.Item>
                        <Descriptions.Item label="H指数"><Tag color={selectedTalentDetail.hIndex > 50 ? 'gold' : selectedTalentDetail.hIndex > 30 ? 'blue' : 'default'}>{selectedTalentDetail.hIndex}</Tag></Descriptions.Item>
                        <Descriptions.Item label="所属产业链"><Tag color="cyan">{selectedTalentDetail.industryChain}</Tag></Descriptions.Item>
                        <Descriptions.Item label="人才分类">
                          {selectedTalentDetail.tags.map(tag => (
                            <Tag key={tag} color={tag === '宜昌籍' ? 'green' : tag === '领军人才' ? 'purple' : tag === '创新人才' ? 'blue' : 'orange'}>{tag}</Tag>
                          ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="单位名称" span={2}>{selectedTalentDetail.institution}</Descriptions.Item>
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
                        { color: 'blue', children: <><Text>发表SCI论文《{selectedTalentDetail.field}领域新进展》</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2026-01-10</Text></> },
                        { color: 'green', children: <><Text>获批国家自然科学基金面上项目</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2025-12-28</Text></> },
                        { color: 'blue', children: <><Text>参加{selectedTalentDetail.industryChain}产业发展论坛</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2025-12-15</Text></> },
                        { color: 'orange', children: <><Text>与三峡实验室签署合作协议</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2025-11-20</Text></> },
                        { color: 'blue', children: <><Text>新增发明专利1件</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2025-11-05</Text></> },
                      ]}
                    />
                  </Card>
                ),
              },
              {
                key: 'orgs',
                label: '合作机构',
                children: (
                  <List
                    dataSource={cooperativeOrgsData}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<BankOutlined />} style={{ backgroundColor: item.type === '高校' ? '#52c41a' : '#722ed1' }} />}
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
                label: '合作人才',
                children: (
                  <List
                    dataSource={cooperativeTalentsData}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2468F2' }} />}
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

export default Talent;
