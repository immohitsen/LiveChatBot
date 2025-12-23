import { PrismaClient } from '@prisma/client'; // Standard import
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // pg connection pool
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Postgres Connection Pool banayein
const pool = new Pool({ connectionString });

// 2. Prisma Adapter connect karein
const adapter = new PrismaPg(pool);

// 3. PrismaClient initialize karein (Adapter ke sath)
export const prisma = new PrismaClient({ adapter });