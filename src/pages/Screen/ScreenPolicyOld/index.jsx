import './policy.scss'
import EChartsChinaMap from "../components/map";
import Header from "../components/header";
import Bottom from "../components/bottom";
import { useNavigate } from "react-router-dom";
import PolicyOverview from './components/policy-overview';
import YichangTalent from './components/yichang-talent';
import PolicyList from './components/policy-list';


function Policy() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/screen/industry" },
        { name: "人才总览", url: "/screen/talent" },
        { name: "创新资源", url: "/screen/innovation" },
        { name: "资金概览", url: "/screen/funds" },
        { name: "政策全景", url: "/screen/policy" },
    ]

    const customData = [
        { name: '西陵区', label: '西陵区', num: 168 },
        { name: '夷陵区', label: '夷陵区', num: 152 },
        { name: '伍家岗区', label: '伍家岗区', num: 138 },
        { name: '宜都市', label: '宜都市', num: 122 },
        { name: '枝江市', label: '枝江市', num: 113 },
        { name: '猇亭区', label: '猇亭区', num: 82 },
        { name: '点军区', label: '点军区', num: 61 },
        { name: '长阳土家族自治县', label: '长阳县', num: 91 },
        { name: '兴山县', label: '兴山县', num: 54 },
        { name: '当阳市', label: '当阳市', num: 103 },
        { name: '远安县', label: '远安县', num: 49 },
        { name: '秭归县', label: '秭归县', num: 78 },
        { name: '五峰土家族自治县', label: '五峰县', num: 45 }
    ]

    const tooltipFields = [
        { label: '政策总数', key: 'num', unit: '条' },
    ]

    function handleClick(url) {
        return navigate(url)
    }
    return (
        <div className="main-content policy-container">
        {/* <Header /> removed - provided by ScreenLayout */}

        <div className="main-content">

            <div className="left-column policy-left">
                <div className="left-top">
                    <div className='left-top-title'></div>
                    <PolicyOverview />
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <YichangTalent />
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
                    <EChartsChinaMap isYichang={true}
                    customData={customData}
                    tooltipFields={tooltipFields}
                    />
                    </div>
                </div>
            </div>

            <div className="right-column policy-right">
                <div className="right-top">
                    <div className='right-top-title'></div>
                    <PolicyList />
                    
                </div>


            </div>
        </div>
        {/* Bottom removed - provided by ScreenLayout */}
        </div>
    );
}

export default Policy;