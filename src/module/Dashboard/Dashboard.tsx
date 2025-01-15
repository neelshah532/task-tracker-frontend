import React, { useState, useMemo, useEffect } from "react";
import {
  Layout,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Menu,
  message,
  Avatar,
  Space,
  Dropdown,
  Skeleton,
  Empty,
  Tooltip,
  Progress,
  Pagination,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LogoutOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import TaskModal from "../TaskModel/TaskModel";
import http from "../../services/http";
import { useDispatch, useSelector } from "react-redux";
import { Task, TaskFilters } from "../../types";
import { useNavigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  console.log("user", user);
  const [collapsed, setCollapsed] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]); // Initialize taskData as an array
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "",
    priority: "",
    search: "",
  });
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   pageSize: 8,
  //   total: 0,
  // });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(clearUser());
    navigate("/login");
  };

  const filteredTasks = useMemo(() => {
    return taskData.filter((task) => {
      const matchesSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || task.status === filters.status;

      const matchesPriority =
        !filters.priority || task.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [taskData, filters]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const statistics = useMemo(
    () => ({
      total: taskData.length,
      completed: taskData.filter((t) => t.status === "completed").length,
      incomplete: taskData.filter((t) => t.status === "incomplete").length,
    }),
    [taskData]
  );
  const handleStatusToggle = async (task: Task) => {
    setLoading(true);
    setTimeout(() => {
      const updatedTasks = taskData.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            status: t.status === "completed" ? "incomplete" : "completed",
          };
        }
        return t;
      });
      setTaskData(updatedTasks); // Update taskData without mutating it
      setLoading(false);
      message.success("Task status updated successfully");
    }, 500);
  };

  // const handlePageChange = (page: number, pageSize?: number) => {
  //   setPagination({
  //     ...pagination,
  //     current: page,
  //     pageSize: pageSize || pagination.pageSize,
  //   });
  // };
  useEffect(() => {
    getfetchdata();
  }, []);

  const getfetchdata = async () => {
    try {
      const response = await http.get("/tasks");
      // Ensure the response data is an array
      if (Array.isArray(response.data.tasks)) {
        setTaskData(response.data.tasks);
        // setPagination((prev) => ({ ...prev, total: response.data.length }));
      } else {
        throw new Error("Data is not in the expected format");
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      message.error("Failed to fetch tasks");
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDelete = async (taskId: string) => {
    Modal.confirm({
      title: "Delete Task",
      content: "Are you sure you want to delete this task?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        setLoading(true);
        try {
          await http.delete(`/tasks/${taskId}`);

          // Update local state
          const updatedTasks = taskData.filter((t) => t._id !== taskId);
          setTaskData(updatedTasks);

          // Adjust current page if necessary
          const remainingItemsOnPage = paginatedTasks.length - 1;
          if (remainingItemsOnPage === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }

          message.success("Task deleted successfully");
        } catch (error) {
          console.error("Failed to delete task", error);
          message.error("Failed to delete task");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleOpenModal = (task?: Task) => {
    setSelectedTask(task || null); // If task is passed, edit, otherwise create a new task
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedTask(null); // Reset selected task on cancel
    console.log("cancle selectedTask", selectedTask);
  };

  const handleSubmit = async (values: Partial<Task>) => {
    setLoading(true);
    try {
      if (selectedTask) {
        console.log("selectedTask", selectedTask);
        // Update existing task
        await http.put(`/tasks/${selectedTask._id}`, values);
        message.success("Task updated successfully");
      } else {
        // Create new task
        await http.post("/tasks", values);
        message.success("Task created successfully");
      }
      setModalVisible(false); // Close the modal after success
      setSelectedTask(null); // Reset selected task
    } catch (error) {
      message.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };
  const completionRate = useMemo(() => {
    return Math.round((statistics.completed / statistics.total) * 100) || 0;
  }, [statistics]);

  const userMenu = (
    <div className="min-w-[200px] p-2">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-medium text-gray-800">{user.name}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
      <Menu>
        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
        >
          Logout
        </Menu.Item>
      </Menu>
    </div>
  );

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border-l-4 ${
        task.priority === "high"
          ? "border-red-500"
          : task.priority === "medium"
          ? "border-yellow-500"
          : "border-green-500"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                task.status === "completed" ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <Text className="text-sm text-gray-500">
              {task.status === "completed" ? "Completed" : "In Progress"}
            </Text>
          </div>
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(task)}
              className="text-gray-500 hover:text-blue-500"
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(task._id)}
              className="text-gray-500 hover:text-red-500"
            />
          </Space>
        </div>

        <div>
          <Title level={5} className="mb-1 line-clamp-1">
            {task.title}
          </Title>
          <Text className="text-gray-600 line-clamp-2">{task.description}</Text>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Tag icon={<CalendarOutlined />} className="rounded-full px-3">
            {task.dueDate}
          </Tag>
          <Button
            type="link"
            onClick={() => handleStatusToggle(task)}
            className={
              task.status === "completed" ? "text-green-500" : "text-gray-500"
            }
            icon={
              task.status === "completed" ? (
                <CheckCircleOutlined />
              ) : (
                <ClockCircleOutlined />
              )
            }
          >
            {task.status === "completed" ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        width={260}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Title level={4} className="m-0 text-blue-600">
            {collapsed ? "TT" : "Task Tracker"}
          </Title>
        </div>

        <Menu mode="inline" className="border-none">
          <Menu.Item key="dashboard" icon={<FlagOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="all" icon={<UnorderedListOutlined />}>
            All Tasks
          </Menu.Item>
          <Menu.Item key="today" icon={<CalendarOutlined />}>
            Today
          </Menu.Item>
          <Menu.Item key="completed" icon={<CheckCircleOutlined />}>
            Completed
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Input
              placeholder="Search tasks..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-64 rounded-full"
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              className="rounded-full"
            >
              New Task
            </Button>
            {/* <Avatar src={user.avatar} icon={<UserOutlined />} /> */}
            <Dropdown
              overlay={userMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" className="flex items-center">
                <Avatar
                  size="small"
                  src={user.avatar}
                  icon={!user.avatar && <UserOutlined />}
                />
                <span className="ml-2 hidden sm:inline">{user.name}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="text-white m-0">
                    Welcome back, {user.name}!
                  </Title>
                  <Text className="text-blue-100">
                    You have {statistics.incomplete} tasks pending
                  </Text>
                </div>
                <Progress
                  type="circle"
                  percent={completionRate}
                  size={80}
                  strokeColor="#ffffff"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => (
                    <div className="text-white">
                      <div className="text-lg font-bold">{percent}%</div>
                      <div className="text-xs">Complete</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </div>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card className="mb-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <Select
                    placeholder="Priority"
                    style={{ width: 140 }}
                    onChange={(value) =>
                      setFilters({ ...filters, priority: value })
                    }
                    allowClear
                    options={[
                      { value: "high", label: "High Priority" },
                      { value: "medium", label: "Medium Priority" },
                      { value: "low", label: "Low Priority" },
                    ]}
                  />
                  <Select
                    placeholder="Status"
                    style={{ width: 140 }}
                    onChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                    allowClear
                    options={[
                      { value: "completed", label: "Completed" },
                      { value: "incomplete", label: "In Progress" },
                    ]}
                  />
                </div>

                {loading ? (
                  <Row gutter={[16, 16]}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                          <Skeleton active />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : paginatedTasks.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {paginatedTasks.map((task) => (
                      <Col xs={24} sm={12} lg={6} key={task._id}>
                        <TaskCard task={task} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="text-gray-500">
                        No tasks found. Create a new task to get started!
                      </div>
                    }
                  />
                )}
              </Card>
            </Col>
          </Row>
          <div className="mt-6 flex justify-between items-center">
            <div className="text-gray-500">
              Showing {paginatedTasks.length} of {filteredTasks.length} tasks
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredTasks.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size) setPageSize(size);
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total} items`}
              pageSizeOptions={["8", "16", "24", "32"]}
            />
          </div>
        </Content>
      </Layout>

      <TaskModal
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        title={selectedTask ? "Edit Task" : "Create New Task"}
        initialValues={selectedTask || undefined}
      />
    </Layout>
  );
};

export default Dashboard;
