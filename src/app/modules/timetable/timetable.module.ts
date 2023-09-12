import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableComponent } from './timetable.component';
import { TimetableRoutingModule } from './timetable.routes';
import { GroupSelectComponent } from 'src/app/shared/components/group-selector/group-selector.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    TimetableComponent,
    GroupSelectComponent
  ],
  imports: [
    TimetableRoutingModule,
    CommonModule,
    FormsModule
  ]
})
export class TimetableModule { }
