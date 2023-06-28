import request from '../utils/http.service';
import { sortByField } from '../helpers/sort';
import { error, success } from 'actions/snackbar/snackbar.action';
import {
  getContractorPayments,
  getPayrollBalance,
} from 'actions/payroll/payroll.action';
import { DivisionParams } from 'app/models/division';

export const getContractorsAPI = async (division?: DivisionParams) => {
  try {
    const response: any = await request(
      '/getContractors',
      'GET',
      {},
      false,
      undefined,
      undefined,
      undefined,
      division
    );
    const {
      status,
      message,
      contractors = [],
      technicians = [],
    } = response.data;
    if (status === 1) {
      const data = [
        ...contractors.map((contractor: any) =>
          normalizeData(contractor, 'vendor')
        ),
        //...technicians.map((technician: any) => normalizeData(technician, 'employee')),
      ];
      return { data: sortByField(data, 'vendor', 'asc', false), status };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const updateCommissionAPI = async (params: {
  type: string;
  id: string;
  commission: number;
  commissionEffectiveDate: Date;
}) => {
  try {
    const response: any = await request(
      '/updateCommission',
      'PUT',
      params,
      false
    );
    const { status, message, contractor, employee } = response.data;
    if (status === 1) {
      const data = contractor
        ? normalizeData(contractor, 'vendor')
        : normalizeData(employee, 'employee');
      return { data, status, message };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const getCommissionHistoryAPI = async (vendorId: string) => {
  try {
    const response: any = await request(
      `/getCommissionHistory/${vendorId}`,
      'OPTIONS',
      {}
    );
    const { status, message, history } = response.data;
    if (status === 1 || status === 200) {
      const data = history;
      return { data, status, message };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const getPayrollBalanceAPI = async (
  startDate: string | null,
  endDate: string | null,
  division?: DivisionParams
) => {
  try {
    const offset = new Date().getTimezoneOffset() / 60;
    const url = `/getPayrollBalance${
      startDate
        ? `?startDate=${startDate}&endDate=${endDate}&offset=${offset}`
        : ''
    }`;
    const response: any = await request(
      url,
      'GET',
      {},
      false,
      undefined,
      undefined,
      undefined,
      division
    );
    const { status, message, vendors = [], employees = [] } = response.data;
    if (status === 1) {
      const data = [
        ...vendors.map((contractor: any) => {
          const { commissionTotal, invoiceIds, jobIds, advancePaymentTotal, creditAvailable, creditUsedTotal, workType, companyLocation } = contractor;
          return ({
            ...normalizeData(contractor.contractor, 'vendor'),
            commissionTotal: Math.round(commissionTotal * 100) / 100,
            invoiceIds,
            jobIds,
            advancePaymentTotal,
            creditAvailable,
            creditUsedTotal,
            workType,
            companyLocation,
          })
        }),
        // ...employees.map((technician: any) => {
        //   const {commissionTotal, invoiceIds} = technician;
        //   return ({
        //     ...normalizeData(technician.employee, 'employee'),
        //     commissionTotal: Math.round(commissionTotal * 100) / 100,
        //     invoiceIds,
        //   })
        // }),
      ];
      return { data: sortByField(data, 'vendor', 'asc', false), status };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const getPaymentsByContractorAPI = async (
  type?: string,
  id?: string,
  division?: DivisionParams
) => {
  try {
    const url = `/getPaymentsByContractor${
      type ? `?id=${id}&type=${type}` : ''
    }`;
    const response: any = await request(
      url,
      'GET',
      {},
      false,
      undefined,
      undefined,
      undefined,
      division
    );
    const { status, message, payments, advancePayments } = response.data;
    if (status === 1) {
      const returnObj: any = { status, message, payments: [] };
      if (payments?.length) {
        const normalized = payments
          .map((payment: any) => {
            if (payment.contractor) {
              return {
                ...payment,
                payedPerson: normalizeData(payment.contractor, 'contractor'),
                contractor: undefined,
              };
            } else {
              return {
                ...payment,
                payedPerson: normalizeData(payment.employee, 'employee'),
                employee: undefined,
              };
            }
          })
          .filter((payment: any) => payment.__t === 'PaymentVendor');
        returnObj.payments = normalized;
      }
      if (advancePayments?.length) {
        const normalized = advancePayments
          .map((advancePayment: any) => {
            if (advancePayment.contractor) {
              return {
                ...advancePayment,
                amountPaid: advancePayment.amount,
                payedPerson: normalizeData(
                  advancePayment.contractor,
                  'contractor'
                ),
                contractor: undefined,
              };
            } else {
              return {
                ...advancePayment,
                payedPerson: normalizeData(advancePayment.employee, 'employee'),
                employee: undefined,
              };
            }
          })
          .filter(
            (advancePayment: any) =>
              advancePayment.__t === 'AdvancePaymentVendor'
          );
        returnObj.payments = [...returnObj.payments, ...normalized];
      }
      return returnObj;
    } else {
      return { status, message };
    }
  } catch (e) {
    return { status: 0, message: `Something went wrong` };
  }
};
export const recordAdvancePaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request(
      '/recordAdvancePaymentContractor ',
      'POST',
      params,
      false
    );
    const { status, message, advancePayment } = response.data;
    if (status === 1) {
      return { advancePayment, status, message };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const updateAdvancePaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request(
      '/updateAdvancePaymentContractor ',
      'PUT',
      params,
      false
    );
    const { status, message, advancePayment } = response.data;
    if (status === 1) {
      return {
        payment: {
          ...advancePayment,
          contractor: undefined,
          employee: undefined,
        },
        status,
        message,
      };
    } else {
      return { status, message };
    }
  } catch (e) {
    return { status: 0, message: `Something went wrong` };
  }
};

export const recordPaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request(
      '/recordPaymentContractor ',
      'POST',
      params,
      false
    );
    const { status, message, payment } = response.data;
    if (status === 1) {
      return { payment, status, message };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const updatePaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request(
      '/updatePaymentContractor ',
      'PUT',
      params,
      false
    );
    const { status, message, payment } = response.data;
    if (status === 1) {
      return {
        payment: {
          ...payment,
          contractor: undefined,
          employee: undefined,
        },
        status,
        message,
      };
    } else {
      return { status, message };
    }
  } catch (e) {
    return { status: 0, message: `Something went wrong` };
  }
};

export const getPayrollReportAPI = async (
  type?: string,
  id?: string,
  division?: DivisionParams
) => {
  try {
    const url = `/getPayrollReport${type ? `?id=${id}&type=${type}` : ''}`;
    const response: any = await request(
      url,
      'GET',
      {},
      false,
      undefined,
      undefined,
      undefined,
      division
    );
    const { status, message, vendors = [], employees = [] } = response.data;
    if (status === 1) {
      const data = [
        ...vendors.map((vendor: any) => {
          const { commissionAmount, contractor, invoice, job } = vendor;
          return ({
            payedPerson: normalizeData(contractor, 'vendor'),
            commissionAmount,
            invoice,
            job,
          })
        }),
        // ...employees.map((technician: any) => {
        //   const {commissionAmount, invoice, employee} = technician;
        //   return ({
        //     payedPerson: normalizeData(technician.employee, 'employee'),
        //     commissionAmount,
        //     invoice,
        //   })
        // }),
      ];

      return { data, status, message };
    } else {
      return { status, message };
    }
  } catch {
    return { status: 0, message: `Something went wrong` };
  }
};

export const normalizeData = (item: any, type: string) => {
  switch (type) {
    case 'vendor':
    case 'contractor':
      return {
        vendor: item?.info?.displayName ?? item?.info?.companyName,
        email: item.info.companyEmail,
        phone: item.contact?.phone || '',
        address: item.address,
        contact: {
          displayName: item.admin?.profile?.displayName,
          _id: item.admin?._id,
          email: item.admin?.auth?.email,
          phone: item.admin?.contact?.phone,
        },
        commission: item.commission,
        commissionType: item.commissionType,
        commissionTier: item.commissionTier,
        accountType: item.admin?.accountType,
        balance: item.balance,
        _id: item._id,
        type: 'vendor',
      };
    case 'employee':
    case 'technician':
      return {
        vendor: item.profile.displayName,
        email: item.auth.email,
        phone: item.contact?.phone || '',
        address: item.address,
        contact: '',
        commission: item.commission,
        balance: item.balance,
        _id: item._id,
        type: 'employee',
      };
  }
};

export const voidPayment: any = (params = {}, division?: DivisionParams) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/voidPayment', 'DELETE', params, false)
        .then((res: any) => {
          if (res.data?.status === 1) {
            dispatch(success('Payment voided succesfully'));
            dispatch(getContractorPayments(undefined, division));
            dispatch(getPayrollBalance(undefined, undefined, division));
            return resolve(res.data);
          } else {
            dispatch(error('Something went wrong! Cannot void payment'));
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
};

export const voidAdvancePayment: any = (
  params = {},
  division?: DivisionParams
) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/voidAdvancePaymentContractor', 'DELETE', params, false)
        .then((res: any) => {
          if (res.data?.status === 1) {
            dispatch(success('Payment voided succesfully'));
            dispatch(getContractorPayments(undefined, division));
            dispatch(getPayrollBalance(undefined, undefined, division));
            return resolve(res.data);
          } else {
            dispatch(error('Something went wrong! Cannot void payment'));
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
};

