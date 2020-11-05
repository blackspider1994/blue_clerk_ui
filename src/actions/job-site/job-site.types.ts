export const types = {
  'JOB_SITE_LOAD': 'loadJobSiteActions',
  'JOB_SITE_NEW': 'newJobSiteAction',
  'JOB_SITE_REMOVE': 'deleteJobSiteActions',
  'SET_JOB_SITE': 'setJobSite'
};


export interface JobSiteState {
  readonly loading: boolean
  readonly data?: any[]
  readonly error?: string
}

export enum JobSiteActionType {
  GET = 'getJobSite',
  SET = 'setJobSite',
  ADD_NEW_JOB_SITE = 'addNewJobSite',
  ADD_NEW_JOB_FAILED = 'addNewJobSiteFailed',
  SUCCESS = 'getJobSiteSuccess',
  FAILED = 'getJobSiteFailed',
}
