'use client';

import { registerDashboardDataSource } from '@/config/data-source.register';

// Module-level call — runs once when this client module loads, before any component renders
registerDashboardDataSource();

export function DataSourceRegistrar() {
	return null;
}
