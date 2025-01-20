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
  Avatar,
  Space,
  Dropdown,
  Skeleton,
  Empty,
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
  SettingOutlined,
} from "@ant-design/icons";
import TaskModal from "../TaskModel/TaskModel";
import http from "../../services/http";
import { useDispatch, useSelector } from "react-redux";
import { ReduxUser, Task, TaskFilters } from "../../types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { clearUser } from "../../store/slice/userSlice";
import CustomLoader from "../CustomLoader";
import {
  CONSOLE_ERROR,
  MENU,
  MODEL,
  PRIORITY_LABEL,
  STATUS,
  STRING,
  TOAST,
} from "../../constant/constant";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxUser) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toogle, setToogle] = useState(false);
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
    setToogle(true);
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
        !filters.priority || task.priority.toLowerCase() === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [taskData, filters]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const statistics = useMemo(() => {
    const completedTasks = taskData.filter(
      (t) => t.status === `${STATUS.COMPLETED}`
    ).length;
    const totalTasks = taskData.length;

    return {
      total: totalTasks,
      completed: completedTasks,
      incomplete: totalTasks - completedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [taskData]);

  const handleStatusToggle = async (task: Task) => {
    setLoading(true);
    try {
      const newStatus =
        task.status === "completed" ? "incomplete" : "completed";

      // Call the status update API
      await http.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
      });

      // Update only the toggled task in the local state
      setTaskData((prevTasks) =>
        prevTasks.map((t) =>
          t._id === task._id ? { ...t, status: newStatus } : t
        )
      );

      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error(`${CONSOLE_ERROR.UDATE_STATUS}`, error);
      toast.error(`${TOAST.UDATE_STATUS}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getfetchdata();
  }, []);

  const getfetchdata = async () => {
    try {
      const response = await http.get("/tasks");
      // Ensure the response data is an array
      if (Array.isArray(response.data.tasks)) {
        setTaskData(response.data.tasks);
      } else {
        throw new Error(`${CONSOLE_ERROR.DATE_FORMAT}`);
      }
    } catch (error) {
      console.error(`${CONSOLE_ERROR.FAILED_TO_FETCH}}`, error);
      toast.error(`${TOAST.FAILED_TO_FETCH}`);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDelete = async (taskId: string) => {
    Modal.confirm({
      title: `${MODEL.TITLE}`,
      content: `${MODEL.CONTENT}`,
      okText: `${MODEL.SUBMIT}`,
      cancelText: `${MODEL.CANCEL}`,
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
          toast.success(`${TOAST.TASK_SUCCESSSFULL}`);
        } catch (error) {
          console.error(`${CONSOLE_ERROR.FAILED_TO_SAVE_TASK}`, error);
          toast.error(`${TOAST.FAILED_TO_SAVE_TASK}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleOpenModal = (task?: Task | null) => {
    if (task) {
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setSelectedTask(null);
    setModalVisible(false);
  };

  const handleSubmit = async (values: Partial<Task>) => {
    setLoading(true);
    try {
      if (selectedTask?._id) {
        // Editing existing task
        const response = await http.put(`/tasks/${selectedTask._id}`, values);

        // Update only the edited task in the local state
        setTaskData((prevTasks) =>
          prevTasks.map((task) =>
            task._id === selectedTask._id ? { ...task, ...response.data } : task
          )
        );
        toast.success(`${TOAST.TASK_SUCCESSSFULL}`);
      } else {
        // Creating new task
        const response = await http.post("/tasks", values);

        // Add the new task to the local state
        setTaskData((prevTasks) => [...prevTasks, response.data]);
        toast.success(`${TOAST.TASK_SUCCESSSFULL}`);
      }

      handleCancel(); // Close modal and clean up
    } catch (error) {
      console.error(`${CONSOLE_ERROR.FAILED_TO_SAVE_TASK}`, error);
      toast.error(`${TOAST.FAILED_TO_SAVE_TASK}`);
    } finally {
      setLoading(false);
    }
  };
  // const completionRate = useMemo(() => {
  //   return Math.round((statistics.completed / statistics.total) * 100) || 0;
  // }, [statistics]);

  const userMenu = (
    <div className="user-menu-dropdown min-w-[240px] rounded-xl shadow-lg bg-white border border-gray-100 transition-all duration-300">
      <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={user.avatar}
            icon={!user.avatar && <UserOutlined />}
            className="border-2 border-white shadow-sm"
          />
          <div>
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-sm text-gray-500 truncate max-w-[160px]">
              {user.email}
            </div>
          </div>
        </div>
      </div>
      <div className="py-2">
        <Menu className="border-none">
          <Menu.Item
            key="profile"
            icon={<UserOutlined className="text-gray-500" />}
            className="menu-item"
          >
            <span className="text-gray-700">{MENU.MYPROFILE}</span>
          </Menu.Item>

          <Menu.Item
            key="settings"
            icon={<SettingOutlined className="text-gray-500" />}
            className="menu-item"
          >
            <span className="text-gray-700">{MENU.SETTING}</span>
          </Menu.Item>

          <Menu.Divider className="my-2 opacity-50" />

          <Menu.Item
            key="logout"
            icon={<LogoutOutlined className="text-red-500" />}
            onClick={handleLogout}
            className="menu-item-logout"
          >
            <span className="text-red-500 font-medium">{MENU.LOGOUT}</span>
          </Menu.Item>
        </Menu>
      </div>
    </div>
  );
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const getPriorityStyles = (priority: string) => {
      switch (priority.toLowerCase()) {
        case "high":
          return {
            border: "#b71c1c",
            background: "#ffcccb",
            text: "#850000",
          };
        case "medium":
          return {
            border: "#ff9800",
            background: "#fff3e0",
            text: "#bf360c",
          };
        case "low":
          return {
            border: "#00875a",
            background: "#e0f7ea",
            text: "#004d40",
          };
        default:
          return {
            border: "#6B7280",
            background: "#F3F4F6",
            text: "#374151",
          };
      }
    };

    const priorityStyle = getPriorityStyles(task.priority);

    return (
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.8rem",
          padding: "1rem",
          width: "100%",
          borderLeft: `4px solid ${priorityStyle.border}`,
        }}
        className="hover:shadow-md transition-all duration-300 p-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor:
                    task.status === "completed" ? "#059669" : "#D97706",
                }}
              />
              <Text className="text-sm text-gray-600">
                {task.status === "completed" ? "Completed" : "In Progress"}
              </Text>
            </div>
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(task)}
                className="text-gray-500 hover:text-blue-600"
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(task._id)}
                className="text-gray-500 hover:text-red-600"
              />
            </Space>
          </div>

          <div>
            <Title level={5} className="mb-1 line-clamp-1">
              {task.title}
            </Title>
            <Text className="text-gray-600 line-clamp-2">
              {task.description}
            </Text>
          </div>

          <Tag
            style={{
              backgroundColor: priorityStyle.background,
              color: priorityStyle.text,
              border: "none",
              borderRadius: "6px",
              padding: "2px 8px",
              fontWeight: 500,
              alignSelf: "flex-start",
            }}
          >
            {task.priority} Priority
          </Tag>

          <div className="flex items-center justify-between mt-2  max-[340px]:flex max-[340px]:flex-col ">
            <Tag
              icon={<CalendarOutlined />}
              style={{
                borderRadius: "9999px",
                padding: "4px 12px",
                backgroundColor: "#F3F4F6",
                border: "none",
                color: "#4B5563",
              }}
            >
              {task.createdAt.split("T")[0]}
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
  };

  return (
    <>
      {toogle ? (
        <CustomLoader />
      ) : (
        <Layout className="min-h-screen">
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="bg-white border-r border-gray-200"
            width={260}
            breakpoint="lg"
            collapsedWidth={0}
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
          >
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
              <Title level={4} className="m-0 text-blue-600">
                {collapsed ? "TT" : "Task Tracker"}
              </Title>
            </div>

            <Menu
              mode="inline"
              className="border-none"
              defaultSelectedKeys={["dashboard"]}
            >
              <Menu.Item key="dashboard" icon={<FlagOutlined />}>
                {MENU.DASHBOARD}
              </Menu.Item>
              <Menu.Item key="all" icon={<UnorderedListOutlined />}>
                {MENU.ALL_TASK}
              </Menu.Item>
              <Menu.Item key="today" icon={<CalendarOutlined />}>
                {MENU.TODAY_TASK}
              </Menu.Item>
              <Menu.Item key="completed" icon={<CheckCircleOutlined />}>
                {MENU.COMPLETED_TASK}
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout>
            <Header className="bg-white px-4 sm:px-6 flex items-center justify-between border-b border-gray-200 w-full">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                />
                <Input
                  placeholder="Search tasks..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-full sm:w-64 rounded-full"
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>

              <Space className="ml-2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                  className="rounded-full min-w-0 sm:min-w-[120px]"
                >
                  <span className="hidden sm:inline">{MODEL.NEWTASK}</span>
                </Button>
                <Dropdown
                  overlay={userMenu}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button type="text" className="flex items-center p-1 sm:p-2">
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

            <Content className="p-4 sm:p-6 bg-gray-50">
              <div className="mb-4 sm:mb-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <Title
                        level={3}
                        className="text-white m-0 "
                        style={{ color: "white" }}
                      >
                        {STRING.WELCOME_BACK}, {user.name}!
                      </Title>
                      <Text className="text-blue-100">
                        {STRING.YOU_HAVE} {statistics.incomplete}{" "}
                        {STRING.PENDING_TASK}
                        {statistics.total} {STRING.TASK}
                      </Text>
                    </div>
                    <Progress
                      type="circle"
                      percent={statistics.completionRate}
                      size={100}
                      strokeColor="#ffffff"
                      trailColor="rgba(255,255,255,0.3)"
                      format={(percent) => (
                        <div className="text-white">
                          <div className="text-xl font-bold">{percent}%</div>
                          <div className="text-xs">{STRING.COMPLETE}</div>
                        </div>
                      )}
                    />
                  </div>
                </Card>
              </div>

              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Card className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="w-full md:justify-between md:items-center flex max-xl:flex-col gap-4 mb-6 ">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Select
                          placeholder={PRIORITY_LABEL.PRIORITY}
                          style={{ width: 200 }}
                          onChange={(value) =>
                            setFilters({ ...filters, priority: value })
                          }
                          allowClear
                          options={[
                            {
                              value: "high",
                              label: (
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: "#DC2626",
                                    }}
                                  />
                                  {PRIORITY_LABEL.HIGH}
                                </div>
                              ),
                            },
                            {
                              value: "medium",
                              label: (
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: "#D97706",
                                    }}
                                  />
                                  {PRIORITY_LABEL.MEDIUM}
                                </div>
                              ),
                            },
                            {
                              value: "low",
                              label: (
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: "#059669",
                                    }}
                                  />
                                  {PRIORITY_LABEL.LOW}
                                </div>
                              ),
                            },
                          ]}
                        />
                        <Select
                          placeholder="Status"
                          style={{ width: 200 }}
                          onChange={(value) =>
                            setFilters({ ...filters, status: value })
                          }
                          allowClear
                          options={[
                            {
                              value: "completed",
                              label: (
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: "#059669",
                                    }}
                                  />
                                  Completed
                                </div>
                              ),
                            },
                            {
                              value: "incomplete",
                              label: (
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: "#D97706",
                                    }}
                                  />
                                  In Progress
                                </div>
                              ),
                            },
                          ]}
                        />
                      </div>

                      <div className="flex md:items-center  max-md:flex-col gap-4">
                        <Text className="text-gray-600 font-medium">
                          Priority Legend:
                        </Text>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                            <Text className="text-gray-600">High Priority</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#D97706]" />
                            <Text className="text-gray-600">
                              Medium Priority
                            </Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#059669]" />
                            <Text className="text-gray-600">Low Priority</Text>
                          </div>
                        </div>
                      </div>
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
                            {STRING.NO_TASK_FOUND}
                          </div>
                        }
                      />
                    )}
                  </Card>
                </Col>
              </Row>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-gray-500 text-center sm:text-left">
                  Showing {paginatedTasks.length} of {filteredTasks.length}{" "}
                  tasks
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
                  className="text-center"
                  size="small"
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
            task={selectedTask}
          />
        </Layout>
      )}
    </>
  );
};

export default Dashboard;
