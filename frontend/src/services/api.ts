import type {
  Activity,
  CustomerRequest,
  LoginResponse,
  RequestStatus,
  User,
  WorkItem,
  Workspace,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: requestHeaders,
    ...restOptions,
  });

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

// 0. Get public workspace list
export async function getWorkspaces(): Promise<Workspace[]> {
  return request<Workspace[]>("/workspaces", {
    method: "GET",
    requiresAuth: false,
  });
}

// 1. Login
export async function login(email: string, password: string, workspaceId: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, workspaceId }),
    requiresAuth: false,
  });
}

// 1b. Register new account
export async function register(
  name: string,
  email: string,
  password: string,
  workspaceId: string
): Promise<{ message: string; user: User }> {
  return request<{ message: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, workspaceId }),
    requiresAuth: false,
  });
}

// 2. Get current authenticated user
export async function getCurrentUser(): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/me", {
    method: "GET",
  });
}

// 3. List customer requests (optional status filtering)
export async function getRequests(status?: RequestStatus | "ALL"): Promise<CustomerRequest[]> {
  const query = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
  return request<CustomerRequest[]>(`/requests${query}`, {
    method: "GET",
  });
}

// 4. View single request
export async function getRequest(id: string): Promise<CustomerRequest> {
  return request<CustomerRequest>(`/requests/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

// 5. Create customer request
export async function createRequest(
  data: Omit<CustomerRequest, "id" | "workspaceId" | "createdAt" | "updatedAt">
): Promise<CustomerRequest> {
  return request<CustomerRequest>("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 6. Update customer request
export async function updateRequest(
  id: string,
  data: Partial<Omit<CustomerRequest, "id" | "workspaceId" | "createdAt" | "updatedAt">>
): Promise<CustomerRequest> {
  return request<CustomerRequest>(`/requests/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 7. Get activities timeline for request
export async function getActivities(id: string): Promise<Activity[]> {
  return request<Activity[]>(`/requests/${encodeURIComponent(id)}/activities`, {
    method: "GET",
  });
}

// 8. Convert request to Work Item
export async function createWorkItem(id: string): Promise<WorkItem> {
  return request<WorkItem>(`/requests/${encodeURIComponent(id)}/work-item`, {
    method: "POST",
  });
}

export const api = {
  getWorkspaces,
  login,
  register,
  getCurrentUser,
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  getActivities,
  createWorkItem,
};


export default api;
