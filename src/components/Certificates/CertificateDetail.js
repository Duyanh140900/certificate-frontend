import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Badge,
  Row,
  Col,
  Table,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaDownload,
  FaArrowLeft,
  FaBan,
  FaQrcode,
  FaImage,
} from "react-icons/fa";
import { certificateAPI } from "../../services/api";

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await certificateAPI.getCertificateById(id);
        setCertificate(response.data.data);

        // Fetch preview image
        fetchPreviewImage();

        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin chứng chỉ, vui lòng thử lại sau.");
        setLoading(false);
        console.error("Error fetching certificate:", err);
      }
    };

    fetchCertificate();

    // Cleanup function to revoke any URLs
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [id]);

  const fetchPreviewImage = async () => {
    setPreviewLoading(true);
    try {
      // Gọi API để lấy hình ảnh preview chứng chỉ
      const previewResponse = await certificateAPI.getImagePreview(id);

      // Tạo URL từ dữ liệu blob hình ảnh
      const blob = new Blob([previewResponse.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setPreviewSrc(url);
    } catch (err) {
      console.error("Error fetching certificate image preview:", err);
      // Nếu không lấy được hình ảnh, thử lấy PDF và chuyển đổi
      try {
        const pdfResponse = await certificateAPI.previewCertificate(id);
        const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPreviewSrc(url);
      } catch (previewError) {
        console.error("Error fetching certificate preview:", previewError);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await certificateAPI.downloadCertificate(id);

      // Tạo blob từ dữ liệu PDF
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Tạo URL và download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      alert("Không thể tải chứng chỉ, vui lòng thử lại sau.");
    }
  };

  const handleDownloadImage = async () => {
    try {
      // Sử dụng previewSrc hiện tại nếu là hình ảnh
      if (previewSrc) {
        const link = document.createElement("a");
        link.href = previewSrc;
        link.setAttribute("download", `${certificate.certificateId}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Error downloading certificate image:", err);
      alert("Không thể tải hình ảnh chứng chỉ, vui lòng thử lại sau.");
    }
  };

  const handleRevoke = async () => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi chứng chỉ này không?")) {
      try {
        await certificateAPI.revokeCertificate(id);
        // Cập nhật trạng thái
        setCertificate((prev) => ({ ...prev, status: "revoked" }));
      } catch (err) {
        console.error("Error revoking certificate:", err);
        alert("Không thể thu hồi chứng chỉ, vui lòng thử lại sau.");
      }
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

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleImagePreview = () => setImagePreviewOpen(!imagePreviewOpen);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải thông tin chứng chỉ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="my-3">
        {error}
      </Alert>
    );
  }

  if (!certificate) {
    return (
      <Alert color="warning" className="my-3">
        Không tìm thấy chứng chỉ.
      </Alert>
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateId}`;

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4>Chi tiết Chứng chỉ</h4>
        <div>
          <Button
            color="secondary"
            className="me-2"
            onClick={() => navigate("/certificates")}
          >
            <FaArrowLeft className="me-1" /> Quay lại
          </Button>
          {certificate.status !== "revoked" &&
            certificate.status !== "processing" && (
              <>
                <Button
                  color="success"
                  className="me-2"
                  onClick={handleDownload}
                >
                  <FaDownload className="me-1" /> Tải PDF
                </Button>
                {previewSrc && (
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={handleDownloadImage}
                  >
                    <FaImage className="me-1" /> Tải ảnh
                  </Button>
                )}
                <Button color="info" className="me-2" onClick={toggleModal}>
                  <FaQrcode className="me-1" /> Mã xác thực
                </Button>
                <Button color="danger" onClick={handleRevoke}>
                  <FaBan className="me-1" /> Thu hồi
                </Button>
              </>
            )}
        </div>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md={6}>
            <h5 className="mb-3">Thông tin chứng chỉ</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <th width="35%">ID Chứng chỉ</th>
                  <td>{certificate.certificateId}</td>
                </tr>
                <tr>
                  <th>Trạng thái</th>
                  <td>{getStatusBadge(certificate.status)}</td>
                </tr>
                <tr>
                  <th>Ngày cấp</th>
                  <td>
                    {new Date(certificate.issueDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                </tr>
                {certificate.expiryDate && (
                  <tr>
                    <th>Ngày hết hạn</th>
                    <td>
                      {new Date(certificate.expiryDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                  </tr>
                )}
                {certificate.issuedBy && (
                  <tr>
                    <th>Người cấp</th>
                    <td>{certificate.issuedBy}</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <h5 className="mt-4 mb-3">Thông tin học viên</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <th width="35%">Mã học viên</th>
                  <td>{certificate.studentId}</td>
                </tr>
                <tr>
                  <th>Họ tên</th>
                  <td>{certificate.studentName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{certificate.studentEmail}</td>
                </tr>
              </tbody>
            </Table>

            <h5 className="mt-4 mb-3">Thông tin khóa học</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <th width="35%">Mã khóa học</th>
                  <td>{certificate.courseId}</td>
                </tr>
                <tr>
                  <th>Tên khóa học</th>
                  <td>{certificate.courseName}</td>
                </tr>
              </tbody>
            </Table>

            {certificate.fieldValues &&
              Object.keys(certificate.fieldValues).length > 0 && (
                <>
                  <h5 className="mt-4 mb-3">Thông tin bổ sung</h5>
                  <Table bordered>
                    <tbody>
                      {Object.entries(certificate.fieldValues).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <th width="35%">{key}</th>
                            <td>{value}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                </>
              )}
          </Col>
          <Col md={6}>
            <h5 className="mb-3">Xem trước chứng chỉ</h5>
            {previewLoading ? (
              <div className="text-center p-5 border rounded">
                <Spinner color="primary" />
                <p className="mt-2">Đang tải xem trước...</p>
              </div>
            ) : previewSrc ? (
              <div className="text-center border rounded p-2">
                <div className="position-relative">
                  <img
                    src={previewSrc}
                    alt="Certificate Preview"
                    className="img-fluid"
                    style={{ maxHeight: "500px", cursor: "pointer" }}
                    onClick={toggleImagePreview}
                  />
                  <div
                    className="position-absolute"
                    style={{
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={toggleImagePreview}
                  >
                    <FaImage className="me-1" /> Phóng to
                  </div>
                </div>
              </div>
            ) : (
              <Alert color="light" className="text-center">
                Không thể tải xem trước chứng chỉ
              </Alert>
            )}

            <div className="mt-4">
              <h5 className="mb-3">Xác thực chứng chỉ</h5>
              <Card body className="bg-light">
                <p>
                  Sử dụng ID chứng chỉ sau để xác thực tính hợp lệ của chứng
                  chỉ:
                </p>
                <div className="bg-white p-2 border rounded text-center mb-2">
                  <code className="fs-5">{certificate.certificateId}</code>
                </div>
                <p className="mb-0">
                  Hoặc truy cập liên kết sau để xác thực trực tiếp:
                </p>
                <div className="bg-white p-2 border rounded text-break mb-2">
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {verificationUrl}
                  </a>
                </div>
                <Button
                  color="info"
                  size="sm"
                  onClick={toggleModal}
                  className="d-flex align-items-center mx-auto"
                >
                  <FaQrcode className="me-1" /> Hiển thị mã QR
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </CardBody>

      {/* Modal QR Code */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Mã QR xác thực chứng chỉ</ModalHeader>
        <ModalBody className="text-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              verificationUrl
            )}`}
            alt="QR Code"
            className="img-fluid"
          />
          <p className="mt-3">Quét mã QR này để xác thực chứng chỉ</p>
          <div className="bg-light p-2 border rounded text-break mt-2">
            <small>{verificationUrl}</small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Đóng
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal hình ảnh phóng to */}
      <Modal isOpen={imagePreviewOpen} toggle={toggleImagePreview} size="lg">
        <ModalHeader toggle={toggleImagePreview}>Xem chứng chỉ</ModalHeader>
        <ModalBody className="text-center p-0">
          <img
            src={previewSrc}
            alt="Certificate Full Preview"
            className="img-fluid"
            style={{ width: "100%" }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleDownloadImage}>
            <FaDownload className="me-1" /> Tải hình ảnh
          </Button>
          <Button color="secondary" onClick={toggleImagePreview}>
            Đóng
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default CertificateDetail;
