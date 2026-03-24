import EChartsChinaMap from "../../components/map";
import Header from "../../components/header";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import Industry from "./components/industry";
import Talent from './components/talent';
import Funds from './components/funds';
import Innovation from './components/innovation';
import Policy from './components/policy';

function Home() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/industry" },
        { name: "人才总览", url: "/talent" },
        { name: "创新资源", url: "/" },//暂时没有
        { name: "资金概览", url: "/" },//暂时没有
        { name: "政策全景", url: "/" },//暂时没有
        // { name: "创新资源", url: "/innovation" },
        // { name: "资金概览", url: "/funds" },
        // { name: "政策全景", url: "/policy" },
    ]
    function handleClick(url) {
        return navigate(url)
    }
    return (
        <div className="container">
        <Header />

        <div className="main-content">
            <div className="left-column">
                <div className="left-middle">
                    <div className='left-middle-title'></div>
                    <Industry />
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <Talent />
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

            <div className="right-column">
                <div className="right-top">
                    <div className='right-top-title'></div>
                    <Innovation />
                </div>
                <div className="right-middle">
                    <div className='right-middle-title'></div>
                    <Funds />
                </div>
                <div className="right-bottom">
                    <div className='right-bottom-title'></div>
                    <Policy />
                </div>
            </div>
        </div>
        <Bottom onReturnHome={() => handleClick('/')} isHome={true}/>
        </div>
    );
}

export default Home;