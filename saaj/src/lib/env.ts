import zod from "zod";

const env_schema = zod.object({
  DATABASE_URL: zod.string().nonempty(),
  OAUTH_CLIENT_ID: zod.string().nonempty(),
  OAUTH_CLIENT_SECRET: zod.string().nonempty(),
  NEXTAUTH_URL: zod.string().nonempty(),
  NEXTAUTH_SECRET: zod.string().nonempty(),
});

export const env = env_schema.parse(process.env);
