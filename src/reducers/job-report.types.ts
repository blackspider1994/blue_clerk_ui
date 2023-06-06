// I am to creat a job-report.types.ts in actions/customer/job-report/ folder for this:
export const types = {
  'EMAIL_JOBREPORTS': 'emailJobReportActions',
  'LOAD_JOBREPORT': 'loadJobReportActions',
  'LOAD_JOBREPORTS': 'loadJobReportsActions',
  'RESET_EMAIL_STATE': 'RESET_EMAIL_STATE',
  'UPDATE_EMAIL_HISTORY': 'UPDATE_EMAIL_HISTORY',
  'SET_JOB_REPORT_LOADING': 'SET_JOB_REPORT_LOADING',
  'SET_JOB_REPORT': 'SET_JOB_REPORT',
  'SET_PREVIOUS_JOB_REPORTS_CURSOR': 'SET_PREVIOUS_JOB_REPORTS_CURSOR',
  'SET_NEXT_JOB_REPORTS_CURSOR': 'SET_NEXT_JOB_REPORTS_CURSOR',
  'SET_JOB_REPORTS_TOTAL': 'SET_JOB_REPORTS_TOTAL',
  'SET_CURRENT_REPORTS_PAGE_INDEX': 'SET_CURRENT_REPORTS_PAGE_INDEX',
  'SET_CURRENT_REPORTS_PAGE_SIZE': 'SET_CURRENT_REPORTS_PAGE_SIZE',
  'SET_REPORT_SEARCH_KEYWORD': 'SET_REPORT_SEARCH_KEYWORD',
  'SET_DATE_FILTER_RANGE': 'SET_DATE_FILTER_RANGE'
};

export interface JobReport {
  _id: string;
  jobId: string;
  status: number;
  employeeType: boolean;
  dateTime: string;
  description: string;
  createdAt: string;
  ticket: {
    scheduleDateTime: string;
    note: string;
    ticketId: string;
  };
  technician: {
    auth: {
      email: string;
    };
    profile: {
      displayName: string;
    };
    contact: {
      phone: string;
    };
    permissions: {
      role: string;
    };
  };
  customer: {
    auth: {
      email: string;
    };
    info: {
      email: string;
    };
    profile: {
      displayName: string;
    };
    contact: {
      phone: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  type: {
    title: string;
  };
  company: {
    auth: {
      email: string;
    };
    info: {
      companyName: string;
      logoUrl: string;
    };
    contact: {
      phone: string;
    };
    permissions: {
      role: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  createdBy: {
    auth: {
      email: string;
    };
    info: {
      companyName: string;
    };
    profile: {
      displayName: string;
    };
    contact: {
      phone: string;
    };
    permissions: {
      role: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  scans: {
    comment: string;
    timeOfScan: string;
    equipment: {
      info: {
        model: string;
        serialNumber: string;
        nfcTag: string;
        location: string;
      };
      images: string[];
      type: {
        title: string;
      };
      brand: {
        title: string;
      };
    };
  };
  emailHistory: [];
}

export interface JobReportState {
  readonly loading: boolean;
  readonly jobReports?: JobReport[];
  readonly error?: string;
  readonly jobReportObj: JobReport;
  prevCursor: string;
  nextCursor: string;
  total: number;
  currentPageIndex: number;
  currentPageSize: number;
  keyword: string;
  dateFilterRange: Range | null;
}


