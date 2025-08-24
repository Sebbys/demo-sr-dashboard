// Install node-fetch v2 for CommonJS: npm install node-fetch@2
const fetch = require("node-fetch");

// Your deployed Google Apps Script Web App URL or override with env var: BASE_URL
const BASE_URL =
  process.env.BASE_URL ||
  "https://script.google.com/macros/s/AKfycbwup0G7Nc00ocAgN7NRKTdjU6ZNP6dXWfd2l2NgnLrH9QqjLLc38U54mNH0OF14Na4/exec";

async function testDashboard(page = 1, limit = 5) {
  console.log(`\n📄 Fetching dashboard page ${page} (limit ${limit})...`);
  try {
    const res = await fetch(`${BASE_URL}?action=dashboard&page=${page}&limit=${limit}`);
    if (!res.ok) {
      console.error("❌ Failed to fetch dashboard:", res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log("✅ Dashboard Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error fetching dashboard:", err);
  }
}

async function testInference() {
  console.log("\n🤖 Running inference...");
  try {
    const res = await fetch(`${BASE_URL}?action=inference`);
    if (!res.ok) {
      console.error("❌ Failed to run inference:", res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log("✅ Inference Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error running inference:", err);
  }
}

;(async () => {
  await testDashboard(1, 5); // Test dashboard with pagination
  await testInference(); // Test inference
})();