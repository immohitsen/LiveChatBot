import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // This connects to the DATABASE_URL in your .env file
    url: env("DATABASE_URL"), 
  },
});