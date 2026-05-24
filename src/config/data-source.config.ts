import { toCamelCase } from '@/helpers/string.helper';
import type {
	DataSourceKey,
	DataSourceModelMap,
} from '@/types/data-source.key';
import {
	type DataSourceConfigType,
	type DataSourceSection,
	DataSourceSectionEnum,
} from '@/types/data-source.type';

const registry: Record<
	DataSourceSection,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Partial<Record<DataSourceKey, DataSourceConfigType<any>>>
> = {
	dashboard: {},
	public: {},
};

export async function getDataSourceConfig<
	K extends DataSourceKey,
	P extends keyof DataSourceConfigType<DataSourceModelMap[K]>,
>(
	section: DataSourceSection,
	key: K,
	prop: P,
): Promise<DataSourceConfigType<DataSourceModelMap[K]>[P]> {
	if (!registry[section]?.[key]) {
		const defKey = toCamelCase(key, {
			capitalizeFirst: true,
		});

		// biome-ignore lint/suspicious/noExplicitAny: It's fine
		let defModule: Record<string, DataSourceConfigType<any>>;

		if (section === DataSourceSectionEnum.DASHBOARD) {
			defModule = await import(
				`../app/(dashboard)/dashboard/${key}/${key}.definition`
			);
		} else {
			defModule = await import(
				`../app/(public)/_components/${key}/${key}.definition`
			);
		}

		registry[section][key] = defModule[`dataSourceConfig${defKey}`];
	}

	// biome-ignore lint/style/noNonNullAssertion: registry[section][key] is guaranteed to be set above
	return registry[section][key]![prop];
}
