import { Context } from "hono";
import { extractHeaderInfo } from "../../api/router/analytics.js";
import { decodeConfig } from "../../api/router/stremio.js";

export function generateKey(c: Context) {
  const url = c.req.url;
  const { ip } = extractHeaderInfo(c);
  const configBase64 = c.req.param("configBase64");
  if (!configBase64) return ip;
  const config = decodeConfig(configBase64);
  const key = config.email;
  // checkEmail(config.email);
  return ip;
}
