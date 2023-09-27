import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableComponent } from './timetable.component';
import { TimetableRoutingModule } from './timetable.routes';
import { GroupSelectComponent } from 'src/app/shared/components/group-selector/group-selector.component';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    TimetableComponent,
    GroupSelectComponent,
    SidebarComponent
  ],
  imports: [
    TimetableRoutingModule,
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatRadioModule,
  ]
})
export class TimetableModule { }
