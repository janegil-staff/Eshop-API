import { Product } from '../models/product.js';
import { Category } from '../models/category.js';
import {
  searchCjProducts,
  getCjProductDetail,
} from '../services/cj.service.js';
import {
  parseCjCost,
  cleanName,
  applyMarkup,
  collectImages,
} from '../utils/cjMapper.js';

const DEFAULT_MULTIPLIER = 2.5;

// GET /api/cj/search?q=knife&pageSize=20
export const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const pageNum = parseInt(req.query.pageNum, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 50);

    const data = await searchCjProducts({ keyword, pageNum, pageSize });

    // Trim to a clean shape for the dashboard.
    const list = (data.list || []).map((p) => ({
      pid: p.pid,
      name: p.productNameEn || 'Untitled',
      sku: p.productSku,
      image: p.productImage,
      cost: parseCjCost(p.sellPrice),
      costRaw: p.sellPrice,
      category: p.categoryName,
      productType: p.productType,
    }));

    res.json({
      total: data.total,
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      list,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Match a CJ category name to one of ours; create it if missing.
async function resolveCategory(cjCategoryName) {
  const name = (cjCategoryName || 'Imported').trim() || 'Imported';
  let category = await Category.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  });
  if (!category) {
    category = await Category.create({ name, icon: '', color: '#185FA5' });
  }
  return category;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/cj/import  body: { pid, multiplier? }
export const importProduct = async (req, res) => {
  try {
    const { pid, multiplier } = req.body;
    if (!pid) return res.status(400).json({ error: 'pid is required' });

    // Don't import the same CJ product twice.
    const existing = await Product.findOne({ supplierProductId: pid });
    if (existing) {
      return res.status(409).json({
        error: 'This product is already imported',
        productId: existing.id || existing._id,
      });
    }

    const detail = await getCjProductDetail(pid);
    if (!detail) return res.status(404).json({ error: 'CJ product not found' });

    const cost = parseCjCost(detail.sellPrice);
    const price = applyMarkup(cost, multiplier || DEFAULT_MULTIPLIER);
    const images = collectImages(detail);
    const category = await resolveCategory(detail.categoryName);

    const product = new Product({
      name: cleanName(detail),
      description: detail.productNameEn || cleanName(detail),
      richDescription: detail.description || detail.remark || '',
      image: images[0] || detail.productImage || '',
      images: images.slice(1),
      brand: detail.supplierName || 'CJ',
      price,
      category: category._id,
      countInStock: 999, // dropshipping: supplier holds stock
      shippingDays: 14,
      supplier: 'CJ',
      supplierProductId: pid,
      isFeatured: false,
    });

    const saved = await product.save();
    res.status(201).json({
      ok: true,
      product: saved,
      meta: { cost, multiplier: multiplier || DEFAULT_MULTIPLIER, price },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};