export interface IClass {
  name: string;
  groupTypes: IGroupType[];
  adeConfig: string;
}

export interface IGroupType {
  name: string;
  groups: string[];
}