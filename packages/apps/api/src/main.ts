import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import { productsRouter } from './routes/products.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { uploadsRouter } from './routes/uploads.routes';
import { swaggerSpec } from './swagger';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(cors);
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/products', productsRouter);
app.use('/reviews', reviewsRouter);
app.use('/uploads', uploadsRouter);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
