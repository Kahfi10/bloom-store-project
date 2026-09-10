import net from 'net';

/**
 * List of forbidden IP ranges and cloud metadata IPs.
 * Especially critical on Oracle Cloud Infrastructure (OCI) where 169.254.169.254
 * serves instance metadata, private IPs, and compartment identity tokens.
 */
const FORBIDDEN_IPS = [
  '169.254.169.254', // Oracle Cloud / AWS / GCP IMDS IP
  '127.0.0.1',       // Loopback
  'localhost',
  '0.0.0.0',
];

/**
 * Checks if an IPv4 address is in a private or reserved subnet.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [p0, p1] = parts;

  // 10.0.0.0/8
  if (p0 === 10) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
  // 192.168.0.0/16
  if (p0 === 192 && p1 === 168) return true;
  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;
  // 169.254.0.0/16 (Link-local & cloud metadata)
  if (p0 === 169 && p1 === 254) return true;
  // 0.0.0.0/8
  if (p0 === 0) return true;

  return false;
}

export interface SSRFValidationResult {
  allowed: boolean;
  reason?: string;
  url?: URL;
}

/**
 * Validates a URL against SSRF vulnerabilities before fetching.
 */
export function validateUrlForSSRF(inputUrl: string): SSRFValidationResult {
  try {
    const parsed = new URL(inputUrl);

    // Only allow HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { allowed: false, reason: `Protokol '${parsed.protocol}' tidak diizinkan. Hanya http dan https yang diizinkan.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check direct forbidden IP/host match
    if (FORBIDDEN_IPS.includes(hostname)) {
      return { allowed: false, reason: `Akses ke host internal/metadata '${hostname}' diblokir oleh sistem SSRF guard.` };
    }

    // If hostname is an IP address, check for private range
    if (net.isIPv4(hostname)) {
      if (isPrivateIPv4(hostname)) {
        return { allowed: false, reason: `IP internal '${hostname}' diblokir oleh sistem SSRF guard.` };
      }
    }

    // Check IPv6 loopback / link-local
    if (net.isIPv6(hostname)) {
      if (hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) {
        return { allowed: false, reason: `IP internal IPv6 '${hostname}' diblokir.` };
      }
    }

    return { allowed: true, url: parsed };
  } catch {
    return { allowed: false, reason: 'URL tidak valid.' };
  }
}

/**
 * Safe fetch wrapper that guards against SSRF before making any HTTP request.
 */
export async function safeFetch(inputUrl: string, init?: RequestInit): Promise<Response> {
  const check = validateUrlForSSRF(inputUrl);
  if (!check.allowed) {
    throw new Error(`SSRF Blocked: ${check.reason}`);
  }
  return fetch(inputUrl, init);
}
