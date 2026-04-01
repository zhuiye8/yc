import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import chinaGeoJson from '@/assets/geo/china.json';
import yichangGeoJson from '@/assets/geo/yichang.json';
import tooltipBg from '/images/screen/tooltip.png';
import './map.scss'
const EChartsChinaMap = ({ isYichang = false, customData = null, tooltipFields = null }) => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [currentMap, setCurrentMap] = useState(isYichang ? 'yichang' : 'china');
  const [mapCenter, setMapCenter] = useState(isYichang ? [111.1, 30.56] : [104.0, 32.5]);
  const [mapZoom, setMapZoom] = useState(isYichang ? 0.9 : 1.4);
  const [yichangMapLoaded, setYichangMapLoaded] = useState(false);
  const YICHANG_CENTER = [111.1, 30.56]

  const mockDatas=[
    {name: '湖北省', label:'宜昌市', enterprise: 11556, talents: 21366},
    {name: '湖南省', label:'湖南省', enterprise: 71556, talents: 81366},
    {name: '北京市', label:'', enterprise: 232560, talents: 152360},
    {name: '上海市', label:'', enterprise: 213256, talents: 133366},
    {name: '广东省', label:'', enterprise: 223256, talents: 123366},
    {name: '西藏自治区', label:'', enterprise: 5864, talents: 11222},
    {name: '四川省', label:'', enterprise: 81864, talents: 71222},
    {name: '云南省', label:'', enterprise: 61064, talents: 31122},
    {name: '夷陵区', label:'', enterprise: 1326, talents: 1034},
    {name: '伍家岗区', label:'', enterprise: 1201, talents: 1231},
    {name: '西陵区', label:'', enterprise: 1931, talents: 7071},
    {name: '长阳土家族自治县', label:'', enterprise: 471, talents: 154},
    {name: '枝江市', label:'', enterprise: 693, talents: 826},
    {name: '宜都市', label:'', enterprise: 825, talents: 542},
    {name: '兴山县', label:'', enterprise: 209, talents: 453},
    {name: '当阳市', label:'', enterprise: 633, talents: 326},
    {name: '远安县', label:'', enterprise: 295, talents: 664},
    {name: '秭归县', label:'', enterprise: 438, talents: 64},
    {name: '五峰土家族自治县', label:'', enterprise: 217, talents: 105},
    {name: '点军区', label:'', enterprise: 94, talents: 273},
    {name: '猇亭区', label:'', enterprise: 304, talents: 816},
  ]

  const getMapOption = (mapType, center, zoom) => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        textStyle: {
          color: '#E0E8FF',
          fontSize: 16,
        },
        formatter: params => {
          const data = customData || mockDatas
          const item = data.filter(v => v.name === params.name)?.[0]
          if(!item) return ''
          
          if (tooltipFields && Array.isArray(tooltipFields)) {
            return `
              <div style="padding: 20px; min-width: 160px; min-height: 120px; background: url(${tooltipBg}) no-repeat center/100% 100%;">
                <div style="color: #B0E0E6; font-weight: bold; margin-bottom: 8px; padding-bottom: 5px; font-size: 16px;">
                  ${item?.label || item.name}
                </div>
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; margin-top: 10px;">
                  ${tooltipFields.map(field => `
                    <span style="color: #FFFFFF;">${field.label}:</span>
                    <span style="color: #FFFFFF;"><span style="color: #FF8C00; font-weight: bold; font-size: 14px;">${item[field.key]}</span>${field.unit || ''}</span>
                  `).join('')}
                </div>
              </div>
            `;
          }
          
          return `
            <div style="padding: 20px; min-width: 160px; min-height: 120px; background: url(${tooltipBg}) no-repeat center/100% 100%;">
              <div style="color: #B0E0E6; font-weight: bold; margin-bottom: 8px; padding-bottom: 5px; font-size: 16px;">
                ${item?.label || item.name}
              </div>
              <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; margin-top: 10px;">
                <span style="color: #FFFFFF;">企业总数:</span>
                <span style="color: #FFFFFF;"><span style="color: #FF8C00; font-weight: bold; font-size: 14px;">${item.enterprise}</span>家</span>
                <span style="color: #FFFFFF;">人才总数:</span>
                <span style="color: #FFFFFF;"><span style="color: #FF8C00; font-weight: bold; font-size: 14px;">${item.talents}</span>人</span>
              </div>
            </div>
          `;
        },
      },
      series: [
        {
          name: mapType,
          type: 'map',
          map: mapType,
          roam: false,
          center: center,
          zoom: zoom,
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicOut',
          animationDurationUpdate: 1000,
          animationEasingUpdate: 'cubicInOut',
          itemStyle: {
            areaColor: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3A64AD' },   // 顶部中蓝色
                { offset: 1, color: '#1A3A6A' }    // 底部深蓝色
              ]
            },
            borderColor: '#4A79CE',
            borderWidth: 0.8,
            borderType: 'solid',
            shadowBlur: 12,
            shadowColor: 'rgba(41, 98, 255, 0.3)',
            shadowOffsetX: 0,
            shadowOffsetY: 1,
          },
          emphasis: {
            itemStyle: {
              areaColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#5A8FEF' },
                  { offset: 1, color: '#3A64AD' }
                ]
              },
              borderColor: '#FFFFFF',
              borderWidth: 2,
              shadowBlur: 20,
              shadowColor: '#2962FF',
            },
            label: {
              show: true,
              color: '#FFFFFF',
              fontSize: function() {
                // 根据容器宽度动态调整字体大小
                const containerWidth = chart?.getWidth() || 800;
                if (containerWidth < 600) return 10;
                if (containerWidth < 900) return 11;
                return 12;
              }(),
              fontWeight: 'bold',
              textShadow: '0 0 5px rgba(41, 98, 255, 0.8)',
            }
          },
          select: {
            itemStyle: {
              areaColor: '#4A79CE',
              borderColor: '#FFFFFF',
              borderWidth: 2,
              shadowBlur: 20,
              shadowColor: '#2962FF',
            },
          },
          label: {
            show: true,
            color: '#FFFFFF',
            fontSize: function() {
              // 根据容器宽度动态调整字体大小
              const containerWidth = chart?.getWidth() || 800;
              if (containerWidth < 600) return 8;
              if (containerWidth < 900) return 9;
              return 10;
            }(),
            fontWeight: 'normal',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
          },
        },
      ],
    };
  };

  useEffect(() => {
    if (!chartRef.current) return;

    if (echarts.getInstanceByDom(chartRef.current)) {
      echarts.getInstanceByDom(chartRef.current).dispose();
    }
    echarts?.registerMap('china', chinaGeoJson);
    
    if (isYichang) {
      echarts?.registerMap('yichang', yichangGeoJson);
      setYichangMapLoaded(true);
    }

    const myChart = echarts?.init(chartRef.current);
    setChart(myChart);

    if (isYichang) {
      myChart?.setOption(getMapOption('yichang', YICHANG_CENTER, 0.9));
    } else {
      myChart?.setOption(getMapOption('china', [104.0, 32.5], 1.4));
    }

    // 窗口大小自适应
    const handleResize = () => {
      // 根据窗口大小调整地图缩放比例
      let newZoom = mapZoom;
      if (window.innerWidth < 900) {
        newZoom = 1.0;
      } else if (window.innerWidth < 1200) {
        newZoom = 1.1;
      } else if (window.innerWidth < 1400) {
        newZoom = 1.2;
      } else if (window.innerWidth < 1600) {
        newZoom = 1.3;
      }
      
      const mapType = isYichang ? 'yichang' : 'china';
      const center = mapType === 'yichang' ? YICHANG_CENTER : [104.0, 32.5];
      
      myChart.setOption(getMapOption(mapType, center, newZoom));
      myChart.resize();

    };
    
    // 初始化时调用一次
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };

  }, []);

  useEffect(() => {
    if (!chart) return;
    
    // 如果是宜昌模式且地图未加载，则加载宜昌地图
    if (isYichang && !yichangMapLoaded) {
    loadYichangMap();
    }
    // 如果不是宜昌模式，切换回中国地图
    else if (!isYichang && yichangMapLoaded) {
      chart.setOption(getMapOption('china', [104.0, 32.5], 1.4));
      setCurrentMap('china');
    }

  }, [isYichang, chart, yichangMapLoaded]);

  useEffect(() => {
    if (!chart) return;
    
    const handleClick = params => {
      if (isYichang) return; 
      if (params.name === '湖北省' && currentMap === 'china') {
        loadYichangMap();
      }
    };

    chart.on('click', handleClick);
    return () => chart.off('click', handleClick);

  }, [chart, currentMap]);

  function loadYichangMap () {
    // 直接使用预导入的宜昌地图数据
    echarts.registerMap('yichang', yichangGeoJson);
    setYichangMapLoaded(true);
    chart.setOption(getMapOption('yichang', YICHANG_CENTER, 0.9));
    setCurrentMap('yichang');
  };

  function onClick () {
    chart.setOption(getMapOption('china', mapCenter, mapZoom));
    setCurrentMap('china');
  }

  function onCountryClick () {
    return currentMap === 'yichang' ? null : loadYichangMap()
  }

  return (
    <div className="echarts-map-container">
    <div className="map-bg-decor">
      <div className="bg-blur top-left"></div>
      <div className="bg-blur bottom-right"></div>
    </div>
    {!isYichang && (
      <div className="map-controls">
      <button 
        onClick={onClick}
        className={`map-btn ${currentMap === 'china' ? 'map-btn-active' : 'map-btn-inactive'}`}
        >
        全国视图
      </button>
      <button
        onClick={onCountryClick}
        disabled={currentMap === 'yichang'}
        className={`map-btn ${currentMap === 'yichang' ? 'map-btn-active-yichang' : 'map-btn-inactive'}`}
      >
        宜昌聚焦
      </button>
      </div>
    )}
    <div ref={chartRef} className="map-chart"></div>
</div>
  );
};

export default EChartsChinaMap;
