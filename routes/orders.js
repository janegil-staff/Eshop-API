import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getTotalSales,
  getOrderCount,
  getUserOrders,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/get/totalsales", getTotalSales);
router.get("/get/count", getOrderCount);
router.get("/get/userorders/:userid", getUserOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
