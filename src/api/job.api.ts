import request, { requestApiV2 } from 'utils/http.service';
import { formatDateYMD } from 'helpers/format';
import moment from 'moment';
import axios from 'axios';
import buildFormData from 'utils/build-formdata';
import {
  refreshJobTypes,
  setJobTypes,
  setJobTypesLoading
} from 'actions/job-type/job-type.action';
import {
  refreshJobs,
  setJobLoading,
  setJobs,
  setJobsList,
  setTodaysJobLoading,
  setTodaysJobs,
  setPreviousJobsCursor,
  setNextJobsCursor,
  setTotal
} from 'actions/job/job.action';
import {
  setMapTechnicianJobs
} from 'actions/map-technician-jobs/map-technician-jobs.action'
import { DivisionParams } from 'app/models/division';

const compareByDate = (a: any, b: any) => {
  if (new Date(a.updatedAt) > new Date(b.updatedAt)) {
    return 1;
  }
  if (new Date(a.updatedAt) < new Date(b.updatedAt)) {
    return -1;
  }
  return 0;
};

export const getAllJobTypesAPI = () => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setJobTypesLoading(true));
      request(`/getJobTypes`, 'post', null)
        .then((res: any) => {
          dispatch(setJobTypes(res.data.types));
          dispatch(setJobTypesLoading(false));
          dispatch(refreshJobTypes(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setJobTypesLoading(false));
          return reject(err);
        });
    });
  };
};

export const getAllJobTypes = () => {
  return new Promise((resolve, reject) => {
    request(`/getJobTypes`, 'post', null)
      .then((res: any) => {
        return resolve(res.data.types);
      })
      .catch(err => {
        return reject(err);
      });
  });
};
let cancelTokenGetAllJobsAPI: any;
export const getAllJobsAPI = (pageSize = 10, currentPageIndex = 0, status = '-1', keyword?: string, selectionRange?: { startDate: Date; endDate: Date } | null, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setJobLoading(true));
      const optionObj: any = {
        pageSize: pageSize,
        currentPage: currentPageIndex
      };
      if (status !== '-1') {
        optionObj.status = Number(status);
      }
      if (keyword) {
        optionObj.keyword = keyword
      }
      if (selectionRange) {
        optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(selectionRange.endDate).format('YYYY-MM-DD');
      }
      if (cancelTokenGetAllJobsAPI) {
        cancelTokenGetAllJobsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setJobLoading(true));
        }, 0);
      }

      cancelTokenGetAllJobsAPI = axios.CancelToken.source();

      requestApiV2(`/getJobs`, 'post', optionObj, cancelTokenGetAllJobsAPI, division)
        .then((res: any) => {
          let tempJobs = res.data.jobs;
          tempJobs = tempJobs.map((tempJob: any) => {
            let tempTasks = tempJob.tasks.map((tempTask: any, index: any) => {
              let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
                const currentItem = tempJob.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
                return {
                  ...tempJobType,
                  jobType: currentItem
                }
              });
              // Jobs data to be sent on List Page
              return {
                ...tempTask,
                technician: tempJob.technicianObj[index],
                contractor: tempJob.contractorsObj[index],
                jobTypes: tempJobTypes,
              }
            })

            return {
              ...tempJob,
              customer: tempJob.customerObj[0],
              jobLocation: tempJob.jobLocationObj[0],
              jobSite: tempJob.jobSiteObj[0],
              ticket: tempJob.ticketObj[0],
              updatedAt: tempJob.updatedAt ? tempJob.updatedAt : tempJob.createdAt,
              tasks: tempTasks
            }
          });
          tempJobs.sort(compareByDate);
          dispatch(setJobs(tempJobs));
          dispatch(setTotal(res.data.total ? res.data.total : 0));
          dispatch(setJobLoading(false));
          dispatch(refreshJobs(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setJobLoading(false));
          dispatch(setJobs([]));
          if (err.message !== 'axios canceled') {
            return reject(err);
          }
        });
    });
  };
};
export const getJobsListAPI = (pageSize = 10, currentPageIndex = 0, status = '-1', keyword?: string, selectionRange?: { startDate: Date; endDate: Date } | null) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setJobLoading(true));
      const optionObj: any = {
        pageSize: pageSize,
        currentPage: currentPageIndex
      };
      if (status !== '-1') {
        optionObj.status = Number(status);
      }
      if (keyword) {
        optionObj.keyword = keyword
      }
      if (selectionRange) {
        optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(selectionRange.endDate).format('YYYY-MM-DD');
      }
      if (cancelTokenGetAllJobsAPI) {
        cancelTokenGetAllJobsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setJobLoading(true));
        }, 0);
      }

      cancelTokenGetAllJobsAPI = axios.CancelToken.source();

      requestApiV2(`/getJobs`, 'post', optionObj, cancelTokenGetAllJobsAPI)
        .then((res: any) => {
          let tempJobs = res.data.jobs;
          tempJobs.sort(compareByDate);
          dispatch(setJobsList(tempJobs.reverse()));
          dispatch(setTotal(res.data.total ? res.data.total : 0));
          dispatch(setJobLoading(false));
          dispatch(refreshJobs(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setJobLoading(false));
          dispatch(setJobs([]));
          if (err.message !== 'axios canceled') {
            return reject(err);
          }
        });
    });
  };
};

let cancelTokenGetTodaysJobsAPI: any;
export const getTodaysJobsAPI = (status = '-1', keyword?: string, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setTodaysJobLoading(true));
      const optionObj: any = {};
      if (status !== '-1') {
        optionObj.status = Number(status);
      }
      if (keyword) {
        optionObj.keyword = keyword;
      }
      optionObj.pageSize = 2020;
      optionObj.startDate = moment(new Date()).format('YYYY-MM-DD');
      optionObj.endDate = moment(new Date()).format('YYYY-MM-DD');
      if (cancelTokenGetTodaysJobsAPI) {
        cancelTokenGetTodaysJobsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setTodaysJobLoading(true));
        }, 0);
      }

      cancelTokenGetTodaysJobsAPI = axios.CancelToken.source();

      requestApiV2(`/getJobs`, 'post', optionObj,cancelTokenGetTodaysJobsAPI, division)
        .then((res: any) => {
          let tempJobs = res.data.jobs;
          tempJobs = tempJobs.map((tempJob: any) => {
            let tempTasks = tempJob.tasks.map((tempTask: any, index: any) => {
              let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
                const currentItem = tempJob.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
                return {
                  ...tempJobType,
                  jobType: currentItem
                }
              });
              return {
                ...tempTask,
                technician: tempJob.technicianObj[index],
                contractor: tempJob.contractorsObj[index],
                jobTypes: tempJobTypes,
              }
            })

            return {
              ...tempJob,
              customer: tempJob.customerObj[0],
              jobLocation: tempJob.jobLocationObj[0],
              jobSite: tempJob.jobSiteObj[0],
              ticket: tempJob.ticketObj[0],
              updatedAt: tempJob.updatedAt ? tempJob.updatedAt : tempJob.createdAt,
              tasks: tempTasks
            }
          });
          tempJobs.sort(compareByDate);
          dispatch(setTodaysJobs(tempJobs.reverse()));
          dispatch(setTodaysJobLoading(false));
          dispatch(refreshJobs(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setTodaysJobLoading(false));
          dispatch(setTodaysJobs([]));
          if (err.message !== 'axios canceled') {
            return reject(err);
          }
        });
    });
  };
};

export const getAllJobsByCustomerAPI = (pageSize = 2020, customerId: string, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setJobLoading(true));
      requestApiV2(`/getJobs`, 'post', { customerId, pageSize }, undefined, division)
        .then((res: any) => {
          let tempJobs = res.data.jobs;
          tempJobs = tempJobs.map((tempJob: any) => {
            let tempTasks = tempJob.tasks.map((tempTask: any, index: any) => {
              let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
                const currentItem = tempJob.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
                return {
                  ...tempJobType,
                  jobType: currentItem
                }
              });
              return {
                ...tempTask,
                technician: tempJob.technicianObj[index],
                contractor: tempJob.contractorsObj[index],
                jobTypes: tempJobTypes,
              }
            })

            return {
              ...tempJob,
              customer: tempJob.customerObj[0],
              jobLocation: tempJob.jobLocationObj[0],
              jobSite: tempJob.jobSiteObj[0],
              ticket: tempJob.ticketObj[0],
              updatedAt: tempJob.updatedAt ? tempJob.updatedAt : tempJob.createdAt,
              tasks: tempTasks
            }
          });
          tempJobs.sort(compareByDate);
          dispatch(setJobs(tempJobs.reverse()));
          dispatch(setJobLoading(false));
          dispatch(refreshJobs(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setJobLoading(false));
          return reject(err);
        });
    });
  };
};

export const getAllJobsByTechnicianAndDateAPI = (technicianIds: any, jobDate: any) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      const optionObj: any = {
        pageSize: 2020,
      }
      if (jobDate) {
        optionObj.startDate = moment(jobDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(jobDate).format('YYYY-MM-DD');
      }
      optionObj.technicianIds = technicianIds.map((tech: any) => tech.id)
      requestApiV2(`/getJobs`, 'post', optionObj)
        .then((res: any) => {
          let tempJobs = res.data.jobs;
          tempJobs = tempJobs.map((tempJob: any) => {
            let tempTasks = tempJob.tasks.map((tempTask: any, index: any) => {
              let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
                const currentItem = tempJob.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
                return {
                  ...tempJobType,
                  jobType: currentItem
                }
              });
              return {
                ...tempTask,
                technician: tempJob.technicianObj[index],
                contractor: tempJob.contractorsObj[index],
                jobTypes: tempJobTypes,
              }
            })

            return {
              ...tempJob,
              customer: tempJob.customerObj[0],
              jobLocation: tempJob.jobLocationObj[0],
              jobSite: tempJob.jobSiteObj[0],
              ticket: tempJob.ticketObj[0],
              updatedAt: tempJob.updatedAt ? tempJob.updatedAt : tempJob.createdAt,
              tasks: tempTasks
            }
          });
          dispatch(setMapTechnicianJobs(tempJobs));
          return resolve(res.data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  };
};

export const getAllJobAPI = async (param?: {}, division?: DivisionParams) => {
  const body = param || {};
  let responseData;
  try {
    const response: any = await requestApiV2('/getJobs', 'POST', body, undefined, division);
    let tempJobs = response.data.jobs;
    tempJobs = tempJobs.map((tempJob: any) => {
      let tempTasks = tempJob.tasks.map((tempTask: any, index: any) => {
        let tempJobTypes = tempTask.jobTypes.map((tempJobType: any, index: any) => {
          const currentItem = tempJob.jobTypeObj?.filter((item: any) => item._id == tempJobType.jobType)[0];
          return {
            ...tempJobType,
            jobType: currentItem
          }
        });
        return {
          ...tempTask,
          technician: tempJob.technicianObj[index],
          contractor: tempJob.contractorsObj[index],
          jobTypes: tempJobTypes,
        }
      })

      return {
        ...tempJob,
        customer: tempJob.customerObj[0],
        jobLocation: tempJob.jobLocationObj[0],
        jobSite: tempJob.jobSiteObj[0],
        ticket: tempJob.ticketObj[0],
        updatedAt: tempJob.updatedAt ? tempJob.updatedAt : tempJob.createdAt,
        tasks: tempTasks
      }
    });
    responseData = response.data;
    responseData.jobs = tempJobs;
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData;
};

export const getjobDetailAPI = async (data: any) => {
  const body = {
    'jobId': data.jobId,
    'companyId': data.companyId
  };
  let responseData;
  try {
    const response: any = await request('/getJobDetails', 'POST', body, false);
    responseData = response.data;
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData.job;
};

export const callCreateJobAPI = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    buildFormData(formData, data);

    request(`/createJob`, 'post', formData)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callEditJobAPI = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    buildFormData(formData, data);

    request(`/editJob`, 'post', formData)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callUpdateJobAPI = (data: any) => {
  return new Promise((resolve, reject) => {
    request(`/updateJob`, 'post', data, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const saveJobType = async (body: { title: string, description?: string }) => {
  let responseData;
  try {
    const response: any = await request('/createJobType', 'POST', body, false);
    responseData = response.data;
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData;
};

export const editJobType = async (body: { jobTypeId: string, title: string, description?: string }) => {
  let responseData;
  try {
    const response: any = await request('/editJobType', 'POST', body, false);
    responseData = response.data;
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData;
};


export const getSearchJobs = async (data: {
  page?: number,
  pageSize?: number,
  customerNames?: any,
  jobId?: string,
  schedule_date?: string
}) => {
  const { page } = data;
  const { pageSize } = data;
  delete data.page;
  delete data.pageSize;

  const requestLink = `/searchJobs?page=${page}&pageSize=${pageSize}`;

  return new Promise(async (resolve, reject) => {
    try {
      const res: any = await request(requestLink, 'post', data);

      if (res.status === 200) {
        return resolve(res);
      }
      /*
       * If (today) {
       *   return resolve(res.data?.filter((job: any) => formatDateYMD(job.scheduleDate) === formatDateYMD(new Date())));
       * } else {
       *   return resolve(res.data?.filter((job: any) => formatDateYMD(job.scheduleDate) !== formatDateYMD(new Date())));
       * }
       */
    } catch (err) {
      return reject(err);
    }
  });
};

export const getJobsStream: any = (actionId: string) => {
  return new Promise((resolve, reject) => {
    request(`/getJobsStream`, 'OPTIONS', { actionId }, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callGetJobReportPDF = (id: string) => {
  return new Promise((resolve, reject) => {

    pdfRequest(`/getJobReportPDF/${id}`, 'get', {}, false)
      .then((res: any) => {
        return resolve(res);
      })
      .catch(err => {
        return reject(err);
      });
  });
};
