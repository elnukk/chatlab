/**
 * Returns CORS headers based on the allowed origins and the request's Origin header.
 *
 * @param {string[]} allowedOrigins - Array of allowed origin strings. Empty or ['*'] means allow all.
 * @param {string|null} requestOrigin - The Origin header from the incoming request.
 * @returns {Object} An object containing the appropriate CORS headers.
 */
export function getCorsHeaders(allowedOrigins, requestOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Experiment-Key',
  };

  const allowAll =
    !allowedOrigins ||
    allowedOrigins.length === 0 ||
    allowedOrigins.includes('*');

  if (allowAll) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
    headers['Vary'] = 'Origin';
  } else {
    // Origin not allowed — omit Access-Control-Allow-Origin so the browser blocks it
    headers['Access-Control-Allow-Origin'] = '';
  }

  return headers;
}

/**
 * Handles a CORS preflight (OPTIONS) request by returning a 204 Response with the
 * appropriate CORS headers.
 *
 * @param {string[]} allowedOrigins - Array of allowed origin strings.
 * @param {Request} request - The incoming Request object.
 * @returns {Response} A 204 No Content response with CORS headers.
 */
export function handleCorsPreFlight(allowedOrigins, request) {
  const requestOrigin = request.headers.get('Origin');
  const headers = getCorsHeaders(allowedOrigins, requestOrigin);

  return new Response(null, {
    status: 204,
    headers,
  });
}
