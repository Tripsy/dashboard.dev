import { useQuery } from '@tanstack/react-query';
import {findPlaces} from "@/services/places.service";
import {PlaceTypeEnum} from "@/models/place.model";

export const usePlaceSearch = ({
    term,
    place_type = PlaceTypeEnum.CITY
}: {
    term: string;
    place_type: PlaceTypeEnum
}) => {
    return useQuery({
        queryKey: [place_type, term],
        queryFn: () =>
            findPlaces({
                filter: {term, place_type},
                limit: 10,
            }),
        enabled: term.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 min cache
    });
};