import './App.scss';
import { BrowserRouter, Routes, Route,  } from 'react-router-dom';
import Talent from './pages/talent/talent';
import Innovation from './pages/innovation/innovation';
import Funds from './pages/funds/funds';
import Policy from './pages/policy/policy';
import Home from './pages/Index';
import Industry from './pages/industry/industry';

function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/industry' element={<Industry />} />
        <Route path='/talent' element={<Talent />} />
        <Route path='/innovation' element={<Innovation />} />
        <Route path='/funds' element={<Funds />} />
        <Route path='/policy' element={<Policy />} />
      </Routes>
     </BrowserRouter>
  );
}

export default App;
