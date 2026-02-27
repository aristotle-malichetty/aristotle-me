/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_SECRET: string;
  IP_HASH_SALT: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
