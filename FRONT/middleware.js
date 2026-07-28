export const config = {
  matcher: '/((?!api|_next|favicon.ico).*)',
};

// Lista de países considerados "Europa" para liberar acesso.
// Ajuste essa lista conforme seu mercado alvo.
const EUROPE_COUNTRIES = new Set([
  'FR', 'BE', 'CH', 'LU', // francófonos (França, Bélgica, Suíça, Luxemburgo)
  'DE', 'IT', 'ES', 'PT', 'NL', 'AT', 'IE', 'PL', 'SE', 'DK', 'FI',
  'NO', 'GR', 'CZ', 'RO', 'HU', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT'
]);

// Se quiser restringir SÓ ao francófono estrito (França, Bélgica, Suíça, Luxemburgo),
// troque a linha abaixo dentro da função por:
// const isTarget = country && ['FR', 'BE', 'CH', 'LU'].includes(country);

export default function middleware(request) {
  const country = request.headers.get('x-vercel-ip-country');
  const isTarget = country && EUROPE_COUNTRIES.has(country);

  if (!isTarget) {
    // 404 discreto: não indica que existe outra versão da página
    return new Response(null, { status: 404 });
  }

  // País permitido -> deixa passar normalmente pro index.html
}
