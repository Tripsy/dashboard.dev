import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	trailingSlash: false,
	output: 'standalone', // Recommended for Amplify
	allowedDevOrigins: ['dashboard.test'],
	// reactStrictMode: false,
	// experimental: {
	//     nodeMiddleware: true,
	// },
};

export default nextConfig;
