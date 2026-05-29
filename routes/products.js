import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  getFeatured,
  updateGalleryImages,
} from "../controllers/product.controller.js";

const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    if (!isValid) {
      throw new Error("invalid image type");
    }
    const fileName = file.originalname.split(".")[0].split(" ").join("-");
    return {
      folder: "estore/products",
      format: FILE_TYPE_MAP[file.mimetype],
      public_id: `${fileName}-${Date.now()}`,
    };
  },
});

const uploadOptions = multer({ storage });

router.get("/", getProducts);
router.get("/get/count", getProductCount);
router.get("/get/featured/:count", getFeatured);
router.get("/:id", getProduct);
router.post("/", uploadOptions.single("image"), createProduct);
router.put("/:id", uploadOptions.single("image"), updateProduct);
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  updateGalleryImages,
);
router.delete("/:id", deleteProduct);

export default router;
