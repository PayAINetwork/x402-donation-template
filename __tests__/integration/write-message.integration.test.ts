import { POST } from "@/app/api/write-message/route";
import { storeDonation } from "@/lib/db";
import {
  createMockPaymentHeader,
  createMockRequest,
  MOCK_WALLET_ADDRESSES,
  MOCK_SIGNATURES,
  expectJsonResponse,
  mockDatabaseReturns,
} from "../utils/test-helpers";

jest.mock("@/lib/db");

describe("/api/write-message - Integration Tests", () => {
  const mockStoreDonation = storeDonation as jest.MockedFunction<
    typeof storeDonation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy Path Scenarios", () => {
    it("should handle complete donation flow", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.alice,
        MOCK_SIGNATURES.success
      );

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success()
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: {
            amount: 25,
            name: "Alice",
            message: "Love this project!",
          },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.success).toBe(true);
      expect(data.message).toContain("Alice");
      expect(data.data.amountUsd).toBe(25);
      expect(mockStoreDonation).toHaveBeenCalledTimes(1);
    });

    it("should handle minimum donation amount", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(MOCK_WALLET_ADDRESSES.bob);

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success({ amountUsd: "1.00" })
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: { amount: 1 },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.amountUsd).toBe(1);
    });

    it("should handle large donation amounts", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.charlie,
        MOCK_SIGNATURES.success
      );

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success({ amountUsd: "10000.00" })
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: { amount: 10000 },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.amountUsd).toBe(10000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle decimal amounts correctly", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.alice
      );

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success({ amountUsd: "12.99" })
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: { amount: 12.99 },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.data.amountUsd).toBe(12.99);
    });

    it("should handle very long donor names", async () => {
      // Arrange
      const longName = "A".repeat(100);
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.alice
      );

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success({ donorName: longName })
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: {
            amount: 10,
            name: longName,
          },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.success).toBe(true);
      expect(mockStoreDonation).toHaveBeenCalledWith(
        MOCK_WALLET_ADDRESSES.alice,
        10,
        longName,
        undefined,
        undefined
      );
    });

    it("should handle special characters in messages", async () => {
      // Arrange
      const specialMessage = "🚀 Great project! ❤️ Keep going 💪";
      const paymentHeader = createMockPaymentHeader(MOCK_WALLET_ADDRESSES.bob);

      mockStoreDonation.mockResolvedValue(
        mockDatabaseReturns.storeDonation.success({ message: specialMessage })
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: {
            amount: 15,
            message: specialMessage,
          },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 200);

      // Assert
      expect(data.success).toBe(true);
      expect(mockStoreDonation).toHaveBeenCalledWith(
        MOCK_WALLET_ADDRESSES.bob,
        15,
        undefined,
        specialMessage,
        undefined
      );
    });
  });

  describe("Error Scenarios", () => {
    it("should reject amounts below minimum", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.alice
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: { amount: 0.009 },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 400);

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain("at least $0.01");
      expect(mockStoreDonation).not.toHaveBeenCalled();
    });

    it("should handle concurrent database writes", async () => {
      // Arrange
      const paymentHeader = createMockPaymentHeader(
        MOCK_WALLET_ADDRESSES.alice
      );

      mockStoreDonation.mockRejectedValue(
        new Error("Concurrent modification detected")
      );

      const request = createMockRequest(
        "http://localhost:3000/api/write-message",
        {
          body: { amount: 10 },
          paymentHeader,
        }
      );

      // Act
      const response = await POST(request);
      const data = await expectJsonResponse(response, 500);

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toContain("Concurrent modification");
    });
  });
});
