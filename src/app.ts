import express from 'express';
import listRoutes from './modules/list/list.routes'
import itemRoutes from './modules/item/item.routes'
import authRoutes from './modules/auth/auth.routes'
import { errorHandler } from './middlewars/error.middleware';
import { authenticate } from './middlewars/auth.middleware';
import cors from 'cors';

const app = express();

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
app.use('/list', authenticate, listRoutes)
app.use('/item', authenticate, itemRoutes)

app.use(errorHandler)

export default app;