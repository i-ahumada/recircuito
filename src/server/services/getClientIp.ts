/**
 * En Heroku el router agrega la IP real del cliente al final de X-Forwarded-For,
 * así que se usa la última entrada (las anteriores las puede mandar el cliente).
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const partes = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (partes.length > 0) return partes[partes.length - 1];
  }
  return req.headers.get("x-real-ip") ?? "local";
}
