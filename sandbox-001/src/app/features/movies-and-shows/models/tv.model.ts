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

export interface SearchTVResponse {
    page: number;
    results: SearchTVResult[];
    total_pages: number;
    total_results: number;
}


export interface SearchTVResult {
    adult: boolean;
    backdrop_path: string;
    genre_ids: string[];
    id: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
}
