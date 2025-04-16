import React, { useState, useEffect } from "react";
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
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { certificateAPI, templateAPI } from "../../services/api";

const CertificateForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [formData, setFormData] = useState({
    template: "",
    studentId: "",
    studentName: "",
    studentEmail: "",
    courseId: "",
    courseName: "",
    fieldValues: {},
  });

  const [errors, setErrors] = useState({});

  // Tải danh sách template
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateAPI.getAllTemplates({ isActive: true });
        setTemplates(response.data.data);
        setLoadingTemplates(false);

        // Nếu có template mặc định, chọn nó
        const defaultTemplate = response.data.data.find((t) => t.isDefault);
        if (defaultTemplate) {
          setFormData((prev) => ({ ...prev, template: defaultTemplate._id }));
          setSelectedTemplate(defaultTemplate);
        }
      } catch (err) {
        setError("Không thể tải danh sách template, vui lòng thử lại sau.");
        setLoadingTemplates(false);
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  // Xử lý khi thay đổi template
  useEffect(() => {
    if (formData.template) {
      const selected = templates.find((t) => t._id === formData.template);
      setSelectedTemplate(selected);

      // Khởi tạo fieldValues cho template được chọn
      if (selected && selected.fields) {
        const initialFieldValues = {};
        selected.fields.forEach((field) => {
          initialFieldValues[field.name] = "";
        });

        setFormData((prev) => ({
          ...prev,
          fieldValues: initialFieldValues,
        }));
      }
    }
  }, [formData.template, templates]);

  const validate = () => {
    const newErrors = {};

    if (!formData.template) {
      newErrors.template = "Vui lòng chọn một template";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Mã học viên là bắt buộc";
    }

    if (!formData.studentName.trim()) {
      newErrors.studentName = "Tên học viên là bắt buộc";
    }

    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = "Email học viên là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = "Email không hợp lệ";
    }

    if (!formData.courseId.trim()) {
      newErrors.courseId = "Mã khóa học là bắt buộc";
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = "Tên khóa học là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldValueChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await certificateAPI.createCertificate(formData);
      navigate(`/certificates/${response.data.data._id}`);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tạo chứng chỉ. Vui lòng thử lại sau.");
      setSubmitting(false);
      console.error("Error creating certificate:", err);
    }
  };

  if (loadingTemplates) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải danh sách template...</p>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h4>Tạo Chứng chỉ Mới</h4>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="template">Chọn Template</Label>
            <Input
              type="select"
              id="template"
              name="template"
              value={formData.template}
              onChange={handleInputChange}
              invalid={!!errors.template}
            >
              <option value="">-- Chọn template --</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} {template.isDefault ? "(Mặc định)" : ""}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.template}</FormFeedback>
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="studentId">Mã học viên</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  invalid={!!errors.studentId}
                  placeholder="VD: SV001"
                />
                <FormFeedback>{errors.studentId}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="studentName">Tên học viên</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  invalid={!!errors.studentName}
                  placeholder="VD: Nguyễn Văn A"
                />
                <FormFeedback>{errors.studentName}</FormFeedback>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="studentEmail">Email học viên</Label>
            <Input
              id="studentEmail"
              name="studentEmail"
              type="email"
              value={formData.studentEmail}
              onChange={handleInputChange}
              invalid={!!errors.studentEmail}
              placeholder="VD: student@example.com"
            />
            <FormFeedback>{errors.studentEmail}</FormFeedback>
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="courseId">Mã khóa học</Label>
                <Input
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  invalid={!!errors.courseId}
                  placeholder="VD: COURSE001"
                />
                <FormFeedback>{errors.courseId}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="courseName">Tên khóa học</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  invalid={!!errors.courseName}
                  placeholder="VD: Lập trình Web"
                />
                <FormFeedback>{errors.courseName}</FormFeedback>
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button
              type="button"
              color="secondary"
              className="me-2"
              onClick={() => navigate("/certificates")}
            >
              Hủy
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" /> Đang tạo...
                </>
              ) : (
                "Tạo chứng chỉ"
              )}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CertificateForm;
