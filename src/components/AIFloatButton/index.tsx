import { RobotOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import styles from './AIFloatButton.module.scss'

export default function AIFloatButton() {
  return (
    <Tooltip title="AI 智能助手" placement="left">
      <button className={styles.floatBtn}>
        <RobotOutlined />
      </button>
    </Tooltip>
  )
}
