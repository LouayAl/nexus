// frontend/src/lib/avatar.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "";

export function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return null;

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  return `${API_BASE}${avatarUrl}`;
}