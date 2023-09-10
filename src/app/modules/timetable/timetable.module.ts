import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableComponent } from './timetable.component';
import { TimetableRoutingModule } from './timetable.routes';



@NgModule({
  declarations: [
    TimetableComponent
  ],
  imports: [
    TimetableRoutingModule,
    CommonModule
  ]
})
export class TimetableModule { }
