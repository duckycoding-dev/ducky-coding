import dotenv from 'dotenv';

// TODO CHECK THIS FOR DEPLOYMENT: WHAT ENV WOULD IT USE???
dotenv.config({ path: './.env.development' });

export const getEnvVariables = () => {
  return {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    REFRESH_JWT_SECRET_KEY: process.env.REFRESH_JWT_SECRET_KEY,
  };
};
