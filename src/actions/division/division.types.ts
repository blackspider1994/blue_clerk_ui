export interface DivisionState {
   readonly loading: boolean
   readonly data?: any[]
   readonly refresh?: boolean
   readonly error?: string
}

export enum DivisionActionType {
   GET = 'getDivision',
   SET = 'setDivision',
   REFRESH = 'refreshDivision',
   SUCCESS = 'getDivisionSuccess',
   FAILED = 'getDivisionFailed',
}