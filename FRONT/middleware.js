import { next } from '@vercel/edge';

export const config = {
  matcher: '/((?!api|_next|favicon.ico).*)',
};

// Países liberados.
// Mercado francofono NAO e so Europa: Quebec (CA) conta e estava faltando.
const ALLOWED_COUNTRIES = new Set([
  // Francofonos
  'FR', 'BE', 'CH', 'LU', 'CA',
  // Resto da Europa
  'DE', 'IT', 'ES', 'PT', 'NL', 'AT', 'IE', 'PL', 'SE', 'DK', 'FI',
  'NO', 'GR', 'CZ', 'RO', 'HU', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT'
]);

// Crawlers que PRECISAM ver a página real.
// Bloquear o revisor da Meta gera reprovação de anúncio e sinalização de conta.
const ALLOWED_BOTS = /facebookexternalhit|facebookcatalog|meta-externalagent|facebookbot|adsbot-google|googlebot/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country');

  // 1) Tráfego pago SEMPRE passa.
  // Clique real de anúncio carrega fbclid/gclid. Nunca bloquear quem você pagou.
  const isPaidClick =
    url.searchParams.has('fbclid') ||
    url.searchParams.has('gclid') ||
    url.searchParams.has('ttclid') ||
    url.searchParams.has('utm_source');

  if (isPaidClick) return next();

  // 2) Crawler de revisão de anúncio passa.
  if (ALLOWED_BOTS.test(ua)) return next();

  // 3) Geo indeterminada passa (fail-open).
  // Sem header, 'XX' ou vazio = não dá pra afirmar que é fora do alvo.
  if (!country || country === 'XX') return next();

  // 4) País conhecido e fora da lista: 404 discreto.
  if (!ALLOWED_COUNTRIES.has(country)) {
    return new Response(null, { status: 404 });
  }

  return next();
}
