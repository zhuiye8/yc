import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
const img = '/images/screen/sum-left.png'

function PolicyOverview({className}) {
    const sumTitle = '政策总数'
    const sumValue = '1256'

    const policyCards = [
        { name: '人才政策总数', value: '564条', bgImage: 'url(/src/assets/imgs/policy-card.png)' },
        { name: '产业政策总数', value: '332条', bgImage: 'url(/src/assets/imgs/policy-card.png)' },
        { name: '创新政策总数', value: '239条', bgImage: 'url(/src/assets/imgs/policy-card.png)' },
        { name: '资金政策总数', value: '121条', bgImage: 'url(/src/assets/imgs/policy-card.png)' }
    ];

    return (
        <Grid container className={className}>
            <Grid item size={12}>
                <Grid container>
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

            <Grid item size={12} className='cards-grid'>
                {policyCards.map((card, index) => (
                    <div key={index} className='stat-card'>
                        <div className='card-bg' style={{ backgroundImage: card.bgImage }} />
                        <div className='card-content'>
                            <div className='card-value'>{card.value}</div>
                            <div className='card-name'>{card.name}</div>
                        </div>
                    </div>
                ))}
            </Grid>
        </Grid>
    );
}

const styles = {
    height: 'calc(100% - 40px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',

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
        padding: '0.375rem',
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

    '& .cards-grid': {
        flex: 1,
        display: 'grid',
        gridTemplateRows: 'repeat(2, 1fr)',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        padding: '8px 4px',
        minHeight: 0,
        
        '@media screen and (max-width: 768px)': {
            gap: '8px',
            padding: '4px',
        },
    },

    '& .stat-card': {
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        // cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        
        // '&:hover': {
        //     transform: 'translateY(-2px)',
        //     boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        // },
        
        '& .card-bg': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
        },
        
        '& .card-content': {
            position: 'absolute',
            bottom: '35%',
            left: '0',
            right: '0',
            textAlign: 'center',
            zIndex: 2,
            padding: '0 8px',
            
            '& .card-value': {
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: 700,
                color: '#FFD700',
                lineHeight: 1.2,
                marginBottom: '4px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            },
            
            '& .card-name': {
                fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '18px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
        },
    },
};

export default styled(PolicyOverview)(styles);