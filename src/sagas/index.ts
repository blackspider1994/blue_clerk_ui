import { all } from 'redux-saga/effects';
import authFlow from './auth.saga';
import bcModalSaga from './bc-modal.saga';
import customersSaga from './customer.saga';
/*
 * Import jobSaga from './job.saga';
 * Import jobTypesSaga from './job-type.saga';
 */
import watchAllCompanyEquipmentsLoad from './company-equipment.saga';
import watchAllEmployeesLoad from './employee.saga';
import watchJobReportLoad from './job-report.saga';
import watchSubscription from './subscriptions.saga';


export default function *rootSaga() {
  yield all([
    customersSaga(),
    // JobTypesSaga(),
    authFlow(),
    watchAllEmployeesLoad(),
    watchAllCompanyEquipmentsLoad(),
    watchJobReportLoad(),
    watchSubscription(),
    bcModalSaga()
  ]);
}
