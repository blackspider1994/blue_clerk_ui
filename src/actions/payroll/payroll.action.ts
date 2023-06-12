import {Contractor, types} from './payroll.types';
import {
  getContractorsAPI,
  getPaymentsByContractorAPI,
  getPayrollBalanceAPI, recordPaymentContractorAPI
} from 'api/payroll.api';
import {error} from "../snackbar/snackbar.action";
import { DivisionParams } from 'app/models/division';


export const setContractorsLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': types.SET_CONTRACTOR_LOADING
  };
};

export const getContractors = (division?: DivisionParams) => {
  return async (dispatch: any) => {
    dispatch(setContractorsLoading(true));
    const contractors: any = await getContractorsAPI(division);
    if (contractors.status === 0) {
      dispatch(error(contractors.message));
      dispatch(setContractors([]));
      dispatch(setContractorsLoading(false));
    } else {
      dispatch(setContractors(contractors.data));
    }
  };
};

export const getPayrollBalance = (startDate: string|null = null, endDate: string|null = null, division?: DivisionParams) => {
  return async (dispatch: any) => {
    dispatch(setContractorsLoading(true));
    const contractors: any = await getPayrollBalanceAPI(startDate, endDate, division);
    if (contractors.status === 0) {
      dispatch(error(contractors.message));
      dispatch(setContractors([]));
      dispatch(setContractorsLoading(false));
    } else {
      dispatch(setContractors(contractors.data));
    }
  };
};

export const recordPaymentContractor = (params: any) => {
  return async (dispatch: any) => {
    const contractors: any = await recordPaymentContractorAPI(params);
    if (contractors.status === 0) {
      dispatch(error(contractors.message));
    } else {
      dispatch(removeContractor(params.id));
    }
  };
};

export const getContractorPayments = (params?: {type: string; id: string}, division?: DivisionParams) => {
  return async (dispatch: any) => {
    dispatch(setContractorsLoading(true));
    const response: any = await getPaymentsByContractorAPI(params?.type, params?.id,division);
    if (response.status === 0) {
      dispatch(error(response.message));
    } else {
      dispatch(setContractorPayments(response.payments));
    }
    dispatch(setContractorsLoading(false));
  };
};

export const setContractors = (contractors: any) => {
  return {
    'type': types.SET_CONTRACTORS,
    'payload': contractors,
  };
};

export const setContractor = (contractor: any) => {
  return {
    'type': types.SET_CONTRACTOR,
    'payload': contractor
  };
};

export const removeContractor = (contractor: Contractor) => {
  return {
    'type': types.REMOVE_CONTRACTOR,
    'payload': contractor,
  };
};

export const setContractorPayments = (payments: any) => {
  return {
    'type': types.SET_CONTRACTOR_PAYMENTS,
    'payload': payments
  };
};

export const updateContractorPayment = (payment: any) => {
  return {
    'type': types.UPDATE_CONTRACTOR_PAYMENT,
    'payload': payment,
  };
};

export const removeContractorPayment = (payment: any) => {
  return {
    'type': types.REMOVE_CONTRACTOR_PAYMENT,
    'payload': payment,
  };
};

export const refreshContractorPayment = (refresh: any) => {
  return {
    'type': types.REFRESH_CONTRACTOR_PAYMENT,
    'payload': refresh,
  };
};



