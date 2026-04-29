import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
  '/invite(.*)',
  '/upgrade(.*)',
  '/school/(.*)',
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

export default clerkMiddleware((auth, req) => {
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
