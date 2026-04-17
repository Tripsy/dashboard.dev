import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	trailingSlash: false,
	output: 'standalone', // Recommended for Amplify
	// reactStrictMode: false,
	// experimental: {
	//     nodeMiddleware: true,
	// },
};

export default nextConfig;
