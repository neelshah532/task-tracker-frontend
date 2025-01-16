import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import {
  FlagOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Task } from "../../types";
import { MODEL } from "../../constant/constant";

interface TaskModalProps {
  visible?: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<Task>) => void;
  initialValues?: Task;
  title?: string;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
  task,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (task) {
        form.setFieldsValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
      }
    }
  }, [visible, task, form]);

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FormOutlined className="text-blue-500" />
          <span className="text-lg font-medium">{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      maskClosable={false}
      width={window.innerWidth > 768 ? 600 : "95%"}
      centered
      confirmLoading={false}
      classNames={{
        content: "p-6",
        header: "pb-4 border-b border-gray-200",
        footer: "pt-4 border-t border-gray-200",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues ?? { status: "incomplete" }}
        onFinish={onSubmit}
        className="space-y-6"
      >
        <div className="space-y-6">
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please input the title!" }]}
            className="mb-0"
          >
            <Input
              size="large"
              placeholder={MODEL.TITLE_TASK}
              prefix={<FileTextOutlined className="text-gray-400" />}
              className="rounded-lg hover:border-blue-400 focus:border-blue-500 focus:shadow-sm"
            />
          </Form.Item>

          <Form.Item
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
            className="mb-0"
          >
            <Input.TextArea
              rows={4}
              placeholder="What needs to be done?"
              className="rounded-lg hover:border-blue-400 focus:border-blue-500 focus:shadow-sm"
            />
          </Form.Item>

          <div className="h-px bg-gray-200 w-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="priority"
              rules={[
                { required: true, message: "Please select the priority!" },
              ]}
              className="mb-0"
            >
              <Select
                size="large"
                placeholder="Select priority"
                suffixIcon={<FlagOutlined className="text-gray-400" />}
                className="w-full"
                dropdownClassName="rounded-lg"
                options={[
                  {
                    value: "High",
                    label: (
                      <span className="flex items-center text-red-500">
                        <FlagOutlined className="mr-2" />
                        High Priority
                      </span>
                    ),
                  },
                  {
                    value: "Medium",
                    label: (
                      <span className="flex items-center text-yellow-500">
                        <FlagOutlined className="mr-2" />
                        Medium Priority
                      </span>
                    ),
                  },
                  {
                    value: "Low",
                    label: (
                      <span className="flex items-center text-green-500">
                        <FlagOutlined className="mr-2" />
                        Low Priority
                      </span>
                    ),
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="status"
              rules={[{ required: true, message: "Please select the status!" }]}
              className="mb-0"
            >
              <Select
                size="large"
                placeholder="Select status"
                suffixIcon={<CheckCircleOutlined className="text-gray-400" />}
                className="w-full"
                dropdownClassName="rounded-lg"
                options={[
                  {
                    value: "incomplete",
                    label: (
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-2" />
                        Incomplete
                      </span>
                    ),
                  },
                  {
                    value: "completed",
                    label: (
                      <span className="flex items-center text-green-500">
                        <CheckCircleOutlined className="mr-2" />
                        Completed
                      </span>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TaskModal;
