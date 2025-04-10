import React, { useState, useEffect, useRef } from "react";
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
} from "reactstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaEdit, FaArrowLeft } from "react-icons/fa";
import { templateAPI } from "../../services/api";

const widthCanvas = 900;

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [heightCanvas, setHeightCanvas] = useState(0);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await templateAPI.getTemplateById(id);
        setTemplate(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin template, vui lòng thử lại sau.");
        setLoading(false);
        console.error("Error fetching template:", err);
      }
    };

    fetchTemplate();
  }, [id]);

  useEffect(() => {
    if (template && template.background) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        setImageSize({
          width: img.width,
          height: img.height,
        });
        setHeightCanvas(widthCanvas * (img.height / img.width));
      };
      img.onerror = () => {
        console.error("Không thể tải hình nền");
      };
      img.src = template.background;
    }
  }, [template]);

  // Render canvas
  const renderCanvas = () => {
    if (!canvasRef.current || !backgroundImage || !template) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Thiết lập kích thước canvas
    canvas.width = widthCanvas;
    canvas.height = heightCanvas;

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ ảnh nền
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Vẽ các trường dữ liệu
    if (template.fields && template.fields.length > 0) {
      template.fields.forEach((field, index) => {
        const text = field.name || `Trường #${index + 1}`;

        // Đảm bảo fontSize là số
        const fontSize = Number(field.fontSize) || 16;

        // Tính toán các thuộc tính văn bản
        let fontStyle = "";
        if (field.isItalic) fontStyle += "italic ";
        if (field.isBold) fontStyle += "bold ";
        fontStyle += `${fontSize}px ${template.fontFamily}`;
        ctx.font = fontStyle;
        ctx.textAlign = field.textAlign;

        // Vẽ văn bản
        ctx.fillStyle = field.fontColor;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(text, field.x, field.y);

        // Vẽ điểm đánh dấu vị trí
        const pointSize = Math.max(4, Math.min(8, fontSize / 18));
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(field.x, field.y, pointSize, 0, 2 * Math.PI);
        ctx.fill();

        // Hiển thị số thứ tự field
        const indexFontSize = Math.max(12, Math.min(16, fontSize / 6));
        ctx.fillStyle = "rgba(0, 0, 100, 0.7)";
        ctx.font = `bold ${indexFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(
          `#${index + 1}`,
          field.x - indexFontSize * 1.5,
          field.y - indexFontSize
        );

        // Hiển thị thông tin vị trí
        const infoFontSize = Math.max(10, Math.min(12, fontSize / 6));
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.font = `${infoFontSize}px Arial`;
        ctx.textAlign = "left";
        ctx.fillText(
          `(${field.x}, ${field.y})`,
          field.x + 5,
          field.y + infoFontSize + 5
        );
      });
    }
  };

  // Vẽ canvas khi background image đã load
  useEffect(() => {
    renderCanvas();
  }, [backgroundImage, template, heightCanvas]);

  // Đảm bảo container có thể scroll khi canvas lớn hơn
  useEffect(() => {
    if (canvasContainerRef.current && backgroundImage) {
      canvasContainerRef.current.style.overflowY = "auto";
      canvasContainerRef.current.style.overflowX = "auto";
    }
  }, [backgroundImage]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải thông tin template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="alert alert-warning" role="alert">
        Không tìm thấy template.
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4>Chi tiết Template</h4>
        <div>
          <Button
            color="secondary"
            className="me-2"
            onClick={() => navigate("/templates")}
          >
            <FaArrowLeft className="me-1" /> Quay lại
          </Button>
          <Button
            color="primary"
            tag={Link}
            to={`/templates/edit/${template._id}`}
          >
            <FaEdit className="me-1" /> Chỉnh sửa
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="mb-4">
          <Col md={6}>
            <h5>Thông tin cơ bản</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <th width="30%">Tên template</th>
                  <td>{template.name}</td>
                </tr>
                <tr>
                  <th>Mô tả</th>
                  <td>{template.description || "Không có mô tả"}</td>
                </tr>
                <tr>
                  <th>Font chữ</th>
                  <td>{template.fontFamily}</td>
                </tr>
                <tr>
                  <th>Trạng thái</th>
                  <td>
                    {template.isActive ? (
                      <Badge color="success">Đang hoạt động</Badge>
                    ) : (
                      <Badge color="secondary">Không hoạt động</Badge>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Mặc định</th>
                  <td>
                    {template.isDefault ? (
                      <Badge color="info">Mặc định</Badge>
                    ) : (
                      "Không"
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Ngày tạo</th>
                  <td>
                    {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
                <tr>
                  <th>Cập nhật lần cuối</th>
                  <td>
                    {new Date(template.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
                <tr>
                  <th>Kích thước ảnh</th>
                  <td>
                    {backgroundImage
                      ? `${imageSize.width} x ${imageSize.height} px`
                      : "Chưa có ảnh nền"}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h5>Preview Template</h5>
            <div className="template-preview-container">
              {template.background ? (
                <div ref={canvasContainerRef} className="canvas-container">
                  <canvas
                    ref={canvasRef}
                    width={widthCanvas}
                    height={heightCanvas}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: "100%",
                    }}
                  ></canvas>
                  <div className="field-info mt-2">
                    <p className="mb-0">
                      <strong>Kích thước thực:</strong> {imageSize.width} x{" "}
                      {imageSize.height} px
                    </p>
                  </div>
                </div>
              ) : (
                <div className="alert alert-light text-center p-5">
                  <p>Không có hình nền</p>
                </div>
              )}
            </div>
          </Col>
        </Row>

        <h5 className="mt-4 mb-3">Danh sách trường dữ liệu</h5>
        {template.fields && template.fields.length > 0 ? (
          <Table bordered responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên trường</th>
                <th>Vị trí (X, Y)</th>
                <th>Cỡ chữ</th>
                <th>Màu chữ</th>
                <th>Căn chỉnh</th>
                <th>Định dạng</th>
              </tr>
            </thead>
            <tbody>
              {template.fields.map((field, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{field.name}</td>
                  <td>
                    ({field.x}, {field.y})
                  </td>
                  <td>{field.fontSize}px</td>
                  <td>
                    <div
                      className="color-sample"
                      style={{
                        backgroundColor: field.fontColor,
                        width: "20px",
                        height: "20px",
                        display: "inline-block",
                        marginRight: "8px",
                        border: "1px solid #ddd",
                        verticalAlign: "middle",
                      }}
                    ></div>
                    {field.fontColor}
                  </td>
                  <td>
                    {field.textAlign === "left"
                      ? "Trái"
                      : field.textAlign === "center"
                      ? "Giữa"
                      : "Phải"}
                  </td>
                  <td>
                    {field.isBold && (
                      <Badge color="dark" className="me-1">
                        Đậm
                      </Badge>
                    )}
                    {field.isItalic && <Badge color="dark">Nghiêng</Badge>}
                    {!field.isBold && !field.isItalic && "Thường"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="alert alert-warning">
            Không có trường dữ liệu nào được xác định.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TemplateDetail;
