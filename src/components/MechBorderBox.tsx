/**
 * @input React
 * @output { MechBorderBox } 大屏专用机械感蓝色边框容器
 * @position 共享 UI 组件，仅供大屏页面使用，四角 L 形装饰 + 可选扫描线动画
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React from 'react';

interface MechBorderBoxProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  headerVariant?: boolean;
  className?: string;
}

const MechBorderBox: React.FC<MechBorderBoxProps> = ({
  title,
  children,
  style,
  headerVariant = false,
  className = '',
}) => {
  const boxClass = [
    'mech-border-box',
    headerVariant ? 'mech-border-box--header' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={boxClass} style={style}>
      {/* 扫描线（仅 header 变体） */}
      {headerVariant && <div className="mech-scan-line" />}

      {/* 标题栏 */}
      {title && (
        <div className="mech-border-title">
          <span className="mech-border-title-decorator" />
          <span className="mech-border-title-text">{title}</span>
        </div>
      )}

      {/* 内层容器（承载底部两个角的伪元素） */}
      <div className="mech-border-inner">
        {children}
      </div>
    </div>
  );
};

export default MechBorderBox;
