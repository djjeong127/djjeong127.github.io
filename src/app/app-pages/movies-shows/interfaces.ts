import { SafeResourceUrl } from "@angular/platform-browser";
import { EMediaType } from "./constants";

export interface ISearchState {
	search: string;
}

export interface IMediaState {
	id: string;
	media_type: EMediaType;
	season?: number;
	episode?: number;
}

export interface ISearchResults {
	title: string;
	results: IMediaInfo[];
	page: number;
	total_pages: number;
}

export interface IMediaInfo {
	id: string;
	title: string;
	media_type: EMediaType;
	media_url?: SafeResourceUrl;
	release_date: string;
	runtime?: number;
	overview: string;
	poster_path?: string;
	season?: number;
	episode?: number;
	episode_title?: string;
	episode_overview?: string;
	seasonsEpisodes?: Map<number, ISeasonInfo>;
	genres: string[];
}

export interface ISeasonInfo {
	season_number: number;
	name: string;
	episode_count: number;
	episodes: IEpisodeInfo[];
}

export interface IEpisodeInfo {
	episode_number: number;
	name: string;
	overview: string;
	runtime: number;
}

export interface IGenre {
	id: number;
	name: string;
}