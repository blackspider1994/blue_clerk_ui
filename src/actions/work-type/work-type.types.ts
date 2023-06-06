export interface WorkTypeState {
   readonly loading: boolean
   readonly data?: any[]
   readonly error?: string
}

export enum WorkTypeActionType {
   GET = 'getWorkType',
   SET = 'setWorkType',
   SUCCESS = 'getWorkTypeSuccess',
   FAILED = 'getWorkTypeFailed',
}