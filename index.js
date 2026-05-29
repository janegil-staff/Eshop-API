import app from "./app.js";
import { connectDB }  from './config/db.js';
import cjRouter from './routes/cj.js';

app.use('/api/cj', cjRouter);
const PORT = process.env.PORT ?? 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 drugs-api running on port ${PORT}`));
}).catch(err => { console.error(err); process.exit(1); });