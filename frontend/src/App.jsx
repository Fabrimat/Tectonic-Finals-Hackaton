import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./Landing.jsx";
import CustomerApp from "./apps/customer/CustomerApp.jsx";
import PartnerApp from "./apps/partner/PartnerApp.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<CustomerApp />} />
        <Route path="/partner/*" element={<PartnerApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
