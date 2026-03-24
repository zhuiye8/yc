/**
 * @input EChartsChinaMap, Header, Bottom from '../../components', Indicator/EnterPrise/Distribution/ChainTalent from './components', { useNavigate }
 * @output { Industry } 大屏产业布局页组件
 * @position 大屏产业页入口，组合地图 + 指标/企业/分布/人才四个子组件
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import './industry.scss'
import EChartsChinaMap from "../../components/map";
import Header from "../../components/header";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import Indicator from "./components/indicator";
import EnterPrise from './components/enterprise';
import Distribution from './components/distribution';
import ChainTalent from './components/talent';

function Industry() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/screen/industry" },
        { name: "人才总览", url: "/screen/talent" },
        { name: "创新资源", url: "/screen" },
        { name: "资金概览", url: "/screen" },
        { name: "政策全景", url: "/screen" },
    ]
    const items = [
        '湿电子化学品','新能源电池','化学制药','合成生物','船舶制造','人工智能'
    ]
    function handleClick(url) {
        return navigate(url)
    }
    return (
        <div className="container industry-container">
        <Header />

        <div className="main-content">
            <div className="left-column">
                <div className="industry-top">
                    <div className="industry-items">
                        {items.map((item, index) => (
                            <div key={index} className="industry-item">
                                {item}
                            </div>
                        ))}
                    </div>                    
                </div>
                <div className="left-middle">
                    <div className='left-middle-title'></div>
                    <Indicator/>
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <EnterPrise />
                </div>
            </div>

            <div className="middle-column">
                <div className="middle-top">
                    {
                        tabs.map((item, index) => {
                            return (
                                <span 
                                className="tab-item" key={index} 
                                onClick={() => handleClick(item.url)}
                                >
                                    {item.name}
                                </span>
                            )
                        })
                    }
                </div>

                <div className="middle-center">
                    <div className="map-container">
                    <EChartsChinaMap />
                    </div>
                </div>
            </div>

            <div className="right-column industry-right">
                
                <div className="right-middle industry-middle">
                    <div className='right-middle-title'></div>
                    <ChainTalent />
                </div>
                <div className="right-bottom industry-bottom">
                    <div className='right-bottom-title'></div>
                    <Distribution />
                </div>
            </div>
        </div>
        <Bottom onReturnHome={() => handleClick('/screen')}/>
        </div>
    );
}

export default Industry;