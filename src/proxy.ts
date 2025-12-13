import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// clerkMiddleware() grants access to user authentication state throughout the app
// TODO DEV: https://clerk.com/docs/nextjs/getting-started/quickstart#:~:text=By%20default%2C%20clerkMiddleware()%20will%20not%20protect%20any%20routes.%20All%20routes%20are%20public%20and%20you%20must%20opt%2Din%20to%20protection%20for%20routes.%20See%20the%20clerkMiddleware()%20reference%20to%20learn%20how%20to%20require%20authentication%20for%20specific%20routes.

// Check publicly available routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	"/", // Home page
	"/sign-in(.*)", // Sign in page
	"/sign-up(.*)", // Sign up page 
	"/forgot-password(.*)" // Forgot password page
]);

export default clerkMiddleware(async (auth, req) => {
	if (!isPublicRoute(req)) {
		await auth.protect(); // If the route is not public, require authentication
	}
})

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}