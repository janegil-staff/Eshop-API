import express from "express";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.options('/*splat', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
