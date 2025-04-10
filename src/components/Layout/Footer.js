import React from "react";
import { Container } from "reactstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <Container className="text-center">
        <p className="mb-0">
          © {new Date().getFullYear()} - Hệ thống Quản lý Chứng chỉ
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
