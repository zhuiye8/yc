/**
 * @input props: { onReturnHome, isHome }
 * @output { Bottom } 大屏底部返回按钮组件
 * @position 大屏共享组件，支持返回首页/返回上级两种模式
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
function Bottom({ onReturnHome, isHome=false }) {
  return (
    <div className="bottom">
      <button 
        className="return-button"
        onClick={onReturnHome}
      >
        {isHome ? '返回': '返回首页'}
      </button>
    </div>
  )
}

export default Bottom
