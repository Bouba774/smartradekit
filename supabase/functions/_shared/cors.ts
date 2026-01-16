// Shared CORS configuration for all edge functions
// This file provides a secure origin whitelist to prevent unauthorized API access

const ALLOWED_ORIGINS = [
  // Production domains
  'https://smarttradetracker.app',
  'https://www.smarttradetracker.app',
  // Lovable preview domains
  'https://sfdudueswogeusuofbbi.lovableproject.com',
];

// Allow all Lovable preview and production domains via pattern matching
const ALLOWED_PATTERNS = [
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^http:\/\/localhost:\d+$/,  // Local development
];

export function getAllowedOrigin(origin: string): string {
  // Check exact matches first
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Check pattern matches
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(origin)) {
      return origin;
    }
  }
  
  // Default to main production domain
  return 'https://smarttradetracker.app';
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-nonce',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours cache for preflight
  };
}

// Helper to create CORS preflight response
export function handleCorsPreflightResponse(req: Request): Response {
  return new Response(null, { 
    status: 204,
    headers: getCorsHeaders(req) 
  });
}
