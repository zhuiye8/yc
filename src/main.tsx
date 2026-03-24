/**
 * @input { StrictMode } from 'react', { createRoot } from 'react-dom/client', { App } from './App'
 * @output 应用挂载副作用，将 React 根组件渲染到 #root DOM 节点
 * @position 应用入口文件，StrictMode 包裹 + createRoot 挂载
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
