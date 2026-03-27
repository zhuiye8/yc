import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import './styles/global.scss'

dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2468F2',
          borderRadius: 8,
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", Inter, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
