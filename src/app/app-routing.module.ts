import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '',   redirectTo: 'timetable', pathMatch: 'full' },
  { path: 'timetable', loadChildren: () => import('./modules/timetable/timetable.module').then(m => m.TimetableModule), data: { animation: 'timetable' } },
  { path: 'home', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule), data: { animation: 'home' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
