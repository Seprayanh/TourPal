const mockPrisma = {
  listing: { findUnique: jest.fn(), update: jest.fn() },
  notification: { create: jest.fn() },
};
jest.mock("@/lib/prismadb", () => ({ __esModule: true, default: mockPrisma }));
jest.mock("@/app/actions/get-current-user", () => ({ __esModule: true, default: jest.fn() }));
import { POST } from "@/app/api/reservations/route";
import getCurrentUser from "@/app/actions/get-current-user";
const mockGetCurrentUser = getCurrentUser as jest.Mock;
function makePostRequest(body: object): Request {
  return new Request("http://localhost/api/reservations", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
const mockListing = { id: "listing_001", userId: "guide_001", title: "西湖徒步" };
const mockReservation = { id: "res_001", userId: "tourist_001", listingId: "listing_001", totalPrice: 150 };
describe("POST /api/reservations", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it("does not create reservation when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await POST(makePostRequest({ listingId: "l1", startDate: "2026-05-01", endDate: "2026-05-02", totalPrice: 100 }));
    expect(mockPrisma.listing.update).not.toHaveBeenCalled();
  });
  it("does not create reservation when fields are missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "tourist_001" });
    await POST(makePostRequest({ listingId: "l1" }));
    expect(mockPrisma.listing.update).not.toHaveBeenCalled();
  });
  it("returns 404 when listing does not exist", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "tourist_001" });
    mockPrisma.listing.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest({ listingId: "none", startDate: "2026-05-01", endDate: "2026-05-02", totalPrice: 100 }));
    expect(res.status).toBe(404);
  });
  it("creates reservation and notifies guide on success", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "tourist_001" });
    mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
    mockPrisma.listing.update.mockResolvedValue({ ...mockListing, reservations: [mockReservation] });
    mockPrisma.notification.create.mockResolvedValue({ id: "notif_001" });
    const res = await POST(makePostRequest({ listingId: "listing_001", startDate: "2026-05-01", endDate: "2026-05-02", totalPrice: 150 }));
    expect(res.status).toBe(200);
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: "guide_001", type: "NEW_BOOKING" }) }));
  });
  it("skips notification when listing has no guide", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "tourist_001" });
    mockPrisma.listing.findUnique.mockResolvedValue({ ...mockListing, userId: null });
    mockPrisma.listing.update.mockResolvedValue({ ...mockListing, reservations: [mockReservation] });
    await POST(makePostRequest({ listingId: "listing_001", startDate: "2026-05-01", endDate: "2026-05-02", totalPrice: 150 }));
    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
  });
});
