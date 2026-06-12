import { computed, Service, signal } from '@angular/core';
import { map, Subscription, timer } from 'rxjs';

export interface Duration {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

@Service()
export class ChristmasService {public now = signal(new Date());
    currentYear = computed(() => this.now().getFullYear());
    nextChristmas = computed(() => {
        var christmas = new Date(this.currentYear(), 11, 25);
        var dayAfterChristmas = new Date(christmas.getFullYear(), christmas.getMonth(), christmas.getDate() + 1);
        if (this.now() >= dayAfterChristmas) {
            return new Date(this.currentYear() + 1, 11, 25)
        }
        else {
            return christmas
        }
    });

    timeUntilChristmas = computed(() => {
        var dayAfterChristmas = new Date(this.nextChristmas().getFullYear(), this.nextChristmas().getMonth(), this.nextChristmas().getDate() + 1);
        var duration: Duration = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        if (this.nextChristmas() <= this.now() && this.now() < dayAfterChristmas) {
            // if it's currently Christmas, do nothing
        }
        else {
            const msInDay = 1000 * 60 * 60 * 24;
            const msInHour = 1000 * 60 * 60;
            const msInMinutes = 1000 * 60;
            const msInSeconds = 1000;

            const differenceInMilliseconds = this.nextChristmas().getTime() - this.now().getTime();
            const days = Math.floor(differenceInMilliseconds / msInDay);
            const hours = Math.floor((differenceInMilliseconds % msInDay) / msInHour);
            const minutes = Math.floor((differenceInMilliseconds % msInHour) / msInMinutes);
            const seconds = Math.floor((differenceInMilliseconds % msInMinutes) / msInSeconds);

            duration = {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            }
        }
        return duration
    });

    isChristmas = computed(() => {
        if (this.timeUntilChristmas().days == 0 && this.timeUntilChristmas().hours == 0 && this.timeUntilChristmas().minutes == 0 && this.timeUntilChristmas().seconds == 0) {
            return true
        }
        else {
            return false
        }
    });

    numberOfSnowflakes = 300;
    public snowflakeArray = signal(Array.from({ length: this.numberOfSnowflakes }));

    
    private subscription: Subscription = timer(0, 1000).pipe(map(() => {
        this.now.update(() => new Date());
    })).subscribe()

    constructor() {
        this.subscription;
    }
}
