/**
 * @input React, dayjs
 * @output { Header } 大屏顶部标题栏 + 实时时钟组件
 * @position 大屏共享组件，每秒刷新时间显示
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置语言为中文
dayjs.locale('zh-cn');

function Header() {

  const [currentTime, setCurrentTime] = useState(dayjs());


  useEffect(() => {
    // 每秒更新一次时间
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    // 组件卸载时清除定时器
    return () => clearInterval(timer);
  }, []);

  // 格式化时间：HH:mm:ss YYYY年MM月DD日 周几
  const formatTime = () => {
    return currentTime.format('HH:mm:ss');
  };

  const formatDate = () => {
    return currentTime.format('YYYY年MM月DD日 dddd');
  } 

    
  return <header className="header">
            <div className="real-time-clock">
                <span className='time'>{formatTime()}</span>
                <span className='date'>{formatDate()}</span>
            
            </div>
      </header>
}

export default Header 