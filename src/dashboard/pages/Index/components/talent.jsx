/**
 * @input MUI Grid, echarts, 背景图片
 * @output { Talent } 大屏首页人才模块子组件
 * @position 大屏首页子组件，展示人才总数 + 分类统计 + ECharts 柱状图
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import img from '../../../assets/imgs/sum-talent.png'
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Talent({className}) {
    const sumTitle = '人才总数'
    const sumValue = '490032'

    const datas = [
        { text: '宜昌籍人才总数', value: 23457 },
        { text: '领军人才总数', value: 1235 },
        { text: '创新人才总数', value: 41134 },
        { text: '紧缺人才', value: 2752 },
    ]
 
    return <Grid container className={className}>
        <Grid item size={12}>
            <Grid container className='header-container'>
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
        <Grid item size={12} className='talent-grid-container'>
            <Grid container className='talent-grid'>
                {
                    datas.map((item, index) => {
                        return <Grid item size={6} key={index} className='talent-item-wrapper'>
                            <Grid container className='talent-item-container'>
                                 <Grid item size={12}>
                                    <div className='talent-value'>{item.value}</div>
                                </Grid>
                                <Grid item size={12}>
                                    <div className='talent-text'>{item.text}</div>
                                </Grid>
                                <Grid item size={12} className='talent-item'></Grid>
                            </Grid>
                        </Grid>
                    })
                }
            </Grid>
        </Grid>
    </Grid>
}

const styles ={
    height:'calc(100% - 40px)',
    overflow: 'hidden',
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

    '& .header-container': {
        flexWrap: 'nowrap',
        '@media screen and (max-width: 768px)': {
            flexWrap: 'wrap',
        },
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
            maxWidth: '120px',
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

    '& .talent-grid-container': {
        flex: 1,
        overflow: 'hidden',
        marginTop: '0.5rem',
    },

    '& .talent-grid': {
        height: '100%',
    },

    '& .talent-item-wrapper': {
        height: '50%',
        padding: '0.25rem',
        
        '@media screen and (max-width: 768px)': {
            height: 'auto',
            minHeight: '120px',
        },
    },

    '& .talent-item-container': {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        
        '& .talent-text': {
            fontSize: '1rem',
            fontWeight: 'bold',
            lineHeight: 1.4,
            marginBottom: '0.25rem',
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 0.25rem',
            
            '@media screen and (max-width: 1440px)': {
                fontSize: '0.9rem',
            },
            '@media screen and (max-width: 1280px)': {
                fontSize: '0.8rem',
            },
        },

        '& .talent-value': {
            fontSize: '1.4rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1a73e8 0%, #64b5f6 100%)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            
            '@media screen and (max-width: 1440px)': {
                fontSize: '1.2rem',
            },
            '@media screen and (max-width: 1280px)': {
                fontSize: '1.1rem',
            },
        },

        '& .talent-item': {
            backgroundImage: "url('/src/assets/imgs/talent-item.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '75px',
            width: '100%',
            marginTop: 'auto',
            
            '@media screen and (max-width: 1440px)': {
                height: '50px',
            },
            // '@media screen and (max-width: 1280px)': {
            //     height: '50px',
            // },
            '@media screen and (max-width: 768px)': {
                height: '45px',
            },
        },
    },
}

export default styled(Talent)(styles);