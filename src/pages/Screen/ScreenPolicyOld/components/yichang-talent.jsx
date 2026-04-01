import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

function YichangTalent({className}) {
    return (
        <Grid container className={className}>
            <Grid item className='content-container'>
                <div className='policy-section'>
                    <div className='section-title'>引进类政策：</div>
                    <div className='section-content'>
                        安家费、购房补贴、租房补贴、落户便利、薪酬激励、引才奖励（给用人单位或中介）。
                    </div>
                </div>

                <div className='policy-section'>
                    <div className='section-title'>保障类政策：</div>
                    <div className='section-content'>
                        <div className='subsection'>
                            <div className='subsection-title'>生活保障：</div>
                            <div className='subsection-content'>
                                人才公寓、共有产权房、医疗保障（绿色通道、体检）、子女教育（入学入园）、配偶安置（就业帮助）。
                            </div>
                        </div>
                        <div className='subsection'>
                            <div className='subsection-title'>人才安居：</div>
                            <div className='subsection-content'>
                                顶尖人才，奖励一套市属国有企业开发的不低于150平方米的住房。全职引进的A-C类人才，前2年可免费入住人才公寓；其他人才，按照标准发放现金购房补贴（D类及以上10万元、E类6万元、F类5万元）
                            </div>
                        </div>
                    </div>
                </div>

                <div className='policy-section'>
                    <div className='section-title'>培育类政策：</div>
                    <div className='section-content'>
                        培训补贴、继续教育支持、访问学者计划、博士后资助、青年人才项目、技能大师工作室、人才研修院。
                    </div>
                </div>
            </Grid>
        </Grid>
    );
}

const styles = {
    height: 'calc(100% - 44px)',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',


    '& .content-container': {
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) rgba(255,255,255,0.05)',

        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            '&:hover': {
                background: 'rgba(255,255,255,0.3)',
            },
        },
    },

    '& .policy-section': {
        marginBottom: '12px',
        
        '&:last-child': {
            marginBottom: 0,
        },
        
        '& .section-title': {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#00ffe4',
            marginBottom: '8px',
        },
        
        '& .section-content': {
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: '#FFFFFF',
            textAlign: 'justify',
            paddingLeft: '13px',
        },
    },

    '& .subsection': {
        marginBottom: '8px',
        
        '&:last-child': {
            marginBottom: 0,
        },
        
        '& .subsection-title': {
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#00c6ff',
        },
        
        '& .subsection-content': {
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'justify',
        },
    },


};

export default styled(YichangTalent)(styles);