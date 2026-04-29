import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
  '/invite(.*)',
  '/upgrade(.*)',
  // '/school/(.*)' — intentionally public for SEO (page handles auth internally)
  '/activities(.*)',
  '/essays(.*)',
  '/recommendations(.*)',
  '/scholarships(.*)',
  '/test-scores(.*)',
  '/interviews(.*)',
  '/decisions(.*)',
  '/more(.*)',
  '/document-checklist(.*)',
  '/explore(.*)',
  '/profile(.*)',
  '/suggest(.*)',
  '/discover(.*)',
  // Pages missing from original list — now handled by middleware so
  // redirect_url is automatically preserved on login redirect
  '/circle(.*)',
  '/deadlines(.*)',
  '/strategy(.*)',
  '/onboarding(.*)',
]);

const isPublicWebhook = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware((auth, req) => {
  // Webhook routes must be publicly reachable — Clerk servers call them
  if (isPublicWebhook(req)) return;
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
