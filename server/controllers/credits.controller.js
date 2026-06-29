import UserModel from "../models/user.model.js";
import dotenv from "dotenv"
dotenv.config()

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn("PayPal credentials missing in .env");
}

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

const CREDIT_MAP = {
  "1.99": 50,
  "4.99": 120,
  "9.99": 300,
};

async function generateAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

export const createCreditsOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    
    // Ensure amount is string for mapping
    const strAmount = amount.toString();

    if (!CREDIT_MAP[strAmount]) {
      return res.status(400).json({ message: "Invalid credit plan" });
    }

    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: strAmount,
            },
            custom_id: JSON.stringify({ userId, credits: CREDIT_MAP[strAmount] }),
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.id) {
      res.status(200).json({ id: data.id });
    } else {
      console.error("PayPal Create Order Error:", data);
      res.status(500).json({ message: "Failed to create PayPal order" });
    }
  } catch (error) {
    console.error("PayPal Order Error:", error);
    res.status(500).json({ message: "PayPal error" });
  }
};

export const captureCreditsOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await generateAccessToken();

    // Capture the payment
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.status === "COMPLETED") {
      // Extract custom_id from the response
      let customIdStr = null;
      if (data.purchase_units && data.purchase_units[0] && data.purchase_units[0].payments && data.purchase_units[0].payments.captures[0]) {
          customIdStr = data.purchase_units[0].payments.captures[0].custom_id;
      }
      
      // Fallback if custom_id is not nested under captures (depends on PayPal API version)
      if (!customIdStr && data.purchase_units && data.purchase_units[0]) {
          customIdStr = data.purchase_units[0].custom_id;
      }

      if (customIdStr) {
        const customId = JSON.parse(customIdStr);
        const userId = customId.userId;
        const creditsToAdd = Number(customId.credits);

        if (userId && creditsToAdd) {
          await UserModel.findByIdAndUpdate(
            userId,
            {
              $inc: { credits: creditsToAdd },
              $set: { isCreditAvailable: true },
            },
            { new: true }
          );
        }
      }
      return res.status(200).json({ success: true, message: "Payment successful" });
    }

    console.error("PayPal Capture Not Completed:", data);
    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    res.status(500).json({ success: false, message: "PayPal capture error" });
  }
};