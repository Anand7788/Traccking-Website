const express = require("express");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");

const AFTERSHIP_API_KEY = process.env.AFTERSHIP_API_KEY;

console.log("Loaded API Key:", AFTERSHIP_API_KEY);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Detect courier slug
app.post("/detect", async (req, res) => {
  const { tracking_number } = req.body;
  try {
    const response = await axios.post(
      "https://api.aftership.com/v4/couriers/detect",
      { tracking: { tracking_number } },
      {
        headers: {
          "aftership-api-key": AFTERSHIP_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    const slug = response.data.data.couriers?.[0]?.slug;
    if (!slug) throw new Error("Slug not found");
    res.json({ slug });
  } catch (error) {
    console.error("Detect slug failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Slug detection failed." });
  }
});

// Add + Track shipment
app.post("/track", async (req, res) => {
  const { slug, tracking_number } = req.body;
  try {
    // Register the tracking
    await axios.post(
      "https://api.aftership.com/v4/trackings",
      {
        tracking: { slug, tracking_number },
      },
      {
        headers: {
          "aftership-api-key": AFTERSHIP_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    const code = err?.response?.data?.meta?.code;
    if (code !== 4003) {
      console.error("Tracking add failed:", err.response?.data || err.message);
      return res.status(500).json({ error: "Tracking creation failed." });
    }
  }

  // Fetch tracking info
  try {
    const response = await axios.get(
      `https://api.aftership.com/v4/trackings/${slug}/${tracking_number}`,
      {
        headers: {
          "aftership-api-key": AFTERSHIP_API_KEY,
        },
      }
    );
    const trackingInfo = response.data.data.tracking;
    res.json(trackingInfo);
  } catch (err) {
    console.error("Tracking failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Tracking failed." });
  }
});

// Get courier list
app.get("/couriers", async (req, res) => {
  try {
    const response = await axios.get("https://api.aftership.com/v4/couriers/all", {
      headers: { "aftership-api-key": AFTERSHIP_API_KEY },
    });
    const couriers = response.data.data.couriers.map((c) => ({
      name: c.name,
      slug: c.slug,
    }));
    res.json({ couriers });
  } catch (err) {
    console.error("Courier list error:", err.message);
    res.status(500).json({ error: "Failed to fetch couriers." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
