# Testing Guide

This project includes comprehensive test coverage for API routes and database operations.

## Running Tests

### Run all tests

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run a specific test file

```bash
pnpm test app/api/write-message/route.test.ts
```

## Test Structure

### API Route Tests

#### `/api/write-message` Tests

- ✅ Successful donation with name and message
- ✅ Donation without optional fields
- ✅ Payment verification failure (402)
- ✅ Invalid amount validation (400)
- ✅ Missing amount validation (400)
- ✅ Invalid payment response (500)
- ✅ Database error handling
- ✅ Missing transaction signature handling

#### `/api/messages` Tests

- ✅ Default pagination parameters
- ✅ Custom pagination
- ✅ Sort by top donations
- ✅ Maximum limit enforcement (100)
- ✅ Invalid page number (400)
- ✅ Invalid limit (400)
- ✅ Invalid sort parameter (400)
- ✅ Database error handling
- ✅ Empty donations array
- ✅ Correct page calculation

### Database Tests

#### `storeDonation` Tests

- ✅ Store donation with all fields
- ✅ Store donation with required fields only
- ✅ Handle database errors

#### `getDonations` Tests

- ✅ Retrieve recent donations
- ✅ Retrieve top donations by amount
- ✅ Handle pagination correctly

#### `getDonationStats` Tests

- ✅ Return donation statistics
- ✅ Handle zero donations
- ✅ Handle database errors

## Test Coverage Goals

The project aims for:

- **70%** branch coverage
- **70%** function coverage
- **70%** line coverage
- **70%** statement coverage

## CI/CD Integration

Tests run automatically on:

- Push to `main`, `develop`, or `feat/**` branches
- Pull requests to `main` or `develop`

Tests run on Node.js versions:

- 18.x
- 20.x

## Writing New Tests

### Example Test Structure

```typescript
import { NextRequest } from "next/server";
import { GET } from "./route";
import { someFunction } from "@/lib/some-module";

// Mock dependencies
jest.mock("@/lib/some-module");

describe("/api/your-endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle success case", async () => {
    // Arrange
    const mockData = {
      /* ... */
    };
    (someFunction as jest.Mock).mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/your-endpoint", {
      method: "GET",
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Mocking Guidelines

### Database Mocks

```typescript
jest.mock("@/lib/db", () => ({
  storeDonation: jest.fn(),
  getDonations: jest.fn(),
  getDonationStats: jest.fn(),
}));
```

### Payment Headers

```typescript
const mockPaymentResponse = Buffer.from(
  JSON.stringify({
    payer: "solana-address-here",
    transaction: "signature-here",
  })
).toString("base64");
```

## Troubleshooting

### Database Connection Errors

Tests use mock database connections. Ensure `jest.setup.js` includes:

```javascript
process.env.STORAGE_URL = "postgresql://test:test@localhost:5432/test";
```

### Module Resolution Issues

Check that `tsconfig.json` includes proper path mappings:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Mock External Dependencies**: Don't hit real databases or APIs
3. **Test Error Cases**: Include happy path and error scenarios
4. **Clear Test Names**: Use descriptive `it()` statements
5. **Clean Up**: Use `beforeEach` to reset mocks
6. **Isolate Tests**: Each test should be independent

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Next.js](https://nextjs.org/docs/testing)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
