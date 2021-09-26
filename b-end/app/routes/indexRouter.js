import express from "express";
import dotenv from "dotenv";
dotenv.config();
import scrapeData from "../../scrapper.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.send("Hello from server");
});

router.post("/scrape", async (req, res) => {
	const { username, password } = req.body;
	const userInfo = await scrapeData({ username, password });
  
  res.send(userInfo);
});

export default router;
