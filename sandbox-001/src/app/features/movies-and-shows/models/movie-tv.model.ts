export interface TmdbConfiguration {
    images: TmdbImage;
    change_keys: string[]
}

export interface TmdbImage {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
}

export interface Country {
    iso_3166_1: string;
    english_name: string;
    native_name: string;
}

export enum DiscoverSortDirection {
    'Asc' = 'asc',
    'Desc' = 'desc'
}

export enum DiscoverSortField {
    'Popularity' = 'popularity',
}

export interface Genre {
    id: number;
    name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface GenresResponse {
    genres: Genre[]
}

export enum MediaType {
    'Movie' = 'movie',
    'TV' = 'tv'
}

export interface CombinedMediaResult {
    media_type: MediaType
    backdrop_path: string;
    genre_ids: string[];
    id: number;
    original_language: string;
    original_title_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    title_name: string;
    vote_average: number;
    vote_count: number;
}