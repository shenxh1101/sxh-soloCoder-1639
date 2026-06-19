import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import BouquetMaker from "@/pages/BouquetMaker";
import BouquetDetail from "@/pages/BouquetDetail";
import LossRecord from "@/pages/LossRecord";
import Reports from "@/pages/Reports";
import PurchaseSuggestion from "@/pages/PurchaseSuggestion";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/bouquet" element={<BouquetMaker />} />
          <Route path="/bouquet/:bouquetId" element={<BouquetDetail />} />
          <Route path="/loss" element={<LossRecord />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/purchase" element={<PurchaseSuggestion />} />
        </Route>
      </Routes>
    </Router>
  );
}
