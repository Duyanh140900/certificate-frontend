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

const defaultField = [
  {
    name: "courseName",
    title: "Cài đặt vị trí đặt tên khóa học",
    nameDisplay: "Tên khóa học",
    x: 0,
    y: 0,
    fontSize: 16,
    fontColor: "#000000",
    textAlign: "center",
    fontFamily: "Arial",
    isChoose: false,
  },
  {
    name: "studentName",
    title: "Cài đặt vị trí đặt tên học viên",
    nameDisplay: "Tên học viên",
    x: 0,
    y: 0,
    fontSize: 16,
    fontColor: "#000000",
    textAlign: "center",
    fontFamily: "Arial",
    isChoose: false,
  },
  {
    name: "timeComplete",
    title: "Cài đặt vị trí đặt ngày hoàn thành",
    nameDisplay: "Ngày hoàn thành",
    x: 0,
    y: 0,
    fontSize: 16,
    fontColor: "#000000",
    textAlign: "center",
    fontFamily: "Arial",
    isChoose: false,
  },
  {
    name: "infoCompany",
    title: "Cài đặt vị trí thông tin đơn vị",
    nameDisplay: "Thông tin đơn vị",
    x: 0,
    y: 0,
    fontSize: 16,
    fontColor: "#000000",
    textAlign: "center",
    fontFamily: "Arial",
    isChoose: false,
  },
];

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
  const [listFont, setListFont] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    background: "",
    fields: [...defaultField],
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

          console.log("templateData", templateData);

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

  useEffect(() => {
    getListFontFamily();
  }, []);

  const getListFontFamily = async () => {
    const response = await templateAPI.getListFonts();
    // return response.data.data;
    console.log("getListFontFamily", response.data.fonts);
    setListFont([{ name: "Arial", value: "Arial" }, ...response.data.fonts]);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên template là bắt buộc";
    }
    console.log("formData.background", formData.background);
    console.log("selectedField", selectedFile);

    if (!selectedFile && formData.background === "") {
      newErrors.background = "Hình nền là bắt buộc";
    }

    const fieldsChoose = formData.fields.filter((field) => field.isChoose);
    console.log("fieldsChoose", fieldsChoose);

    if (fieldsChoose.length === 0) {
      newErrors.fields = "Cần ít nhất một trường dữ liệu được chọn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loadFont = async (name, url) => {
    try {
      console.log("loadFont", name, `url(http://localhost:3001${url})`);

      const font = new FontFace(name, `url(http://localhost:3001${url})`);
      await font.load();
      document.fonts.add(font);
    } catch (error) {
      console.error("Error loading font:", error);
    }
  };

  const handleFieldChange = async (index, e) => {
    const { name, value, type, checked } = e.target;

    if (name === "fontFamily") {
      await loadFont(value, `/fonts/${value}.ttf`); // Tải font chữ khi thay đổi value); // Tải font chữ khi thay đổi
    }

    setFormData((prev) => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        [name]: type === "checkbox" ? checked : value,
      };
      // console.log("updatedFields", updatedFields);
      return { ...prev, fields: updatedFields };
    });
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
      const isSelected = field.isChoose;
      if (isSelected) {
        const text = field.nameDisplay || `Trường #${index + 1}`;

        // Đảm bảo fontSize là số
        const fontSize = Number(field.fontSize) || 16;
        const fontFamily = field.fontFamily || "Arial";

        // Tính toán các thuộc tính văn bản
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = field.textAlign;

        // console.log("ctx.fillStyle", field.fontColor);

        // Vẽ văn bản
        ctx.fillStyle = field.fontColor;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(text, field.x, field.y);
      }
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
            {/* <Col md={6}>
              <FormGroup>
                <Label for="fontFamily">Font chữ</Label>
                <Input
                  type="select"
                  id="fontFamily"
                  name="fontFamily"
                  value={formData.fontFamily}
                  onChange={handleInputChange}
                >
                  {listFont.map((font, index) => (
                    <option key={index} value={font.name}>
                      {font.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col> */}
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
            <div className="text-danger">{errors.background}</div>

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

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Các trường dữ liệu</h5>
              <div className="text-danger">{errors.fields}</div>
              {/* <Button
                type="button"
                color="success"
                size="sm"
                onClick={addField}
              >
                Thêm trường
              </Button> */}
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
                    <div className="d-flex align-items-center justify-content-center">
                      <Input
                        type="checkbox"
                        name="isChoose"
                        className="mt-0"
                        checked={field.isChoose}
                        onChange={(e) => handleFieldChange(index, e)}
                      />
                      <h6 className="mb-0 px-2">{field.title}</h6>
                    </div>
                  </div>

                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-y-${index}`}>Top</Label>
                        <Input
                          type="number"
                          id={`field-y-${index}`}
                          name="y"
                          value={field.y}
                          onChange={(e) => handleFieldChange(index, e)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-x-${index}`}>Left</Label>
                        <Input
                          type="number"
                          id={`field-x-${index}`}
                          name="x"
                          value={field.x}
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
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`field-fontSize-${index}`}>Cỡ chữ</Label>
                        <Input
                          type="number"
                          id={`field-fontSize-${index}`}
                          name="fontSize"
                          value={field.fontSize}
                          onChange={(e) => handleFieldChange(index, e)}
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
                        <Label for={`field-textAlign-${index}`}>Font</Label>
                        <Input
                          type="select"
                          id={`field-textAlign-${index}`}
                          name="fontFamily"
                          value={field.fontFamily}
                          onChange={(e) => handleFieldChange(index, e)}
                        >
                          {listFont.map((font, index) => (
                            <option key={index} value={font.name}>
                              {font.name}
                            </option>
                          ))}
                        </Input>
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
