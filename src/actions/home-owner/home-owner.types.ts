export const types = {
    'HOME_OWNER_LOAD': 'loadHomeownerActions',
  };
  
  export interface HomeOwnerState {
    readonly loading: boolean
    readonly refresh: boolean
    readonly data?: any[]
    readonly error?: string
  }

  export enum HomeOwnerType {
    GET = 'getHomeOwner',
    SET = 'setHomeOwner',
    FAILED = 'getHomeOwnerFailed',
    CLEAR_HOME_OWNER_STORE = 'clearHomeOwnerStore'
  }