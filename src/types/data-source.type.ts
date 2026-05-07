export const DataSourceSectionEnum = {
	DASHBOARD: 'dashboard',
	PUBLIC: 'public',
} as const;

export type DataSourceSection =
	(typeof DataSourceSectionEnum)[keyof typeof DataSourceSectionEnum];
