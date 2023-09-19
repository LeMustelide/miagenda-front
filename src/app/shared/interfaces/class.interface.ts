export interface IClass {
  name: string;
  groupTypes: IGroupType[];
}

export interface IGroupType {
  name: string;
  groups: string[];
}