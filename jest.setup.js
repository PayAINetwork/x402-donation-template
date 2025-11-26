// Learn more: https://github.com/testing-library/jest-dom
// Add custom jest matchers from jest-dom
require("@testing-library/jest-dom");

// Mock environment variables for tests
process.env.STORAGE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXT_PUBLIC_SOLANA_NETWORK = "solana-devnet";
process.env.FACILITATOR_URL = "https://facilitator.payai.network";
