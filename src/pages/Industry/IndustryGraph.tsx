import { useMemo } from 'react'
import { Button, Tag } from 'antd'
import {
  AlertOutlined,
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import IndustryChainGraph from '@/components/IndustryTree'
import { industryChainGraphData } from '@/mock/industryChainGraphData'
import { enterprises } from '@/mock/data'
import styles from './Industry.module.scss'

interface IndustryGraphProps {
  chainKey: string
}

const statusColor = {
  strong: '#2468F2',
  weak: '#7BA3FA',
  missing: '#BFC8D6',
}

// 链上人才 mock 数据
const chainTalents = [
  { name: '王建国', title: '院士', field: '矿产资源' },
  { name: '李国璋', title: '教授级高工', field: '精细化工' },
  { name: '张志刚', title: '研究员', field: '新材料' },
  { name: '陈明辉', title: '研究员', field: '化工工程' },
  { name: '王建国', title: '院士', field: '矿产资源' },
  { name: '李国璋', title: '教授级高工', field: '精细化工' },
  { name: '张志刚', title: '研究员', field: '新材料' },
  { name: '陈明辉', title: '研究员', field: '化工工程' },
]

export default function IndustryGraph({ chainKey }: IndustryGraphProps) {
  const graphData = useMemo(() => {
    return industryChainGraphData[chainKey]
  }, [chainKey])

  if (!graphData) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无该产业链图谱数据</div>
  }

  return (
    <div className={styles.graphLayout}>
      {/* 左列：图谱 + 链上企业 */}
      <div className={styles.leftColumn}>
        <div className={styles.graphArea}>
          <div className={styles.legend}>
            <span><span className={styles.legendDot} style={{ background: statusColor.strong }} /> 强链</span>
            <span><span className={styles.legendDot} style={{ background: statusColor.weak }} /> 弱链</span>
            <span><span className={styles.legendDot} style={{ background: statusColor.missing }} /> 缺链</span>
          </div>
          <IndustryChainGraph key={chainKey} graphData={graphData} />
        </div>

        {/* 链上企业 */}
        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <BankOutlined className={styles.icon} />
              链上企业
            </div>
            <Button type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>
          <div className={styles.enterpriseGrid}>
            <table className={styles.enterpriseTable}>
              <thead>
                <tr><th>企业</th><th>创新</th></tr>
              </thead>
              <tbody>
                {enterprises.slice(0, 4).map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td><span className={styles.scoreCircle}>{e.innovationScore}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.enterpriseTable}>
              <thead>
                <tr><th>企业</th><th>创新</th></tr>
              </thead>
              <tbody>
                {enterprises.slice(4, 8).map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td><span className={styles.scoreCircle}>{e.innovationScore}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.viewAll}>查看全部企业 &gt;</div>
        </div>
      </div>

      {/* 右列：预警系数 + 本地化率 + 链上人才 */}
      <div className={styles.sidePanel}>
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <AlertOutlined className={styles.icon} />
            预警系数
          </div>
          <div className={styles.statValue}>
            72.5
            <span className={`${styles.statTrend} ${styles.up}`}>
              <ArrowUpOutlined /> 3.2%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '72.5%', background: '#F26B4A' }} />
          </div>
          <div className={styles.statSub}>较上月下降3.2%，需关注缺链环节</div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <HomeOutlined className={styles.icon} />
            本地化率
          </div>
          <div className={styles.statValue} style={{ color: '#2468F2' }}>
            46.8%
            <span className={styles.statTrend} style={{ color: '#2BA471' }}> +2.1%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '46.8%' }} />
          </div>
          <div className={styles.statSub}>本地企业占比，较上月提升2.1%</div>
        </div>

        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.talentHeader}>
            <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
              <TeamOutlined className={styles.icon} />
              链上人才
            </div>
            <Button type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>
          <table className={styles.talentTable}>
            <thead>
              <tr>
                <th>人才</th>
                <th>职称</th>
                <th>领域</th>
              </tr>
            </thead>
            <tbody>
              {chainTalents.map((t, i) => (
                <tr key={i}>
                  <td>{t.name}</td>
                  <td><Tag color="blue">{t.title}</Tag></td>
                  <td>{t.field}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.viewAll}>查看全部企业 &gt;</div>
        </div>
      </div>
    </div>
  )
}
