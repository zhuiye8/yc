import { Grid2 as Grid, Icon } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import img from '../../../assets/imgs/policy-bottom.png'

function Policy({className}) {
    // 政策数据
    const policyData = {
        total: '134条',
        totalLabel: '政策总数',
        items: [
            { name: '人才政策数', value: '44' },
            { name: '可申报政策数', value: '56' },
            { name: '到期政策数', value: '4' }
        ]
    };

    return (
        <Grid container className={className}>
            <Grid item className='policy-left'>
                <div className='policy-sum'>
                    <div className='total-number'>{policyData.total}</div>
                    <div className='total-label'>{policyData.totalLabel}</div>
                </div>
                <div className='img'>
                     <img src={img} alt="政策图标"/>
                </div>
            </Grid>

            {/* 右侧区域 - 政策列表 */}
            <Grid item className='policy-right'>
                {policyData.items.map((item, index) => (
                    <div key={index} className='policy-item'>
                        <span className='policy-name'>{item.name}</span>
                        <span className='policy-value-wrapper'>
                            <span className='policy-value'>{item.value}</span>
                            <span className='policy-unit'>条</span>
                        </span>
                        
                    </div>
                ))}
            </Grid>
        </Grid>
    );
}

const styles = {
    overflow: 'hidden',
    height: 'calc(100% - 40px)',
    width: '100%',
    overflow: 'hidden',
    '& .policy-left': {
        width: '40%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
            // 左侧上半部分
        '& .policy-sum': {
            textAlign: 'center',
            paddingTop: '24px',
            '& .total-number': {
                fontSize: '32px',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '4px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',

                '@media screen and (max-width: 1920px)': {
                    fontSize: '32px',
                },
                '@media screen and (max-width: 1680px)': {
                    fontSize: '24px',
                },
                '@media screen and (max-width: 1440px)': {
                    fontSize: '18px',
                },
                '@media screen and (max-width: 1366px)': {
                    fontSize: '16px',
                },
                '@media screen and (max-width: 1280px)': {
                    fontSize: '12px',
                },
            },
            '& .total-label': {
                fontSize: '14px',
                color: '#B0C4DE',
                letterSpacing: '0.5px'
            },
        },
        // 左侧下半部分 - 图片区域
        '& .img': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
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
                    maxHeight: '48px',
                    maxWidth: '60px',
                },
            }
        },
    },

    '& .policy-right': {
        width: '60%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8px',
        // 右侧样式
        '& .policy-item': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(176, 196, 222, 0.15)',
            '&:last-child': {
                borderBottom: 'none'
            },
            '& .policy-name': {
                fontSize: '15px',
                color: '#FFFFFF',
                fontWeight: 400
            },
            '& .policy-value-wrapper': {
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                letterSpacing: '1px',
                '& .policy-value': {
                    fontSize: '18px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }
            },


        },
    },




};

export default styled(Policy)(styles);