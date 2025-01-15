import React from "react";
import { Modal, Form, Input, Select, Row, Col, Divider } from "antd";
import {
  FlagOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Task } from "../../types";

interface TaskModalProps {
  visible?: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<Task>) => void;
  initialValues?: Task;
  title?: string;
}
const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={
        <div className="modal-title">
          <FormOutlined className="modal-icon" />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      maskClosable={false}
      width={window.innerWidth > 768 ? 600 : "95%"}
      className="task-modal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues ?? { status: "Incomplete" }}
        onFinish={onSubmit}
        className="task-form"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input
                size="large"
                placeholder="Task title"
                prefix={<FileTextOutlined />}
                className="task-input"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="What needs to be done?"
                className="task-textarea"
              />
            </Form.Item>
          </Col>

          <Divider />

          <Col xs={24} sm={12}>
            <Form.Item
              name="priority"
              rules={[
                { required: true, message: "Please select the priority!" },
              ]}
            >
              <Select
                size="large"
                placeholder="Select priority"
                suffixIcon={<FlagOutlined />}
                className="task-select"
                options={[
                  {
                    value: "High",
                    label: "High Priority",
                    className: "high-priority",
                  },
                  {
                    value: "Medium",
                    label: "Medium Priority",
                    className: "medium-priority",
                  },
                  {
                    value: "Low",
                    label: "Low Priority",
                    className: "low-priority",
                  },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              rules={[{ required: true, message: "Please select the status!" }]}
            >
              <Select
                size="large"
                placeholder="Select status"
                suffixIcon={<CheckCircleOutlined />}
                className="task-select"
                options={[
                  { value: "Incomplete", label: "Incomplete" },
                  { value: "Completed", label: "Completed" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaskModal;
