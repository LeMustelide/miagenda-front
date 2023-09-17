import { Component, EventEmitter, Output } from '@angular/core';

type TDGroupKeys = 'TD1' | 'TD2';
type TPGroupKeys = 'TP1' | 'TP2' | 'TP3';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  tdGroup = {
    TD1: false,
    TD2: false,
  };

  tpGroup = {
    TP1: false,
    TP2: false,
    TP3: false,
  };

  alternant: boolean = true;
  @Output() tdChange = new EventEmitter<string>();
  @Output() tpChanged = new EventEmitter<string>();
  @Output() alternantChanged = new EventEmitter<boolean>();

  onTdChange(checkedGroup: TDGroupKeys) {
    Object.keys(this.tdGroup).forEach((group) => {
      if (group !== checkedGroup) {
        this.tdGroup[group as TDGroupKeys] = false;
      }
    });
    this.tdChange.emit(checkedGroup);
  }

  onTpChange(checkedGroup: TPGroupKeys) {
    Object.keys(this.tpGroup).forEach((group) => {
      if (group !== checkedGroup) {
        this.tpGroup[group as TPGroupKeys] = false;
      }
    });
    this.tpChanged.emit(checkedGroup);
  }

  setAlternant(isInitiale: boolean) {
    this.alternant = isInitiale;
    this.onAlternantSelect();
  }

  onAlternantSelect() {
    this.alternantChanged.emit(this.alternant);
  }
}
