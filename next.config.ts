import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	trailingSlash: false,
	output: 'standalone', // Recommended for Amplify
	allowedDevOrigins: ['dashboard.test'],
	/*
	 * Nunjucks reads the email layouts through a runtime path
	 * (`buildSrcPath('templates')`), which file tracing cannot follow — nothing
	 * statically imports them. Without this they are left out of the standalone
	 * bundle and `templates.render()` throws in production but not in dev.
	 */
	outputFileTracingIncludes: {
		'/**': ['./src/templates/**/*'],
	},
	// reactStrictMode: false,
	experimental: {
		// nodeMiddleware: true,

		/*
		 * Keep Turbopack under the container's 4g `mem_limit` (docker-compose.yml).
		 * Without a target it grows until the cgroup OOM killer SIGKILLs next-server —
		 * which looks like the dev server silently exiting, with nothing in the log.
		 * 3 GiB leaves headroom for the Node process itself around Turbopack's arena.
		 *
		 * Note this bounds memory, not the on-disk `.next/dev/cache`, which still grows
		 * across sessions — `pnpm run clean` drops it when startup RSS creeps back up.
		 */
		turbopackMemoryLimit: 3 * 1024 * 1024 * 1024,
	},
};

export default nextConfig;
