import axios from 'axios';
import moment from 'moment';
import request from '../utils/http.service';
import { refreshPaymentTerms, setPaymentTerms, setPaymentTermsLoading } from 'actions/payment-terms/payment.terms.action';
// import {
//   getInvoicingList,
// } from 'actions/invoicing/invoicing.action';
import {
  getAllInvoicesAPI,
  getAllInvoicesForBulkPaymentsAPI,
  getUnpaidInvoicesAPI
} from './invoicing.api';
import {
  setPaymentsLoading,
  setPayments, updateSyncedPayments,
  // setPaymentsTotal,
  // setNextPaymentsCursor,
  // setPreviousPaymentsCursor,
} from 'actions/invoicing/payments/payments.action';
import { error, success } from 'actions/snackbar/snackbar.action';
import {SYNC_RESPONSE} from "../app/models/payments";
import { DivisionParams } from 'app/models/division';

export const recordPayment: any = (params = {}, division?:DivisionParams) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/recordPayment', 'POST', params, false)
        .then((res: any) => {
          // dispatch(getInvoicingList());
          if (res.data.status === 1) {
            dispatch(getAllInvoicesAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getUnpaidInvoicesAPI(undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllInvoicesForBulkPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
          }
          return resolve(res.data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
};

export const updatePayment: any = (params = {},  division?:DivisionParams) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/updatePayment', 'PUT', params, false)
        .then((res: any) => {
          // dispatch(getInvoicingList());
          if (res.data.status === 1) {
            dispatch(getAllInvoicesAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllInvoicesForBulkPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
          }
          return resolve(res.data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
};

export const voidPayment: any = (params = {},  division?:DivisionParams) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/voidPayment', 'DELETE', params, false)
        .then((res: any) => {
          if(res.data?.status === 1){
            dispatch(success("Payment voided succesfully"));
            dispatch(getAllInvoicesAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllInvoicesForBulkPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            dispatch(getAllPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,division));
            return resolve(res.data);
          } else {
            dispatch(error("Something went wrong! Cannot void payment"));
          }
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
};

let cancelTokenGetAllPaymentsAPI:any;
export const getAllPaymentsAPI = (pageSize = 10, previousCursor = '', nextCursor = '', keyword?: string, selectionRange?:{startDate:Date;endDate:Date}|null, customerId?: string, dueDate?: Date|null, showPaid?: boolean, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch(setPaymentsLoading(true));
      const optionObj = {};
      // const optionObj:any = {
      //   pageSize,
      //   previousCursor,
      //   nextCursor,
      //   isDraft: false,
      // };
      // if(keyword){
      //   optionObj.keyword = keyword
      // }
      // if(selectionRange){
      //   optionObj.startDate = moment(selectionRange.startDate).format('YYYY-MM-DD');
      //   optionObj.endDate = moment(selectionRange.endDate).add(1,'day').format('YYYY-MM-DD');
      // }
      // if(customerId){
      //   optionObj.customerId = customerId;
      // }
      // if(dueDate){
      //   optionObj.dueDate = moment(dueDate).format('YYYY-MM-DD');
      // }
      // if(showPaid === false) {
      //   optionObj.status = JSON.stringify(["UNPAID", "PARTIALLY_PAID"]);
      // }
      // if(cancelTokenGetAllPaymentsAPI) {
      //   cancelTokenGetAllPaymentsAPI.cancel('axios canceled');
      //   setTimeout(() => {
      //     dispatch(setPaymentsLoading(true));
      //   }, 0);
      // }

      cancelTokenGetAllPaymentsAPI = axios.CancelToken.source();

      request(`/getPayments`, 'GET', optionObj, undefined, undefined, cancelTokenGetAllPaymentsAPI,undefined,division)
        .then((res: any) => {
          const {payment, unsyncedPayments} = res.data;
          dispatch(setPayments(payment.reverse(), unsyncedPayments));
          // dispatch(setPreviousPaymentsCursor(res.data?.pagination?.previousCursor ? res.data?.pagination?.previousCursor : ''));
          // dispatch(setNextPaymentsCursor(res.data?.pagination?.nextCursor ? res.data?.pagination?.nextCursor : ''));
          // dispatch(setPaymentsTotal(res.data?.total ? res.data?.total : 0));
          dispatch(setPaymentsLoading(false));
          return resolve(res.data);
        })
        .catch(err => {
          dispatch(setPaymentsLoading(false));
          dispatch(setPayments([]));
          if(err.message !== 'axios canceled'){
            return reject(err);
          }
        });
    });
  };
};

export const getUnsyncedPayments = async(division?: DivisionParams) => {
  try {
    const response: any = await request('/getUnsyncedPayments', 'GET', undefined,undefined,undefined,undefined,undefined,division);
    const {status, message, payments} = response.data;
    if (status === 1) return payments.reverse();
    throw ({message});
  } catch (e) {
    throw (e.message);
  }
}

export const SyncPayments = (ids: string[] = []) => async(dispatch: any): Promise<SYNC_RESPONSE> => {
  let responseData;
  try {
    const params ={paymentIds :  JSON.stringify(ids)};
    const response: any = await request('/createQBPayments', 'POST', params, false);
    const {status, message, totalPaymentSynced, totalPaymentUnsynced, paymentSynced, paymentUnsynced} = response.data;

    if (status === 1) {
      const unsynced = paymentUnsynced.map((payment: any) => ({
        _id: payment.payment._id,
        error: payment.errorMessage,
      }));
      const synced = paymentSynced.map((payment: any) => ({
        _id: payment._id,
        quickbookId: payment.quickbookId
      }));

      dispatch(updateSyncedPayments(paymentSynced));
      return ({ids: [...unsynced, ...synced], totalPaymentSynced, totalPaymentUnsynced});
    } else {
      throw new Error(message);
    }
  } catch (err) {
    responseData = err.data;
    if (err.response?.status >= 400 || err.data?.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  //return responseData;
};

