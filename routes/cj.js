import express from 'express';
import { testCjAuth, listCjProducts } from '../services/cj.service.js';
import { searchProducts, importProduct, importBatch } from '../controllers/cjImport.controller.js';

const router = express.Router();

// GET /api/cj/test-auth  — confirms the key + token work
router.get('/test-auth', async (req, res) => {
  try {
    const result = await testCjAuth();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/cj/products?pageSize=5  — pulls a few raw CJ products
router.get('/products', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    const data = await listCjProducts({ pageSize });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', searchProducts);
router.post('/import', importProduct);
router.post('/import-batch', importBatch);

export default router;