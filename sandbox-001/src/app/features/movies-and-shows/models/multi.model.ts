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
    name: string;
    original_language: string;
    original_title: string;
    original_name: string;
    overview: string;
    poster_path: string;
    media_type: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    first_air_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export interface TrendingMultiResponse {
    page: number;
    results: TrendingMultiResult[];
    total_pages: number;
    total_results: number;
}

export interface TrendingMultiResult {
    adult: boolean;
    backdrop_path: string;
    id: number;
    title: string;
    name: string;
    original_language: string;
    original_title: string;
    original_name: string;
    overview: string;
    poster_path: string;
    media_type: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    first_air_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export enum TimeWindow {
    'Day' = 'day',
    'Week' = 'week'
}