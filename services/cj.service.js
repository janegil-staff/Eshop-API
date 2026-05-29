const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

let cached = {
  accessToken: null,
  expiresAt: 0, // epoch ms
};

// Authenticate with the API key, cache the token until it expires.
async function getAccessToken() {
  const now = Date.now();
  // Reuse cached token if it has >2 min left.
  if (cached.accessToken && now < cached.expiresAt - 120000) {
    return cached.accessToken;
  }

  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) throw new Error('CJ_API_KEY is not set');

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json();
  if (!data?.result || !data?.data?.accessToken) {
    throw new Error(`CJ auth failed: ${data?.message || 'unknown error'}`);
  }

  cached.accessToken = data.data.accessToken;
  cached.expiresAt = new Date(data.data.accessTokenExpiryDate).getTime();
  return cached.accessToken;
}

// Generic authenticated GET against the CJ API.
async function cjGet(path, params = {}) {
  const token = await getAccessToken();
  const qs = new URLSearchParams(params).toString();
  const url = `${CJ_BASE}${path}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: { 'CJ-Access-Token': token },
  });
  const data = await res.json();
  if (!data?.result) {
    throw new Error(`CJ request failed: ${data?.message || 'unknown error'}`);
  }
  return data.data;
}

// --- Test helpers ---

// Confirms auth works and returns the raw token info.
export async function testCjAuth() {
  const token = await getAccessToken();
  return { ok: true, tokenPreview: `${token.slice(0, 8)}…`, expiresAt: cached.expiresAt };
}

// Pulls a small page of products so we can see CJ's data shape.
export async function listCjProducts({ pageNum = 1, pageSize = 5 } = {}) {
  return cjGet('/product/list', { pageNum, pageSize });
}

// Search products (the list endpoint, with a keyword).
export async function searchCjProducts({ keyword, pageNum = 1, pageSize = 20 } = {}) {
  const params = { pageNum, pageSize };
  if (keyword) params.productNameEn = keyword;
  return cjGet('/product/list', params);
}

// Full product detail by CJ product id (pid) — has variants, all images, real prices.
export async function getCjProductDetail(pid) {
  return cjGet('/product/query', { pid });
}

// CJ's category tree (3-level nested).
export async function getCjCategories() {
  return cjGet('/product/getCategory');
}