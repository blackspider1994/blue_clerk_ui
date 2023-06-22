import { NotificationState } from './notifications.types';
import { Reducer } from 'redux';
import {
  acceptOrRejectContractNotificationAction,
  dismissNotificationAction,
  loadNotificationsActions,
  markNotificationAsRead,
  showNotificationPopup,
} from 'actions/notifications/notifications.action';
import { NotificationItem } from 'app/components/bc-header/bc-header-notification';
import { types } from 'actions/auth/auth.types';
import { NotificationActionTypes } from 'actions/notifications/notifications.types';

const initialNotificationState: NotificationState = {
  'error': '',
  'loading': false,
  'notificationObj': {
    'error': '',
    'loading': false,
    'response': ''
  },
  'notifications': [],
  'notificationOpen': false,
  total: 0,
  totalUnread: 0,
  currentPage: 0,
  pageSize: 10
};

export const NotificationsReducer: Reducer<any> = (
  state = initialNotificationState,
  action
) => {
  switch (action.type) {
    case loadNotificationsActions.fetch.toString():
      return {
        ...state,
        'loading': true
      };
    case loadNotificationsActions.fetching.toString():
      return {
        ...state,
        'loading': true
      };
    case loadNotificationsActions.success.toString():
      return {
        ...state,
        'loading': false,
        'notifications': action.payload.notifications,
        total: action.payload.total,
        totalUnread: action.payload.totalUnread || 0
      };
    case loadNotificationsActions.fault.toString():
      return {
        ...state,
        'error': action.payload,
        'loading': false
      };
    case loadNotificationsActions.cancelled.toString():
      return {
        ...state,
        'loading': false
      };
    case markNotificationAsRead.success.toString():
    case dismissNotificationAction.success.toString():
      return {
        ...state,
        'notifications': state.notifications.map((notification: NotificationItem) => {
          if (notification._id === action.payload._id) {
            const returnedNotification = action.payload;
            if (notification?.metadata?.jobRequest?.requestId) {
              returnedNotification.metadata.jobRequest = {
                _id: notification.metadata.jobRequest._id,
                requestId: notification.metadata.jobRequest.requestId
              }
            }
            return returnedNotification
          } else {
            return notification
          }
        })
      };

    case NotificationActionTypes.PUSH_NOTIFICATION:
      return {
        ...state,
        'notifications': [action.payload, ...state.notifications]
      };

    case acceptOrRejectContractNotificationAction.success.toString():
      return {
        ...state,
        'notificationObj': {
          ...state.notificationObj,
          'loading': false,
          'response': action.payload.message
        }
      };

    case acceptOrRejectContractNotificationAction.cancelled.toString():
      return {
        ...state,
        'notificationObj': {
          'error': false,
          'loading': false,
          'response': ''
        }
      };

    case acceptOrRejectContractNotificationAction.fetching.toString():
      return {
        ...state,
        'notificationObj': {
          ...state.notificationObj,
          'loading': true,
          'response': ''
        }
      };

    case acceptOrRejectContractNotificationAction.fault.toString():
      return {
        ...state,
        'notificationObj': {
          ...state.notificationObj,
          'error': action.payload,
          'loading': false
        }
      };
    case showNotificationPopup.toString():
      return {
        ...state,
        'notificationOpen': action.payload,
      };

    default:
      return state;
  }
};
