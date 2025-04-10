import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";

// Templates
import TemplateList from "./components/Templates/TemplateList";
import TemplateForm from "./components/Templates/TemplateForm";
import TemplateDetail from "./components/Templates/TemplateDetail";

// Certificates
import CertificateList from "./components/Certificates/CertificateList";
import CertificateForm from "./components/Certificates/CertificateForm";
import CertificateDetail from "./components/Certificates/CertificateDetail";
import VerifyCertificate from "./components/Certificates/VerifyCertificate";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Templates */}
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/new" element={<TemplateForm />} />
          <Route path="/templates/edit/:id" element={<TemplateForm />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />

          {/* Certificates */}
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificates/new" element={<CertificateForm />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />

          {/* Verify */}
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route
            path="/verify/:certificateId"
            element={<VerifyCertificate />}
          />

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <div className="text-center my-5">
                <h2>404 - Không tìm thấy trang</h2>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
