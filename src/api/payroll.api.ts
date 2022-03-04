import request from '../utils/http.service';
import {sortByField} from "../helpers/sort";

export const getContractorsAPI = async () => {
  try {
    const response: any = await request("/getContractors", 'GET', {}, false);
    const {status, message, contractors = [], technicians = []} = response.data;
    if (status === 1) {
      const data = [
          ...contractors.map((contractor: any) => normalizeData(contractor, 'vendor')),
          ...technicians.map((technician: any) => normalizeData(technician, 'employee')),
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
          const {commissionTotal, invoiceIds} = contractor;
          return ({
            ...normalizeData(contractor.contractor, 'vendor'),
            commissionTotal: Math.round(commissionTotal * 100) / 100,
            invoiceIds,
            })
        }, ),
        ...employees.map((technician: any) => {
          const {commissionTotal, invoiceIds} = technician;
          return ({
            ...normalizeData(technician.employee, 'employee'),
            commissionTotal: Math.round(commissionTotal * 100) / 100,
            invoiceIds,
          })
        }),
      ];
      return {data: sortByField(data, 'vendor','asc',false), status};
    } else {
      return {status, message};
    }
  } catch {
    return {status: 0, message: `Something went wrong`};
  }
}

export const getPaymentsByContractorAPI = async (type: string, id: string) => {
  try {
    const url = `/getPaymentsByContractor?id=${id}&type=${type}`
    const response: any = await request(url, 'GET', {}, false);
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

const normalizeData = (item: any, type: string) => {
  switch (type) {
    case 'vendor':
    case 'contractor':
      return ({
        vendor: item.info.companyName,
          email: item.info.companyEmail,
        phone: item.contact?.phone || '',
        address: item.address,
        contact: '',
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
