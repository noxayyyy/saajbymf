import { PrismaClient } from "../generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prismaBase = globalForPrisma.prisma || new PrismaClient();

export const prisma = prismaBase.$extends({
  query: {
    cart: {
      async update({ args, query }) {
        args.data = { ...args.data, updated_at: new Date() };
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaBase;
