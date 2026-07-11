import { Component, HostListener, signal } from '@angular/core';
import { ANGULAR_MATERIAL_MODULES } from '../../modules/angular-material.module';
import { NgStyle } from '@angular/common';

interface FadingElement {
  id: number;
  left: string;
  top: string;
}

@Component({
  selector: 'app-give-us-this-day-our',
  imports: [ANGULAR_MATERIAL_MODULES, NgStyle],
  templateUrl: './give-us-this-day-our.html',
  styleUrl: './give-us-this-day-our.scss',
})
export class GiveUsThisDayOur {

  // Handles logic for html element following mouse
  // Singular signal minimizes change detection overhead
  readonly currentCoords = signal({ x: 0, y: 0 });

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Continuously stream the mouse coordinates into the signal
    this.currentCoords.set({
      x: event.clientX,
      y: event.clientY
    });
  }





  // Handles logic for an html element that will appear and fade on click
  // 1. Array Signal holding all active fading elements
  elements = signal<FadingElement[]>([]);
  
  // Counter to give every single element a completely unique ID key
  private elementIdCounter = 0;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const uniqueId = this.elementIdCounter++;
    
    // 2. Create the new element object instance
    const newElement: FadingElement = {
      id: uniqueId,
      left: `${x}px`,
      top: `${y}px`
    };

    // 3. Append the new instance to our signal array using immutable spread syntax
    this.elements.update(prev => [...prev, newElement]);

    // 4. Garbage Collection: Safely remove the element from the DOM array after the 1s animation finishes
    setTimeout(() => {
      this.elements.update(prev => prev.filter(el => el.id !== uniqueId));
    }, 1000); // Matches the 1s CSS animation duration
  }
}
