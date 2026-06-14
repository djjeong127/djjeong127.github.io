import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, interval, map, Subscription } from "rxjs";
import { AngularMaterialModule } from "../../shared/modules/angular-material.module";

@Component({
	selector: "app-christmas-calendar",
	standalone: true,
	imports: [CommonModule, AngularMaterialModule],
	templateUrl: "./christmas-calendar.component.html",
	styleUrl: "./christmas-calendar.component.scss",
})
export class ChristmasCalendarComponent implements OnDestroy {
	snowflakes = [...Array(50).keys()].map((i) => i + 1);

	dateObservable$: Observable<Date>;
	subscription: Subscription;

	currentDate = new Date();
	christmasDate = new Date(this.currentDate.getFullYear(), 11, 25);
	isTodayChristmas =
		this.currentDate.getMonth() === this.christmasDate.getMonth() &&
		this.currentDate.getDay() === this.christmasDate.getDay();
	daysTillChristmas = this.getDaysTillChristmas(
		this.currentDate,
		this.christmasDate
	);

	audio = new Audio();
	audioList: string[] = [
		"christmas-spirit.mp3",
		"deck-the-halls-background-christmas-music.mp3",
		"santa-and-friends.mp3",
	];
	isMuted = false;

	constructor() {
		document.body.style.backgroundColor = "#005670";

		// initialize observable to emit datetime every second
		this.dateObservable$ = interval(1000).pipe(map(() => new Date()));

		// initialize subscription to observable
		this.subscription = this.dateObservable$.subscribe((x) => {
			this.currentDate = x;
			this.isTodayChristmas =
				this.currentDate.getMonth() === this.christmasDate.getMonth() &&
				this.currentDate.getDay() === this.christmasDate.getDay();
			this.daysTillChristmas = this.getDaysTillChristmas(
				this.currentDate,
				this.christmasDate
			);
		});

		//audio for page
		const randomAudio: number = Math.floor(
			Math.random() * this.audioList.length
		);
		this.audio.src = "/assets/audio/" + this.audioList[randomAudio];
		this.audio.loop = true;
		this.audio.autoplay = true;
		this.audio.load();
		this.audio
			.play()
			.then(() => {
				this.isMuted = this.audio.muted;
			})
			.catch(() => {
				this.isMuted = true;
			});
	}

	getDaysTillChristmas(todayDate: Date, christmasDate: Date): number {
		const simpleTodayDate = new Date(
			todayDate.getFullYear(),
			todayDate.getMonth(),
			todayDate.getDate()
		);
		if (this.isTodayChristmas) {
			return 0;
		} else if (todayDate.getTime() < christmasDate.getTime()) {
			const daysTillChristmas =
				(christmasDate.getTime() - simpleTodayDate.getTime()) /
				(1000 * 60 * 60 * 24);
			return Math.round(daysTillChristmas);
		} else {
			const nextYearsChristmasDate = new Date(
				christmasDate.getFullYear() + 1,
				christmasDate.getMonth(),
				christmasDate.getDate()
			);
			const daysTillChristmas =
				(nextYearsChristmasDate.getTime() - simpleTodayDate.getTime()) /
				(1000 * 60 * 60 * 24);
			return Math.round(daysTillChristmas);
		}
	}

	toggleVolume() {
		this.isMuted = !this.isMuted;
		this.audio.muted = this.isMuted;
		this.audio.play();
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
		document.body.style.backgroundColor = "#eefeff";
		this.audio.pause();
	}
}
