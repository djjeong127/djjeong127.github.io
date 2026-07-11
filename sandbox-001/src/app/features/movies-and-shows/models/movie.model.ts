import { Country, DiscoverSortDirection, DiscoverSortField, Genre, ProductionCompany, ProductionCountry, SpokenLanguage } from "./movie-tv.model";



export interface DiscoverMovieResponse {
    page: number;
    results: DiscoverMovieResult[];
    total_pages: number;
    total_results: number;
}

export interface DiscoverMovieResult {
    adult: boolean;
    backdrop_path: string;
    genre_ids: string[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export interface MovieDetailResponse {
    adult: boolean;
    backdrop_path: string;
    belongs_to_collection: Collection[];
    budget: number;
    genres: Genre[]
    homepage: string;
    id: number;
    imdb_id: string;
    origin_country: string[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export interface Collection {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
}


export interface DiscoverMovieSortBy {
    field: DiscoverSortField;
    direction: DiscoverSortDirection;
}

export interface DiscoverMovieParams {
    page: number;
    sort_by: DiscoverMovieSortBy;
    with_genre: Genre;
    with_origin_country: Country;
}