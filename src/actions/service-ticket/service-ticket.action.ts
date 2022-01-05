import { types } from './service-ticket.types';
export const setServiceTicket = (serviceTickets: any) => {
  return {
    'payload': serviceTickets,
    'type': types.SET_SERVICE_TICKET
  };
};
export const setServiceTicketLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': types.SET_SERVICE_TICKET_LOADING
  };
};
export const refreshServiceTickets = (refresh: any) => {
  return {
    'payload': refresh,
    'type': types.SET_REFRESH_SERVICE_TICKET_STATUS
  };
};

export const setOpenServiceTicket = (openServiceTickets: any) => {
  return {
    'payload': openServiceTickets,
    'type': types.SET_OPEN_SERVICE_TICKET
  };
};

export const setOpenServiceTicketLoading = (isLoading: any) => {
  return {
    'payload': isLoading,
    'type': types.SET_OPEN_SERVICE_TICKET_LOADING
  };
};

export const setOpenServiceTicketObject = (openTicket: any) => {
  return {
    'payload': openTicket,
    'type': types.SET_OPEN_SERVICE_TICKET_OBJECT
  };
};

export const setClearOpenServiceTicketObject = () => {
  return {
    'type': types.SET_CLEAR_OPEN_SERVICE_TICKET_OBJECT
  };
};

export const setOpenTicketFilterState = (openTicketFilterObj: any) => {
  return {
    'payload': openTicketFilterObj,
    'type': types.SET_OPEN_TICKET_FILTER_STATE
  };
};

export const setClearOpenTicketFilterState = (openTicketFilterObj: any) => {
  return {
    'payload': openTicketFilterObj,
    'type': types.SET_OPEN_TICKET_FILTER_STATE
  };
};

export const setSelectedCustomers = (customers: any[]) => {
  return {
    'payload': customers,
    'type': types.SET_SELECTED_CUSTOMERS
  };
};

export const setTicket2JobID = (ticketID: string) => {
  return {
    'payload': ticketID,
    'type': types.SET_TICKET_2_JOB
  };
};

export const getServiceTicketDetailAction = (ticketId:string) => {
  return {
    'payload': ticketId,
    'type': types.GET_SERVICE_TICKET_DETAIL
  };
};

