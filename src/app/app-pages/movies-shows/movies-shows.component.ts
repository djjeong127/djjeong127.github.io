import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularMaterialModule } from "../../shared/modules/angular-material.module";
import { IMediaInfo, ISearchState } from "./interfaces";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { MoviesShowsService } from "./movies-shows.service";

@Component({
	selector: "app-movies-shows",
	standalone: true,
	imports: [AngularMaterialModule, RouterOutlet],
	templateUrl: "./movies-shows.component.html",
	styleUrl: "./movies-shows.component.scss",
})
export class MoviesShowsComponent implements OnInit, OnDestroy {
	infiniteScroll: () => void;
	scrollTop: () => void;
	isSearchHidden = false;
	previousScrollPosition = 0;

	constructor(
		public moviesShowsService: MoviesShowsService,
		private route: ActivatedRoute,
		private router: Router
	) {
		route.queryParams.subscribe({
			next: (params) => {
				if (params["search"]) {
					moviesShowsService.loadSearchResults(params["search"], true);
				} else {
					if (location.pathname === "/movies-shows") {
						moviesShowsService.loadSearchResults("", true);
					} else {
						moviesShowsService.showSearchResults = false;
					}
				}
			},
			error: (err) => {
				console.log("search error");
				console.log(err);
			},
			complete: () => {
				console.log("completed search");
			},
		});

		// initialize scroll top arrow function for new searches
		this.scrollTop = () => {
			window.scrollTo({ top: 0 });
		};

		// initialize infinite scroll arrow function for paging, also for hiding search bar
		this.infiniteScroll = () => {
			if (window.pageYOffset > this.previousScrollPosition) {
				this.isSearchHidden = true;
			}
			else {
				this.isSearchHidden = false;
			}
			this.previousScrollPosition = window.pageYOffset;

			if (location.pathname === "/movies-shows") {
				if (
					window.scrollY + window.innerHeight >
						document.body.scrollHeight - window.innerHeight * 0.5 &&
					!moviesShowsService.loadingPage
				) {
					if (route.snapshot.queryParamMap.has("search")) {
						moviesShowsService.loadSearchResults(
							route.snapshot.queryParamMap.get("search")!,
							false
						);
					} else {
						moviesShowsService.loadSearchResults("", false);
					}
				}
			}
		};
	}

	ngOnInit(): void {
		window.addEventListener("beforeunload", this.scrollTop);
		window.addEventListener("scroll", this.infiniteScroll);
	}

	ngOnDestroy(): void {
		window.removeEventListener("beforeunload", this.scrollTop);
		window.removeEventListener("scroll", this.infiniteScroll);
	}

	searchTMDBMovieShow(searchTitle: string) {
		this.scrollTop();

		var queryParamObject: ISearchState = {
			search: searchTitle,
		};
		this.router.navigate(["movies-shows"], {
			queryParams: queryParamObject,
		});
	}

	loadVideo(mediaItem: IMediaInfo) {
		this.moviesShowsService.updateMediaState(mediaItem);
	}

	blur(inputElement: HTMLInputElement) {
		inputElement.blur();
	}
}
