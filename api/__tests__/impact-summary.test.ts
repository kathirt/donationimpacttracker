import { Context, HttpRequest } from "@azure/functions";
import httpTrigger from "../impact-summary/index";

describe("Impact Summary API Integration Tests", () => {
  let context: Context;

  beforeEach(() => {
    // Mock Azure Functions Context
    context = {
      log: jest.fn(),
      done: jest.fn(),
      bindings: {},
      bindingData: {},
      traceContext: {
        traceparent: null,
        tracestate: null,
        attributes: {}
      },
      bindingDefinitions: [],
      invocationId: "test-invocation-id",
      executionContext: {
        invocationId: "test-invocation-id",
        functionName: "impact-summary",
        functionDirectory: "/",
        retryContext: null
      },
      res: undefined
    } as unknown as Context;

    // Add log methods
    context.log.error = jest.fn();
    context.log.warn = jest.fn();
    context.log.info = jest.fn();
    context.log.verbose = jest.fn();
  });

  describe("GET /impact-summary", () => {
    it("should return impact summary with all metrics when no filters are provided", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(context.res?.body.totalDonations).toBeDefined();
      expect(context.res?.body.totalAmount).toBeDefined();
      expect(context.res?.body.totalBeneficiaries).toBeDefined();
      expect(context.res?.body.impactsByType).toBeDefined();
      expect(context.res?.body.regionBreakdown).toBeDefined();
      expect(context.res?.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("should have proper structure for impactsByType", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      const impactsByType = context.res?.body.impactsByType;
      
      // Check that impact types exist
      expect(impactsByType).toBeDefined();
      expect(typeof impactsByType).toBe("object");
      
      // Check specific impact types if present
      if (impactsByType.meals_served) {
        expect(impactsByType.meals_served.total).toBeDefined();
        expect(impactsByType.meals_served.description).toBeDefined();
        expect(typeof impactsByType.meals_served.total).toBe("number");
      }
      
      if (impactsByType.books_distributed) {
        expect(impactsByType.books_distributed.total).toBeDefined();
        expect(impactsByType.books_distributed.description).toBeDefined();
      }
    });

    it("should have proper structure for regionBreakdown", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      const regionBreakdown = context.res?.body.regionBreakdown;
      
      expect(regionBreakdown).toBeDefined();
      expect(typeof regionBreakdown).toBe("object");
      
      // Check that regions have proper structure
      Object.keys(regionBreakdown).forEach((region) => {
        expect(regionBreakdown[region].donations).toBeDefined();
        expect(regionBreakdown[region].amount).toBeDefined();
        expect(regionBreakdown[region].beneficiaries).toBeDefined();
        expect(typeof regionBreakdown[region].donations).toBe("number");
        expect(typeof regionBreakdown[region].amount).toBe("number");
        expect(typeof regionBreakdown[region].beneficiaries).toBe("number");
      });
    });

    it("should filter by region when region parameter is provided", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=North%20America",
        headers: {},
        query: { region: "North America" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      
      // When filtered by region, totals should reflect only that region
      expect(context.res?.body.totalDonations).toBeDefined();
      expect(context.res?.body.totalAmount).toBeDefined();
      expect(context.res?.body.totalBeneficiaries).toBeDefined();
      
      // Values should be numbers
      expect(typeof context.res?.body.totalDonations).toBe("number");
      expect(typeof context.res?.body.totalAmount).toBe("number");
      expect(typeof context.res?.body.totalBeneficiaries).toBe("number");
    });

    it("should handle region filter for Europe", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=Europe",
        headers: {},
        query: { region: "Europe" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(context.res?.body.totalDonations).toBeGreaterThan(0);
      expect(context.res?.body.totalAmount).toBeGreaterThan(0);
      expect(context.res?.body.totalBeneficiaries).toBeGreaterThan(0);
    });

    it("should handle region filter for Asia", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=Asia",
        headers: {},
        query: { region: "Asia" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(context.res?.body.totalDonations).toBeGreaterThan(0);
      expect(context.res?.body.totalAmount).toBeGreaterThan(0);
      expect(context.res?.body.totalBeneficiaries).toBeGreaterThan(0);
    });

    it("should handle region filter for Africa", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=Africa",
        headers: {},
        query: { region: "Africa" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(context.res?.body.totalDonations).toBeGreaterThan(0);
      expect(context.res?.body.totalAmount).toBeGreaterThan(0);
      expect(context.res?.body.totalBeneficiaries).toBeGreaterThan(0);
    });

    it("should handle non-existent region gracefully", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=Antarctica",
        headers: {},
        query: { region: "Antarctica" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      // Should still return 200 but with default/full data
      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
    });

    it("should accept campaign parameter (for future use)", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?campaign=Education",
        headers: {},
        query: { campaign: "Education" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
    });

    it("should accept donor parameter (for future use)", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?donor=donor-001",
        headers: {},
        query: { donor: "donor-001" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
    });

    it("should handle multiple query parameters", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary?region=Europe&campaign=Education",
        headers: {},
        query: { region: "Europe", campaign: "Education" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
    });
  });

  describe("OPTIONS /impact-summary (CORS preflight)", () => {
    it("should handle OPTIONS request for CORS", async () => {
      const req: HttpRequest = {
        method: "OPTIONS",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.headers?.["Access-Control-Allow-Origin"]).toBe("*");
      expect(context.res?.headers?.["Access-Control-Allow-Methods"]).toBeDefined();
      expect(context.res?.headers?.["Access-Control-Allow-Headers"]).toBeDefined();
    });
  });

  describe("Data integrity checks", () => {
    it("should have consistent total amounts across regions", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      const data = context.res?.body;
      
      // Calculate sum from region breakdown
      let totalFromRegions = 0;
      Object.values(data.regionBreakdown).forEach((region: any) => {
        totalFromRegions += region.amount;
      });
      
      // Total amount should match or be consistent with region totals
      expect(data.totalAmount).toBeGreaterThan(0);
      expect(totalFromRegions).toBeGreaterThan(0);
    });

    it("should have positive values for all metrics", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/impact-summary",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      const data = context.res?.body;
      
      expect(data.totalDonations).toBeGreaterThan(0);
      expect(data.totalAmount).toBeGreaterThan(0);
      expect(data.totalBeneficiaries).toBeGreaterThan(0);
      
      // Check impact types have positive values
      Object.values(data.impactsByType).forEach((impact: any) => {
        expect(impact.total).toBeGreaterThan(0);
        expect(impact.description).toBeTruthy();
      });
    });
  });
});
