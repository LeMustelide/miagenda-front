import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss']
})
export class GroupSelectComponent {
  groupTD: string = '';
  groupTP: string = '';
  alternant: boolean = true;
  @Output() groupTDChanged = new EventEmitter<string>();
  @Output() groupTPChanged = new EventEmitter<string>();
  @Output() alternantChanged = new EventEmitter<boolean>();

  onGroupTDSelect() {
    this.groupTDChanged.emit(this.groupTD);
  }

  onGroupTPSelect() {
    this.groupTPChanged.emit(this.groupTP);
  }

  onAlternantSelect() {
    this.alternantChanged.emit(this.alternant);
  }
}
