export interface Country {
    iso_3166_1: string;
    english_name: string;
    native_name: string;
}

export enum SortDirection {
    'Asc' = 'asc',
    'Desc' = 'desc'
}

export interface Genre {
    id: number;
    name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}