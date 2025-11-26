import { NextRequest } from "next/server";

/**
 * Test utility functions for API route testing
 */

/**
 * Create a mock payment response header
 */
export function createMockPaymentHeader(
  payerAddress: string,
  transactionSignature?: string
): string {
  return Buffer.from(
    JSON.stringify({
      payer: payerAddress,
      ...(transactionSignature && { transaction: transactionSignature }),
    })
  ).toString("base64");
}

/**
 * Create a mock NextRequest with payment headers
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    paymentHeader?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "POST", body, paymentHeader, headers = {} } = options;

  const allHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (paymentHeader) {
    allHeaders["X-PAYMENT-RESPONSE"] = paymentHeader;
  }

  return new NextRequest(url, {
    method,
    headers: allHeaders,
    ...(body && { body: JSON.stringify(body) }),
  });
}

/**
 * Mock Solana wallet address for testing
 */
export const MOCK_WALLET_ADDRESSES = {
  alice: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  bob: "8yLXtg3DX98e98UYTEqcE6kCdIfUfRpB94WfZpKpthBtV",
  charlie: "9zMXtg4EY09f09VZUFrdF7lDejJgVgSqC05XgZqLuitCW",
};

/**
 * Mock transaction signatures for testing
 */
export const MOCK_SIGNATURES = {
  success:
    "5J4kXHEQKZDJq5j5N9VwZz3YVXYQKZDJq5j5N9VwZz3YVXYQKZDJq5j5N9VwZz3YVXYQ",
  failed: "2A1bYGFPRLEMn2m2K6UxYy1XUWXPRLEMn2m2K6UxYy1XUWXPRLEMn2m2K6UxYy1XUWX",
};

/**
 * Create mock donation data
 */
export function createMockDonation(overrides: Partial<any> = {}) {
  return {
    id: 1,
    donor_address: MOCK_WALLET_ADDRESSES.alice,
    donor_name: "Test Donor",
    amount_usd: 25.0,
    currency: "USDC",
    message: "Test message",
    created_at: new Date("2025-11-25T10:00:00Z"),
    ...overrides,
  };
}

/**
 * Create multiple mock donations
 */
export function createMockDonations(count: number): any[] {
  return Array.from({ length: count }, (_, i) =>
    createMockDonation({
      id: i + 1,
      donor_name: `Donor ${i + 1}`,
      amount_usd: 10 + i * 5,
    })
  );
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert response status and parse JSON
 */
export async function expectJsonResponse(
  response: Response,
  expectedStatus: number = 200
) {
  expect(response.status).toBe(expectedStatus);
  return await response.json();
}

/**
 * Mock database return values
 */
export const mockDatabaseReturns = {
  storeDonation: {
    success: (overrides = {}) => ({
      id: 1,
      donorAddress: MOCK_WALLET_ADDRESSES.alice,
      donorName: "Test Donor",
      amountUsd: "25.00",
      currency: "USDC",
      message: "Test message",
      transactionSignature: MOCK_SIGNATURES.success,
      createdAt: new Date(),
      ...overrides,
    }),
    minimal: {
      id: 1,
      donorAddress: MOCK_WALLET_ADDRESSES.alice,
      donorName: null,
      amountUsd: "10.00",
      currency: "USDC",
      message: null,
      transactionSignature: null,
      createdAt: new Date(),
    },
  },
  getDonations: {
    empty: {
      donations: [],
      total: 0,
    },
    withData: (count: number = 3) => ({
      donations: createMockDonations(count),
      total: count,
    }),
  },
  getDonationStats: {
    empty: {
      totalDonations: 0,
      totalAmount: 0,
    },
    withData: {
      totalDonations: 10,
      totalAmount: 250.0,
    },
  },
};
