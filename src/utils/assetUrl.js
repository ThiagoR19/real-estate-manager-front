import { apiBase } from "./request.js";

export function assetUrl(path) {
  if (!path) return null;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).href;
}
