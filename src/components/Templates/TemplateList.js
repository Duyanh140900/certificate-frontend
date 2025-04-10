import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { templateAPI } from "../../services/api";

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateAPI.getAllTemplates();
        setTemplates(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách template, vui lòng thử lại sau.");
        setLoading(false);
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa template này không?")) {
      try {
        await templateAPI.deleteTemplate(id);
        setTemplates(templates.filter((template) => template._id !== id));
      } catch (err) {
        setError("Không thể xóa template, vui lòng thử lại sau.");
        console.error("Error deleting template:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải danh sách template...</p>
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

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Danh sách Template</h4>
        <Button color="primary" tag={Link} to="/templates/new">
          <FaPlus className="me-1" /> Thêm template mới
        </Button>
      </CardHeader>
      <CardBody>
        {templates.length === 0 ? (
          <div className="text-center p-4">
            <p>Không có template nào được tìm thấy.</p>
            <Button color="primary" tag={Link} to="/templates/new">
              Tạo template đầu tiên
            </Button>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Mặc định</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id}>
                  <td>{template.name}</td>
                  <td>
                    {template.description
                      ? template.description.substring(0, 50) + "..."
                      : "N/A"}
                  </td>
                  <td>
                    {template.isActive ? (
                      <Badge color="success">Đang hoạt động</Badge>
                    ) : (
                      <Badge color="secondary">Không hoạt động</Badge>
                    )}
                  </td>
                  <td>
                    {template.isDefault ? (
                      <Badge color="info">Mặc định</Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <Button
                      color="info"
                      size="sm"
                      className="me-1"
                      tag={Link}
                      to={`/templates/${template._id}`}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      className="me-1"
                      tag={Link}
                      to={`/templates/edit/${template._id}`}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(template._id)}
                    >
                      <FaTrash />
                    </Button>
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

export default TemplateList;
