import { Routes } from "@angular/router";
import { InvestingCalculatorComponent } from "./app-pages/investing-calculator/investing-calculator.component";
import { HomepageComponent } from "./homepage/homepage.component";
import { MoviesShowsComponent } from "./app-pages/movies-shows/movies-shows.component";
import { PageNotFoundComponent } from "./shared/components/page-not-found/page-not-found.component";
import { VideoPlayerComponent } from "./app-pages/movies-shows/video-player/video-player.component";
import { authGuard, timeGuard } from "./shared/services/auth.guard";
import { ChristmasCalendarComponent } from "./app-pages/christmas-calendar/christmas-calendar.component";

export const routes: Routes = [
	{ path: "", component: HomepageComponent },
	{ path: "investing-calculator", component: InvestingCalculatorComponent },
	{ path: "christmas-calendar", component: ChristmasCalendarComponent},
	{
		path: "movies-shows",
		component: MoviesShowsComponent,
		children: [{ path: "video-player", component: VideoPlayerComponent }],
	},
	{ path: "**", component: PageNotFoundComponent },
];
