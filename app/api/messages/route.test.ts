import { NextRequest } from "next/server";
import { GET } from "./route";
import { getDonations, getDonationStats } from "@/lib/db";

// Mock the database module
jest.mock("@/lib/db", () => ({
  getDonations: jest.fn(),
  getDonationStats: jest.fn(),
}));

describe("/api/messages", () => {
  const mockGetDonations = getDonations as jest.MockedFunction<
    typeof getDonations
  >;
  const mockGetDonationStats = getDonationStats as jest.MockedFunction<
    typeof getDonationStats
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return paginated donations with default parameters", async () => {
      // Arrange
      const mockDonations = [
        {
          id: 1,
          donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          donor_name: "Alice",
          amount_usd: 50,
          message: "Great project!",
          created_at: "2025-11-25T10:00:00Z",
        },
        {
          id: 2,
          donor_address: "8yLXtg3DX98e98UYTEqcE6kCdIfUfRpB94WfZpKpthBtV",
          donor_name: "Bob",
          amount_usd: 25,
          message: "Keep it up!",
          created_at: "2025-11-25T11:00:00Z",
        },
      ];

      const mockStats = {
        totalDonations: 10,
        totalAmount: 250,
      };

      mockGetDonations.mockResolvedValueOnce({
        donations: mockDonations,
        total: 10,
      });
      mockGetDonationStats.mockResolvedValueOnce(mockStats);

      const request = new NextRequest("http://localhost:3000/api/messages", {
        method: "GET",
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.donations).toEqual(mockDonations);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 10,
        pages: 1,
      });
      expect(data.data.stats).toEqual(mockStats);
      expect(mockGetDonations).toHaveBeenCalledWith(1, 50, "recent");
      expect(mockGetDonationStats).toHaveBeenCalled();
    });

    it("should handle custom pagination parameters", async () => {
      // Arrange
      const mockDonations = [
        {
          id: 1,
          donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          donor_name: "Charlie",
          amount_usd: 100,
          message: "Amazing!",
          created_at: "2025-11-25T12:00:00Z",
        },
      ];

      mockGetDonations.mockResolvedValueOnce({
        donations: mockDonations,
        total: 25,
      });
      mockGetDonationStats.mockResolvedValueOnce({
        totalDonations: 25,
        totalAmount: 500,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/messages?page=2&limit=10",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
      });
      expect(mockGetDonations).toHaveBeenCalledWith(2, 10, "recent");
    });

    it("should sort by top donations", async () => {
      // Arrange
      const mockDonations = [
        {
          id: 1,
          donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          donor_name: "Top Donor",
          amount_usd: 1000,
          message: "Biggest donation!",
          created_at: "2025-11-25T12:00:00Z",
        },
      ];

      mockGetDonations.mockResolvedValueOnce({
        donations: mockDonations,
        total: 5,
      });
      mockGetDonationStats.mockResolvedValueOnce({
        totalDonations: 5,
        totalAmount: 1500,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/messages?sort=top",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockGetDonations).toHaveBeenCalledWith(1, 50, "top");
    });

    it("should enforce maximum limit of 100", async () => {
      // Arrange
      mockGetDonations.mockResolvedValueOnce({
        donations: [],
        total: 0,
      });
      mockGetDonationStats.mockResolvedValueOnce({
        totalDonations: 0,
        totalAmount: 0,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/messages?limit=500",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.pagination.limit).toBe(100);
      expect(mockGetDonations).toHaveBeenCalledWith(1, 100, "recent");
    });

    it("should return 400 for invalid page number", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/messages?page=0",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid pagination parameters");
      expect(mockGetDonations).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid limit", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/messages?limit=-5",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid pagination parameters");
      expect(mockGetDonations).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid sort parameter", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/messages?sort=invalid",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Sort must be 'recent' or 'top'");
      expect(mockGetDonations).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      mockGetDonations.mockRejectedValueOnce(
        new Error("Database connection lost")
      );

      const request = new NextRequest("http://localhost:3000/api/messages", {
        method: "GET",
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection lost");
    });

    it("should calculate correct number of pages", async () => {
      // Arrange
      mockGetDonations.mockResolvedValueOnce({
        donations: [],
        total: 47,
      });
      mockGetDonationStats.mockResolvedValueOnce({
        totalDonations: 47,
        totalAmount: 470,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/messages?limit=10",
        {
          method: "GET",
        }
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.pagination.pages).toBe(5); // 47 items / 10 per page = 5 pages
    });

    it("should return empty donations array when no donations exist", async () => {
      // Arrange
      mockGetDonations.mockResolvedValueOnce({
        donations: [],
        total: 0,
      });
      mockGetDonationStats.mockResolvedValueOnce({
        totalDonations: 0,
        totalAmount: 0,
      });

      const request = new NextRequest("http://localhost:3000/api/messages", {
        method: "GET",
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.donations).toEqual([]);
      expect(data.data.stats.totalDonations).toBe(0);
      expect(data.data.stats.totalAmount).toBe(0);
    });
  });
});
