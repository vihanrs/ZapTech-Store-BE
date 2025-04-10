import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
  retrieveSessionStatus,
} from "../application/payment";

export const paymentsRouter = express.Router();

// paymentsRouter.route("/webhook").post(handleWebhook);
paymentsRouter.route("/create-checkout-session").post(createCheckoutSession);
paymentsRouter.route("/session-status").get(retrieveSessionStatus);
