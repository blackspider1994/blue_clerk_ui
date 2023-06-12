import { Reducer } from 'redux';
import {
  JobReportState
} from './job-report.types';
import { loadJobReportActions, loadJobReportsActions } from 'actions/customer/job-report/job-report.action';
import { types } from 'reducers/job-report.types';

// I am to creat a job-report.reducer.ts in reducers/ folder for this:
const initialJobReport: JobReportState = {
  'loading': false,
  'jobReports': [],
  prevCursor: '',
  nextCursor: '',
  total: 0,
  currentPageIndex: 0,
  currentPageSize: 10,
  keyword: '',
  dateFilterRange: null,

  'jobReportObj': {
    '_id': '',
    'jobId': '',
    'status': 0,
    'employeeType': false,
    'dateTime': '',
    'description': '',
    'createdAt': '',
    'ticket': {
      'scheduleDateTime': '',
      'note': '',
      'ticketId': ''
    },
    'technician': {
      'auth': {
        'email': ''
      },
      'profile': {
        'displayName': ''
      },
      'contact': {
        'phone': ''
      },
      'permissions': {
        'role': ''
      }
    },
    'customer': {
      'auth': {
        'email': ''
      },
      'info': {
        'email': ''
      },
      'profile': {
        'displayName': ''
      },
      'contact': {
        'phone': ''
      },
      'address': {
        'street': '',
        'city': '',
        'state': '',
        'zipCode': ''
      }
    },
    'type': {
      'title': ''
    },
    'company': {
      'auth': {
        'email': ''
      },
      'info': {
        'companyName': '',
        'logoUrl': ''
      },
      'contact': {
        'phone': ''
      },
      'permissions': {
        'role': ''
      },
      'address': {
        'street': '',
        'city': '',
        'state': '',
        'zipCode': ''
      }
    },
    'createdBy': {
      'auth': {
        'email': ''
      },
      'info': {
        'companyName': ''
      },
      'profile': {
        'displayName': ''
      },
      'contact': {
        'phone': ''
      },
      'permissions': {
        'role': ''
      },
      'address': {
        'street': '',
        'city': '',
        'state': '',
        'zipCode': ''
      }
    },
    'scans': {
      'comment': '',
      'timeOfScan': '',
      'equipment': {
        'info': {
          'model': '',
          'serialNumber': '',
          'nfcTag': '',
          'location': ''
        },
        'images': [''],
        'type': {
          'title': ''
        },
        'brand': {
          'title': ''
        }
      }
    },
    'emailHistory': []
  }
};

export const JobReportReducer: Reducer<any> = (
  state = initialJobReport,
  {payload, type}
) => {
  switch (type) {
    case loadJobReportsActions.cancelled.toString():
      return {
        ...state,
        'loading': false
      };
    case loadJobReportsActions.success.toString():
      return {
        ...state,
        'jobReports': payload.reports.reverse(),
        'loading': false
      };
    case loadJobReportsActions.fault.toString():
      return {
        ...state,
        'error': payload,
        'loading': false

      };
    case loadJobReportsActions.fetch.toString():
      return {
        ...state,
        'loading': true
      };

    case loadJobReportActions.cancelled.toString():
      return {
        ...state,
        'loading': false
      };
    case loadJobReportActions.success.toString():
      return {
        ...state,
        'jobReportObj': payload,
        'loading': false
      };
    case loadJobReportActions.fault.toString():
      return {
        ...state,
        'error': payload,
        'loading': false

      };
    case loadJobReportActions.fetch.toString():
      return {
        ...state,
        'loading': true
      };

    case types.UPDATE_EMAIL_HISTORY:
      return {
        ...state,
        'jobReports': state.jobReports.map((jobReport:any) => {
          if (jobReport._id === payload.id) {
            return {
              ...jobReport,
              'emailHistory': [
                ...jobReport.emailHistory,
                {
                  'sentAt': Date.now()
                }
              ]
            };
          }
          return jobReport;
        }),
        'jobReportObj': {
          ...state.jobReportObj,
          'emailHistory': payload.email
            ? [
              ...state.jobReportObj.emailHistory,
              {
                'sentAt': Date.now(),
                'sentTo': payload.email
              }
            ]
            : state.jobReportObj.emailHistory
        }
      };
    case types.SET_JOB_REPORT_LOADING:
      return {
        ...state,
        'loading': payload,
      };
    case types.SET_JOB_REPORT:
      return {
        ...state,
        'jobReports': payload,
      };
    case types.SET_PREVIOUS_JOB_REPORTS_CURSOR:
      return {
        ...state,
        prevCursor: payload,
      };
    case types.SET_NEXT_JOB_REPORTS_CURSOR:
      return {
        ...state,
        nextCursor: payload,
      };
    case types.SET_JOB_REPORTS_TOTAL:
      return {
        ...state,
        total: payload,
      };
    case types.SET_CURRENT_REPORTS_PAGE_INDEX:
      return {
        ...state,
        currentPageIndex: payload,
      };
    case types.SET_CURRENT_REPORTS_PAGE_SIZE:
      return {
        ...state,
        currentPageSize: payload,
      };
    case types.SET_REPORT_SEARCH_KEYWORD:
      return {
        ...state,
        keyword: payload,
      };
    case types.SET_DATE_FILTER_RANGE:
      return {
        ...state,
        dateFilterRange: payload,
      };


    default:
      return state;
  }
};
