import { createApp } from './app';
import { initDb } from './infrastructure/database/models';

const app = createApp();
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await initDb();
    console.log('Database connected and synchronized successfully.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }

  app.listen(PORT, () => {
    console.log(`UniLib API Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

bootstrap();

