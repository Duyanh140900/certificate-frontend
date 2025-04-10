import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Link } from "react-router-dom";
import { FaEye, FaPlus, FaDownload, FaUndo, FaBan } from "react-icons/fa";
import { certificateAPI } from "../../services/api";

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    studentId: "",
    courseId: "",
    status: "",
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      // Loại bỏ các giá trị filter rỗng
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      );

      const response = await certificateAPI.getCertificates(params);
      setCertificates(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách chứng chỉ, vui lòng thử lại sau.");
      setLoading(false);
      console.error("Error fetching certificates:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleResetFilters = () => {
    setFilters({
      studentId: "",
      courseId: "",
      status: "",
    });
    // Reset và tải lại danh sách
    setTimeout(fetchCertificates, 0);
  };

  const handleRevokeCertificate = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi chứng chỉ này không?")) {
      try {
        await certificateAPI.revokeCertificate(id);
        // Cập nhật trạng thái của chứng chỉ trong danh sách
        setCertificates(
          certificates.map((cert) =>
            cert._id === id ? { ...cert, status: "revoked" } : cert
          )
        );
      } catch (err) {
        setError("Không thể thu hồi chứng chỉ, vui lòng thử lại sau.");
        console.error("Error revoking certificate:", err);
      }
    }
  };

  const handleDownloadCertificate = async (id) => {
    try {
      const response = await certificateAPI.downloadCertificate(id);

      // Tạo blob từ dữ liệu PDF
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Tạo URL và download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      alert("Không thể tải chứng chỉ, vui lòng thử lại sau.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "processing":
        return <Badge color="warning">Đang xử lý</Badge>;
      case "generated":
        return <Badge color="success">Đã tạo</Badge>;
      case "sent":
        return <Badge color="info">Đã gửi</Badge>;
      case "revoked":
        return <Badge color="danger">Đã thu hồi</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải danh sách chứng chỉ...</p>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Danh sách Chứng chỉ</h4>
        <Button color="primary" tag={Link} to="/certificates/new">
          <FaPlus className="me-1" /> Tạo chứng chỉ mới
        </Button>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Card className="mb-3">
          <CardBody>
            <Form onSubmit={handleSearchSubmit}>
              <Row>
                <Col md={3}>
                  <FormGroup>
                    <Label for="studentId">Mã học viên</Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      value={filters.studentId}
                      onChange={handleFilterChange}
                      placeholder="Nhập mã học viên"
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="courseId">Mã khóa học</Label>
                    <Input
                      id="courseId"
                      name="courseId"
                      value={filters.courseId}
                      onChange={handleFilterChange}
                      placeholder="Nhập mã khóa học"
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="status">Trạng thái</Label>
                    <Input
                      type="select"
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="generated">Đã tạo</option>
                      <option value="sent">Đã gửi</option>
                      <option value="revoked">Đã thu hồi</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <div className="d-flex gap-2">
                    <Button type="submit" color="primary">
                      Tìm kiếm
                    </Button>
                    <Button
                      type="button"
                      color="secondary"
                      onClick={handleResetFilters}
                    >
                      <FaUndo /> Reset
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>

        {loading ? (
          <div className="text-center py-3">
            <Spinner size="sm" color="primary" />
            <span className="ms-2">Đang tải...</span>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center p-4">
            <p>Không có chứng chỉ nào được tìm thấy.</p>
            <Button color="primary" tag={Link} to="/certificates/new">
              Tạo chứng chỉ đầu tiên
            </Button>
          </div>
        ) : (
          <Table hover responsive className="mt-3">
            <thead>
              <tr>
                <th>ID Chứng chỉ</th>
                <th>Học viên</th>
                <th>Khóa học</th>
                <th>Ngày cấp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate._id}>
                  <td>{certificate.certificateId}</td>
                  <td>
                    <div>{certificate.studentName}</div>
                    <small className="text-muted">
                      {certificate.studentId}
                    </small>
                  </td>
                  <td>
                    <div>{certificate.courseName}</div>
                    <small className="text-muted">{certificate.courseId}</small>
                  </td>
                  <td>
                    {new Date(certificate.issueDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                  <td>{getStatusBadge(certificate.status)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        color="info"
                        size="sm"
                        title="Xem chi tiết"
                        tag={Link}
                        to={`/certificates/${certificate._id}`}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        color="success"
                        size="sm"
                        title="Tải xuống"
                        onClick={() =>
                          handleDownloadCertificate(certificate._id)
                        }
                        disabled={
                          certificate.status === "processing" ||
                          certificate.status === "revoked"
                        }
                      >
                        <FaDownload />
                      </Button>
                      {certificate.status !== "revoked" && (
                        <Button
                          color="danger"
                          size="sm"
                          title="Thu hồi"
                          onClick={() =>
                            handleRevokeCertificate(certificate._id)
                          }
                        >
                          <FaBan />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default CertificateList;
