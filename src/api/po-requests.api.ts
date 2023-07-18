import request, { requestApiV2 } from '../utils/http.service';
import { refreshPORequests, setPORequest, setPORequestLoading, setPreviousPORequestCursor, setNextPORequestCursor, setTotal} from 'actions/po-request/po-request.action';
import moment from 'moment';
import axios from 'axios';

const compareByDate = (a: any, b: any) => {
  if (new Date(a.createdAt) > new Date(b.createdAt)) {
    return 1;
  }
  if (new Date(a.createdAt) < new Date(b.createdAt)) {
    return -1;
  }
  return 0;
};


let cancelTokenGetAllPORequestsAPI: any;
export const getAllPORequestsAPI = (pageSize = 10, currentPageIndex = 0, status = false, keyword?: string, selectionRange?: { startDate: Date; endDate: Date } | null, division?: any) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setPORequestLoading(true));
      const optionObj: any = {
        pageSize,
        currentPage: currentPageIndex,
        type: "PO Request"
      };

      if (status)
        optionObj.status = 1;
      else
        optionObj.status = 0;

      if (keyword) {
        optionObj.keyword = keyword
      }

      if (selectionRange) {
        optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
        optionObj.endDate = moment(selectionRange.endDate).format('YYYY-MM-DD');
      }

      if (cancelTokenGetAllPORequestsAPI) {
        cancelTokenGetAllPORequestsAPI.cancel('axios canceled');
        setTimeout(() => {
          dispatch(setPORequestLoading(true));
        }, 0);
      }

      cancelTokenGetAllPORequestsAPI = axios.CancelToken.source();

      requestApiV2(`/getPORequest`, 'post', optionObj, cancelTokenGetAllPORequestsAPI, division)
        .then((res: any) => {
          let tempPORequests = res.data.serviceTickets;
          tempPORequests = tempPORequests.map((tempPORequest: { createdAt: string }) => ({
            ...tempPORequest,
            createdAt: tempPORequest.createdAt
          }));
          tempPORequests.sort(compareByDate);
          
          dispatch(setPORequest(tempPORequests.reverse()));
          dispatch(setPreviousPORequestCursor(res.data.previousCursor ? res.data.previousCursor : ''));
          dispatch(setNextPORequestCursor(res.data.nextCursor ? res.data.nextCursor : ''));
          dispatch(setTotal(res.data.total ? res.data.total : 0));
          dispatch(setPORequestLoading(false));
          dispatch(refreshPORequests(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setPORequestLoading(false));
          dispatch(setPORequest([]));
          if (err.message !== 'axios canceled') {
            return reject(err);
          }
        });
    });
  };
};

export const generatePORequestEmailTemplate = async (params: any) => {
  const queryParams = Object.keys(params).reduce((acc: string, key: string, index, arr) => `${acc}${key}=${params[key]}${index < arr.length - 1 ? '&' : ''}`, '?');
  try {
    const response: any = await requestApiV2(`/getPORequestEmailTemplate${queryParams}`, 'GET', {});
    return response.data;
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
}


export const sendPORequestEmail = async (params: any) => {
  try {
    const response: any = await requestApiV2('/sendPORequest', 'POST', params);
    return response.data;
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
}