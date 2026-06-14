import { Component } from "@angular/core";
import {
	IEpisodeInfo,
	IGenre,
	IMediaInfo,
	IMediaState,
	ISeasonInfo,
} from "../interfaces";
import { EMediaType } from "../constants";
import { AngularMaterialModule } from "../../../shared/modules/angular-material.module";
import { MoviesShowsService } from "../movies-shows.service";
import { TmdbService } from "../services/tmdb.service";
import { VidsrcService } from "../services/vidsrc.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { catchError, concatMap, forkJoin, Observable, of, tap } from "rxjs";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";

@Component({
	selector: "app-video-player",
	standalone: true,
	imports: [AngularMaterialModule],
	templateUrl: "./video-player.component.html",
	styleUrl: "./video-player.component.scss",
})
export class VideoPlayerComponent {
	EMediaType = EMediaType;

	mediaState$: Observable<IMediaInfo>;

	constructor(
		public moviesShowsService: MoviesShowsService,
		private tmdbService: TmdbService,
		private vidsrcService: VidsrcService,
		private domSanitizer: DomSanitizer,
		private route: ActivatedRoute
	) {
		this.mediaState$ = route.queryParams.pipe(
			concatMap((params) => {
				const mediaState: IMediaState = {
					id: params["id"],
					media_type: params["media_type"],
					season: params["season"],
					episode: params["episode"],
				};
				return this.loadMedia(mediaState);
			})
		);
	}

	loadMedia(mediaState: IMediaState): Observable<IMediaInfo> {
		if (mediaState.media_type === EMediaType.MOVIE) {
			return this.loadMovie(mediaState);
		} else {
			return this.loadShow(mediaState);
		}
	}

	loadMovie(mediaState: IMediaState): Observable<IMediaInfo> {
		return this.tmdbService.getMovieDetails(mediaState.id).pipe(
			concatMap((movieDetails) => {
				var mediaItem: IMediaInfo = {
					id: movieDetails.id,
					title: movieDetails.title,
					media_type: mediaState.media_type,
					// media_url?: SafeResourceUrl;
					release_date: movieDetails.release_date,
					runtime: movieDetails.runtime,
					overview: movieDetails.overview,
					genres: this.getGenreNamesList(movieDetails.genres),
				};
				var mediaInfoPropertyObservables: Map<
					string,
					Observable<any>
				> = new Map();
				mediaInfoPropertyObservables.set(
					"media_url",
					this.getMediaURL(mediaItem)
				);

				return forkJoin(Object.fromEntries(mediaInfoPropertyObservables)).pipe(
					concatMap((mediaInfoPropertyList) => {
						const mediaInfoPropertyListMap = new Map(
							Object.entries(mediaInfoPropertyList)
						);
						mediaItem.media_url = mediaInfoPropertyListMap.get("media_url");
						return of(mediaItem);
					})
				);
			})
		);
	}

	loadShow(mediaState: IMediaState): Observable<IMediaInfo> {
		return this.tmdbService.getShowDetails(mediaState.id).pipe(
			concatMap((showDetails) => {
				var mediaItem: IMediaInfo = {
					id: showDetails.id,
					title: showDetails.name,
					media_type: mediaState.media_type,
					// media_url?: SafeResourceUrl;
					release_date: showDetails.first_air_date,
					overview: showDetails.overview,
					season: parseInt(mediaState.season!.toString()),
					episode: parseInt(mediaState.episode!.toString()),
					// episode_title?: string;
					// episode_overview?: string;
					// seasonsEpisodes?: Map<number, ISeasonInfo>;
					genres: this.getGenreNamesList(showDetails.genres),
				};
				var mediaInfoPropertyObservables: Map<
					string,
					Observable<any>
				> = new Map();
				mediaInfoPropertyObservables.set(
					"seasonsEpisodes",
					this.getSeasonsEpisodesMap(mediaItem.id)
				);
				mediaInfoPropertyObservables.set(
					"media_url",
					this.getMediaURL(mediaItem)
				);

				return forkJoin(Object.fromEntries(mediaInfoPropertyObservables)).pipe(
					concatMap((mediaInfoPropertyList) => {
						const mediaInfoPropertyListMap = new Map(
							Object.entries(mediaInfoPropertyList)
						);
						mediaItem.seasonsEpisodes =
							mediaInfoPropertyListMap.get("seasonsEpisodes");
						const episodeDetails = mediaItem.seasonsEpisodes?.get(mediaItem.season!)!.episodes[mediaItem.episode! - 1]!;
						mediaItem.episode_title = episodeDetails.name;
						mediaItem.episode_overview = episodeDetails.overview;
						mediaItem.media_url = mediaInfoPropertyListMap.get("media_url");
						return of(mediaItem);
					})
				);
			})
		);
	}

	getGenreNamesList(genreMap: IGenre[]): string[] {
		var genreList: string[] = [];
		for (const genre of genreMap) {
			genreList.push(genre.name);
		}
		return genreList;
	}

	getMediaURL(mediaItem: IMediaInfo): Observable<SafeResourceUrl> {
		if (mediaItem.media_type === EMediaType.MOVIE) {
			return this.vidsrcService.getTMDBMovie(mediaItem.id).pipe(
				concatMap((responseHTML) => {
					const secureURL = this.parseResponseHtml(responseHTML);
					return of(secureURL);
				}),
				catchError((err) => {
					console.log("error getting media: ");
					console.log(err);
					return of("");
				})
			);
		} else {
			return this.vidsrcService
				.getTMDBShow(mediaItem.id, mediaItem.season!, mediaItem.episode!)
				.pipe(
					concatMap((responseHTML) => {
						const secureURL = this.parseResponseHtml(responseHTML);
						return of(secureURL);
					}),
					catchError((err) => {
						console.log("error getting media: ");
						console.log(err);
						return of("");
					})
				);
		}
	}

	parseResponseHtml(responseHtml: string): SafeResourceUrl {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(responseHtml, "text/html");

		var iframeSource = htmlDoc
			.querySelector("iframe#player_iframe")!
			.getAttribute("src")!;

		const url = `https:${iframeSource}`;
		const secureURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
		return secureURL;
	}

	getSeasonsEpisodesMap(titleID: string): Observable<Map<number, ISeasonInfo>> {
		return this.tmdbService.getShowDetails(titleID).pipe(
			concatMap((showDetails) => {
				var seasonsEpisodesMap: Map<number, ISeasonInfo> = new Map();
				var episodeItemListObservables: Map<
					number,
					Observable<IEpisodeInfo[]>
				> = new Map();
				for (const season of showDetails.seasons) {
					if (season.season_number > 0) {
						var seasonItem: ISeasonInfo = {
							season_number: parseInt(season.season_number),
							name: season.name,
							episode_count: parseInt(season.episode_count),
							episodes: [],
						};
						seasonsEpisodesMap.set(season.season_number, seasonItem);
					}
					episodeItemListObservables.set(
						season.season_number,
						this.createEpisodeItemList(titleID, season.season_number)
					);
				}
				return forkJoin(Object.fromEntries(episodeItemListObservables)).pipe(
					concatMap((episodeItemLists) => {
						const episodesItemListsMap = new Map(
							Object.entries(episodeItemLists)
						);
						for (const seasonNumber of seasonsEpisodesMap.keys()) {
							var newSeasonItem: ISeasonInfo = structuredClone(
								seasonsEpisodesMap.get(seasonNumber)!
							);
							newSeasonItem.episodes = episodesItemListsMap.get(
								seasonNumber.toString()
							)!;
							seasonsEpisodesMap.set(seasonNumber, newSeasonItem);
						}
						return of(seasonsEpisodesMap);
					})
				);
			})
		);
	}

	createEpisodeItemList(
		titleID: string,
		season: number
	): Observable<IEpisodeInfo[]> {
		return this.tmdbService.getSeasonDetails(titleID, season).pipe(
			concatMap((seasonDetails) => {
				var episodeItemList: IEpisodeInfo[] = [];
				for (const episode of seasonDetails.episodes) {
					episodeItemList.push({
						episode_number: episode.episode_number,
						name: episode.name,
						overview: episode.overview,
						runtime: episode.runtime,
					});
				}
				return of(episodeItemList);
			})
		);
	}

	changeSeason(season: number, mediaItem: IMediaInfo) {
		var newMediaItem: IMediaInfo = structuredClone(mediaItem);
		newMediaItem.season = season;
		newMediaItem.episode = 1;
		this.moviesShowsService.updateMediaState(newMediaItem);
	}

	changeEpisode(episode: number, mediaItem: IMediaInfo) {
		var newMediaItem: IMediaInfo = structuredClone(mediaItem);
		newMediaItem.episode = episode;
		this.moviesShowsService.updateMediaState(newMediaItem);
	}

	minutesToHoursAndMinutes(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (hours === 0) {
			return `${remainingMinutes}m`
		}
		if (minutes === 0) {
			return `${hours}h`
		}
		else {
			return `${hours}h ${remainingMinutes}m`;
		}
	}
}
