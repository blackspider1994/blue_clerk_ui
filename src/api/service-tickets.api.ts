import request, { requestApiV2 } from '../utils/http.service';
import { refreshServiceTickets, setOpenServiceTicket, setOpenServiceTicketLoading, setServiceTicket, setServiceTicketLoading, setPreviousServiceTicketCursor, setNextServiceTicketCursor, setTotal} from 'actions/service-ticket/service-ticket.action';
import moment from 'moment';
import axios from 'axios';
import { DivisionParams } from 'app/models/division';

const compareByDate = (a: any, b: any) => {
  if (new Date(a.createdAt) > new Date(b.createdAt)) {
    return 1;
  }
  if (new Date(a.createdAt) < new Date(b.createdAt)) {
    return -1;
  }
  return 0;
};

export const getAllServiceTicketAPI =  (param?: {pageSize: 2020}, division?: DivisionParams) => {
  const body = param || {pageSize: 2020};
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setServiceTicketLoading(true));
      requestApiV2(`/getServiceTickets`, 'post', body, undefined,division)
        .then((res: any) => {
          const tempJobs = res.data.serviceTickets?.filter((ticket: any) => ticket.status !== 1);

          dispatch(setServiceTicket(tempJobs.reverse()));
          dispatch(setServiceTicketLoading(false));
          dispatch(refreshServiceTickets(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setServiceTicketLoading(false));
          return reject(err);
        });
    });
  };
};
let cancelTokenGetAllServiceTicketsAPI:any;
export const getAllServiceTicketsAPI = (pageSize = 10, currentPageIndex = 0, status = false, keyword?: string, selectionRange?:{startDate:Date;endDate:Date}|null, division?: any) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setServiceTicketLoading(true));
      const optionObj:any = {
        pageSize,
        currentPage: currentPageIndex,
        type: "Ticket"
      };

      if(status)
        optionObj.status = 1;
      else
        optionObj.status = 0;

      if(keyword){
        optionObj.keyword = keyword
      }

      if(selectionRange){
        optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(selectionRange.endDate).format('YYYY-MM-DD');
      }

      if(cancelTokenGetAllServiceTicketsAPI) {
        cancelTokenGetAllServiceTicketsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setServiceTicketLoading(true));
        }, 0);
      }
      
      cancelTokenGetAllServiceTicketsAPI = axios.CancelToken.source();

      requestApiV2(`/getServiceTickets`, 'post', optionObj, cancelTokenGetAllServiceTicketsAPI, division)
        .then((res: any) => {
          let tempServiceTickets = res.data.serviceTickets;
          tempServiceTickets = tempServiceTickets.map((tempServiceTicket: {createdAt:string})=>({
            ...tempServiceTicket,
            createdAt: tempServiceTicket.createdAt
          }));
          tempServiceTickets.sort(compareByDate);
          
          dispatch(setServiceTicket(tempServiceTickets.reverse()));
          dispatch(setPreviousServiceTicketCursor(res.data.previousCursor ? res.data.previousCursor : ''));
          dispatch(setNextServiceTicketCursor(res.data.nextCursor ? res.data.nextCursor : ''));
          dispatch(setTotal(res.data.total ? res.data.total : 0));
          dispatch(setServiceTicketLoading(false));
          dispatch(refreshServiceTickets(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setServiceTicketLoading(false));
          dispatch(setServiceTicket([]));
          if(err.message !== 'axios canceled'){
            return reject(err);
          }
        });
    });
  };
};
export const callCreateTicketAPI = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'images') {
        data.images.forEach((image: any) => formData.append(key, image))
      } else {
        formData.append(key, data[key]);
      }
    });
    request(`/createServiceTicket`, 'post', formData, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callEditTicketAPI = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'images') {
        data.images.forEach((image: any) => formData.append(key, image))
      } else {
        formData.append(key, data[key]);
      }
    });


    request(`/updateServiceTicket`, 'post', formData)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const getOpenServiceTickets = (data: {
  pageNo?: number,
  pageSize?: number,
  jobTypeTitle?: string,
  dueDate?: string,
  customerNames?: any,
  ticketId?: string,
  companyId?: string
}) => {
  const page = data.pageNo;
  const pagesize = data.pageSize;
  delete data.pageNo;
  delete data.pageSize;
  const requestLink = `/getOpenServiceTickets?page=${page}&pagesize=${pagesize}`;
  return new Promise((resolve, reject) => {
    request(requestLink, 'post', data)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callEditServiceTicket = (data: any) => {
  return new Promise((resolve, reject) => {
    request(`/editServiceTicket`, 'post', data, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const getServiceTicketDetail:any = (ticketId:string) => {
  return new Promise((resolve, reject) => {
    request(`/getServiceTicketDetail`, 'post', { ticketId }, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const getOpenServiceTicketsStream:any = (actionId: string, division?: DivisionParams) => {
  return new Promise((resolve, reject) => {
    request(`/getOpenServiceTicketsStream`, 'OPTIONS', {actionId, includeOpenJobRequest: true}, false,undefined,undefined,undefined,division)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};
