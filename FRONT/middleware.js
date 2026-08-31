export const config = {
  matcher: '/((?!api|_next|favicon.ico).*)',
};

// Países liberados.
// Mercado francofono NAO e so Europa: Quebec (CA) conta.
const ALLOWED_COUNTRIES = new Set([
  // Francofonos
  'FR', 'BE', 'CH', 'LU', 'CA',
  // Resto da Europa
  'DE', 'IT', 'ES', 'PT', 'NL', 'AT', 'IE', 'PL', 'SE', 'DK', 'FI',
  'NO', 'GR', 'CZ', 'RO', 'HU', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT'
]);

// Crawlers que PRECISAM ver a pagina real.
// Bloquear o revisor da Meta gera reprovacao de anuncio e sinalizacao de conta.
const ALLOWED_BOTS = /facebookexternalhit|facebookcatalog|meta-externalagent|facebookbot|adsbot-google|googlebot/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country');

  // 1) Trafego pago SEMPRE passa.
  // Clique real de anuncio carrega fbclid/gclid. Nunca bloquear quem voce pagou.
  if (
    url.searchParams.has('fbclid') ||
    url.searchParams.has('gclid') ||
    url.searchParams.has('ttclid') ||
    url.searchParams.has('utm_source')
  ) {
    return;
  }

  // 2) Crawler de revisao de anuncio passa.
  if (ALLOWED_BOTS.test(ua)) return;

  // 3) Geo indeterminada passa (fail-open).
  if (!country || country === 'XX') return;

  // 4) Pais conhecido e fora da lista: 404 discreto.
  if (!ALLOWED_COUNTRIES.has(country)) {
    return new Response(null, { status: 404 });
  }

  // 5) Pais liberado: sem retorno, o Vercel serve o index.html normalmente.
}
