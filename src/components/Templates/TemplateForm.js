import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Progress,
  Alert,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { templateAPI, uploadAPI } from "../../services/api";

const defaultField = {
  name: "",
  x: 0,
  y: 0,
  fontSize: 16,
  fontColor: "#000000",
  textAlign: "left",
  isBold: false,
  isItalic: false,
};

const widthCanvas = 900;

const TemplateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [heightCanvas, setHeightCanvas] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    background: "",
    fontFamily: "Helvetica",
    fields: [{ ...defaultField }],
    isDefault: false,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchTemplate = async () => {
        try {
          const response = await templateAPI.getTemplateById(id);
          const templateData = response.data.data;

          // Đảm bảo fields không bị null hoặc undefined
          if (!templateData.fields || templateData.fields.length === 0) {
            templateData.fields = [{ ...defaultField }];
          }

          setFormData(templateData);

          // Nếu có background, thiết lập preview
          if (templateData.background) {
            setPreviewImage(templateData.background);
          }

          setLoading(false);
        } catch (err) {
          setError("Không thể tải thông tin template, vui lòng thử lại sau.");
          setLoading(false);
          console.error("Error fetching template:", err);
        }
      };

      fetchTemplate();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (previewImage) {
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
      img.src = previewImage;
    }
  }, [previewImage]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên template là bắt buộc";
    }

    // Validate từng field trong fields
    const fieldErrors = formData.fields.map((field) => {
      const fieldError = {};
      if (!field.name.trim()) {
        fieldError.name = "Tên trường là bắt buộc";
      }
      return fieldError;
    });

    if (fieldErrors.some((fe) => Object.keys(fe).length > 0)) {
      newErrors.fields = fieldErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    // Xử lý đặc biệt cho fontSize, đảm bảo là số
    if (name === "fontSize") {
      const numValue = parseInt(value, 10);

      setFormData((prev) => {
        const updatedFields = [...prev.fields];
        updatedFields[index] = {
          ...updatedFields[index],
          [name]: isNaN(numValue) ? 16 : numValue,
        };
        return { ...prev, fields: updatedFields };
      });
      return;
    }

    setFormData((prev) => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        [name]: type === "checkbox" ? checked : value,
      };
      return { ...prev, fields: updatedFields };
    });
  };

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...defaultField }],
    }));
  };

  const removeField = (index) => {
    if (formData.fields.length > 1) {
      setFormData((prev) => {
        const updatedFields = [...prev.fields];
        updatedFields.splice(index, 1);
        return { ...prev, fields: updatedFields };
      });

      if (selectedField === index) {
        setSelectedField(null);
      } else if (selectedField > index) {
        setSelectedField(selectedField - 1);
      }
    }
  };

  // Upload background lên server
  const uploadBackgroundToServer = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setError(null);

    try {
      const response = await uploadAPI.uploadToMinIO(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });
      console.log(response.data.message);
      if (response.data && response.data.message) {
        setUploadSuccess(true);
        return response.data.message; // Trả về URL của file đã upload
      } else {
        throw new Error("Không nhận được URL từ server");
      }
    } catch (err) {
      console.error("Error uploading background:", err);
      setError(`Lỗi upload: ${err.message || "Không thể upload file"}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Hiển thị preview local trước
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, background: url }));
    setPreviewImage(url);
    setSelectedFile(null);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef is not set correctly.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      let backgroundUrl;
      if (selectedFile) {
        const uploadedUrl = await uploadBackgroundToServer(selectedFile);
        if (uploadedUrl) {
          backgroundUrl = uploadedUrl;
        } else {
          throw new Error("Không thể upload hình nền");
        }
      }

      // Cập nhật formData với URL background mới nếu cần
      const updatedFormData = {
        ...formData,
        background: backgroundUrl,
      };

      // Gọi API tạo hoặc cập nhật template
      if (isEditMode) {
        await templateAPI.updateTemplate(id, updatedFormData);
      } else {
        await templateAPI.createTemplate(updatedFormData);
      }

      navigate("/templates");
    } catch (err) {
      setError(
        `${
          err.message || "Đã xảy ra lỗi khi lưu template"
        }. Vui lòng thử lại sau.`
      );
      setSubmitting(false);
      console.error("Error saving template:", err);
    }
  };

  // Vẽ canvas với template và các trường
  const renderCanvas = () => {
    if (!canvasRef.current || !backgroundImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Thiết lập kích thước canvas bằng đúng kích thước của ảnh
    canvas.width = widthCanvas;
    canvas.height = heightCanvas;

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ ảnh nền
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Vẽ các trường dữ liệu
    formData.fields.forEach((field, index) => {
      const isSelected = selectedField === index;
      const text = field.name || `Trường #${index + 1}`;

      // Đảm bảo fontSize là số
      const fontSize = Number(field.fontSize) || 16;

      // Tính toán các thuộc tính văn bản
      let fontStyle = "";
      if (field.isItalic) fontStyle += "italic ";
      if (field.isBold) fontStyle += "bold ";
      fontStyle += `${fontSize}px ${formData.fontFamily}`;
      ctx.font = fontStyle;
      ctx.textAlign = field.textAlign;

      // Vẽ văn bản
      ctx.fillStyle = field.fontColor;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, field.x, field.y);
    });
  };

  // Kích hoạt vẽ canvas khi có thay đổi
  useEffect(() => {
    renderCanvas();
  }, [backgroundImage, formData, selectedField]);

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

  return (
    <Card className="mb-4">
      <CardHeader>
        <h4>{isEditMode ? "Chỉnh sửa Template" : "Tạo Template Mới"}</h4>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {uploadSuccess && (
          <Alert color="success" className="mb-3">
            Upload hình nền thành công!
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="name">Tên template</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  invalid={!!errors.name}
                />
                <FormFeedback>{errors.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="fontFamily">Font chữ</Label>
                <Input
                  type="select"
                  id="fontFamily"
                  name="fontFamily"
                  value={formData.fontFamily}
                  onChange={handleInputChange}
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="description">Mô tả</Label>
            <Input
              type="textarea"
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label for="background">Hình nền</Label>
            <div className="d-flex mb-2">
              <Button
                type="button"
                color="secondary"
                onClick={handleBrowseClick}
                disabled={isUploading}
              >
                Chọn file
              </Button>
              <Input
                type="file"
                name="file"
                id="imageUpload"
                innerRef={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <FormFeedback>{errors.background}</FormFeedback>

            {selectedFile && (
              <div className="mt-2 mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-2">File: {selectedFile.name}</div>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="mb-2">
                      {uploadProgress}%
                    </Progress>
                    <small>Đang tải lên...</small>
                  </div>
                )}
              </div>
            )}
          </FormGroup>

          <div className="template-preview-container mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Preview Template</h5>
            </div>

            {previewImage ? (
              <canvas
                ref={canvasRef}
                width={widthCanvas}
                height={heightCanvas}
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "100%",
                }}
              >
                <div className="field-info mt-2">
                  <p className="mb-0">
                    <strong>Hướng dẫn:</strong> Click vào canvas để đặt vị trí
                    trường dữ liệu. Click vào trường để chọn và di chuyển nó đến
                    vị trí mới.
                  </p>
                </div>
              </canvas>
            ) : (
              <div className="alert alert-light text-center p-5">
                <h6>Tải hình nền để xem preview template</h6>
              </div>
            )}
          </div>

          <Row className="mt-3 mb-2">
            <Col xs={6}>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />{" "}
                  Đặt làm template mặc định
                </Label>
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />{" "}
                  Kích hoạt template
                </Label>
              </FormGroup>
            </Col>
          </Row>

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Các trường dữ liệu</h5>
              <Button
                type="button"
                color="success"
                size="sm"
                onClick={addField}
              >
                Thêm trường
              </Button>
            </div>

            {formData.fields.map((field, index) => (
              <Card
                key={index}
                className={`mb-3 border ${
                  selectedField === index ? "border-primary" : ""
                }`}
                onClick={() => setSelectedField(index)}
              >
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <h6>Trường #{index + 1}</h6>
                    {formData.fields.length > 1 && (
                      <Button
                        type="button"
                        color="danger"
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>

                  <Row>
                    <Col md={12}>
                      <FormGroup>
                        <Label for={`field-name-${index}`}>Tên trường</Label>
                        <Input
                          id={`field-name-${index}`}
                          name="name"
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, e)}
                          invalid={
                            errors.fields &&
                            errors.fields[index] &&
                            errors.fields[index].name
                          }
                        />
                        {errors.fields &&
                          errors.fields[index] &&
                          errors.fields[index].name && (
                            <FormFeedback>
                              {errors.fields[index].name}
                            </FormFeedback>
                          )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for={`field-x-${index}`}>Vị trí X</Label>
                        <Input
                          type="number"
                          id={`field-x-${index}`}
                          name="x"
                          value={field.x}
                          onChange={(e) => handleFieldChange(index, e)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for={`field-y-${index}`}>Vị trí Y</Label>
                        <Input
                          type="number"
                          id={`field-y-${index}`}
                          name="y"
                          value={field.y}
                          onChange={(e) => handleFieldChange(index, e)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-fontSize-${index}`}>Cỡ chữ</Label>
                        <Input
                          type="number"
                          id={`field-fontSize-${index}`}
                          name="fontSize"
                          value={field.fontSize}
                          onChange={(e) => handleFieldChange(index, e)}
                          min="8"
                          max="500"
                          step="1"
                        />
                        <div className="text-muted small mt-1">
                          <span className="text-info">Gợi ý:</span> Tiêu đề lớn:
                          80-150px, Nội dung: 20-50px
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-fontColor-${index}`}>Màu chữ</Label>
                        <Input
                          type="color"
                          id={`field-fontColor-${index}`}
                          name="fontColor"
                          value={field.fontColor}
                          onChange={(e) => handleFieldChange(index, e)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-textAlign-${index}`}>
                          Căn chỉnh
                        </Label>
                        <Input
                          type="select"
                          id={`field-textAlign-${index}`}
                          name="textAlign"
                          value={field.textAlign}
                          onChange={(e) => handleFieldChange(index, e)}
                        >
                          <option value="left">Trái</option>
                          <option value="center">Giữa</option>
                          <option value="right">Phải</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="isBold"
                            checked={field.isBold}
                            onChange={(e) => handleFieldChange(index, e)}
                          />{" "}
                          In đậm
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="isItalic"
                            checked={field.isItalic}
                            onChange={(e) => handleFieldChange(index, e)}
                          />{" "}
                          In nghiêng
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="d-flex justify-content-end mt-4">
            <Button
              type="button"
              color="secondary"
              className="me-2"
              onClick={() => navigate("/templates")}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={submitting || isUploading}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" /> Đang lưu...
                </>
              ) : isEditMode ? (
                "Cập nhật"
              ) : (
                "Tạo template"
              )}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TemplateForm;
