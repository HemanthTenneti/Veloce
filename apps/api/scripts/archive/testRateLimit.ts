/* eslint-disable no-console */
/**
 * Rate Limiter Tester Script
 *
 * Tests the general API rate limiter by making rapid requests
 * to see when it kicks in (100 requests per 15 minutes per IP)
 *
 * Usage: npx tsx scripts/testRateLimit.ts
 */

import axios, { AxiosError } from "axios";

// Configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:3000";
const ENDPOINT = "/api/vehicles";
const RATE_LIMIT = 100; // Should match server.ts apiLimiter.max
const REQUEST_COUNT = RATE_LIMIT * (0.1 * RATE_LIMIT); // Test exceeding the limit by 10%

interface RateLimitResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

async function testRateLimit() {
  console.log("🚀 Starting Rate Limiter Test");
  console.log(`📍 Target: ${API_BASE_URL}${ENDPOINT}`);
  console.log(`⚙️  Rate Limit: ${RATE_LIMIT} requests per 15 minutes`);
  console.log(`📊 Testing: ${REQUEST_COUNT} requests\n`);

  let successCount = 0;
  let rateLimitedCount = 0;
  const results: { attempt: number; status: number; message: string }[] = [];

  for (let i = 1; i <= REQUEST_COUNT; i++) {
    try {
      const response = await axios.get<unknown>(`${API_BASE_URL}${ENDPOINT}`, {
        timeout: 5000,
      });

      successCount++;

      // Only log every 10th successful request to avoid spam
      if (i % 10 === 0 || i <= 5) {
        console.log(`✅ Request #${i}: Status ${response.status} (OK)`);
      }

      results.push({
        attempt: i,
        status: response.status,
        message: "Success",
      });
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 429) {
        // Rate limited
        rateLimitedCount++;
        const data = axiosError.response.data as RateLimitResponse;

        console.log(
          `\n⛔ Request #${i}: Status ${axiosError.response.status} (RATE LIMITED)`,
        );
        console.log(`   Message: "${data.message}"`);
        console.log(`   Timestamp: ${data.timestamp}\n`);

        results.push({
          attempt: i,
          status: 429,
          message: data.message || "Rate limited",
        });
      } else {
        console.error(`❌ Request #${i}: Error - ${axiosError.message}`);
        results.push({
          attempt: i,
          status: axiosError.response?.status || 0,
          message: axiosError.message,
        });
      }
    }

    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successful Requests: ${successCount}/${REQUEST_COUNT}`);
  console.log(`⛔ Rate Limited (429): ${rateLimitedCount}/${REQUEST_COUNT}`);
  console.log(
    `💡 Rate Limit Kicked In At: Request #${RATE_LIMIT + 1 || "N/A"}`,
  );
  console.log("=".repeat(60) + "\n");

  if (rateLimitedCount === 0) {
    console.warn(
      "⚠️  No rate limiting detected! Check if the server is running and rate limiter is enabled.\n",
    );
  } else {
    console.log(
      `✅ Rate limiter is working correctly! Started blocking at request #${RATE_LIMIT + 1}\n`,
    );
  }

  // Detailed results for first 5 and last 5 requests
  console.log("📋 Detailed Results (First 5 & Last 5 Requests):");
  console.log("-".repeat(60));

  const first5 = results.slice(0, 5);
  const last5 = results.slice(-5);

  console.log("First 5 Requests:");
  first5.forEach(r => {
    const icon =
      r.status === 200 ? "✅"
      : r.status === 429 ? "⛔"
      : "❌";
    console.log(`  ${icon} #${r.attempt}: ${r.status} - ${r.message}`);
  });

  console.log("\nLast 5 Requests:");
  last5.forEach(r => {
    const icon =
      r.status === 200 ? "✅"
      : r.status === 429 ? "⛔"
      : "❌";
    console.log(`  ${icon} #${r.attempt}: ${r.status} - ${r.message}`);
  });

  console.log("\n" + "=".repeat(60));
}

// Run the test
testRateLimit().catch(error => {
  console.error(
    "❌ Test failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
