const mockPrismaUser = { findUnique: jest.fn(), create: jest.fn() };
jest.mock("@/lib/prismadb", () => ({ __esModule: true, default: { user: mockPrismaUser } }));
jest.mock("bcrypt", () => ({ hash: jest.fn().mockResolvedValue("hashed_pw_abc123") }));
import { POST } from "@/app/api/register/route";
function makeRequest(body: object): Request {
  return new Request("http://localhost/api/register", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
describe("POST /api/register", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it("returns 400 when email format is invalid", async () => {
    const res = await POST(makeRequest({ name: "A", email: "not-an-email", password: "password123" }));
    expect(res.status).toBe(400);
  });
  it("returns 400 when password is too short", async () => {
    const res = await POST(makeRequest({ name: "A", email: "a@a.com", password: "abc" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/password/i);
  });
  it("returns 409 when email already registered", async () => {
    mockPrismaUser.findUnique.mockResolvedValue({ id: "x", email: "a@a.com" });
    const res = await POST(makeRequest({ name: "A", email: "a@a.com", password: "password123" }));
    expect(res.status).toBe(409);
  });
  it("creates user successfully with valid data", async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockPrismaUser.create.mockResolvedValue({ id: "new_id", name: "A", email: "a@a.com", role: "TOURIST" });
    const res = await POST(makeRequest({ name: "A", email: "a@a.com", password: "password123" }));
    expect(res.status).toBe(200);
  });
  it("defaults role to TOURIST when not specified", async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockPrismaUser.create.mockResolvedValue({ id: "x", name: "A", email: "a@a.com", role: "TOURIST" });
    await POST(makeRequest({ name: "A", email: "a@a.com", password: "password123" }));
    expect(mockPrismaUser.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ role: "TOURIST" }) }));
  });
  it("hashes password before storing", async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockPrismaUser.create.mockResolvedValue({ id: "x", name: "A", email: "a@a.com", role: "TOURIST" });
    await POST(makeRequest({ name: "A", email: "a@a.com", password: "password123" }));
    expect(mockPrismaUser.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ hashedPassword: "hashed_pw_abc123" }) }));
  });
});
