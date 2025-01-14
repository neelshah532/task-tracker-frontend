import { Button, Form, Input } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import http from "../../services/http";
import { FormValues } from "../../types";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isLogin) {
        const response = await http.post("/login", {
          email: values.email,
          password: values.password,
        });

        const userData = {
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email,
          token: response.data.data.jwt,
          isVerified: response.data.data.isVerified,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Welcome back!");
        navigate("/");
      } else {
        await http.post("/signup", {
          name: values.fullName,
          email: values.email,
          password: values.password,
        });

        toast.success("Account created successfully!");
        setIsLogin(true);
        form.resetFields();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data.message || "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md transform transition-all duration-500">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Logo Section */}
          <div className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="flex items-center justify-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h1 className="text-2xl font-bold text-white">TaskTracker</h1>
              </div>
              <p className="text-blue-100 mt-2">
                Stay organized, get more done
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="space-y-4"
            >
              {!isLogin && (
                <Form.Item
                  name="fullName"
                  rules={[
                    { required: true, message: "Please enter your name" },
                  ]}
                  className="mb-4"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Full Name"
                    className="input-field"
                  />
                </Form.Item>
              )}

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
                className="mb-4"
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email Address"
                  className="input-field"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
                className="mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  className="input-field"
                />
              </Form.Item>

              {!isLogin && (
                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Passwords do not match!");
                      },
                    }),
                  ]}
                  className="mb-4"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Confirm Password"
                    className="input-field"
                  />
                </Form.Item>
              )}

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-button"
                  loading={loading}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  form.resetFields();
                }}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-300"
              >
                {isLogin
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
