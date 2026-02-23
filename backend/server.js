const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("✅ MySQL connected");
});


// ✅ SIGNUP API
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.log("❌ DB ERROR:", err);
      return res.status(500).json({ message: err.message });
    }
    console.log("✅ USER REGISTERED");
    res.json({ message: "User registered successfully" });
  });
});


// ✅ LOGIN API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN DATA:", email, password);
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.length > 0) {
      console.log("✅ LOGIN SUCCESS");
      res.json({ message: "Login successful", user: result[0], token: result[0].id });
    } else {
      console.log("❌ INVALID CREDENTIALS");
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});


// ✅ SAVE ANALYSIS
app.post("/api/history", (req, res) => {
  const { user_id, food_name, confidence, calories, protein, fat, carbohydrates, sugar, fiber, image_preview } = req.body;
  const sql = `INSERT INTO food_history (user_id, food_name, confidence, calories, protein, fat, carbohydrates, sugar, fiber, image_preview, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  db.query(sql, [user_id, food_name, confidence, calories, protein, fat, carbohydrates, sugar, fiber, image_preview || ''], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, id: result.insertId });
  });
});


// ✅ GET HISTORY
app.get("/api/history/:userId", (req, res) => {
  const sql = `SELECT * FROM food_history WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});


// ✅ DELETE HISTORY ITEM
app.delete("/api/history/:id", (req, res) => {
  const { user_id } = req.query;
  db.query("DELETE FROM food_history WHERE id = ? AND user_id = ?", [req.params.id, user_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});


// ✅ SAVE PREFERENCES
app.post("/api/preferences", (req, res) => {
  const { user_id, preferences, custom_restrictions } = req.body;
  const sql = `INSERT INTO user_preferences (user_id, preferences, custom_restrictions, updated_at) 
               VALUES (?, ?, ?, NOW()) 
               ON DUPLICATE KEY UPDATE preferences=?, custom_restrictions=?, updated_at=NOW()`;
  db.query(sql, [user_id, JSON.stringify(preferences), custom_restrictions,
                       JSON.stringify(preferences), custom_restrictions], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});


// ✅ GET PREFERENCES
app.get("/api/preferences/:userId", (req, res) => {
  db.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results[0] || null });
  });
});


// ✅ DIET AI CHATBOT
app.post("/api/chat", async (req, res) => {
  try {
    const { message, foodName, nutritionData, dietaryPreferences, customRestrictions } = req.body;

    let dietContext = '';
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      dietContext = `The user follows these dietary preferences: ${dietaryPreferences.join(', ')}.`;
    }
    if (customRestrictions) {
      dietContext += ` Additional restrictions: ${customRestrictions}.`;
    }

    let foodContext = '';
    if (foodName && nutritionData) {
      foodContext = `The food being discussed is "${foodName}" with: Calories: ${nutritionData.calories}kcal, Protein: ${nutritionData.protein}g, Carbs: ${nutritionData.carbohydrates}g, Fat: ${nutritionData.fat}g, Sugar: ${nutritionData.sugar}g, Fiber: ${nutritionData.fiber}g.`;
    }

    const systemPrompt = `You are a friendly, expert diet and nutrition assistant for FoodNutritionAI app.
${foodContext}
${dietContext}
Answer the user's question in 2-4 sentences. Be specific, practical, and personalized.
If the food conflicts with their dietary preferences, clearly mention it.
If asked for a diet plan, give a simple structured plan.
Keep responses concise and helpful.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error?.message || "Groq error");

    const reply = json.choices[0].message.content.trim();
    console.log("✅ Chat reply sent");
    res.json({ success: true, reply });

  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ success: false, reply: "Sorry, I could not process that. Please try again." });
  }
});


// ✅ SAVE NOTIFICATIONS
app.post("/api/notifications", (req, res) => {
  const { user_id, notifications, email_frequency } = req.body;
  const sql = `INSERT INTO user_notifications (user_id, notifications, email_frequency, updated_at)
               VALUES (?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE notifications=?, email_frequency=?, updated_at=NOW()`;
  db.query(sql, [user_id, JSON.stringify(notifications), email_frequency,
                       JSON.stringify(notifications), email_frequency], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// ✅ GET NOTIFICATIONS
app.get("/api/notifications/:userId", (req, res) => {
  db.query("SELECT * FROM user_notifications WHERE user_id = ?", [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results[0] || null });
  });
});


// ✅ SAVE PROFILE
app.post("/api/profile", (req, res) => {
  const { user_id, full_name, email, phone, date_of_birth, gender, height, weight, goal } = req.body;
  const sql = `INSERT INTO user_profile (user_id, full_name, email, phone, date_of_birth, gender, height, weight, goal, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE full_name=?, email=?, phone=?, date_of_birth=?, gender=?, height=?, weight=?, goal=?, updated_at=NOW()`;
  db.query(sql, [user_id, full_name, email, phone, date_of_birth||null, gender, height||null, weight||null, goal,
                       full_name, email, phone, date_of_birth||null, gender, height||null, weight||null, goal], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// ✅ GET PROFILE
app.get("/api/profile/:userId", (req, res) => {
  db.query("SELECT * FROM user_profile WHERE user_id = ?", [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results[0] || null });
  });
});


// ✅ FORGOT PASSWORD
app.post("/forgot-password", (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  console.log("FORGOT EMAIL:", email);
  const sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.length === 0) {
      console.log("❌ EMAIL NOT FOUND");
      return res.status(404).json({ message: "Email not found" });
    }
    console.log("✅ EMAIL FOUND");
    res.json({ message: "Email found" });
  });
});


// ====================================================
// ✅ AI ANALYZE API — using Groq (free, no limits)
// ====================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded." });

    const base64Image = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;

    let dietContext = '';
    try {
      const userPreferences = req.body.preferences ? JSON.parse(req.body.preferences) : null;
      const customRestrictions = req.body.custom_restrictions || '';
      if (userPreferences) {
        const activePrefs = Object.entries(userPreferences)
          .filter(([_, v]) => v === true)
          .map(([k]) => k);
        if (activePrefs.length > 0) {
          dietContext = `The user follows these dietary preferences: ${activePrefs.join(', ')}. `;
        }
      }
      if (customRestrictions) {
        dietContext += `Additional dietary restrictions: ${customRestrictions}. `;
      }
      if (dietContext) console.log("🥗 Diet context:", dietContext);
    } catch (e) {}

    const prompt = `You are a professional nutritionist AI. ${dietContext}Analyze the food in this image and return ONLY valid JSON, no markdown, no explanation.

{
  "foodName": "Name of the food",
  "servingSize": "e.g. 1 cup / 250g",
  "calories": 350,
  "confidence": "high",
  "macros": {
    "protein":       { "amount": 12, "unit": "g" },
    "carbohydrates": { "amount": 45, "unit": "g" },
    "fat":           { "amount": 10, "unit": "g" },
    "fiber":         { "amount": 4,  "unit": "g" },
    "sugar":         { "amount": 8,  "unit": "g" }
  },
  "micros": {
    "sodium":    { "amount": 320, "unit": "mg" },
    "calcium":   { "amount": 80,  "unit": "mg" },
    "iron":      { "amount": 2,   "unit": "mg" },
    "vitaminC":  { "amount": 15,  "unit": "mg" },
    "potassium": { "amount": 400, "unit": "mg" }
  },
  "healthScore": 7,
  "healthLabel": "Moderately Healthy",
  "tips": ["tip 1", "tip 2"],
  "allergens": ["gluten", "dairy"]
}

Return ONLY the JSON. No markdown.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 1024
      })
    });

    const json = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(json.error));

    const rawText = json.choices[0].message.content.trim();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    }

    console.log("✅ AI ANALYSIS DONE:", data.foodName);
    return res.json({ success: true, data });

  } catch (err) {
    console.error("❌ Analyze error FULL:", err.message);
    return res.status(500).json({ error: "Failed to analyze image." });
  }
});


// ✅ SERVER
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});