import express from "express";
import dotenv from "dotenv";
import connectDb from "../server/utils/connectDb.js";
import authRouter from "../server/routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "../server/routes/user.route.js";
import notesRouter from "../server/routes/genrate.route.js";
import pdfRouter from "../server/routes/pdf.route.js";
import creditRouter from "../server/routes/credits.route.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ message: "ExamNotes AI Backend Running 🚀" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/notes", notesRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/credit", creditRouter);

connectDb();

export default app;
