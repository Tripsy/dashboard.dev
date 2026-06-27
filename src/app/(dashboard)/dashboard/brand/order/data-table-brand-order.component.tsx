'use client';

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import type React from 'react';
import { type JSX, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	DataTableProvider,
	useDataTable,
} from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersBrandOrder } from '@/app/(dashboard)/dashboard/brand/order/data-table-filters-brand-order.component';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { requestFind } from '@/helpers/services.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	BRAND_DEFAULT_TYPE,
	type BrandModel,
	BrandStatusEnum,
	type BrandType,
} from '@/models/brand.model';
import { useToast } from '@/providers/toast.provider';
import { orderUpdate } from '@/services/brand.service';

type SortableBrandItemProps = {
	brand: BrandModel;
	isFirst: boolean;
	isLast: boolean;
	onMoveUp: (id: number) => void;
	onMoveDown: (id: number) => void;
};

const SortableBrandItem = ({
	brand,
	isFirst,
	isLast,
	onMoveUp,
	onMoveDown,
}: SortableBrandItemProps): JSX.Element => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: brand.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<li ref={setNodeRef} style={style} {...attributes}>
			<div className="flex items-center gap-2 bg-secondary p-2">
				<span
					{...listeners}
					className="cursor-row-resize flex-1 select-none touch-none"
				>
					{brand.name}
				</span>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => onMoveUp(brand.id)}
						disabled={isFirst}
						className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						aria-label={`Move ${brand.name} up`}
					>
						<Icons.Direction.ArrowUp />
					</button>
					<button
						type="button"
						onClick={() => onMoveDown(brand.id)}
						disabled={isLast}
						className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						aria-label={`Move ${brand.name} down`}
					>
						<Icons.Direction.ArrowDown />
					</button>
				</div>
			</div>
		</li>
	);
};

const DataTableBrandOrderContent = (): JSX.Element => {
	const translationsKeys = useMemo(
		() =>
			[
				'app.text.error_title',
				'app.text.success_title',
				'brand-order.success.order_updated',
				'brand-order.error.order_updated',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const { showToast } = useToast();

	const { dataSource, dataTableStore } = useDataTable<'brand'>();
	const tableState = useStore(dataTableStore, (s) => s.tableState);
	const queryClient = useQueryClient();

	const [orderedBrands, setOrderedBrands] = useState<BrandModel[]>([]);

	const queryKey = useMemo(
		() => [
			'dataTableOrder',
			dataSource,
			tableState.filters.brand_type.value,
			tableState.filters.language.value,
		],
		[
			dataSource,
			tableState.filters.brand_type.value,
			tableState.filters.language.value,
		],
	);

	const { data, isLoading } = useQuery({
		queryKey,
		queryFn: async () => {
			const response = await requestFind<BrandModel>('brand', {
				order_by: 'sort_order',
				direction: 'DESC',
				filter: {
					status: BrandStatusEnum.ACTIVE,
					brand_type:
						tableState.filters.brand_type.value ??
						BRAND_DEFAULT_TYPE,
					language:
						tableState.filters.language.value ??
						Configuration.language(),
				},
			});

			if (!response) {
				throw new Error(`Could not retrieve ${dataSource} data`);
			}

			return response;
		},
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (data?.entries) {
			setOrderedBrands(data.entries);
		}
	}, [data]);

	const { mutate: updateOrder, isPending: loading } = useMutation({
		mutationFn: (positions: number[]) =>
			orderUpdate(
				tableState.filters.brand_type.value as BrandType,
				positions,
			),
		onSuccess: async () => {
			showToast({
				severity: 'success',
				summary: translations['app.text.success_title'],
				detail: translations['brand-order.success.order_updated'],
			});

			await queryClient.invalidateQueries({ queryKey });
		},
		onError: () => {
			showToast({
				severity: 'error',
				summary: translations['app.text.error_title'],
				detail: translations['brand-order.error.order_updated'],
			});
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent): void => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		setOrderedBrands((items) => {
			const oldIndex = items.findIndex((item) => item.id === active.id);
			const newIndex = items.findIndex((item) => item.id === over.id);

			return arrayMove(items, oldIndex, newIndex);
		});
	};

	const moveBrand = (id: number, direction: 'up' | 'down'): void => {
		setOrderedBrands((items) => {
			const index = items.findIndex((item) => item.id === id);

			if (index === -1) {
				return items;
			}

			const targetIndex = direction === 'up' ? index - 1 : index + 1;

			if (targetIndex < 0 || targetIndex >= items.length) {
				return items;
			}

			return arrayMove(items, index, targetIndex);
		});
	};

	const handleMoveUp = (id: number): void => moveBrand(id, 'up');
	const handleMoveDown = (id: number): void => moveBrand(id, 'down');

	const handleUpdateOrder = (): void => {
		const positions = orderedBrands.map((brand) => brand.id);

		updateOrder(positions);
	};

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (orderedBrands.length === 0) {
		return <ErrorComponent title="" description="No entries found." />;
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={orderedBrands.map((brand) => brand.id)}
					strategy={verticalListSortingStrategy}
				>
					<ol className="list-decimal space-y-2 ml-8 mt-4">
						{orderedBrands.map((brand, index) => (
							<SortableBrandItem
								key={brand.id}
								brand={brand}
								isFirst={index === 0}
								isLast={index === orderedBrands.length - 1}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
							/>
						))}
					</ol>
				</SortableContext>
			</DndContext>

			<div className="flex gap-3 mt-4">
				<Button variant="outline" title="Back to list" asChild={true}>
					<Link href={Routes.get('brand')}>
						<Icons.Brand />
						Back to list
					</Link>
				</Button>
				<Button
					variant="outline"
					hover="info"
					onClick={handleUpdateOrder}
					title="Update"
					disabled={loading}
				>
					<Icons.Action.Save />
					Update order
				</Button>
			</div>
		</>
	);
};

export const DataTableBrandOrder = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="brand" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersBrandOrder />
				<DataTableBrandOrderContent />
			</div>
		</DataTableProvider>
	);
};
