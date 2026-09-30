export type RequestStatus = "NEW" | "QUALIFIED" | "CLOSED";

export interface CustomerRequest {
  id: string;
  workspaceId: string;
  customerName: string;
  customerEmail?: string;
  requestedService: string;
  scheduledDate: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  requestId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  workspaceId: string;
  name?: string;
  workspaceName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface WorkItem {
  id: string;
  requestId: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
}

