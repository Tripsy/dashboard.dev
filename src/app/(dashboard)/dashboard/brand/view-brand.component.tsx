'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import type { BrandModel } from '@/models/brand.model';

export function ViewBrand({ entry }: { entry: BrandModel }) {
	const languageContents = Object.values(entry.contents ?? []);
	const contentTabDefault = languageContents[0]?.language;

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Type</span>{' '}
					{formatEnumLabel(entry.brand_type)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus status={entry.status} />
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Created At</span>{' '}
						{formatDate(entry.created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Updated At</span>{' '}
						{formatDate(entry.updated_at, 'date-time') || '-'}
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">Deleted At</span>{' '}
							<span className="text-red-500">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="mb-4">
				<Tabs defaultValue={contentTabDefault} className="w-full">
					<div className="flex items-center justify-center border-b border-line pb-2 mb-4">
						<h3 className="font-bold whitespace-nowrap">
							Language specific
						</h3>
						<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
							{languageContents.map((value) => (
								<TabsTrigger
									key={value.language}
									value={value.language}
								>
									{value.language.toUpperCase()}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					{languageContents.map((value) => {
						return (
							<TabsContent
								key={`content-${value.language}`}
								value={value.language}
							>
								<div className="ml-4 space-y-1 text-sm">
									<div>
										<span className="font-semibold">
											Description
										</span>{' '}
										{value.description}
									</div>
									<div>
										<span className="font-semibold">
											Meta - Title
										</span>{' '}
										{value.meta?.title || 'N/A'}
									</div>
									<div>
										<span className="font-semibold">
											Meta - Description
										</span>{' '}
										{value.meta?.description || 'N/A'}
									</div>
									<div>
										<span className="font-semibold">
											Meta - Keywords
										</span>{' '}
										{value.meta?.keywords || 'N/A'}
									</div>
								</div>
							</TabsContent>
						);
					})}
				</Tabs>
			</div>
		</div>
	);
}
