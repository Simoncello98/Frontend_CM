export enum TeamNameEnum {
    None = 'none',
    TeamA = 'TeamA',
    TeamB = 'TeamB',
}
export const TeamNameEnumItems: Array<TeamNameEnum> = [
    TeamNameEnum.None,
    TeamNameEnum.TeamA,
    TeamNameEnum.TeamB

];

export interface TeamNameObservable {
    TeamName: TeamNameEnum;
}

export const TeamNamePossibleValues: Array<TeamNameObservable> = TeamNameEnumItems.map(x => ({ TeamName: x }));
