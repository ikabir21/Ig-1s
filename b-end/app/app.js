import express from "express";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import logger from "morgan";
import indexRouter from "./routes/indexRouter.js"

dotenv.config();
const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

app.use("/", indexRouter);


let PORT;
if (process.env.NODE_ENV !== "production") {
	PORT = 3000;
} else {
	PORT = process.env.PORT;
}

app.listen(PORT, (err) => {
	if (err) console.log(err);
	console.log(`server running on port https://127.0.0.1:${PORT}`);
});
