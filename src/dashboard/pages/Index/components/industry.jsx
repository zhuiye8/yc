/**
 * @input MUI Grid, echarts, 背景图片
 * @output { Industry } 大屏首页产业模块子组件
 * @position 大屏首页子组件，展示链上企业总数 + 产业链 ECharts 环形图
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import img from '../../../assets/imgs/sum-left.png'
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Industry({className}) {
    const sumTitle = '链上企业总数'
    const sumValue = '154570'
    const chartRef = useRef(null);


    useEffect(() => {

        if(chartRef.current){
            const chart = echarts.init(chartRef.current);

            const containerWidth = chart.getWidth();

            const option = {
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    top: '15%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['强链', '弱链', '缺链'],
                    right: '5%',
                    top: '2%',
                    itemWidth: 10,
                    itemHeight: 10,
                    textStyle: {
                        fontSize: 12
                    }
                },
                xAxis: {
                    type: 'category',
                    data: ['湿电子化学品', '新能源电池', '化学制药', '合成生物', '船舶制造', '人工智能'],
                    axisLabel: {
                        fontSize: 13,
                        color: '#ffffff',
                        rotate: 30,
                        interval: 0
                    },
                    axisLine: { show: true, lineStyle: { color: '#666' } },
                    axisTick: { show: false }
                },
                yAxis: {
                    type: 'value',
                    splitLine: { show: false },
                    axisLine: { show: true, lineStyle: { color: '#666' } },
                    axisLabel: {
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.7)'
                    }
                },
                series: [
                    {
                        name: '强链',
                        type: 'bar',
                        stack: 'total',
                        data: [3200, 1800, 1950, 500, 1300, 500],
                        itemStyle: {
                            color: '#28fab4ff',
                            borderRadius: [4, 4, 0, 0]
                        },
                        barWidth: 20
                    },
                    {
                        name: '弱链',
                        type: 'bar',
                        stack: 'total',
                        data: [2100, 1400, 600, 1200, 540, 460],
                        itemStyle: {
                            color: '#1890ff',
                            borderRadius: [4, 4, 0, 0]
                        },
                        barWidth: 20
                    },
                    {
                        name: '缺链',
                        type: 'bar',
                        stack: 'total',
                        data: [320, 400, 300, 280, 240, 600],
                        itemStyle: {
                            color: '#f5222d',
                            borderRadius: [4, 4, 0, 0]
                        },
                        barWidth: 20
                    }
                ]
            };

            chart.setOption(option);

            const handleResize = () => {
                const containerWidth = chart.getWidth();
                // 根据容器宽度调整字体大小和柱宽
                const legendFontSize = containerWidth < 600 ? 10 : 12;
                const xAxisFontSize = containerWidth < 600 ? 10 : 13;
                const yAxisFontSize = containerWidth < 600 ? 9 : 11;
                const barWidth = containerWidth < 600 ? 12 : 20;

                chart.setOption({
                    legend: {
                        ...option.legend,
                        textStyle: {
                            fontSize: legendFontSize
                        }
                    },
                    xAxis: {
                        ...option.xAxis,
                        axisLabel: {
                            ...option.xAxis.axisLabel,
                            fontSize: xAxisFontSize
                        }
                    },
                    yAxis: {
                        ...option.yAxis,
                        axisLabel: {
                            ...option.yAxis.axisLabel,
                            fontSize: yAxisFontSize
                        }
                    },
                    series: option.series.map(series => ({
                        ...series,
                        barWidth: barWidth
                    }))
                });

                chart.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.dispose();
            };

        }

    })

    return <Grid container className={className}>
        <Grid item size={12}>
            <Grid container >
                <Grid item size={4} className='img'>
                    <img src={img} alt=""/>
                </Grid>
                <Grid item size={8}>
                    <div className='sum'>
                        <div className='sum-title'>{sumTitle}</div>
                        <div className='sum-value'>{sumValue}</div>
                    </div>
                </Grid>
            </Grid>
        </Grid>
        <Grid item size={12} className='chart' >
            <div ref={chartRef} />
        </Grid>
    </Grid>
}

const styles ={

    height: 'calc(100% - 40px)',
    display: 'flex',
    flexDirection: 'column',

    '@media screen and (max-width: 1920px)': {
        fontSize: '16px',
    },
    '@media screen and (max-width: 1680px)': {
        fontSize: '14px',
    },
    '@media screen and (max-width: 1440px)': {
        fontSize: '12px',
    },
    '@media screen and (max-width: 1366px)': {
        fontSize: '11px',
    },
    '@media screen and (max-width: 1280px)': {
        fontSize: '10px',
    },
    '& .img': {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
            height: 'auto',
            maxHeight: '100px',
            width: '100%',
            maxWidth: '140px',
            objectFit: 'contain',
            
            '@media screen and (max-width: 1440px)': {
                maxHeight: '80px',
                maxWidth: '100px',
            },
            '@media screen and (max-width: 1280px)': {
                maxHeight: '70px',
                maxWidth: '90px',
            },
        },
    },
    
    '& .sum': {
        padding: '0.375rem', // 6px转为rem
        '@media screen and (max-width: 1440px)': {
            padding: '0.25rem',
        },
    },
    '& .sum-title': {
        color: '#fff',
        lineHeight: 1.2,
        padding: '0.25rem',
        fontWeight: 'bold',
        fontSize: '1.2em',
        
        '@media screen and (max-width: 1440px)': {
            fontSize: '1em',
        },
        '@media screen and (max-width: 1280px)': {
            fontSize: '0.9em',
        },
    },
    '& .sum-value': {
        fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        background: 'linear-gradient(135deg, #f8d06bff 0%, #FF8A00 100%)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 2px 4px rgba(255, 138, 0, 0.2)',
        padding: '0.25rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        
        '@media screen and (max-width: 1440px)': {
            fontSize: 'clamp(1rem, 3.5vw, 1.8rem)',
        },
    },
    '& .chart': {
        flex: '1 1 0',
        minHeight: 0,
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
    },
    '& .chart > div': {
        width: '100%!\important',
        height: '100%!\important'
    }
}

export default styled(Industry)(styles)