import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss']
})
export class GroupSelectComponent {
  groupTD: string = '';
  groupTP: string = '';
  @Output() groupTDChanged = new EventEmitter<string>();
  @Output() groupTPChanged = new EventEmitter<string>();

  onGroupTDSelect() {
    this.groupTDChanged.emit(this.groupTD);
  }

  onGroupTPSelect() {
    this.groupTPChanged.emit(this.groupTP);
  }
}
