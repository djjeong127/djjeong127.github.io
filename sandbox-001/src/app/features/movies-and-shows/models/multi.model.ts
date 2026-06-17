import { MediaType } from "./movie-tv.model";

export interface SearchMultiResponse {
    page: number;
    results: SearchMultiResult[];
    total_pages: number;
    total_results: number;
}

export interface SearchMultiResult {
    adult: boolean;
    backdrop_path: string;
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    poster_path: string;
    media_type: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    name: string;
    original_name: string;
}

export interface MultiFilter {
    movie?: MediaType.Movie;
    tv?: MediaType.TV;
    person?: MediaType.Person;
}