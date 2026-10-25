import { PrismaClient } from "@prisma/client";

// Supabase transaction pooling cannot reuse Prisma's named prepared statements.
function runtimeDatabaseUrl(value: string | undefined) {
  if (!value) return value;
  const url = new URL(value);
  if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543") {
    url.searchParams.set("pgbouncer", "true");
    return url.toString();
  }
  return value;
}

const databaseUrl = runtimeDatabaseUrl(process.env.DATABASE_URL);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
