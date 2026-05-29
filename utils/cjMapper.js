// Parse CJ's price which may be "7.46 -- 8.62" (range) or "0.56" (single).
// Returns the LOW end as the cost basis.
export function parseCjCost(sellPrice) {
  if (sellPrice === undefined || sellPrice === null) return 0;
  const str = String(sellPrice);
  const nums = str.match(/[\d.]+/g);
  if (!nums || nums.length === 0) return 0;
  return parseFloat(nums[0]); // low end
}

// CJ sometimes returns productName as a JSON-string array of (Chinese) names.
// Prefer the English name; fall back gracefully.
export function cleanName(detail) {
  if (detail.productNameEn) return detail.productNameEn.trim();
  if (detail.nameEn) return detail.nameEn.trim();
  try {
    const arr = JSON.parse(detail.productName);
    if (Array.isArray(arr) && arr[0]) return arr[0];
  } catch {
    /* not JSON */
  }
  return detail.productName || 'Untitled product';
}

// USD -> NOK rate. Update periodically (or wire to a live FX API later).
const USD_TO_NOK = 11;

// Convert CJ's USD cost to NOK, apply margin multiplier, round to a clean price.
// cost: number in USD. multiplier: your margin (e.g. 2.5).
export function applyMarkup(costUsd, multiplier) {
  const m = Number(multiplier) || 2.5;
  const costNok = costUsd * USD_TO_NOK;
  const raw = costNok * m;
  // Round to nearest 9 kr for nicer pricing (e.g. 273.6 -> 279).
  return Math.ceil(raw / 10) * 10 - 1;
}

// Collect images: detail endpoint usually has productImageSet (array) + productImage.
export function collectImages(detail) {
  const imgs = [];
  if (Array.isArray(detail.productImageSet)) imgs.push(...detail.productImageSet);
  if (detail.productImage && !imgs.includes(detail.productImage)) {
    imgs.unshift(detail.productImage);
  }
  return imgs.filter(Boolean);
}