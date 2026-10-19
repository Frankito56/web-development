import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unilib?schema=public';

const isProduction = process.env.NODE_ENV === 'production';
const isRemotePostgres = databaseUrl.includes('render.com') || databaseUrl.includes('oregon-postgres') || isProduction;

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isRemotePostgres
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});
