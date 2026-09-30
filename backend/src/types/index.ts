import type { Request as ExpressRequest } from "express";

export interface UserPayload {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthRequest extends ExpressRequest {
  user?: UserPayload;
}

export type RequestStatus = "NEW" | "QUALIFIED" | "CLOSED";

export interface CustomerRequest {
  id: string;
  workspace_id: string;
  customer_name: string;
  customer_email: string;
  requested_service: string;
  scheduled_date: string;
  status: RequestStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  work_item_id?: string | null;
}

export interface WorkItem {
  id: string;
  workspace_id: string;
  request_id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
}

export interface Activity {
  id: string;
  workspace_id: string;
  request_id: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: string;
  user_name?: string;
}
