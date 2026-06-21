import { Country, DiscoverSortField, Genre, DiscoverSortDirection, SpokenLanguage, ProductionCountry, ProductionCompany } from "./movie-tv.model";

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

export interface TVSeriesDetailResponse {
    adult: boolean;
    backdrop_path: string;
    created_by: Creator[];
    episode_run_time: number[];
    first_air_date: string;
    genres: Genre[];
    homepage: string;
    id: number;
    in_production: boolean;
    languages: string[];
    last_episode_to_air: Episode;
    name: string;
    next_episode_to_air: string;
    networks: ProductionCompany[];
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    seasons: Season[];
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string;
    type: string;
    vote_average: number;
    vote_count: number;
}

export interface Creator {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string;
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
}

export interface Season {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
}

export interface TVSeasonDetailResponse {
    air_date: string;
    episodes: Episode[];
    name: string;
    networks: ProductionCompany[];
    overview: string;
    id: number;
    poster_path: string;
    season_number: number;
    vote_average: number;
}

export interface TVEpisodeDetailResponse {
    air_date: string;
    episode_number: number;
    name: string;
    overview: string;
    id: number;
    production_code: string;
    runtime: number;
    season_number: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
}