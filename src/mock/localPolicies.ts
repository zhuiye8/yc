/**
 * 宜昌本地真实政策数据（38条）
 * 来源：宜昌政策收集3.5.xlsx
 */
export interface LocalPolicy {
  id: string
  title: string
  docNo: string
  issuer: string
  coIssuers: string
  level: string
  publishDate: string
  effectiveDate: string
  expiryDate: string
  status: string
  sourceUrl: string
  sourceName: string
  tags: string
}

export const localPolicies: LocalPolicy[] = [
  { id: 'p1', title: '市人民政府办公室关于支持硅碳负极产业发展的实施意见', docNo: '宜府办发〔2025〕45号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2025-12-17', effectiveDate: '2026-01-01', expiryDate: '2031-02-10', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224936&depid=847&t=4', sourceName: '政务', tags: '科技创新,产业发展,财政金融' },
  { id: 'p2', title: '市人民政府办公室关于印发《宜昌市支持生物制造产业高质量倍增发展若干措施》的通知', docNo: '宜府办发〔2025〕39号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2025-11-10', effectiveDate: '2025-01-01', expiryDate: '2027-12-31', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224834&depid=847&t=4', sourceName: '政务', tags: '科技创新,产业发展,财政金融' },
  { id: 'p3', title: '市人民政府办公室关于印发《宜昌市支持数字经济发展的若干政策》的通知', docNo: '宜府办发〔2025〕24号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2025-08-06', effectiveDate: '2025-07-28', expiryDate: '2027-12-31', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224666&depid=847&t=4', sourceName: '政务', tags: '惠企政策,产业发展' },
  { id: 'p4', title: '市人民政府办公室关于印发《宜昌市促进文化旅游产业高质量发展奖励办法（试行）》的通知', docNo: '宜府办发〔2025〕18号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2025-05-19', effectiveDate: '2025-01-01', expiryDate: '2026-12-31', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224492&depid=847&t=4', sourceName: '政务', tags: '文化旅游' },
  { id: 'p5', title: '市人民政府办公室关于印发《宜昌市推动电子商务高质量发展的若干措施》的通知', docNo: '宜府办发〔2025〕9号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2025-03-31', effectiveDate: '2025-03-26', expiryDate: '2027-12-31', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224394&depid=847&t=4', sourceName: '政务', tags: '电子商务' },
  { id: 'p6', title: '市人民政府办公室关于印发《宜昌市促进知识产权高质量发展若干措施》的通知', docNo: '宜府办发〔2024〕50号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-12-31', effectiveDate: '2024-12-25', expiryDate: '2027-12-31', status: '有效', sourceUrl: 'http://www.yichang.gov.cn/zfxxgk/show.html?aid=1&id=224173&depid=847&t=4', sourceName: '政务', tags: '知识产权' },
  { id: 'p7', title: '市人民政府办公室关于印发《宜昌市加快推进新型工业化的若干政策措施》的通知', docNo: '宜府办发〔2024〕41号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-11-22', effectiveDate: '2024-11-22', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '政务', tags: '新型工业化,产业发展' },
  { id: 'p8', title: '市人民政府关于印发《宜昌市科技创新人才引育实施办法》的通知', docNo: '宜府发〔2024〕16号', issuer: '宜昌市人民政府', coIssuers: '', level: '市', publishDate: '2024-10-08', effectiveDate: '2024-10-08', expiryDate: '2027-10-07', status: '有效', sourceUrl: '', sourceName: '政务', tags: '人才引育,科技创新' },
  { id: 'p9', title: '市人民政府关于印发《宜昌高新技术产业开发区管理办法》的通知', docNo: '宜府发〔2024〕12号', issuer: '宜昌市人民政府', coIssuers: '', level: '市', publishDate: '2024-07-26', effectiveDate: '2024-09-01', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '高新技术,园区管理' },
  { id: 'p10', title: '市人民政府办公室关于印发《宜昌市促进开放型经济高质量发展的若干措施》的通知', docNo: '宜府办发〔2024〕22号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-07-15', effectiveDate: '2024-07-15', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '政务', tags: '开放型经济' },
  { id: 'p11', title: '市人民政府办公室关于印发《宜昌市中心城区住房公积金贷款实施细则》的通知', docNo: '宜府办发〔2024〕17号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-06-13', effectiveDate: '2024-06-13', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '住房公积金' },
  { id: 'p12', title: '市人民政府关于加快推进"电化长江"宜昌示范区建设的实施意见', docNo: '宜府发〔2024〕8号', issuer: '宜昌市人民政府', coIssuers: '', level: '市', publishDate: '2024-05-16', effectiveDate: '2024-05-16', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '电化长江,绿色发展' },
  { id: 'p13', title: '市人民政府关于印发《推进宜昌建设长江大保护典范城市规划纲要（2024—2035年）》的通知', docNo: '宜府发〔2024〕4号', issuer: '宜昌市人民政府', coIssuers: '', level: '市', publishDate: '2024-04-02', effectiveDate: '2024-04-02', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '长江大保护' },
  { id: 'p14', title: '市人民政府办公室关于推进宜昌城市数智化转型的实施方案', docNo: '宜府办发〔2024〕5号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-03-13', effectiveDate: '2024-03-13', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '数智化转型' },
  { id: 'p15', title: '市人民政府办公室关于印发《宜昌市支持新能源汽车产业发展措施》的通知', docNo: '宜府办发〔2024〕2号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-02-02', effectiveDate: '2024-02-02', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '政务', tags: '新能源汽车,产业发展' },
  { id: 'p16', title: '市人民政府办公室关于印发《2024年宜昌市推进新型工业化工作方案》的通知', docNo: '宜府办发〔2024〕1号', issuer: '宜昌市人民政府办公室', coIssuers: '', level: '市', publishDate: '2024-01-19', effectiveDate: '2024-01-19', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '新型工业化' },
  { id: 'p17', title: '市人民政府关于印发《宜昌市推动大规模设备更新和消费品以旧换新实施方案》的通知', docNo: '宜府发〔2024〕10号', issuer: '宜昌市人民政府', coIssuers: '', level: '市', publishDate: '2024-06-05', effectiveDate: '2024-06-05', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '政务', tags: '设备更新,以旧换新' },
  { id: 'p18', title: '湖北省人民政府办公厅关于印发《湖北省新型工业化发展大会精神贯彻落实工作方案》的通知', docNo: '鄂政办发〔2024〕20号', issuer: '湖北省人民政府办公厅', coIssuers: '', level: '省', publishDate: '2024-05-10', effectiveDate: '2024-05-10', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '省政府', tags: '新型工业化' },
  { id: 'p19', title: '省人民政府办公厅关于加快推进三大都市圈发展的指导意见', docNo: '鄂政办发〔2024〕5号', issuer: '湖北省人民政府办公厅', coIssuers: '', level: '省', publishDate: '2024-02-20', effectiveDate: '2024-02-20', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '省政府', tags: '区域发展' },
  { id: 'p20', title: '宜都市人民政府关于印发《宜都市支持制造业高质量发展若干政策》的通知', docNo: '宜都政发〔2024〕8号', issuer: '宜都市人民政府', coIssuers: '', level: '县', publishDate: '2024-07-01', effectiveDate: '2024-07-01', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '宜都市政府', tags: '制造业' },
  { id: 'p21', title: '枝江市人民政府关于印发《枝江市促进经济稳定增长若干措施》的通知', docNo: '枝政发〔2024〕5号', issuer: '枝江市人民政府', coIssuers: '', level: '县', publishDate: '2024-04-15', effectiveDate: '2024-04-15', expiryDate: '2025-12-31', status: '有效', sourceUrl: '', sourceName: '枝江市政府', tags: '经济增长,惠企政策' },
  { id: 'p22', title: '当阳市人民政府办公室关于印发《当阳市促进民营经济发展壮大的若干措施》的通知', docNo: '当政办发〔2024〕12号', issuer: '当阳市人民政府办公室', coIssuers: '', level: '县', publishDate: '2024-06-20', effectiveDate: '2024-06-20', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '当阳市政府', tags: '民营经济' },
  { id: 'p23', title: '远安县人民政府关于印发《远安县支持工业经济高质量发展的若干政策》的通知', docNo: '远政发〔2024〕3号', issuer: '远安县人民政府', coIssuers: '', level: '县', publishDate: '2024-03-28', effectiveDate: '2024-03-28', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '远安县政府', tags: '工业经济' },
  { id: 'p24', title: '兴山县人民政府关于印发《兴山县促进文化旅游产业高质量发展奖励办法》的通知', docNo: '兴政发〔2024〕6号', issuer: '兴山县人民政府', coIssuers: '', level: '县', publishDate: '2024-05-08', effectiveDate: '2024-05-08', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '兴山县政府', tags: '文化旅游' },
  { id: 'p25', title: '夷陵区人民政府关于印发《夷陵区支持科技创新驱动高质量发展若干措施》的通知', docNo: '夷政发〔2024〕15号', issuer: '夷陵区人民政府', coIssuers: '', level: '区', publishDate: '2024-08-12', effectiveDate: '2024-08-12', expiryDate: '2027-08-11', status: '有效', sourceUrl: '', sourceName: '夷陵区政府', tags: '科技创新' },
  { id: 'p26', title: '西陵区人民政府办公室关于印发《西陵区促进服务业高质量发展若干措施》的通知', docNo: '西政办发〔2024〕8号', issuer: '西陵区人民政府办公室', coIssuers: '', level: '区', publishDate: '2024-06-25', effectiveDate: '2024-06-25', expiryDate: '2026-06-24', status: '有效', sourceUrl: '', sourceName: '西陵区政府', tags: '服务业' },
  { id: 'p27', title: '伍家岗区人民政府关于印发《伍家岗区促进数字经济发展若干措施》的通知', docNo: '伍政发〔2024〕10号', issuer: '伍家岗区人民政府', coIssuers: '', level: '区', publishDate: '2024-07-18', effectiveDate: '2024-07-18', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '伍家岗区政府', tags: '数字经济' },
  { id: 'p28', title: '点军区人民政府办公室关于印发《点军区支持中小企业发展若干措施》的通知', docNo: '点政办发〔2024〕5号', issuer: '点军区人民政府办公室', coIssuers: '', level: '区', publishDate: '2024-04-22', effectiveDate: '2024-04-22', expiryDate: '2026-04-21', status: '有效', sourceUrl: '', sourceName: '点军区政府', tags: '中小企业' },
  { id: 'p29', title: '猇亭区人民政府关于印发《猇亭区推进产业转型升级若干政策》的通知', docNo: '猇政发〔2024〕7号', issuer: '猇亭区人民政府', coIssuers: '', level: '区', publishDate: '2024-05-30', effectiveDate: '2024-05-30', expiryDate: '2026-12-31', status: '有效', sourceUrl: '', sourceName: '猇亭区政府', tags: '产业转型' },
  { id: 'p30', title: '宜昌高新区管委会关于印发《宜昌高新区促进企业上市挂牌奖励办法》的通知', docNo: '宜高新〔2024〕12号', issuer: '宜昌高新区管委会', coIssuers: '', level: '园区', publishDate: '2024-09-05', effectiveDate: '2024-09-05', expiryDate: '2027-09-04', status: '有效', sourceUrl: '', sourceName: '高新区', tags: '企业上市,资本市场' },
  { id: 'p31', title: '市科技局关于印发《宜昌市科技计划项目管理办法》的通知', docNo: '宜科发〔2024〕3号', issuer: '宜昌市科技局', coIssuers: '', level: '市', publishDate: '2024-03-01', effectiveDate: '2024-03-01', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '市科技局', tags: '科技计划' },
  { id: 'p32', title: '市经信局关于印发《宜昌市"专精特新"中小企业培育管理办法》的通知', docNo: '宜经信〔2024〕8号', issuer: '宜昌市经信局', coIssuers: '', level: '市', publishDate: '2024-04-10', effectiveDate: '2024-04-10', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '市经信局', tags: '专精特新,中小企业' },
  { id: 'p33', title: '市人社局关于印发《宜昌市高层次人才分类认定办法》的通知', docNo: '宜人社发〔2024〕15号', issuer: '宜昌市人社局', coIssuers: '', level: '市', publishDate: '2024-05-20', effectiveDate: '2024-05-20', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '市人社局', tags: '人才认定' },
  { id: 'p34', title: '市财政局 市科技局关于印发《宜昌市科技创新券管理办法》的通知', docNo: '宜财教〔2024〕6号', issuer: '宜昌市财政局', coIssuers: '宜昌市科技局', level: '市', publishDate: '2024-06-08', effectiveDate: '2024-06-08', expiryDate: '2027-06-07', status: '有效', sourceUrl: '', sourceName: '市财政局', tags: '科技创新券' },
  { id: 'p35', title: '秭归县文化和旅游局 秭归县财政局关于印发《秭归县全民健身赛事（活动）、竞技体育经费补助管理办法》的通知', docNo: '秭文旅发〔2024〕10号', issuer: '秭归县文化和旅游局', coIssuers: '秭归县财政局', level: '县', publishDate: '2024-08-15', effectiveDate: '2024-08-15', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '秭归县', tags: '体育文化' },
  { id: 'p36', title: '县人民政府关于印发《长阳土家族自治县政府投资项目管理实施办法》的通知', docNo: '长政发〔2024〕4号', issuer: '长阳土家族自治县人民政府', coIssuers: '', level: '县', publishDate: '2024-03-20', effectiveDate: '2024-03-20', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '长阳县政府', tags: '政府投资' },
  { id: 'p37', title: '县人民政府办公室关于印发《2025年长阳土家族自治县推进新型工业化工作方案》的通知', docNo: '长政办发〔2025〕2号', issuer: '长阳土家族自治县人民政府办公室', coIssuers: '', level: '县', publishDate: '2025-01-15', effectiveDate: '2025-01-15', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '长阳县政府', tags: '新型工业化' },
  { id: 'p38', title: '县科技经信局关于印发《五峰土家族自治县科技创新项目管理办法》的通知', docNo: '五科经信〔2024〕5号', issuer: '五峰土家族自治县科技经信局', coIssuers: '', level: '县', publishDate: '2024-09-10', effectiveDate: '2024-09-10', expiryDate: '', status: '有效', sourceUrl: '', sourceName: '五峰县', tags: '科技创新' },
]
