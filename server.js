import express from "express"
import db from "./config/db.js"

const app = express()
app.use(express.json())

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({
      message: error
    })
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000")
})