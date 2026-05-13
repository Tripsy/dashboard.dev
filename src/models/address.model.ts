import { displayPlaceLabel, type PlaceModel } from '@/models/place.model';

export type AddressModel<D = Date | string> = {
	id: number;

	city: PlaceModel<D> | null;
	details: string;
	postal_code: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D | null;
};

export function displayAddressLabel(entry: AddressModel): string {
	if (!entry.city) {
		return entry.details;
	}

	return `${displayPlaceLabel(entry.city, null, false)}, ${entry.details}`;
}
