import express from "express"
import isAuth from "../middleware/isAuth.js"
import { createCreditsOrder, captureCreditsOrder } from "../controllers/credits.controller.js"

const creditRouter = express.Router()

creditRouter.post("/order" , isAuth ,createCreditsOrder )
creditRouter.post("/capture" , isAuth, captureCreditsOrder)

export default creditRouter