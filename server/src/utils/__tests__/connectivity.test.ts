import axios from "axios";
import { checkInternetConnectivity } from "../connectivity";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("connectivity.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid noise in test output
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkInternetConnectivity", () => {
    it("should return true when internet is available", async () => {
      // Mock successful axios response
      mockedAxios.get.mockResolvedValueOnce({ data: "OK" });

      const result = await checkInternetConnectivity();

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://httpbin.org/status/200",
        {
          timeout: 5000,
        }
      );
    });

    it("should return false when internet is not available", async () => {
      // Mock axios to throw an error
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://httpbin.org/status/200",
        {
          timeout: 5000,
        }
      );
    });

    it("should return false on timeout", async () => {
      // Mock timeout error
      const timeoutError = new Error("timeout of 5000ms exceeded");
      timeoutError.name = "TimeoutError";
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://httpbin.org/status/200",
        {
          timeout: 5000,
        }
      );
    });

    it("should return false on connection refused", async () => {
      // Mock connection refused error
      const connectionError = new Error("connect ECONNREFUSED");
      connectionError.name = "ECONNREFUSED";
      mockedAxios.get.mockRejectedValueOnce(connectionError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should return false on DNS resolution failure", async () => {
      // Mock DNS resolution error
      const dnsError = new Error("getaddrinfo ENOTFOUND");
      dnsError.name = "ENOTFOUND";
      mockedAxios.get.mockRejectedValueOnce(dnsError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should return false on HTTP error status", async () => {
      // Mock HTTP error response
      const httpError = {
        response: {
          status: 500,
          statusText: "Internal Server Error",
        },
        message: "Request failed with status code 500",
      };
      mockedAxios.get.mockRejectedValueOnce(httpError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should return false on 404 error", async () => {
      // Mock 404 error
      const notFoundError = {
        response: {
          status: 404,
          statusText: "Not Found",
        },
        message: "Request failed with status code 404",
      };
      mockedAxios.get.mockRejectedValueOnce(notFoundError);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should log error when connectivity check fails", async () => {
      const consoleSpy = jest.spyOn(console, "log");
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await checkInternetConnectivity();

      expect(consoleSpy).toHaveBeenCalledWith(
        "No internet connectivity detected:",
        networkError
      );
    });

    it("should not log anything when connectivity check succeeds", async () => {
      const consoleSpy = jest.spyOn(console, "log");
      mockedAxios.get.mockResolvedValueOnce({ data: "OK" });

      await checkInternetConnectivity();

      expect(consoleSpy).not.toHaveBeenCalledWith(
        "No internet connectivity detected:",
        expect.anything()
      );
    });

    it("should use correct URL and timeout configuration", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: "OK" });

      await checkInternetConnectivity();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://httpbin.org/status/200",
        {
          timeout: 5000,
        }
      );
    });

    it("should handle axios configuration correctly", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: "OK" });

      await checkInternetConnectivity();

      const callArgs = mockedAxios.get.mock.calls[0];
      expect(callArgs[0]).toBe("https://httpbin.org/status/200");
      expect(callArgs[1]).toEqual({ timeout: 5000 });
    });

    it("should return false for any axios error", async () => {
      // Test with various error types
      const errors = [
        new Error("Generic error"),
        { message: "Object error" },
        "String error",
        null,
        undefined,
      ];

      for (const error of errors) {
        mockedAxios.get.mockRejectedValueOnce(error);
        const result = await checkInternetConnectivity();
        expect(result).toBe(false);
      }
    });

    it("should handle concurrent calls correctly", async () => {
      mockedAxios.get.mockResolvedValue({ data: "OK" });

      // Make multiple concurrent calls
      const promises = [
        checkInternetConnectivity(),
        checkInternetConnectivity(),
        checkInternetConnectivity(),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([true, true, true]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid successive calls", async () => {
      mockedAxios.get.mockResolvedValue({ data: "OK" });

      const result1 = await checkInternetConnectivity();
      const result2 = await checkInternetConnectivity();
      const result3 = await checkInternetConnectivity();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe("Error handling edge cases", () => {
    it("should handle axios throwing non-Error objects", async () => {
      mockedAxios.get.mockRejectedValueOnce("String error");

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should handle axios throwing null", async () => {
      mockedAxios.get.mockRejectedValueOnce(null);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should handle axios throwing undefined", async () => {
      mockedAxios.get.mockRejectedValueOnce(undefined);

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });

    it("should handle axios throwing objects without message property", async () => {
      mockedAxios.get.mockRejectedValueOnce({ code: "SOME_ERROR" });

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });
  });

  describe("Network simulation scenarios", () => {
    it("should handle slow network response", async () => {
      // Simulate slow response that still succeeds
      mockedAxios.get.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: "OK" }), 100);
          })
      );

      const result = await checkInternetConnectivity();

      expect(result).toBe(true);
    });

    it("should handle network that times out", async () => {
      // Simulate timeout
      mockedAxios.get.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error("timeout of 5000ms exceeded");
              error.name = "TimeoutError";
              reject(error);
            }, 100);
          })
      );

      const result = await checkInternetConnectivity();

      expect(result).toBe(false);
    });
  });
});
