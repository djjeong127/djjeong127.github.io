import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Christmas } from './features/christmas/christmas';
import { MoviesAndShows } from './features/movies-and-shows/movies-and-shows';
import { Recipes } from './features/recipes/recipes';
import { GiveUsThisDayOur } from './shared/components/give-us-this-day-our/give-us-this-day-our';
import { RecipePage } from './features/recipes/components/recipe-page/recipe-page';
import { MediaPlayer } from './features/movies-and-shows/components/media-player/media-player';

export const routes: Routes = [
    {
        path: '',
        component: Homepage
    },
    {
        path: 'christmas',
        component: Christmas
    },
    {
        path: 'movies-and-shows',
        component: MoviesAndShows
    },
    {
        path: 'movies-and-shows/:media_type/:id',
        component: MediaPlayer
    },
    {
        path: 'recipes',
        component: Recipes,
    },
    {
        path: 'recipes/:id',
        component: RecipePage
    },
    {
        path: '**',
        component: GiveUsThisDayOur
    }
];
