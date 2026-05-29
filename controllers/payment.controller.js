import stripe from '../config/stripe.js';
import { Product } from '../models/product.js';

// POST /api/orders/create-payment-intent
// body: { items: [{ product: <id>, quantity: <n> }] }
export const createPaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Fetch real prices from DB — never trust client-sent amounts.
    const ids = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } });

    let amount = 0;
    for (const item of items) {
      const product = products.find(
        (p) => String(p._id) === String(item.product)
      );
      if (!product) {
        return res.status(400).json({ message: `Invalid product: ${item.product}` });
      }
      if (product.countInStock <= 0) {
        return res.status(400).json({ message: `${product.name} is unavailable` });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      amount += product.price * qty;
    }

    // Stripe expects the smallest currency unit (øre for NOK).
    const amountMinor = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency: 'nok',
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      amount, // major units, for display
      currency: 'nok',
    });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    res.status(500).json({ message: err.message });
  }
};