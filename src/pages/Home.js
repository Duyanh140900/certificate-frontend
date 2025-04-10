import React from "react";
import { Card, CardBody, Button, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { FaFileAlt, FaCertificate, FaSearch } from "react-icons/fa";

const Home = () => {
  return (
    <div className="my-4">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Hệ thống Quản lý Chứng chỉ</h1>
        <p className="lead">
          Nền tảng hiện đại giúp tạo, quản lý và xác thực chứng chỉ một cách đơn
          giản và hiệu quả
        </p>
      </div>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <CardBody className="d-flex flex-column">
              <div className="text-center mb-4">
                <FaFileAlt size={48} className="text-primary" />
              </div>
              <h3 className="h4 text-center">Quản lý Template</h3>
              <p className="text-muted flex-grow-1">
                Tạo và quản lý các mẫu chứng chỉ với đầy đủ tùy chỉnh về giao
                diện, phông chữ và vị trí các trường thông tin.
              </p>
              <Button color="primary" tag={Link} to="/templates" block>
                Quản lý Template
              </Button>
            </CardBody>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <CardBody className="d-flex flex-column">
              <div className="text-center mb-4">
                <FaCertificate size={48} className="text-success" />
              </div>
              <h3 className="h4 text-center">Quản lý Chứng chỉ</h3>
              <p className="text-muted flex-grow-1">
                Tạo mới, xem và quản lý các chứng chỉ. Dễ dàng cấp chứng chỉ cho
                học viên với đầy đủ thông tin và tính bảo mật cao.
              </p>
              <Button color="success" tag={Link} to="/certificates" block>
                Quản lý Chứng chỉ
              </Button>
            </CardBody>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <CardBody className="d-flex flex-column">
              <div className="text-center mb-4">
                <FaSearch size={48} className="text-info" />
              </div>
              <h3 className="h4 text-center">Xác thực Chứng chỉ</h3>
              <p className="text-muted flex-grow-1">
                Xác thực tính hợp lệ của chứng chỉ thông qua mã chứng chỉ. Đảm
                bảo tính minh bạch và chống làm giả.
              </p>
              <Button color="info" tag={Link} to="/verify" block>
                Xác thực Chứng chỉ
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="bg-light mt-4">
        <CardBody>
          <Row>
            <Col lg={8}>
              <h3>Về hệ thống Quản lý Chứng chỉ</h3>
              <p>
                Hệ thống Quản lý Chứng chỉ là giải pháp toàn diện giúp các tổ
                chức giáo dục và đào tạo tạo, quản lý và xác thực chứng chỉ một
                cách hiệu quả. Hệ thống cung cấp các tính năng:
              </p>
              <ul>
                <li>Tạo và quản lý các mẫu chứng chỉ với nhiều tùy chỉnh</li>
                <li>
                  Phát hành chứng chỉ cho học viên với mã xác thực duy nhất
                </li>
                <li>Xác thực tính hợp lệ của chứng chỉ</li>
                <li>Theo dõi lịch sử và quản lý chứng chỉ đã phát hành</li>
              </ul>
            </Col>
            <Col
              lg={4}
              className="d-flex align-items-center justify-content-center"
            >
              <Button
                color="primary"
                size="lg"
                tag={Link}
                to="/certificates/new"
                className="mt-3 mt-lg-0"
              >
                Tạo Chứng chỉ Ngay
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home;
