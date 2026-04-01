import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Hotspot({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const treemapData = {
        name: '技术分类',
        children: [
            { 
                name: '石油、煤气及炼焦工业...', 
                value: 18,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#8B5CF6' },
                            { offset: 1, color: '#3B82F6' }
                        ]
                    }
                }
            },
            { 
                name: '无机化学', 
                value: 10,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#1E3A8A' },
                            { offset: 1, color: '#60A5FA' }
                        ]
                    }
                }
            },
            { 
                name: '水、废水...', 
                value: 10,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: '#F472B6' },
                            { offset: 1, color: '#F9A8D4' }
                        ]
                    }
                }
            },
            { 
                name: '液体变溶式机械：液体..', 
                value: 14,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#06B6D4' },
                            { offset: 1, color: '#2DD4BF' }
                        ]
                    }
                }
            },
            { 
                name: '一般的物理或化学的方法', 
                value: 6,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#FCD34D' },
                            { offset: 1, color: '#FDE047' }
                        ]
                    }
                }
            }
        ]
    };

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
                    return `${params.name}<br/>数量: ${params.value}`;
                }
            },
            series: [
                {
                    type: 'treemap',
                    data: treemapData.children,
                    label: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return `${params.name}\n${params.value}`;
                        },
                        fontSize: 12,
                        color: '#FFFFFF',
                        fontWeight: 400,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    },
                    itemStyle: {
                        borderColor: '#0A0F1A',
                        borderWidth: 2,
                        gapWidth: 2,
                        borderRadius: 4
                    },
                    levels: [
                        {
                            itemStyle: {
                                borderColor: '#0A0F1A',
                                borderWidth: 2,
                                gapWidth: 2
                            }
                        }
                    ],
                    roam: false,
                    nodeClick: false,
                    breadcrumb: {
                        show: false
                    }
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
    padding: '4px', 
    
    '& .chart-container': {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    

};

export default styled(Hotspot)(styles);