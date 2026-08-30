export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

export const R2_DOMAIN = (
  process.env.NEXT_PUBLIC_R2_DOMAIN ??
  "https://pub-79d873202b764f38a02677bcf89dfb69.r2.dev"
).replace(/\/+$/, "")
