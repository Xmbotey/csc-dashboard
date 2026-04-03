import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import InvestorList from './pages/InvestorList';
import InvestorDetail from './pages/InvestorDetail';
import V3Positions from './pages/V3Positions';
import Deltas from './pages/Deltas';
import Colaterales from './pages/Colaterales';
import Proyecciones from './pages/Proyecciones';
import Simulador from './pages/Simulador';
import TotalesCSC from './pages/TotalesCSC';

function AppRoutes() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/inversores" element={<InvestorList />} />
        <Route path="/inversores/:id" element={<InvestorDetail />} />
        <Route path="/posiciones-v3" element={<V3Positions />} />
        <Route path="/deltas" element={<Deltas />} />
        <Route path="/colaterales" element={<Colaterales />} />
        <Route path="/proyecciones" element={<Proyecciones />} />
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/totales-csc" element={<TotalesCSC />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
