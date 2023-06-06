import moment from 'moment';
import axios from 'axios';
import request from 'utils/http.service';
import { 
  setJobReportLoading,
  setJobReport,
  setPreviousJobReportsCursor,
  setNextJobReportsCursor,
  setJobReportsTotal
} from 'actions/customer/job-report/job-report.action';
import { DivisionParams } from 'app/models/division';

let cancelTokenGetAllJobReportsAPI:any;
export const getAllJobReportsAPI = (pageSize = 10, currentPageIndex = 0, keyword?: string, selectionRange?:{startDate:Date;endDate:Date}|null, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setJobReportLoading(true));
      const optionObj:any = {
        pageSize,
        currentPage: currentPageIndex
      };
      if(keyword){
        optionObj.keyword = keyword
      }
      if(selectionRange){
        optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(selectionRange.endDate).format('YYYY-MM-DD');
      }
      if(cancelTokenGetAllJobReportsAPI) {
        cancelTokenGetAllJobReportsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setJobReportLoading(true));
        }, 0);
      }
      
      cancelTokenGetAllJobReportsAPI = axios.CancelToken.source();
      request(`/getAllJobReports`, 'OPTIONS', optionObj, undefined, undefined, cancelTokenGetAllJobReportsAPI, undefined, division)
        .then((res: any) => {
          let tempReports = res.data.reports;
          tempReports = tempReports.map((tempReport: any)=>
          {
            let tempJob = tempReport.jobObj[0];
            let tempTasks = tempJob?.tasks.map((tempTask: any, index: any) => {
              let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
                const currentItem = tempReport?.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
                return {
                  ...tempJobType,
                  jobType : currentItem
                }
              });
              const currenttechnician = tempJob.technicianObj?.filter((item: any) => item._id == tempTask.technician)[0];
              const currentcontractor = tempJob.contractorsObj?.filter((item: any) => item._id == tempTask.contractor)[0];
              return {
                ...tempTask, 
                technician : currenttechnician,
                contractor : currentcontractor,     
                jobTypes: tempJobTypes,
              }
            })

            return {
              ...tempReport,
              invoice : tempReport.invoiceObj[0],
              company : tempReport.companyObj[0],    
              job : {
                ...tempJob,
                customer: tempReport.customerObj[0],
                jobLocation: tempReport.jobLocationObj[0],
                jobSite : tempReport.jobSiteObj[0],        
                tasks: tempTasks
              }
            }
          });
          dispatch(setJobReport(tempReports));
          dispatch(setPreviousJobReportsCursor(res.data.previousCursor ? res.data.previousCursor : ''));
          dispatch(setNextJobReportsCursor(res.data.nextCursor ? res.data.nextCursor : ''));
          dispatch(setJobReportsTotal(res.data.total ? res.data.total : 0));
          dispatch(setJobReportLoading(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setJobReportLoading(false));
          dispatch(setJobReport([]));
          if(err.message !== 'axios canceled'){
            return reject(err);
          }
        });
    });
  };
};

export const getJobReports = async (data: any) => {
  try {
    const response: any = await request('/getAllJobReports', 'GET', false);
    let tempReports = response.data.reports;
    tempReports = tempReports.map((tempReport: any)=>
    {
      let tempJob = tempReport.jobObj[0];
      let tempTasks = tempJob?.tasks.map((tempTask: any, index: any) => {
        let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
          const currentItem = tempReport?.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
          return {
            ...tempJobType,
            jobType : currentItem
          }
        });
        const currenttechnician = tempJob.technicianObj?.filter((item: any) => item._id == tempTask.technician)[0];
        const currentcontractor = tempJob.contractorsObj?.filter((item: any) => item._id == tempTask.contractor)[0];
        return {
          ...tempTask, 
          technician : currenttechnician,
          contractor : currentcontractor,     
          jobTypes: tempJobTypes,         
        }
      })

      return {
        ...tempReport,
        invoice : tempReport.invoiceObj[0],
        company : tempReport.companyObj[0],    
        job : {
          ...tempJob,
          customer: tempReport.customerObj[0],
          jobLocation: tempReport.jobLocationObj[0],
          jobSite : tempReport.jobSiteObj[0],        
          tasks: tempTasks
        }
      }
    });
    return tempReports;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const emailJobReport = async (data: any) => {
  try {
    const response: any = await request(`/sendJobReportEmail`, 'POST', { 'jobReportId': data.id }, false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const getJobReportDetail = async (data: any) => {
  try {
    const response: any = await request(`/getJobReport?jobReportId=${data.jobReportId}`, 'GET', false);
    return response.data.report;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

// Export const getJobReportDetail = async (data: any) => {};
