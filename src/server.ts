import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT || 4000);

async function start() {
  app.listen(port, () => {
    console.log(`DEWR workforce intelligence services running on http://localhost:${port}`);
  });
}

void start();
