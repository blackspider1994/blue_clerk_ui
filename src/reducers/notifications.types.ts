import { NotificationItem } from 'app/components/bc-header/bc-header-notification';

type ServiceTicketNotification = {
  _id: string;
  scheduleDate: string;
  createdAt: string;
  technician: string;
  image: string;
  customer: string;
  customerPO: string;
  customerContactId: string;
  note: string;
  comment: string;
  createdBy: string;
  company: string;
  ticketId: string;
  jobId: string;
  requestId: string;
  track: any[];
  status?: number;
};

export enum NotificationTypeTypes {
  CONTRACT_ACCEPTED = 'ContractAccepted',
  CONTRACT_CANCELLED = 'ContractCanceled',
  CONTRACT_FINISHED = 'ContractFinished',
  CONTRACT_INVITATION = 'ContractInvitation',
  CONTRACT_REJECTED = 'ContractRejected',
  SERVICE_TICKET_CREATED = 'ServiceTicketCreated',
  JOB_REQUEST_CREATED = 'JobRequestCreated',
  JOB_RESCHEDULED = 'JobRescheduled',
  NEW_CHAT = 'NewChat',
}

export type Notification = {
  _id: string;
  company: string;
  notificationType: string;
  message: {
    title: string;
    body: string;
  };
  readStatus: {
    isRead: true;
    readBy: {
      _id: string;
      auth: {
        email: string;
        password: string;
      };
      profile: {
        firstName: string;
        lastName: string;
        displayName: string;
      };
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
      contact: {
        phone: string;
      };
      permissions: {
        role: 0;
      };
      info: {
        companyName: string;
        logoUrl: string;
        industry: string;
      };
      company: string;
    };
    readAt: string;
  };
  dismissedStatus: {
    isDismissed: true;
    dismissedBy: {
      _id: string;
      auth: {
        email: string;
        password: string;
      };
      profile: {
        firstName: string;
        lastName: string;
        displayName: string;
      };
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
      contact: {
        phone: string;
      };
      permissions: {
        role: number;
    };
      info: {
        companyName: string;
        logoUrl: string;
        industry: string;
      };
      company: string;
    };
    dismissedAt: string;
  };
  createdAt: string;
  metadata: ServiceTicketNotification;
};

export interface NotificationState {
  error: string;
  notifications: Notification[];
  loading: boolean;
  notificationObj: {
    loading: boolean;
    error: string;
    response: string;
  }
  notificationOpen: boolean;
  total: number;
  totalUnread: number;
  currentPage: number;
  pageSize: number;
  search?: string;
}


