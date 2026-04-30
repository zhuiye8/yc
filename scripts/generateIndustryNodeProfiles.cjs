const fs = require('fs')
const path = require('path')

const sourcePath = path.resolve(__dirname, '../src/data/industry-keywords.json')
const targetPath = path.resolve(__dirname, '../src/data/industry-node-profiles.json')
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))

const chainFallbacks = [
  {
    test: /人工智能/,
    text: '连接算力、数据、算法与应用场景，支撑人工智能能力建设和产业化落地。',
  },
  {
    test: /新能源|新材料/,
    text: '围绕关键材料、能源转换和装备应用构建资源基础，支撑新能源新材料产业延伸。',
  },
  {
    test: /制剂|仿制药|医药|药/,
    text: '服务药物研发、制剂生产和质量控制，支撑医药成果转化与规模化供应。',
  },
  {
    test: /酵母|发酵|功能成分/,
    text: '贯通菌种、发酵、提取和应用环节，支撑功能成分制造与食品健康产品开发。',
  },
  {
    test: /船舶/,
    text: '面向绿色动力、智能控制和船舶制造配套，支撑内河船舶产业升级。',
  },
  {
    test: /湿电子|电子化学品|化学品/,
    text: '面向高纯化学品制备、检测和半导体制程应用，支撑电子材料供应能力建设。',
  },
]

const stageRules = [
  { test: /上游|原料|材料|矿|树脂|纤维|基材|辅料|菌种|底座|基础|芯片|器件|零部件|动力|电池|电机|电控|GPU|ASIC|CPU|FPGA|NPU|HBM|DRAM|NAND|SSD|PCIe|CXL|处理器|存储/, value: '基础支撑环节' },
  { test: /中游|制造|加工|合成|制备|生产|发酵|提取|纯化|检测|封装|组装|集成|设计|研发|训练|平台|系统|工程|质量/, value: '核心制造与能力建设环节' },
  { test: /下游|应用|终端|场景|服务|治理|认证|行业|方案|生态|交付|运维|食品|医疗|汽车|船舶|半导体|电子|光伏|储能/, value: '场景应用与生态延伸环节' },
]

const nodeRules = [
  { test: /GPU|图形处理器|图形处理单元/, text: '提供模型训练、图形渲染和高并行计算所需的核心算力。' },
  { test: /ASIC|专用AI加速器/, text: '通过定制化芯片架构提升特定 AI 算子的推理效率和能耗表现。' },
  { test: /CPU|中央处理器|通用处理器/, text: '承担通用计算、任务调度和系统控制，是智能计算平台的基础算力单元。' },
  { test: /FPGA/, text: '提供可重构硬件加速能力，适用于低时延推理、边缘计算和原型验证。' },
  { test: /NPU|神经网络处理器/, text: '面向神经网络推理和端侧智能场景，提升 AI 任务的本地处理能力。' },
  { test: /HBM|高带宽内存/, text: '为大模型训练和高性能计算提供高吞吐、低延迟的数据访问能力。' },
  { test: /DRAM|动态随机存取存储器/, text: '承担计算设备运行过程中的高速临时数据存储，影响系统吞吐和响应效率。' },
  { test: /NAND|闪存/, text: '提供非易失性数据存储能力，是智能终端、服务器和存储设备的重要基础器件。' },
  { test: /SSD|固态硬盘/, text: '通过高速闪存存储提升数据读写效率，支撑模型加载、数据处理和业务系统运行。' },
  { test: /PCIe|CXL|互连|总线/, text: '负责芯片、存储和加速设备间的高速互联，决定计算系统的数据交换效率。' },
  { test: /传感器|视觉|力觉|雷达|感知/, text: '采集外部环境和设备状态数据，为智能识别、控制决策和安全运行提供输入。' },
  { test: /数据采集|数据治理|元数据|数据质量|数据血缘|权限|隐私|安全/, text: '规范数据采集、管理和使用流程，保障产业数据可用、可信和合规流转。' },
  { test: /数据标注|训练数据|合成数据|数据增强/, text: '提升训练样本的规模、质量和覆盖面，为模型训练与评测提供数据基础。' },
  { test: /机器学习|深度学习|强化学习|自监督|算法/, text: '沉淀模型学习和优化方法，支撑智能识别、预测决策和自动化处理能力。' },
  { test: /大模型|预训练|文本模型|视觉模型|语音模型|多模态/, text: '构建通用智能能力底座，为行业应用提供语言、视觉、语音和多模态理解能力。' },
  { test: /训练|微调|指令|参数高效|对齐|偏好学习/, text: '优化模型能力、任务适配和输出行为，使模型更符合业务场景和安全要求。' },
  { test: /评测|基准|鲁棒|安全性|公平性|红队/, text: '验证模型性能、稳定性和风险边界，为规模化应用提供质量依据。' },
  { test: /推理|推理引擎|服务化|流式|批处理|并发/, text: '支撑模型高效部署和在线服务，提升响应速度、吞吐能力和业务可用性。' },
  { test: /量化|剪枝|蒸馏|稀疏/, text: '压缩模型参数和计算开销，降低部署成本并提升端侧或云侧运行效率。' },
  { test: /RAG|检索|索引|重排|融合/, text: '将外部知识与模型生成能力结合，提升行业问答、检索和知识服务的准确性。' },
  { test: /Agent|智能体|工作流|编排/, text: '把模型能力组织成可执行任务流程，支撑复杂业务的自动分析和协同处理。' },
  { test: /日志|指标|监控|运维|回滚|漂移/, text: '跟踪模型和系统运行状态，保障智能应用持续稳定和可控迭代。' },
  { test: /应用软件|解决方案|办公|生产力|客服|营销|金融科技|医疗健康|教育|政务|网络安全/, text: '面向具体行业和业务流程提供智能化产品，推动 AI 能力转化为应用价值。' },
  { test: /机器人|自动化|运动控制|规划|智能终端|可穿戴|车载/, text: '将感知、决策和控制能力嵌入终端设备，支撑智能硬件和具身智能应用。' },
  { test: /标准|合规|认证|审计|透明度|知识产权|监管/, text: '建立风险治理和合规评价体系，保障产业应用安全、可信和可持续发展。' },

  { test: /锂离子|锂电|正极|负极|电解液|隔膜/, text: '构成动力与储能电池的核心材料体系，决定电池能量密度、安全性和循环寿命。' },
  { test: /钠离子|钠电/, text: '面向低成本储能和规模化应用，提供锂电之外的电化学储能技术路线。' },
  { test: /固态电池|固态电解质/, text: '通过固态电解质提升电池安全性和能量密度，是下一代储能的重要方向。' },
  { test: /氢能|制氢|储氢|燃料电池|氢燃料/, text: '围绕氢气制取、储运和电化学转化，支撑清洁能源替代和交通能源应用。' },
  { test: /光伏|太阳能|硅片|电池片|组件|逆变器/, text: '连接光电转换、组件制造和并网应用，支撑清洁电力规模化供给。' },
  { test: /风电|叶片|塔筒|发电机|齿轮箱/, text: '围绕风能捕获、传动和发电装备制造，支撑可再生能源装机增长。' },
  { test: /储能|电池管理|BMS|PCS|热管理/, text: '保障电能存储、调度和安全运行，提升新能源消纳和电力系统稳定性。' },
  { test: /碳纤维|复合材料|高分子|树脂|膜材料|石墨烯|纳米/, text: '提供轻量化、高强度或高功能材料基础，拓展新能源、装备和电子应用场景。' },
  { test: /稀土|磁材|永磁|钕铁硼/, text: '提供高性能磁性材料，支撑电机、风电、汽车和智能装备核心部件。' },
  { test: /回收|梯次利用|再生/, text: '实现材料和电池资源循环利用，降低供应风险并提升产业绿色化水平。' },

  { test: /速释|缓释|控释|迟释|肠溶|靶向|脂质体|微球|纳米制剂/, text: '通过剂型设计调控药物释放和体内分布，提升疗效、安全性和用药便利性。' },
  { test: /片剂|胶囊|颗粒|注射剂|冻干|吸入|滴眼|外用/, text: '面向不同给药路径形成稳定产品形态，支撑药品生产和临床使用。' },
  { test: /原料药|中间体|晶型|杂质|质量研究/, text: '保障药物活性成分、关键物质和质量属性稳定，是高端制剂开发的基础。' },
  { test: /一致性评价|生物等效|BE|药代|临床/, text: '验证仿制药与参比制剂的一致性，支撑产品注册、替代和市场准入。' },
  { test: /连续制造|工艺放大|生产线|GMP|无菌/, text: '提升制剂生产的稳定性、可控性和规模化能力，保障药品合规供应。' },
  { test: /包材|给药装置|辅料/, text: '影响药品稳定性、递送效率和患者使用体验，是制剂产品化的重要支撑。' },
  { test: /检测|质控|溶出|稳定性|方法学/, text: '建立药品质量评价和过程控制手段，保障制剂安全、有效和批间一致。' },

  { test: /酵母菌|菌种|菌株|菌株库|选育|诱变/, text: '提供发酵生产的源头生物资源，决定产物效率、稳定性和产业化潜力。' },
  { test: /发酵罐|发酵工艺|培养基|补料|放大/, text: '控制微生物生长和代谢过程，提升目标成分产量和规模化生产稳定性。' },
  { test: /酵母抽提物|酵母蛋白|葡聚糖|甘露聚糖|核苷酸|多肽/, text: '从酵母体系中获取功能成分，支撑食品配料、营养健康和生物制造应用。' },
  { test: /分离|提取|纯化|浓缩|干燥|喷雾/, text: '将发酵产物转化为稳定可用的功能原料，决定产品纯度、成本和品质。' },
  { test: /食品|调味|烘焙|饲料|营养|保健|功能食品/, text: '面向消费和工业应用开发终端产品，释放酵母功能成分的市场价值。' },
  { test: /废水|废渣|资源化|绿色制造/, text: '处理发酵副产物并推动资源循环利用，提升产业绿色化和综合效益。' },

  { test: /船型|总体设计|船舶设计|结构设计|流体|水动力/, text: '确定船舶总体方案、结构性能和航行效率，是绿色智能船舶制造的前端环节。' },
  { test: /船体|分段|焊接|涂装|总装|建造/, text: '承担船舶结构制造和装配成形，直接影响交付周期、质量和成本。' },
  { test: /电推|电力推进|混合动力|LNG|甲醇|氢燃料|动力系统/, text: '提供低排放动力和能源转换能力，是绿色船舶节能降碳的核心。' },
  { test: /导航|通信|雷达|自动驾驶|智能航行|避碰/, text: '提升船舶感知、定位和自主决策能力，支撑智能航运与安全运行。' },
  { test: /船岸协同|岸电|充换电|港口|运维/, text: '连接船舶、港口和岸端基础设施，保障绿色船舶运营和补能服务。' },
  { test: /检验|认证|规范|适航|安全/, text: '建立船舶质量、安全和合规评价基础，支撑产品交付和市场准入。' },

  { test: /氢氟酸|HF|硫酸|盐酸|硝酸|氨水|过氧化氢|双氧水|磷酸/, text: '作为半导体湿法制程的关键高纯试剂，主要用于清洗、刻蚀和表面处理。' },
  { test: /显影液|剥离液|刻蚀液|清洗液|CMP|抛光液/, text: '直接服务晶圆制造关键工序，影响图形转移、缺陷控制和良率水平。' },
  { test: /超净|高纯|电子级|金属离子|颗粒|杂质/, text: '通过纯化和污染控制提升化学品洁净度，满足先进制程严苛质量要求。' },
  { test: /配方|复配|添加剂|稳定剂|表面活性剂/, text: '通过配方设计改善化学品选择性、稳定性和工艺适配能力。' },
  { test: /包装|储运|容器|供应链/, text: '保障高纯化学品在包装、运输和使用过程中的洁净、安全与稳定供应。' },
  { test: /半导体|晶圆|光刻|显示|面板|PCB/, text: '面向电子制造关键制程提供材料支撑，影响终端器件性能和生产良率。' },
]

function unique(values) {
  return Array.from(new Set(values.map((item) => String(item).trim()).filter(Boolean)))
}

function splitQueryString(queryString) {
  if (!queryString) return []
  return String(queryString).split(/\s+OR\s+/i)
}

function getStageLabel(nodeName) {
  const matched = stageRules.find((rule) => rule.test.test(nodeName))
  return matched?.value || '关键产业环节'
}

function getFallbackText(chainName) {
  return chainFallbacks.find((rule) => rule.test.test(chainName))?.text
    || '承接产业链上下游资源协同，支撑相关企业、人才和技术能力集聚。'
}

function getNodeText(nodeName, chainName, entry) {
  const keywordText = unique([
    nodeName,
    ...(entry.keywords || []),
    ...splitQueryString(entry.queryString),
  ]).join(' ')

  const matched = nodeRules.find((rule) => rule.test.test(keywordText))
  return matched?.text || getFallbackText(chainName)
}

function buildProfile(chainName, nodeName, entry) {
  const stageLabel = getStageLabel(nodeName)
  const nodeText = getNodeText(nodeName, chainName, entry)
  return `“${nodeName}”是“${chainName}”产业链的${stageLabel}，${nodeText}`
}

const profiles = {}
let total = 0

for (const [chainName, nodes] of Object.entries(source)) {
  profiles[chainName] = {}

  for (const [nodeName, entry] of Object.entries(nodes)) {
    profiles[chainName][nodeName] = buildProfile(chainName, nodeName, entry)
    total += 1
  }
}

fs.writeFileSync(targetPath, `${JSON.stringify(profiles, null, 2)}\n`, 'utf8')
console.log(`Generated ${total} industry node profiles: ${targetPath}`)
