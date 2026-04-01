import express from 'express';
import userRoutes from './modules/user/user.routes.js'
import listRoutes from './modules/list/list.routes.js'
import itemRoutes from './modules/item/item.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import { errorHandler } from './middlewares/error.middleware.js';
import { authenticate } from './middlewares/auth.middleware.js';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

app.use(requestLogger);

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes)
app.use('/user', authenticate, userRoutes)
app.use('/list', authenticate, listRoutes)
app.use('/item', authenticate, itemRoutes)

app.use(errorHandler)

export default app;