import { NextRequest } from "next/server";
import { POST } from "./route";
import { storeDonation } from "@/lib/db";

// Mock the database module
jest.mock("@/lib/db", () => ({
  storeDonation: jest.fn(),
}));

describe("/api/write-message", () => {
  const mockStoreDonation = storeDonation as jest.MockedFunction<
    typeof storeDonation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should successfully process a donation with name and message", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          transaction: "mock-signature-123",
        })
      ).toString("base64");

      const mockDonation = {
        id: 1,
        donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        donor_name: "John Doe",
        amount_usd: 25.5,
        currency: "USDC",
        message: "Great project!",
        created_at: new Date(),
      };

      mockStoreDonation.mockResolvedValueOnce(mockDonation);

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 25.5,
            name: "John Doe",
            message: "Great project!",
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("John Doe");
      expect(data.message).toContain("$25.5");
      expect(data.data.donator).toBe(
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
      );
      expect(data.data.amountUsd).toBe(25.5);
      expect(data.data.currency).toBe("USDC");
      expect(data.data.name).toBe("John Doe");
      expect(data.data.message).toBe("Great project!");
      expect(mockStoreDonation).toHaveBeenCalledWith(
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        25.5,
        "John Doe",
        "Great project!",
        "mock-signature-123"
      );
    });

    it("should process donation without optional name and message", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          transaction: "mock-signature-456",
        })
      ).toString("base64");

      const mockDonation = {
        id: 2,
        donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        donor_name: null,
        amount_usd: 10,
        currency: "USDC",
        message: null,
        created_at: new Date(),
      };

      mockStoreDonation.mockResolvedValueOnce(mockDonation);

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 10,
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBeNull();
      expect(data.data.message).toBeNull();
      expect(mockStoreDonation).toHaveBeenCalledWith(
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        10,
        undefined,
        undefined,
        "mock-signature-456"
      );
    });

    it("should return 402 when payment header is missing", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 10,
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(402);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Payment verification failed");
      expect(mockStoreDonation).not.toHaveBeenCalled();
    });

    it("should return 400 when amount is less than $0.01", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          transaction: "mock-signature-789",
        })
      ).toString("base64");

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
            body: JSON.stringify({
            amount: 0.005,
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Amount must be at least $0.01");
      expect(mockStoreDonation).not.toHaveBeenCalled();
    });

    it("should return 400 when amount is missing", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          transaction: "mock-signature-789",
        })
      ).toString("base64");

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Amount must be at least $0.01");
    });

    it("should return 500 when payment response is invalid", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": "invalid-base64-!!!",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 10,
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid payment response");
      expect(mockStoreDonation).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          transaction: "mock-signature-error",
        })
      ).toString("base64");

      mockStoreDonation.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 15,
            name: "Jane Doe",
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection failed");
    });

    it("should handle transaction signature missing in payment response", async () => {
      // Arrange
      const mockPaymentResponse = Buffer.from(
        JSON.stringify({
          payer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          // No transaction field
        })
      ).toString("base64");

      const mockDonation = {
        id: 3,
        donor_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        donor_name: null,
        amount_usd: 5,
        currency: "USDC",
        message: null,
        created_at: new Date(),
      };

      mockStoreDonation.mockResolvedValueOnce(mockDonation);

      const request = new NextRequest(
        "http://localhost:3000/api/write-message",
        {
          method: "POST",
          headers: {
            "X-PAYMENT-RESPONSE": mockPaymentResponse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 5,
          }),
        }
      );

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.transactionSignature).toBeNull();
      expect(mockStoreDonation).toHaveBeenCalledWith(
        "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        5,
        undefined,
        undefined,
        undefined
      );
    });
  });
});
