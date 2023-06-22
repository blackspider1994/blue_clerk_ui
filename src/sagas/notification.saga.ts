import { acceptRejectVendorAPI } from 'api/vendor.api';
import { acceptOrRejectContractNotificationAction, dismissNotificationAction, loadNotificationsActions, markNotificationAsRead } from 'actions/notifications/notifications.action';
import {
  all,
  call,
  cancelled,
  put,
  takeLatest

} from 'redux-saga/effects';
import { getNotifications, updateNotification } from 'api/notifications.api';


export function *handleGetNotifications(action: { payload: any }) {
  yield put(loadNotificationsActions.fetching());
  try {
    const result = yield call(getNotifications, action.payload?.pageSize, action.payload?.currentPage, action.payload?.search);
    yield put(loadNotificationsActions.success(result));
  } catch (error) {
    yield put(loadNotificationsActions.fault(error.toString()));
  } finally {
    if (yield cancelled()) {
      yield put(loadNotificationsActions.cancelled());
    }
  }
}

export function *handleNotificationMarkAsRead(action: {payload: string}) {
  yield put(markNotificationAsRead.fetching());
  try {
    const result = yield call(updateNotification, action.payload);
    yield put(markNotificationAsRead.success(result.notification));
  } catch (error) {
    yield put(markNotificationAsRead.fault(error.toString()));
  } finally {
    if (yield cancelled()) {
      yield put(markNotificationAsRead.cancelled());
    }
  }
}

export function *handleNotificationDismiss(action: {payload: string}) {
  yield put(dismissNotificationAction.fetching());
  try {
    const result = yield call(updateNotification, action.payload);
    yield put(dismissNotificationAction.success(result.notification));
  } catch (error) {
    yield put(dismissNotificationAction.fault(error.toString()));
  } finally {
    if (yield cancelled()) {
      yield put(dismissNotificationAction.cancelled());
    }
  }
}

export function *handleAcceptOrReject(action: {payload: any}) {
  yield put(acceptOrRejectContractNotificationAction.fetching());
  try {
    const result = yield call(acceptRejectVendorAPI, action.payload);
    if (result.status === 0) {
      yield put(acceptOrRejectContractNotificationAction.fault(result.message));
    } else {
      yield put(acceptOrRejectContractNotificationAction.success({ '_id': action.payload.notificationId,
        'message': result.message
      }));
    }
  } catch (error) {
    yield put(acceptOrRejectContractNotificationAction.fault(error.toString()));
  } finally {
    if (yield cancelled()) {
      yield put(acceptOrRejectContractNotificationAction.cancelled());
    }
  }
}

export default function *watchNotifications() {
  yield all([
    takeLatest(loadNotificationsActions.fetch, handleGetNotifications),
    takeLatest(markNotificationAsRead.fetch, handleNotificationMarkAsRead),
    takeLatest(dismissNotificationAction.fetch, handleNotificationDismiss),
    takeLatest(acceptOrRejectContractNotificationAction.fetch, handleAcceptOrReject)
  ]);
}
