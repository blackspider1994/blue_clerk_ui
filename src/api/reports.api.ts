import { DivisionParams } from 'app/models/division';
import request, { requestApiV2 } from '../utils/http.service';

export const generateIncomeReport = async (params: any, division?: DivisionParams) => {
  try {
    const response: any = await request("/generateIncomeReport", 'OPTIONS', params,undefined,undefined,undefined,undefined,division);
    const {status, message} = response.data;
    if (status === 1) {
      return response.data;
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const getMemorizedReports = async (division?: DivisionParams) => {
  try {
    const response: any = await request("/getMemorizedReports", 'OPTIONS', undefined,undefined,undefined,undefined,undefined,division);
    const {status, message} = response.data;
    if (status === 1) {
      return response.data;
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const updateMemorizedReport = async (params: any) => {
  try {
    const response: any = await request("/updateMemorizedReport", 'PUT', params);
    const {status, message} = response.data;
    if (status === 1) {
      return response.data;
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const createMemorizedReport = async (params: any) => {
  try {
    const response: any = await request("/createMemorizedReport", 'POST', params);
    const {status, message} = response.data;
    if (status === 1) {
      return response.data;
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const generateIncomePdfReport = async (params: any, division?: DivisionParams) => {
  const queryParams = Object.keys(params).reduce((acc: string, key: string, index, arr) => `${acc}${key}=${params[key]}${index < arr.length -1 ? '&' : ''}`, '?' );
  try {
    const response: any = await request(`/generateIncomeReportPdf${queryParams}`, 'GET', {}, undefined,undefined,undefined,undefined,division);
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const generateIncomeEmailTemplate = async (params: any) => {
  const queryParams = Object.keys(params).reduce((acc: string, key: string, index, arr) => `${acc}${key}=${params[key]}${index < arr.length -1 ? '&' : ''}`, '?' );
  try {
    const response: any = await request(`/getReportEmailTemplate/incomeReport${queryParams}`, 'GET', {});
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const sendIncomeEmail = async (params: any) => {
  try {
    const response: any = await request('/sendReport/incomeReport', 'POST', params);
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const generateAccountReceivableReport = async (type: number, asOf: string, customerIds?: string[], division?: DivisionParams) => {
  const ids = customerIds ? JSON.stringify(customerIds) : null;

  const params = `?reportData=${type}&asOf=${asOf}${ids ? '&customerIds='+ids : ''}`
  try {
    const response: any = await request(`/generateAccountReceivableReport${params}`, 'GET', {}, undefined,undefined,undefined,undefined,division);
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const generateAccountReceivableReportSubdivisions = async (asOf: string, customerId: string) => {
  const params = `?&asOf=${asOf}&customerId=${customerId}`
  try {
    const response: any = await request(`/generateAccountReceivableReport/subdivisions${params}`, 'GET', {});
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}


export const generateAccountReceivablePdfReport = async (type: number, asOf: string, customerIds?: string[], division?: DivisionParams) => {
  const ids = customerIds ? JSON.stringify(customerIds) : null;

  const params = `?reportData=${type}&asOf=${asOf}${ids ? '&customerIds='+ids : ''}`
  try {
    const response: any = await request(`/generateReportPdf/AccountReceivableReport${params}`, 'GET', {},undefined,undefined,undefined,undefined,division);
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const generateAccountReceivableEmailTemplate = async () => {
  try {
    const response: any = await request('/getReportEmailTemplate/accountReceivableReport', 'GET', {});
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const sendAccountReceivableEmail = async (params: any) => {
  try {
    const response: any = await request('/sendReport/accountReceivableReport', 'POST', params);
    return response.data;
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}
