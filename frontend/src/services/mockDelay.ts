/* Simulated network latency for the mock services. Remove once they call the real API. */
export function mockDelay(ms = 250): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
