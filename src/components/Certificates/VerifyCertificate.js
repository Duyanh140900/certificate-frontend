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
  Input,
  FormGroup,
  Label,
  Form,
  Alert,
  Table,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch, FaCheck, FaBan } from "react-icons/fa";
import { certificateAPI } from "../../services/api";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [verifyId, setVerifyId] = useState(certificateId || "");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  // Nếu đã có certificateId trong URL, tự động verify
  useEffect(() => {
    if (certificateId) {
      handleVerify();
    }
  }, [certificateId]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (!verifyId.trim()) {
      setError("Vui lòng nhập ID chứng chỉ để xác thực");
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setVerified(false);

    try {
      const response = await certificateAPI.verifyCertificate(verifyId);
      setCertificate(response.data.data);
      setVerified(true);
      setLoading(false);

      // Cập nhật URL nếu cần
      if (!certificateId) {
        navigate(`/verify/${verifyId}`, { replace: true });
      }
    } catch (err) {
      setError("Không tìm thấy chứng chỉ hoặc chứng chỉ đã bị thu hồi.");
      setLoading(false);
      console.error("Error verifying certificate:", err);
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

  return (
    <Card className="mb-4">
      <CardHeader>
        <h4>Xác thực Chứng chỉ</h4>
      </CardHeader>
      <CardBody>
        <Card className="mb-4">
          <CardBody className="bg-light">
            <Form onSubmit={handleVerify}>
              <Row className="align-items-end">
                <Col md={9}>
                  <FormGroup>
                    <Label for="certificateId">
                      Nhập ID chứng chỉ cần xác thực
                    </Label>
                    <Input
                      id="certificateId"
                      placeholder="VD: CERT-2023-ABCXYZ"
                      value={verifyId}
                      onChange={(e) => setVerifyId(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <Button
                    color="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <FaSearch className="me-1" />
                    )}{" "}
                    Xác thực
                  </Button>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>

        {error && (
          <Alert color="danger" className="mb-4">
            <div className="d-flex align-items-center">
              <FaBan className="me-2" size={20} />
              <div>{error}</div>
            </div>
          </Alert>
        )}

        {verified && certificate && (
          <>
            <Alert
              color={certificate.status === "revoked" ? "danger" : "success"}
              className="mb-4"
            >
              <div className="d-flex align-items-center">
                {certificate.status === "revoked" ? (
                  <>
                    <FaBan className="me-2" size={20} />
                    <div>
                      <strong>Chứng chỉ đã bị thu hồi.</strong> Chứng chỉ này
                      không còn hiệu lực.
                    </div>
                  </>
                ) : (
                  <>
                    <FaCheck className="me-2" size={20} />
                    <div>
                      <strong>Chứng chỉ hợp lệ!</strong> Thông tin chi tiết được
                      hiển thị bên dưới.
                    </div>
                  </>
                )}
              </div>
            </Alert>

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
                  </tbody>
                </Table>

                <h5 className="mt-4 mb-3">Thông tin học viên</h5>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th width="35%">Họ tên</th>
                      <td>{certificate.studentName}</td>
                    </tr>
                  </tbody>
                </Table>

                <h5 className="mt-4 mb-3">Thông tin khóa học</h5>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th width="35%">Tên khóa học</th>
                      <td>{certificate.courseName}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                {/* Phần này có thể hiển thị ảnh chứng chỉ hoặc trang để download nếu API hỗ trợ */}
                <div className="text-center p-4 border rounded mb-3">
                  <h5 className="mb-3">Chứng chỉ đã được xác thực</h5>
                  <div className="d-flex justify-content-center mb-3">
                    <div className="p-3 bg-success text-white rounded-circle">
                      <FaCheck size={50} />
                    </div>
                  </div>
                  <p className="lead">
                    {certificate.status === "revoked"
                      ? "Chứng chỉ này đã bị thu hồi và không còn giá trị."
                      : "Chứng chỉ này được phát hành chính thức và có giá trị."}
                  </p>
                </div>
                <Card body className="bg-light">
                  <h5>Lưu ý:</h5>
                  <ul>
                    <li>
                      Mọi thông tin về chứng chỉ đều có thể được xác thực công
                      khai.
                    </li>
                    <li>
                      Chứng chỉ chỉ có giá trị khi còn hiệu lực và không bị thu
                      hồi.
                    </li>
                    <li>
                      Để biết thêm thông tin chi tiết, vui lòng liên hệ với đơn
                      vị cấp chứng chỉ.
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default VerifyCertificate;
