import request from '../utils/http.service';
import {sortByField} from "../helpers/sort";
import { error, success } from 'actions/snackbar/snackbar.action';
import { getContractorPayments, getPayrollBalance } from 'actions/payroll/payroll.action';

export const getContractorsAPI = async () => {
  try {
    const response: any = await request("/getContractors", 'GET', {}, false);
    const {status, message, contractors = [], technicians = []} = response.data;
    if (status === 1) {
      const data = [
          ...contractors.map((contractor: any) => normalizeData(contractor, 'vendor')),
          //...technicians.map((technician: any) => normalizeData(technician, 'employee')),
      ];
      return {data: sortByField(data, 'vendor','asc',false), status};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const updateCommissionAPI = async (params: {
  type: string;
  id: string;
  commission: number;
}) => {
  try {
    const response: any = await request("/updateCommission", 'PUT', params, false);
    const {status, message, contractor, employee} = response.data;
    if (status === 1) {
      const data = (contractor ? normalizeData(contractor, 'vendor') : normalizeData(employee, 'employee'));
      return {data, status, message};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const getPayrollBalanceAPI = async (startDate: string|null, endDate: string|null) => {
  try {
    const offset = new Date().getTimezoneOffset() / 60;
    const url = `/getPayrollBalance${startDate ? `?startDate=${startDate}&endDate=${endDate}&offset=${offset}` : ''}`
    const response: any = await request(url, 'GET', {}, false);
    const {status, message, vendors = [], employees = []} = response.data;
    if (status === 1) {
      const data = [
        ...vendors.map((contractor: any) => {
          const { commissionTotal, invoiceIds, advancePaymentTotal, creditAvailable, creditUsedTotal } = contractor;
          return ({
            ...normalizeData(contractor.contractor, 'vendor'),
            commissionTotal: Math.round(commissionTotal * 100) / 100,
            invoiceIds,
            advancePaymentTotal,
            creditAvailable,
            creditUsedTotal,
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
      return {data: sortByField(data, 'vendor','asc',false), status};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const getPaymentsByContractorAPI = async (type?: string, id?: string) => {
  try {
    const url = `/getPaymentsByContractor${type ? `?id=${id}&type=${type}`:''}`;
    const response: any = await request(url, 'GET', {}, false);
    const {status, message, payments} = response.data;
    if (status === 1) {
      const normalized = payments.map((payment: any) => {
        if (payment.contractor) {
          return {...payment,
            payedPerson: normalizeData(payment.contractor, 'contractor'),
            contractor: undefined,
          }
        } else {
          return {...payment,
            payedPerson: normalizeData(payment.employee, 'employee'),
            employee: undefined,
          }
        }
      })
      return {payments: normalized.filter((payment: any) => payment.__t === 'PaymentVendor')
        , status, message};
    } else {
      return {status, message};
    }
  } catch(e) {
    console.log(e);
    return {status: 0, message: `Something went wrong`};
  }
}
export const recordAdvancePaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request("/recordAdvancePaymentContractor ", 'POST', params, false);
    const {status, message, advancePayment} = response.data;
    if (status === 1) {
      return {advancePayment, status, message};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const recordPaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request("/recordPaymentContractor ", 'POST', params, false);
    const {status, message, payment} = response.data;
    if (status === 1) {
      return {payment, status, message};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const updatePaymentContractorAPI = async (params: any) => {
  try {
    const response: any = await request("/updatePaymentContractor ", 'PUT', params, false);
    const {status, message, payment} = response.data;
    if (status === 1) {
      return {
        payment: {
          ...payment,
          contractor: undefined,
          employee: undefined,
        }, status, message};
    } else {
      return {status, message};
    }
  } catch(e) {
    console.log(e);
    return {status: 0, message: `Something went wrong`};
  }
}

export const getPayrollReportAPI = async (type?: string, id?: string) => {
  try {
    const url = `/getPayrollReport${type ? `?id=${id}&type=${type}`:''}`
    const response: any = await request(url, 'GET', {}, false);
    const {status, message, vendors = [], employees = []} = response.data;
    if (status === 1) {
      const data = [
        ...vendors.map((vendor: any) => {
          const {commissionAmount, contractor, invoice} = vendor;
          return ({
            payedPerson: normalizeData(contractor, 'vendor'),
            commissionAmount,
            invoice,
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
      ]


      return {data, status, message};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const normalizeData = (item: any, type: string) => {
  switch (type) {
    case 'vendor':
    case 'contractor':
      return ({
        vendor: item.info.companyName,
        email: item.info.companyEmail,
        phone: item.contact?.phone || '',
        address: item.address,
        contact: {
          displayName: item.admin?.profile?.displayName,
          _id: item.admin?._id,
          email:  item.admin?.auth?.email,
          phone:  item.admin?.contact?.phone,
        },
        commission: item.commission,
        balance: item.balance,
        _id: item._id,
        type: 'vendor'});
    case 'employee':
    case 'technician':
      return ({
        vendor: item.profile.displayName,
        email: item.auth.email,
        phone: item.contact?.phone || '',
        address: item.address,
        contact: '',
        commission: item.commission,
        balance: item.balance,
        _id: item._id,
        type: 'employee'});
  }
}

export const voidPayment: any = (params = {}) => {
  return (dispatch: any) => {
    return new Promise(async (resolve, reject) => {
      request('/voidPayment', 'DELETE', params, false)
        .then((res: any) => {
          if(res.data?.status === 1){
            dispatch(success("Payment voided succesfully"));
            dispatch(getContractorPayments());
            dispatch(getPayrollBalance());
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
