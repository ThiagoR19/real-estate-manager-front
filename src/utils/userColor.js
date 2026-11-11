export default function userColor(usuario = "") {
  let hash = 0;
  for (const letra of String(usuario ?? "")) {
    hash = (hash * 31 + letra.charCodeAt(0)) | 0;
  }
  const color = (hash >>> 0) & 0xffffff;
  return `#${color.toString(16).padStart(6, "0")}`;
}
