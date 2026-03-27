/**
 * @input MUI Grid, echarts
 * @output { Classification } 人才分类 ECharts 环形图组件
 * @position 大屏人才页子组件，展示领军/技能/创新人才分类分布
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

import { classificationData } from '../../../data/realData';

function Classification({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const talentData = classificationData;

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    return `${params.name}: ${params.value}人`;
                }
            },
            legend: {
                show: false
            },
            series: [
                {
                    name: '人才分类',
                    type: 'pie',
                    radius: ['15%', '80%'],
                    center: ['50%', '50%'],
                    roseType: 'area',
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 0,
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderWidth: 1
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: function(params) {
                            // 根据不同的数据返回不同的标签格式
                            if (params.name === '创新人才' && params.value === 23146) {
                                return `创新人才 23146人`;
                            } else if (params.name === '技能人才') {
                                return `技能人才 12668人`;
                            } else {
                                return `领军人才 \n9668人`;
                            }
                        },
                        color: '#FFFFFF',
                        fontSize: 16,
                        lineHeight: 18,
                        fontWeight: 400,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    },
                    labelLine: {
                        show: true,
                        length: 10,
                        length2: 10,
                        smooth: true,
                        lineStyle: {
                            color: 'rgba(255,255,255,0.5)',
                            width: 1
                        }
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 10
                    },
                    data: [
                        {
                            value: talentData[0].value,
                            name: talentData[0].name,
                            itemStyle: { color: talentData[0].color }
                        },
                        {
                            value: talentData[1].value,
                            name: talentData[1].name,
                            itemStyle: { color: talentData[1].color }
                        },
                        {
                            value: talentData[2].value,
                            name: talentData[2].name,
                            itemStyle: { color: talentData[2].color }
                        }
                    ]
                }
            ]
        };
        
        chartInstance.current.setOption(option);
        
        const resizeObserver = new ResizeObserver(() => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        });
        
        resizeObserver.observe(chartRef.current);
        
        return () => {
            resizeObserver.disconnect();
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    return (
        <Grid container className={className}>
            <Grid item className='chart-container'>
                <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
            </Grid>
        </Grid>
    );
}

const styles = {
    height: 'calc(100% - 40px)',
    width: '100%',
    overflow: 'hidden',
    padding: '12px',
    
    '& .chart-container': {
        width: '100%',
        height: '100%',
        position: 'relative'
    }
};

export default styled(Classification)(styles);