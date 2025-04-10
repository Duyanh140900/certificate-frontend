import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, NavItem, NavLink, Container } from "reactstrap";

const AppNavbar = () => {
  const location = useLocation();

  // Kiểm tra đường dẫn hiện tại để highlight menu item tương ứng
  const isActive = (path) => {
    return location.pathname === path ? "active fw-bold" : "";
  };

  return (
    <Navbar color="dark" dark expand="md" className="mb-4">
      <Container>
        <Link className="navbar-brand" to="/">
          Hệ thống Quản lý Chứng chỉ
        </Link>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink
              tag={Link}
              to="/templates"
              className={isActive("/templates")}
            >
              Quản lý Template
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              tag={Link}
              to="/certificates"
              className={isActive("/certificates")}
            >
              Quản lý Chứng chỉ
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/verify" className={isActive("/verify")}>
              Xác thực Chứng chỉ
            </NavLink>
          </NavItem>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
