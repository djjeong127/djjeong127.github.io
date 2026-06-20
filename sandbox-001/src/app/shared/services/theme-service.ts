import { DOCUMENT, inject, Service, signal } from '@angular/core';

// Closed set of specific user roles
export enum Modes {
  Light = 'light',
  Dark = 'dark'
}

// Closed set of features (for toggling light/dark mode)
export enum Feature {
    DefaultAll = 'default-for-all',
    MoviesAndShows = 'movies-and-shows'
}

export interface FeatureMode {
    feature: Feature;
    mode: Modes;
}

// Closed set of specific user roles
export enum Themes {
  Mountain = 'mountain',
  Jeju = 'jeju',
  SeoulCherryBlossom = 'seoul-cherry-blossom'
}


@Service()
export class ThemeService {
    private document = inject(DOCUMENT);

    private defaultAllFeatureMode: FeatureMode = {
        feature: Feature.DefaultAll,
        mode: Modes.Light
    }
    private defaultMovieFeatureMode: FeatureMode = {
        feature: Feature.MoviesAndShows,
        mode: Modes.Dark
    }
    private listOfDefaultFeatureModes: FeatureMode[] = [this.defaultAllFeatureMode, this.defaultMovieFeatureMode]


    public currentFeatureMode = signal<FeatureMode>(this.defaultAllFeatureMode)
    public theme = signal(Themes.Mountain);


    private setFeatureMode(featureMode: FeatureMode) {
        const root = this.document.documentElement;

        this.currentFeatureMode.set(featureMode)
        root.style.setProperty('--color-scheme', this.currentFeatureMode().mode)
        localStorage.setItem(`${this.currentFeatureMode().feature}-mode`, JSON.stringify(this.currentFeatureMode()));
    }

    private setTheme(theme: Themes) {
        const root = this.document.documentElement;

        Object.values(Themes).forEach((enumTheme) => {
            if (enumTheme !== theme) {
                root.classList.remove(enumTheme);
            }
        })

        this.theme.update(() => theme)
        root.classList.add(this.theme())
        localStorage.setItem('theme', this.theme());
    }

    public switchFeature(feature: Feature) {
        const storedFeaureMode: FeatureMode = JSON.parse(localStorage.getItem(`${feature}-mode`)!)

        this.setFeatureMode(storedFeaureMode)
    }

    public toggleMode() {
        const root = this.document.documentElement;

        if (this.currentFeatureMode().mode === Modes.Light) {
            this.currentFeatureMode.update((featureMode) => ({...featureMode, mode: Modes.Dark}))
            this.setFeatureMode(this.currentFeatureMode())
        }
        else {
            this.currentFeatureMode.update((featureMode) => ({...featureMode, mode: Modes.Light}))
            this.setFeatureMode(this.currentFeatureMode())
        }
    }

    public toggleTheme() {
        const root = this.document.documentElement;

        if (this.theme() === Themes.Mountain) {
            this.setTheme(Themes.Jeju)
        }
        else if (this.theme() === Themes.Jeju) {
            this.setTheme(Themes.SeoulCherryBlossom)
        }
        else {
            this.setTheme(Themes.Mountain)
        }
    }

    constructor() {
        const features: Feature[] = Object.values(Feature)

        // initialize FeatureModes in localstorage
        features.forEach((feature) => {
            if (localStorage.getItem(`${feature}-mode`)) {
                const storedFeatureMode = JSON.parse(localStorage.getItem(`${feature}-mode`)!)
                this.setFeatureMode(storedFeatureMode)
            }
            else {
                this.setFeatureMode(this.listOfDefaultFeatureModes.find((featureMode) => featureMode.feature === feature)!)
            }
        })

        // after initializing, remember to switch the feature to the default
        this.switchFeature(Feature.DefaultAll)

        // and then we can also switch the feature by tracking the current route in the root app-root component
        // REMEMBER TO ALSO EDIT THE ROUTE CHECKS IN APP-ROOT COMPONENT

        // initialize themes in localstorage
        if (localStorage.getItem('theme')) {
            this.setTheme(localStorage.getItem('theme')! as Themes)
        }
        else {
            this.setTheme(this.theme())
        }

    }
}
