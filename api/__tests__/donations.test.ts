import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import httpTrigger from "../donations/index";

describe("Donations API Integration Tests", () => {
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
        functionName: "donations",
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

  describe("GET /donations", () => {
    it("should return all donations when no filters are provided", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations",
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
      expect(Array.isArray(context.res?.body)).toBe(true);
      expect(context.res?.body.length).toBeGreaterThan(0);
      expect(context.res?.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("should filter donations by donor", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations?donor=donor-001",
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
      expect(Array.isArray(context.res?.body)).toBe(true);
      
      // All returned donations should match the donor filter
      context.res?.body.forEach((donation: any) => {
        expect(donation.donorId).toBe("donor-001");
      });
    });

    it("should filter donations by campaign", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations?campaign=School",
        headers: {},
        query: { campaign: "School" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(Array.isArray(context.res?.body)).toBe(true);
      
      // All returned donations should match the campaign filter
      context.res?.body.forEach((donation: any) => {
        expect(donation.campaign.toLowerCase()).toContain("school");
      });
    });

    it("should filter donations by region", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations?region=North%20America",
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
      expect(Array.isArray(context.res?.body)).toBe(true);
      
      // All returned donations should match the region filter
      context.res?.body.forEach((donation: any) => {
        expect(donation.region).toBe("North America");
      });
    });

    it("should filter donations by date range", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations?startDate=2024-01-01&endDate=2024-01-15",
        headers: {},
        query: { startDate: "2024-01-01", endDate: "2024-01-15" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(Array.isArray(context.res?.body)).toBe(true);
      
      // All returned donations should be within the date range
      context.res?.body.forEach((donation: any) => {
        const donationDate = new Date(donation.date);
        expect(donationDate.getTime()).toBeGreaterThanOrEqual(new Date("2024-01-01").getTime());
        expect(donationDate.getTime()).toBeLessThanOrEqual(new Date("2024-01-15").getTime());
      });
    });

    it("should handle multiple filters simultaneously", async () => {
      const req: HttpRequest = {
        method: "GET",
        url: "http://localhost:7071/api/donations?region=Europe&campaign=Digital",
        headers: {},
        query: { region: "Europe", campaign: "Digital" },
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(200);
      expect(context.res?.body).toBeDefined();
      expect(Array.isArray(context.res?.body)).toBe(true);
      
      // All returned donations should match all filters
      context.res?.body.forEach((donation: any) => {
        expect(donation.region).toBe("Europe");
        expect(donation.campaign.toLowerCase()).toContain("digital");
      });
    });
  });

  describe("POST /donations", () => {
    it("should create a new donation with all required fields", async () => {
      const newDonation = {
        donorId: "donor-test",
        donorName: "Test Donor",
        amount: 1000,
        campaign: "Test Campaign",
        region: "North America"
      };

      const req: HttpRequest = {
        method: "POST",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: newDonation,
        rawBody: JSON.stringify(newDonation),
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(201);
      expect(context.res?.body).toBeDefined();
      expect(context.res?.body.id).toBeDefined();
      expect(context.res?.body.donorId).toBe(newDonation.donorId);
      expect(context.res?.body.amount).toBe(newDonation.amount);
      expect(context.res?.body.campaign).toBe(newDonation.campaign);
      expect(context.res?.body.date).toBeDefined(); // Should auto-generate date
    });

    it("should return 400 when donorId is missing", async () => {
      const invalidDonation = {
        amount: 500,
        campaign: "Test Campaign"
      };

      const req: HttpRequest = {
        method: "POST",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: invalidDonation,
        rawBody: JSON.stringify(invalidDonation),
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(400);
      expect(context.res?.body.error).toBeDefined();
    });

    it("should return 400 when amount is missing", async () => {
      const invalidDonation = {
        donorId: "donor-test",
        campaign: "Test Campaign"
      };

      const req: HttpRequest = {
        method: "POST",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: invalidDonation,
        rawBody: JSON.stringify(invalidDonation),
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(400);
      expect(context.res?.body.error).toBeDefined();
    });

    it("should return 400 when campaign is missing", async () => {
      const invalidDonation = {
        donorId: "donor-test",
        amount: 500
      };

      const req: HttpRequest = {
        method: "POST",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: invalidDonation,
        rawBody: JSON.stringify(invalidDonation),
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(400);
      expect(context.res?.body.error).toBeDefined();
    });
  });

  describe("OPTIONS /donations (CORS preflight)", () => {
    it("should handle OPTIONS request for CORS", async () => {
      const req: HttpRequest = {
        method: "OPTIONS",
        url: "http://localhost:7071/api/donations",
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

  describe("Unsupported HTTP methods", () => {
    it("should return 405 for PUT method", async () => {
      const req: HttpRequest = {
        method: "PUT",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: {},
        rawBody: "{}",
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(405);
      expect(context.res?.body.error).toBe("Method not allowed");
    });

    it("should return 405 for DELETE method", async () => {
      const req: HttpRequest = {
        method: "DELETE",
        url: "http://localhost:7071/api/donations",
        headers: {},
        query: {},
        params: {},
        body: undefined,
        rawBody: undefined,
        get: jest.fn()
      } as unknown as HttpRequest;

      await httpTrigger(context, req);

      expect(context.res?.status).toBe(405);
      expect(context.res?.body.error).toBe("Method not allowed");
    });
  });
});
