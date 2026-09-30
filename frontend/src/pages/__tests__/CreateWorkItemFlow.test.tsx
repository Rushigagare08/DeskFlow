import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { RequestDetails } from "../RequestDetails";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  getRequest: vi.fn(),
  createWorkItem: vi.fn(),
  getActivities: vi.fn(),
}));

describe("Create Work Item Confirmation Flow", () => {
  it("handles the confirmation modal flow correctly for QUALIFIED requests", async () => {
    const mockRequest = {
      id: "req-123",
      workspaceId: "ws-1",
      customerName: "Acme Corp",
      customerEmail: "acme@example.com",
      requestedService: "HVAC Installation",
      scheduledDate: "2026-10-15",
      status: "QUALIFIED" as const,
      createdAt: "2026-09-29T10:00:00.000Z",
      updatedAt: "2026-09-29T10:00:00.000Z",
    };

    vi.mocked(api.getRequest).mockResolvedValue(mockRequest);
    vi.mocked(api.getActivities).mockResolvedValue([]);
    vi.mocked(api.createWorkItem).mockResolvedValue({
      id: "wi-456",
      workspaceId: "ws-1",
      requestId: "req-123",
      createdBy: "usr-1",
      createdAt: "2026-09-29T10:00:00.000Z",
    });

    render(
      <MemoryRouter initialEntries={["/requests/req-123"]}>
        <Routes>
          <Route path="/requests/:id" element={<RequestDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. A QUALIFIED request shows the "Create Work Item" button.
    const createBtn = await screen.findByRole("button", { name: /create work item/i });
    expect(createBtn).toBeTruthy();
    expect(createBtn.hasAttribute("disabled")).toBe(false);

    // 2. Clicking it opens the confirmation modal.
    fireEvent.click(createBtn);

    const modalTitle = await screen.findByText("Create Work Item?");
    expect(modalTitle).toBeTruthy();

    // 3. The modal displays: customer name, requested service, scheduled date
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("HVAC Installation").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("2026-10-15").length).toBeGreaterThanOrEqual(2);

    // 4. Clicking Cancel closes the modal.
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText("Create Work Item?")).toBeNull();
    });

    // 5. The work-item API should NOT be called when Cancel is clicked.
    expect(api.createWorkItem).not.toHaveBeenCalled();
  });
});

