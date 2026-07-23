'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/helpers/date.helper';
import {
	capitalizeFirstLetter,
	formatEnumLabel,
} from '@/helpers/string.helper';
import type { PlaceModel } from '@/models/place.model';

export function ViewPlace({ entry }: { entry: PlaceModel }) {
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
					{formatEnumLabel(entry.place_type)}
				</div>
				<div>
					<span className="font-semibold">Code</span> {entry.code}
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
							<span className="text-danger">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			{languageContents.length > 0 && (
				<div className="mb-4">
					<Tabs
						defaultSelectedKey={contentTabDefault}
						className="w-full"
					>
						<div className="flex items-center border-b border-line pb-2 gap-2">
							<h3 className="font-bold whitespace-nowrap">
								Language specific
							</h3>
							<TabsList>
								{languageContents.map((value) => (
									<TabsTrigger
										key={value.language}
										id={value.language}
									>
										{value.language.toUpperCase()}
									</TabsTrigger>
								))}
							</TabsList>
						</div>
						{languageContents.map((value) => (
							<TabsContent
								key={`content-${value.language}`}
								id={value.language}
							>
								<div className="space-y-1 text-sm">
									<div>
										<span className="font-semibold">
											Type - Label
										</span>{' '}
										{capitalizeFirstLetter(
											value.type_label,
										)}
									</div>
									<div>
										<span className="font-semibold">
											Name
										</span>{' '}
										{value.name}
									</div>
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			)}
		</div>
	);
}
