import { Country, DiscoverSortField, Genre, DiscoverSortDirection } from "./movie-tv.model";

export interface DiscoverTVResponse {
    page: number;
    results: DiscoverTVResult[];
    total_pages: number;
    total_results: number;
}


export interface DiscoverTVResult {
    backdrop_path: string;
    first_air_date: string;
    genre_ids: string[];
    id: number;
    name: string;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
}

export interface DiscoverTVSortBy {
    field: DiscoverSortField;
    direction: DiscoverSortDirection;
}

export interface DiscoverTVParams {
    page: number;
    sort_by: DiscoverTVSortBy;
    with_genre: Genre;
    with_origin_country: Country;
}
