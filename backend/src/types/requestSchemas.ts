import { z } from "zod";

export const requestStatusEnum = z.enum(["NEW", "QUALIFIED", "CLOSED"]);

export type RequestStatusType = z.infer<typeof requestStatusEnum>;

export const createRequestSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerEmail: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  requestedService: z.string().trim().min(1, "Requested service is required"),
  scheduledDate: z.string().trim().min(1, "Scheduled date is required"),
  status: requestStatusEnum.default("NEW"),
  notes: z.string().optional(),
});

export const updateRequestSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").optional(),
  customerEmail: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  requestedService: z.string().trim().min(1, "Requested service is required").optional(),
  scheduledDate: z.string().trim().min(1, "Scheduled date is required").optional(),
  status: requestStatusEnum.optional(),
  notes: z.string().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
