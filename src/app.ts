import express from 'express';
import userRoutes from './modules/user/user.routes'
import listRoutes from './modules/list/list.routes'
import itemRoutes from './modules/item/item.routes'
import authRoutes from './modules/auth/auth.routes'
import { errorHandler } from './middlewars/error.middleware';
import { authenticate } from './middlewars/auth.middleware';
import cors from 'cors';
import logger from './logger';

const app = express();

// Basic request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "Access granted!",
    user: req.user,
  });
});

app.use('/auth', authRoutes)
app.use('/user', authenticate, userRoutes)
app.use('/list', authenticate, listRoutes)
app.use('/item', authenticate, itemRoutes)

app.use(errorHandler)

export default app;