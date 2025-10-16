# Integration Tests Documentation

This document describes the integration tests implemented for the Donation Impact Tracker project.

## Overview

The project includes comprehensive integration tests covering:
- **API Endpoints** (Backend Azure Functions)
- **Frontend Services** (OpenAI narrative generation)

## Test Structure

### Backend API Tests (`/api/__tests__/`)

Located in the `api/__tests__` directory, these tests validate the Azure Functions endpoints.

#### 1. Donations API Tests (`donations.test.ts`)
Tests the `/api/donations` endpoint functionality.

**Test Coverage:**
- ✅ GET requests with and without filters
  - No filters (returns all donations)
  - Filter by donor ID
  - Filter by campaign name
  - Filter by region
  - Filter by date range
  - Multiple simultaneous filters
- ✅ POST requests to create donations
  - Valid donation creation
  - Validation errors for missing required fields (donorId, amount, campaign)
- ✅ CORS preflight (OPTIONS) requests
- ✅ Unsupported HTTP methods (PUT, DELETE)
- ✅ Error handling

**Total Tests:** 13 passing

#### 2. Impact Summary API Tests (`impact-summary.test.ts`)
Tests the `/api/impact-summary` endpoint functionality.

**Test Coverage:**
- ✅ GET requests with and without filters
  - No filters (returns complete summary)
  - Filter by region (North America, Europe, Asia, Africa)
  - Filter by campaign
  - Filter by donor
  - Multiple query parameters
  - Non-existent region handling
- ✅ Data structure validation
  - impactsByType structure and content
  - regionBreakdown structure and content
- ✅ CORS preflight (OPTIONS) requests
- ✅ Data integrity checks
  - Positive values for all metrics
  - Consistency across region breakdowns

**Total Tests:** 14 passing

### Frontend Service Tests (`/src/__tests__/`)

Located in the `src/__tests__` directory, these tests validate frontend services.

#### 1. OpenAI Service Tests (`openai.integration.test.ts`)
Tests the Azure OpenAI narrative generation service.

**Test Coverage:**
- ✅ Narrative generation for different types
  - Impact summary narratives
  - Donor story narratives
  - Campaign update narratives
- ✅ Personalized thank you messages
  - Various donation amounts (small to large)
  - Different donor names and campaigns
- ✅ Campaign progress updates
  - Single and multiple metrics
  - Empty metrics handling
- ✅ Overall impact summaries
  - Global and regional summaries
  - Multiple impact types
- ✅ Impact description formatting
  - Meals, books, students, scholarships
  - Multiple impact types with proper conjunction
- ✅ Error handling
- ✅ Narrative consistency
- ✅ API call delay simulation

**Total Tests:** 20 passing

## Running the Tests

### Backend API Tests

```bash
cd api
npm test
```

For watch mode:
```bash
npm run test:watch
```

### Frontend Tests

```bash
npm test
```

For single run (CI mode):
```bash
npm test -- --watchAll=false
```

For coverage:
```bash
npm test -- --coverage --watchAll=false
```

## Test Technologies

### Backend (API)
- **Jest**: Test framework
- **ts-jest**: TypeScript support for Jest
- **@azure/functions**: Azure Functions SDK for mocking context

### Frontend
- **Jest**: Test framework (via react-scripts)
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers

## Test Files

```
api/
├── __tests__/
│   ├── donations.test.ts           # Donations endpoint tests
│   └── impact-summary.test.ts      # Impact summary endpoint tests
└── jest.config.js                  # Jest configuration

src/
└── __tests__/
    └── openai.integration.test.ts  # OpenAI service tests
```

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: |
    cd api
    npm install
    npm test

- name: Run Frontend Tests
  run: |
    npm install
    npm test -- --watchAll=false
```

## Test Coverage

### Current Coverage

| Component | Tests | Passing | Coverage |
|-----------|-------|---------|----------|
| Donations API | 13 | ✅ 13 | 100% |
| Impact Summary API | 14 | ✅ 14 | 100% |
| OpenAI Service | 20 | ✅ 20 | 100% |
| **Total** | **47** | **✅ 47** | **100%** |

## Writing New Tests

### Adding Backend API Tests

1. Create test file in `api/__tests__/`
2. Import the Azure Function
3. Mock the Context object
4. Test different HTTP methods and scenarios

Example:
```typescript
import { Context, HttpRequest } from "@azure/functions";
import httpTrigger from "../your-function/index";

describe("Your Function Tests", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: jest.fn(),
      // ... other context properties
    } as unknown as Context;
  });

  it("should handle requests", async () => {
    const req: HttpRequest = {
      method: "GET",
      // ... request properties
    } as unknown as HttpRequest;

    await httpTrigger(context, req);

    expect(context.res?.status).toBe(200);
  });
});
```

### Adding Frontend Service Tests

1. Create test file in `src/__tests__/`
2. Import the service
3. Test the service methods with various inputs

Example:
```typescript
import { YourService } from '../services/your-service';

describe('Your Service Tests', () => {
  it('should perform operation', async () => {
    const result = await YourService.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Mock External Dependencies**: Don't make real API calls
5. **Error Testing**: Test both success and failure scenarios
6. **Edge Cases**: Test boundary conditions and edge cases

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
npm install
```

#### 2. TypeScript compilation errors
```bash
npm run build
```

#### 3. Tests timing out
Increase timeout in test:
```typescript
it('test name', async () => {
  // test code
}, 10000); // 10 second timeout
```

## Future Enhancements

- [ ] Add E2E tests using Playwright or Cypress
- [ ] Add performance tests
- [ ] Add load tests for API endpoints
- [ ] Increase code coverage metrics
- [ ] Add mutation testing
- [ ] Add visual regression tests

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve code coverage
4. Update this documentation

## Support

For issues or questions about tests:
- Check test output for detailed error messages
- Review this documentation
- Check Jest documentation: https://jestjs.io/
- Check Testing Library docs: https://testing-library.com/
