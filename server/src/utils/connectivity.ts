import axios from "axios";

/**
 * Checks if the server has internet connectivity
 * @returns Promise<boolean> - true if internet is available, false otherwise
 */
export async function checkInternetConnectivity(): Promise<boolean> {
  try {
    const checkUrl =
      process.env.CONNECTIVITY_CHECK_URL || "https://httpbin.org/status/200";
    const timeout = parseInt(process.env.CONNECTIVITY_TIMEOUT || "5000");

    // Try to reach a reliable external service with configurable timeout
    await axios.get(checkUrl, {
      timeout,
    });
    return true;
  } catch (error) {
    console.log("No internet connectivity detected:", error);
    return false;
  }
}
