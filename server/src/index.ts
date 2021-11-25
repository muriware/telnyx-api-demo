import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/message', (req, res) => {
  const result = { message: 'Hello, World' };

  console.log('result:', result);
  return res.status(200).send(result);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
