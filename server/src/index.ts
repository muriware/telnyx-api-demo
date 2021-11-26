import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { credentialRouter } from './credential/credential.router';
import { dialRouter } from './dial/dial.router';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/v1/call-control/credential', credentialRouter);
app.use('/v1/call-control/dial', dialRouter);

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
