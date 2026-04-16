// frontend/src/lib/serverUrl.ts
export const SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "")!;