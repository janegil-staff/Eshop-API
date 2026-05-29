import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { Category } from "../models/category.js";

export const getProducts = async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    return res.status(500).json({ success: false });
  }
  res.send(productList);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return res.status(500).json({ success: false });
  }
  res.send(product);
};
export const createProduct = async (req, res) => {
  console.log(req.file);
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: file.path, // Cloudinary URL
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send(product);
};

export const updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const file = req.file;
  const imagepath = file ? file.path : product.image; // Cloudinary URL or keep existing

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true },
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
};

export const deleteProduct = (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "the product is deleted!",
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

export const getProductCount = async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    return res.status(500).json({ success: false });
  }
  res.send({ productCount });
};

export const getFeatured = async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    return res.status(500).json({ success: false });
  }
  res.send(products);
};

export const updateGalleryImages = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const files = req.files;
  let imagesPaths = [];
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  if (files) {
    files.map((file) => {
      imagesPaths.push(`${basePath}${file.filename}`);
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { images: imagesPaths },
    { new: true },
  );

  if (!product) return res.status(500).send("the gallery cannot be updated!");

  res.send(product);
};
