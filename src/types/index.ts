export interface FormValues {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// types/task.ts
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "completed" | "incomplete";
  priority: "high" | "medium" | "low";
  createdAt: string;
  dueDate?: string;
}

export interface TaskFilters {
  status: string;
  priority: string;
  search: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface ReduxUser {
  user: {
    id: string;
    name: string;
    email: string;
    token: string;
    isVerified?: boolean | string;
    avatar?: string;
  };
}
