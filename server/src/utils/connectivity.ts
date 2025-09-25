import axios from "axios";

/**
 * Checks if the server has internet connectivity
 * @returns Promise<boolean> - true if internet is available, false otherwise
 */
export async function checkInternetConnectivity(): Promise<boolean> {
  try {
    // Try to reach a reliable external service with a short timeout
    await axios.get("https://httpbin.org/status/200", {
      timeout: 5000, // 5 second timeout
    });
    return true;
  } catch (error) {
    console.log("No internet connectivity detected:", error);
    return false;
  }
}
