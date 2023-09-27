import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home.routes';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ProgressBarComponent } from './progress-bar/progress-bar/progress-bar.component';


@NgModule({
  declarations: [
    HomeComponent,
    ProgressBarComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatCheckboxModule,
    FormsModule,
    MatRadioModule,
  ]
})
export class HomeModule { }
