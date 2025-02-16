const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const pdfParse = require("pdf-parse");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const twilio = require("twilio");
const { OpenAI } = require("openai");

require("dotenv").config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(bodyParser.json());

const requiredFields = [
  "name",
  "epic_id",
  "phone_number",
  "attending_physician",
  "date",
  "primary_care_provider",
  "insurance",
  "disposition"
];

// Endpoint to parse and return data from PDF
app.post("/api/parse", upload.single("file"), async (req, res) => {
  try {
    // Extract text from the uploaded PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text.trim();

    // Split PDF text into individual lines
    const lines = pdfText.split("\n").map(line => line.trim()).filter(line => line !== "");

    // Define batch size (e.g., 10 lines per batch)
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < lines.length; i += batchSize) {
      batches.push(lines.slice(i, i + batchSize).join("\n"));
    }

    console.log(`Processing ${batches.length} batches`);

    let allParsedData = [];

    // Process each batch separately
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

      // Send extracted text to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You extract structured data from text and return ONLY valid JSON. No explanations, no additional text."
          },
          {
            role: "user",
            content: `
            Extract the following fields from the provided text:
            ${requiredFields.join(", ")}
            
            PDF Content:
            """${batch}"""

            Return the data as a JSON array of objects.
            Respond ONLY with valid JSON. Do not include any explanations or additional text.
          `
          }
        ],
        max_tokens: 1500
      });

      // Validate OpenAI response
      let aiResponse = response.choices?.[0]?.message?.content?.trim();
      if (!aiResponse) {
        throw new Error("No valid response from OpenAI");
      }

      // Remove Markdown-style backticks if present
      aiResponse = aiResponse.replace(/^```json\s*|```$/g, "").trim();

      console.log(`Batch ${batchIndex + 1} Response:`, aiResponse);

      // Parse response as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(aiResponse);
        allParsedData.push(...parsedData);
      } catch (error) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    }
    res.json(allParsedData);
  } catch (error) {
    console.error("Error in /api/parse:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to verify phone numbers using Twilio API
app.post("/api/verify-phone", async (req, res) => {
  const { phone_number } = req.body;
  try {
    const lookup = await twilioClient.lookups.v1.phoneNumbers(phone_number).fetch();
    res.json({ valid: true, formatted: lookup.phoneNumber });
  } catch (error) {
    res.status(400).json({ valid: false, error: "Invalid phone number" });
  }
});

// Endpoint to save parsed data to Supabase
app.post("/api/discharges", async (req, res) => {
  const { discharges } = req.body;
  try {
    const { error } = await supabase.from("discharges").insert(discharges);
    if (error) throw error;
    res.status(201).send("Data saved successfully");
  } catch (error) {
    res.status(500).json({ error: "Error saving data" });
  }
});

// Endpoint to fetch discharges with pagination and sorting
app.get("/api/discharges", async (req, res) => {
  const { page = 1, limit = 10, sortField = "name", sortOrder = "asc" } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1️⃣ Get total count of discharges
    const { count, error: countError } = await supabase
      .from("discharges")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;
    const totalPages = Math.ceil(count / limit);

    // 2️⃣ Fetch paginated & sorted discharge records
    const { data, error } = await supabase
      .from("discharges")
      .select("*")
      .order(sortField, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // 3️⃣ Return records along with total pages info
    res.json({ data, totalPages });
  } catch (error) {
    console.error("Error fetching discharges:", error.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Serve React Frontend in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));