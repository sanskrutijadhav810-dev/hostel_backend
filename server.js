const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ REPLACE THIS with your MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://sanskruti1896_db_user:Hostel123@cluster0.f9dxlob.mongodb.net/?appName=Cluster0";
const DB_NAME = "hostel_cms";
const COL_NAME = "complaints";

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch(err => console.error("❌ MongoDB connection failed:", err));

const col = () => db.collection(COL_NAME);

// GET all complaints
app.get("/complaints", async (req, res) => {
  try {
    const data = await col().find({}).sort({ id: -1 }).toArray();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - add new complaint
app.post("/complaints", async (req, res) => {
  try {
    const all = await col().find({}).toArray();
    const nextId = all.length ? Math.max(...all.map(c => c.id || 0)) + 1 : 1;
    const doc = { ...req.body, id: nextId, dateTime: new Date().toISOString() };
    await col().insertOne(doc);
    res.json({ success: true, id: nextId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - update complaint
app.put("/complaints/:id", async (req, res) => {
  try {
    await col().updateOne({ id: parseInt(req.params.id) }, { $set: req.body });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE - delete complaint
app.delete("/complaints/:id", async (req, res) => {
  try {
    await col().deleteOne({ id: parseInt(req.params.id) });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/", (req, res) => res.send("HostelDesk API is running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
