// app/auth/callback/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  console.log('Callback reached! Redirecting to dashboard...');
  
  // URL absoluta para o dashboard
  const dashboardUrl = new URL('/logged/dashboard', request.url);
  
  // Forçar redirecionamento imediato
  const response = NextResponse.redirect(dashboardUrl);
  
  // Headers adicionais para garantir
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}