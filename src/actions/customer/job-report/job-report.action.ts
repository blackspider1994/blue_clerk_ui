import { createApiAction } from '../../action.utils';
import { types } from '../../../reducers/job-report.types';


export const loadJobReportActions = createApiAction(types.LOAD_JOBREPORT);
export const loadJobReportsActions = createApiAction(types.LOAD_JOBREPORTS);
// Export const emailJobReportActions = createApiAction(types.EMAIL_JOBREPORTS);

interface UpdateEmailProps {
  id: string;
  email: string
}

export const updateEmailHistory = ({ id, email }:UpdateEmailProps) => {
  return { 'payload': { email,
    id
  },
  'type': types.UPDATE_EMAIL_HISTORY
  };
};

export const setJobReportLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': types.SET_JOB_REPORT_LOADING
  };
};

export const setJobReport = (jobReports: any) => {
  return {
    'payload': jobReports,
    'type': types.SET_JOB_REPORT
  };
};
export const setPreviousJobReportsCursor = (prevCursor: string) => {
  return {
    'payload': prevCursor,
    'type': types.SET_PREVIOUS_JOB_REPORTS_CURSOR
  };
};
export const setNextJobReportsCursor = (nextCursor: string) => {
  return {
    'payload': nextCursor,
    'type': types.SET_NEXT_JOB_REPORTS_CURSOR
  };
};
export const setJobReportsTotal = (total: number) => {
  return {
    'payload': total,
    'type': types.SET_JOB_REPORTS_TOTAL
  };
};
export const setCurrentPageIndex = (currentPageIndex: number) => {
  return {
    'payload': currentPageIndex,
    'type': types.SET_CURRENT_REPORTS_PAGE_INDEX
  };
};
export const setCurrentPageSize = (currentPageSize: number) => {
  return {
    'payload': currentPageSize,
    'type': types.SET_CURRENT_REPORTS_PAGE_SIZE
  };
};
export const setKeyword = (keyword: string) => {
  return {
    'payload': keyword,
    'type': types.SET_REPORT_SEARCH_KEYWORD
  };
};

export const setDateFilterRange = (dateFilterRange: any) => {
  return {
    'payload': dateFilterRange,
    'type': types.SET_DATE_FILTER_RANGE
  };
}
