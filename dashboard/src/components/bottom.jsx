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
