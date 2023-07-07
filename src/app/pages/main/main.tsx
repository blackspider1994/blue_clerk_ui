import AuthRoute from 'auth-route';
import BCCircularLoader from '../../components/bc-circular-loader/bc-circular-loader';
import 'scss/elevation.scss';
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import BCAdminLayout from "../../components/bc-admin-layout/bc-admin-layout";
import BCAdminHeader from "../../components/bc-admin-header/bc-admin-header";
import BCAdminSidebar from "../../components/bc-admin-sidebar/bc-admin-sidebar";
import * as CONSTANTS from "../../../constants";
import { modalTypes } from '../../../constants';

import { getjobDetailAPI } from 'api/job.api';
import { getAllJobRequestAPI } from 'api/job-request.api';

import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { loadNotificationsActions, showNotificationPopup } from 'actions/notifications/notifications.action';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';
import { getCompanyProfileAction } from 'actions/user/user.action';
import { logoutAction, resetStore } from 'actions/auth/auth.action';
import { setCurrentPageIndex, setCurrentPageSize } from 'actions/job-request/job-request.action';
import { markNotificationAsRead } from 'actions/notifications/notifications.action';
import { info } from '../../../actions/snackbar/snackbar.action';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { Can, ability } from 'app/config/Can';

const UpdateInvoicePage = React.lazy(() => import('../invoicing/invoices-list/update-invoice/update-invoice'));
const DashboardPage = React.lazy(() => import('../dashboard/dashboard'));
const CustomersPage = React.lazy(() => import('../customer/customer'));
const NewCustomerPage = React.lazy(() => import('../customer/new-customer/new-customer'));
const JobReportsPage = React.lazy(() => import('../customer/job-reports/job-reports'));
const ViewMoreCustomerPage = React.lazy(() => import('../customer/view-more/view-more'));
const CustomersJobEquipmentInfoReportsPage = React.lazy(() => import('../customer/view-more/job-equipment-info/reports/reports'));
const CustomersJobEquipmentInfoJobsPage = React.lazy(() => import('../customer/view-more/job-equipment-info/jobs/jobs'));
const CustomersJobEquipmentInfoTicketsPage = React.lazy(() => import('../customer/view-more/job-equipment-info/tickets/tickets'));
const CustomersJobEquipmentInfoEquipmentPage = React.lazy(() => import('../customer/view-more/job-equipment-info/equipment/equipment'));
const ViewMoreLocationPage = React.lazy(() => import('../customer/view-more/view-more-location'));
const TicketsMapViewPage = React.lazy(() => import('../customer/tickets-map-view/tickets-map-view'));

const ViewJobReportsPage = React.lazy(() => import('../customer/job-reports/view-job-report'));
const ViewInvoicePage = React.lazy(() => import('../customer/job-reports/view-invoice'));
const EditInvoicePage = React.lazy(() => import('../customer/job-reports/view-invoice-edit'));

const InvoicingTodosPage = React.lazy(() => import('../invoicing/todos/todos'));
const InvoicingListPage = React.lazy(() => import('../invoicing/invoices-list/invoices-list'));
const InvoicingPurchaseOrderPage = React.lazy(() => import('../invoicing/purchase-order/purchase-order'));
const InvoicingEstimatesPage = React.lazy(() => import('../invoicing/estimates/estimates'));
const TechnicianPage = React.lazy(() => import('../employee/technicians/technicians'));
const OfficeAdminPage = React.lazy(() => import('../employee/office-admin/office-admin'));

const ScheduleJobsPage = React.lazy(() => import('../customer/schedule-jobs/job-page/job-page'));
const ScheduleServiceTicketsPage = React.lazy(() => import('../customer/schedule-jobs/service-ticket/service-ticket'));
const ScheduleJobRequestsPage = React.lazy(() => process.env.REACT_APP_JOB_REQUEST_ACTIVE ?
  import('../customer/schedule-jobs/job-request/job-request'):
  import('../customer/schedule-jobs/job-request/no-job-request')
);

const CalendarPage = React.lazy(() => import('../customer/calendar/calendar'));
const ManagersPage = React.lazy(() => import('../employee/managers/managers'));
const GroupPage = React.lazy(() => import('../employee/group/group'));

const AdminEmployeesPage = React.lazy(() => import('../admin/employees/employees'));
const BillingPage = React.lazy(() => import('../admin/billing/billing'));
const BillingMethodsPage = React.lazy(() => import('../admin/billing/methods/methods'));
const BillingHistoryPage = React.lazy(() => import('../admin/billing/history/history'));
const BillingSubscriptionPage = React.lazy(() => import('../admin/billing/subscription/subscription'));
const BrandsPage = React.lazy(() => import('../admin/brands/brands'));
const CompanyProfilePage = React.lazy(() => import('../admin/company-profile/company-profile'));
const EquipmentTypePage = React.lazy(() => import('../admin/equipment-type/equipment-type'));
const AdminGroupsPage = React.lazy(() => import('../admin/groups/groups'));
const AdminServiceAndProductsPage = React.lazy(() => import('../admin/services-and-products/services-and-products'));
const AdminServiceAndProductsListPage = React.lazy(() => import('../admin/services-and-products/services-and-products-list'));
const AdminInvoicingPage = React.lazy(() => import('../admin/invoicing/invoicing'));
const AdminInvoicingItemsPage = React.lazy(() => import('../admin/invoicing/items/items'));
const JobTypesPage = React.lazy(() => import('../admin/job-types/job-types'));
const ReportNumberPage = React.lazy(() => import('../admin/report-number/report-number'));
const RolesPermissionsPage = React.lazy(() => import('../admin/roles-permissions/roles-permissions'));
const RolesManagerPage = React.lazy(() => import('../admin/roles-permissions/manager/manager'));
const RolesTechnicianPage = React.lazy(() => import('../admin/roles-permissions/technician/technician'));
const ViewRolePage = React.lazy(() => import('../admin/roles-permissions/roles/roles'));
const AdminVendorsPage = React.lazy(() => import('../admin/vendors/vendors'));
const AdminPayrollPage = React.lazy(() => import('../admin/payroll/payroll'));
const AdminIntegrationsPage = React.lazy(() => import('../admin/integrations/integrations'));
const ViewMoreVendorPage = React.lazy(() => import('../admin/vendors/view-more/view-more'));
const InventoryPage = React.lazy(() => import('../inventory/inventory'));
const PurchasedTagsPage = React.lazy(() => import('../tags/purchased-tags/purchased-tags'));
const BlueTagsPage = React.lazy(() => import('../tags/blue-tags/blue-tags'));
const CreateInvoicePage = React.lazy(() => import('../invoicing/invoices-list/create-invoice/create-invoice'));
const CreatePurchaseOrderPage = React.lazy(() =>
  import('../invoicing/purchase-order/create-purchase-order/create-purchase-order'));
const CreateEstimatePage = React.lazy(() => import('../invoicing/estimates/create-estimates/create-estimates'));
const ViewProfilePage = React.lazy(() => import('../profile/view-profile/view-profile'));
const EmailPreferencePage = React.lazy(() => import('../profile/email-preference/email-preference'));
const AdminAddNewEmployeePage = React.lazy(() => import('../admin/employees/add-new-employee'));
const NotificationPage = React.lazy(() => import('../notifications/notifications'));

const EmployeeProfilePage = React.lazy(() => import('../admin/employees/view-more/view-more'));
const ChangePasswordPage = React.lazy(() => import('../profile/change-password/change-password'));

const PayrollPage = React.lazy(() => import('../payroll/payroll'));
const PastPaymentPage = React.lazy(() => import('../payroll/past-payment/past-payment'));
const PayrollReportsPage = React.lazy(() => import('../payroll/reports/reports'));

const RevenueReportsPage = React.lazy(() => import('../reports/customers/revenue-reports/revenue'));
const ARReportsPage = React.lazy(() => import('../reports/customers/ar-report'));
const NewPayrollReportsPage = React.lazy(() => import('../reports/vendors/payroll-reports/payroll'));
const DataPage = React.lazy(() => import('../admin/data/data'))

const activeJobRequest = process.env.REACT_APP_JOB_REQUEST_ACTIVE

function Main(): any {
  const dispatch = useDispatch();
  const notifications = useSelector((state: any) => state.notifications)
  const profileState = useSelector((state: any) => state.profile);
  const { user } = useSelector((state: any) => state.auth);
  const { numberOfJobRequest } = useSelector((state: any) => state.jobRequests);
  const { jobRequests } = useSelector((state: any) => state.jobRequests);
  const snackbarState = useSelector((state: any) => state.snackbar);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const initialHeaderLoad = () => {
    dispatch(loadNotificationsActions.fetch());
    dispatch(loadInvoiceItems.fetch());
    if(activeJobRequest) {
      dispatch(getAllJobRequestAPI(undefined, undefined, undefined, '-1', '', undefined));
    }
  }

  const showNotificationDetails = (state?: boolean) => {
    dispatch(showNotificationPopup(state ?? !notifications.notificationOpen));
  };

  const getCompanyProfile = (companyId:string) => {
    dispatch(getCompanyProfileAction(companyId));
  };

  const logoutAndReset = () => {
    dispatch(logoutAction());
    dispatch(resetStore());
  }

  const openModalHandler = async (type:any, data:any, itemId:any, metadata?:any) => {
    switch (type) {
      case 'JobRescheduled':
        const job: any = await getjobDetailAPI(data);
        job.jobRescheduled = itemId;
        dispatch(setModalDataAction({
          'data': {
            'job': job,
            'modalTitle': 'Edit Job - Rescheduled',
            'removeFooter': false
          },
          'type': modalTypes.EDIT_JOB_MODAL
        }));
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;

      case 'JobRequestCreated':
      case 'NewChatJobRequest':
        dispatch(
          markNotificationAsRead.fetch({ id: itemId, isRead: true })
        );
        if(data){
          dispatch(
            setModalDataAction({
              data: {
                jobRequest: {...data, tab: type === 'NewChatJobRequest' ? 1 : 0},
                removeFooter: false,
                maxHeight: '100%',
                modalTitle: 'Job Request',
              },
              type: modalTypes.VIEW_JOB_REQUEST_MODAL,
            })
          );
          setTimeout(() => {
            dispatch(openModalAction());
          }, 200);
        } else {
          dispatch(setCurrentPageIndex(0));
          dispatch(setCurrentPageSize(30));
          const result:any = await dispatch(getAllJobRequestAPI(30, undefined, undefined, '-1', '', undefined));
          const matchedJobRequest = result?.jobRequests?.filter((jobRequest:any) => jobRequest._id === metadata?._id)
          if(matchedJobRequest && matchedJobRequest.length){
            dispatch(
              setModalDataAction({
                data: {
                  jobRequest: {...matchedJobRequest[0], tab: type === 'NewChatJobRequest' ? 1 : 0},
                  removeFooter: false,
                  maxHeight: '100%',
                  modalTitle: 'Job Request',
                },
                type: modalTypes.VIEW_JOB_REQUEST_MODAL,
              })
            );
            setTimeout(() => {
              dispatch(openModalAction());
            }, 200);
          }
        }
        break;

      case 'ServiceTicketCreated':
        dispatch(setModalDataAction({
          'data': {
            'modalTitle': 'Service Ticket Details',
            'removeFooter': false,
            'className': 'serviceTicketTitle',
            'maxHeight': '754px',
            'height': '100%',
            'ticketId': metadata._id,
            'notificationId': itemId,
          },
          'type': modalTypes.VIEW_SERVICE_TICKET_MODAL
        }));
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;

      case 'ContractNotification':
        dispatch(setModalDataAction({
          'data': {
            'removeFooter': false,
            'maxHeight': '450px',
            'height': '100%',
            'message': data.message,
            'contractId': metadata._id,
            'notificationType': data.notificationType,
            'notificationId': itemId
          },
          'type': modalTypes.CONTRACT_VIEW_MODAL
        }));
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;

      default:
        break;
    }
  }

  const dispatchResetInfoSnackbar = () => {
    dispatch(info(''));
  }

  return (
    <Router>
      <Switch>
        <Suspense
          fallback={
            <div style={{flex: 1}}>
              <BCAdminHeader
                drawerOpen={true}
                notifications={notifications}
                initialLoad={initialHeaderLoad}
                showNotificationDetails={showNotificationDetails}
                openModalHandler={openModalHandler}
                jobRequests={jobRequests}
                user={user}
              />
              <BCAdminSidebar
                open={true}
                user={user}
                profileState={profileState}
                numberOfJobRequest={numberOfJobRequest}
                showNotificationDetails={showNotificationDetails}
                getCompanyProfile={getCompanyProfile}
                logoutAndReset={logoutAndReset}
              />
              <div style={{
                flexGrow: 1,
                padding: 20,
                backgroundColor: CONSTANTS.PRIMARY_WHITE
              }}>
                <BCCircularLoader heightValue={'100vh'} />
              </div>
            </div>
          }>
          <Route>
            <BCAdminLayout
              notifications={notifications}
              initialLoad={initialHeaderLoad}
              showNotificationDetails={showNotificationDetails}
              user={user}
              profileState={profileState}
              numberOfJobRequest={numberOfJobRequest}
              getCompanyProfile={getCompanyProfile}
              logoutAndReset={logoutAndReset}
              openModalHandler={openModalHandler}
              jobRequests={jobRequests}
              dispatchResetInfoSnackbar={dispatchResetInfoSnackbar}
              snackbarState={snackbarState}
            >
              <Switch>
                <AuthRoute
                  Component={DashboardPage}
                  exact
                  path={'/main/dashboard'}
                  title={'Dashboard'}
                />
                <AuthRoute
                  Component={InventoryPage}
                  exact
                  path={'/main/inventory'}
                  title={'Inventory'}
                />
                <AuthRoute
                  Component={PurchasedTagsPage}
                  exact
                  path={'/main/tags/purchasedtag'}
                  title={'Tags'}
                />
                <AuthRoute
                  Component={PastPaymentPage}
                  exact
                  path={'/main/payroll/pastpayment/:contractorName'}
                  title={'Tags'}
                  hasAccess={ability.can('manage', 'VendorPayments')}
                />
                <AuthRoute
                  Component={PastPaymentPage}
                  exact
                  path={'/main/payroll/pastpayment/:companyLocation?/:workType?'}
                  title={'Tags'}
                  hasAccess={ability.can('manage', 'VendorPayments')}
                />
                <AuthRoute
                  Component={PayrollReportsPage}
                  exact
                  path={'/main/payroll/reports/:companyLocation?/:workType?'}
                  title={'Tags'}
                  hasAccess={ability.can('manage', 'VendorPayments')}
                />
                <AuthRoute
                  Component={PayrollPage}
                  exact
                  path={'/main/payroll/:companyLocation?/:workType?'}
                  title={'Tags'}
                  hasAccess={ability.can('manage', 'VendorPayments')}
                />
                <AuthRoute
                  Component={BlueTagsPage}
                  exact
                  path={'/main/tags/bluetag'}
                  title={'Tags'}
                />
                <AuthRoute
                  Component={GroupPage}
                  exact
                  path={'/main/employees/group'}
                  title={'Employees'}
                />
                <AuthRoute
                  Component={TechnicianPage}
                  exact
                  path={'/main/employees/technician'}
                  title={'Employees'}
                />
                <AuthRoute
                  Component={ManagersPage}
                  exact
                  path={'/main/employees/managers'}
                  title={'Employees'}
                />
                <AuthRoute
                  Component={OfficeAdminPage}
                  exact
                  path={'/main/employees/office-admin'}
                  title={'Employees'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/new-customer',
                    'title': 'Customers'
                  }}
                  Component={CustomersPage}
                  exact
                  path={'/main/customers'}
                  title={'Customers'}
                />
                <AuthRoute
                  Component={NewCustomerPage}
                  exact
                  path={'/main/customers/new-customer'}
                  title={'Customers'}
                />
                {/* For dev */}
                {/* <AuthRoute
                  Component={ScheduleJobsPage}
                  exact
                  path={'/main/customers/schedule'}
                  title={'Customers'}
                /> */}
                <AuthRoute
                  Component={ScheduleJobsPage}
                  exact
                  path={'/main/customers/schedule/jobs/:companyLocation?/:workType?'}
                  title={'Customers'}
                  hasAccess={ability.can('manage', 'Jobs')}
                />
                <AuthRoute
                  Component={ScheduleServiceTicketsPage}
                  exact
                  path={'/main/customers/schedule/tickets/:companyLocation?/:workType?'}
                  title={'Customers'}
                  hasAccess={ability.can('manage', 'Tickets')}
                />
                <AuthRoute
                  Component={ScheduleJobRequestsPage}
                  exact
                  path={'/main/customers/schedule/job-requests'}
                  title={'Customers'}
                />
                <AuthRoute
                  Component={CalendarPage}
                  exact
                  path={'/main/customers/calendar/:companyLocation?/:workType?'}
                  title={'Customers'}
                  hasAccess={ability.can('manage', 'Tickets') || ability.can('manage', 'Jobs')}
                />
                <AuthRoute
                  Component={ViewInvoicePage}
                  exact
                  path={'/main/customers/job-reports/view/:invoice'}
                  title={'View Invoice'}
                />
                <AuthRoute
                  Component={TicketsMapViewPage}
                  exact
                  path={'/main/customers/ticket-map-view/:companyLocation?/:workType?'}
                  title={'Map View'}
                  hasAccess={ability.can('manage', 'Tickets') || ability.can('manage', 'Jobs')}
                />
                <AuthRoute
                  Component={ViewJobReportsPage}
                  /*
                   * ActionData={{
                   *   link: "/main/customers/job-reports/:jobId",
                   *   title: "Job Reports",
                   * }}
                   */
                  exact
                  path={'/main/customers/job-reports/detail/:jobReportId'}
                  title={'Job Reports'}
                />
                <AuthRoute
                  Component={JobReportsPage}
                  exact
                  path={'/main/customers/job-reports/:companyLocation?/:workType?'}
                  title={'Job Reports'}
                />

                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername',
                    'title': 'Customers'
                  }}
                  Component={ViewMoreCustomerPage}
                  exact
                  path={'/main/customers/:customername'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername/job-equipment-info/reports/:companyLocation?/:workType?',
                    'title': 'Customers'
                  }}
                  Component={CustomersJobEquipmentInfoReportsPage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/reports/:companyLocation?/:workType?'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername/job-equipment-info/jobs/:companyLocation?/:workType?',
                    'title': 'Customers'
                  }}
                  Component={CustomersJobEquipmentInfoJobsPage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/jobs/:companyLocation?/:workType?'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername/job-equipment-info/jobs/:jobId',
                    'title': 'Customers'
                  }}
                  Component={ViewJobReportsPage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/job-report/:jobReportId'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername/job-equipment-info/tickets/:companyLocation?/:workType?',
                    'title': 'Customers'
                  }}
                  Component={CustomersJobEquipmentInfoTicketsPage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/tickets/:companyLocation?/:workType?'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/:customername/job-equipment-info/equipment',
                    'title': 'Customers'
                  }}
                  Component={CustomersJobEquipmentInfoEquipmentPage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/equipment'}
                  title={'Customers'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/customers/location/:joblocation',
                    'title': 'Customers'
                  }}
                  Component={ViewMoreLocationPage}
                  exact
                  path={'/main/customers/location/:joblocation'}
                  title={'Customers'}
                />

                <AuthRoute
                  Component={ViewInvoicePage}
                  exact
                  path={'/main/customers/:customername/job-equipment-info/job-report/view/:invoice'}
                  title={'View Invoice'}
                />

                {/*                  <AuthRoute
                    Component={EditInvoicePage}
                    exact
                    path={'/main/customers/job-reports/edit/:invoice'}
                    title={'Edit Invoice'}
                  />*/}
                <AuthRoute
                  Component={EditInvoicePage}
                  exact
                  path={'/main/invoicing/edit/:invoice'}
                  title={'Edit Invoice'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <Redirect
                  exact
                  from={`/main/invoicing`}
                  to={currentDivision.urlParams ? `/main/invoicing/invoices-list/${currentDivision.urlParams}` : `/main/invoicing/invoices-list`}
                />

                {/* <AuthRoute
                    Component={InvoicingTodosPage}
                    path={'/main/invoicing/todos'}
                    title={'Invoicing'}
                  /> */}

                <AuthRoute
                  Component={InvoicingListPage}
                  path={'/main/invoicing/invoices-list/:companyLocation?/:workType?'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing') || ability.can('manage', 'CustomerPayments')}
                />

                <AuthRoute
                  Component={EditInvoicePage}
                  path={'/main/invoicing/create-invoice'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={UpdateInvoicePage}
                  path={'/main/invoicing/update-invoice'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={InvoicingPurchaseOrderPage}
                  path={'/main/invoicing/purchase-order'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={CreatePurchaseOrderPage}
                  path={'/main/invoicing/create-purchase-order'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={ViewInvoicePage}
                  exact
                  path={'/main/invoicing/view/:invoice'}
                  title={'View Invoice'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={InvoicingEstimatesPage}
                  path={'/main/invoicing/estimates'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={CreateEstimatePage}
                  path={'/main/invoicing/create-estimates'}
                  title={'Invoicing'}
                  hasAccess={ability.can('manage', 'Invoicing')}
                />

                <AuthRoute
                  Component={BillingPage}
                  exact
                  path={'/main/admin'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={BillingPage}
                  exact
                  path={'/main/admin/billing'}
                  title={'Admin'}
                  hasAccess={ability.can('edit', 'BillingInformation')}
                />
                <AuthRoute
                  Component={BillingMethodsPage}
                  exact
                  path={'/main/admin/billing/billing-methods'}
                  title={'Admin'}
                  hasAccess={ability.can('edit', 'BillingInformation')}
                />
                <AuthRoute
                  Component={BillingHistoryPage}
                  exact
                  path={'/main/admin/billing/billing-history'}
                  title={'Admin'}
                  hasAccess={ability.can('edit', 'BillingInformation')}
                />
                <AuthRoute
                  Component={BillingSubscriptionPage}
                  exact
                  path={'/main/admin/billing/subscription'}
                  title={'Admin'}
                  hasAccess={ability.can('edit', 'BillingInformation')}
                />
                <AuthRoute
                  Component={BrandsPage}
                  exact
                  path={'/main/admin/brands'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={CompanyProfilePage}
                  exact
                  path={'/main/admin/company-profile'}
                  title={'Admin'}
                  hasAccess={ability.can('manage', 'Company')}
                />
                <AuthRoute
                  Component={AdminEmployeesPage}
                  exact
                  path={'/main/admin/employees'}
                  title={'Admin'}
                  hasAccess={ability.can('manage', 'Employee')}
                />
                <AuthRoute
                  Component={AdminAddNewEmployeePage}
                  exact
                  path={'/main/admin/employees/add-new-employee'}
                  title={'Admin'}
                  hasAccess={ability.can('manage', 'Employee')}
                />
                <AuthRoute
                  Component={EmployeeProfilePage}
                  exact
                  path={'/main/admin/employees/:contractorName'}
                  title={'Admin'}
                  hasAccess={ability.can('manage', 'Employee')}
                />
                <AuthRoute
                  Component={EquipmentTypePage}
                  exact
                  path={'/main/admin/equipment-type'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminGroupsPage}
                  exact
                  path={'/main/admin/groups'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminServiceAndProductsPage}
                  exact
                  path={'/main/admin/services-and-products'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminServiceAndProductsListPage}
                  exact
                  path={'/main/admin/services-and-products/services/:type'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminInvoicingPage}
                  exact
                  path={'/main/admin/invoicing'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminInvoicingItemsPage}
                  exact
                  path={'/main/admin/invoicing/items'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={JobTypesPage}
                  exact
                  path={'/main/admin/job-types'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={ReportNumberPage}
                  exact
                  path={'/main/admin/report-number'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={RolesPermissionsPage}
                  exact
                  path={'/main/admin/roles-permissions'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={RolesManagerPage}
                  exact
                  path={'/main/admin/roles-permissions/manager-list'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={RolesTechnicianPage}
                  exact
                  path={'/main/admin/roles-permissions/technician-list'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={ViewRolePage}
                  exact
                  path={'/main/admin/roles-permissions/view-roles'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminVendorsPage}
                  exact
                  path={'/main/admin/vendors'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminPayrollPage}
                  exact
                  path={'/main/admin/payroll'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={AdminIntegrationsPage}
                  path={'/main/admin/integrations'}
                  title={'Integrations'}
                />
                <AuthRoute
                  actionData={{
                    'link': '/main/admin/vendors/:contractorName',
                    'title': 'Admin'
                  }}
                  Component={ViewMoreVendorPage}
                  exact
                  path={'/main/admin/vendors/:contractorName'}
                  title={'Admin'}
                />
                <AuthRoute
                  Component={DataPage}
                  exact
                  path={'/main/admin/data'}
                  title={'Data'}
                />
                <Redirect
                  exact
                  from={`/main/reports`}
                  to={currentDivision.urlParams ? `/main/reports/revenue/${currentDivision.urlParams}` : `/main/reports/revenue`}
                />
                <AuthRoute
                  Component={RevenueReportsPage}
                  exact
                  path={'/main/reports/revenue/:companyLocation?/:workType?'}
                  title={'Reports'}
                  hasAccess={ability.can('manage', 'Reporting')}
                />
                <AuthRoute
                  Component={ARReportsPage}
                  exact
                  path={'/main/reports/ar/:companyLocation?/:workType?'}
                  title={'Reports'}
                  hasAccess={ability.can('manage', 'Reporting')}
                />
                <AuthRoute
                  Component={NewPayrollReportsPage}
                  exact
                  path={'/main/reports/payroll'}
                  title={'Reports'}
                  hasAccess={ability.can('manage', 'Reportings')}
                />
                <AuthRoute
                  Component={ViewProfilePage}
                  exact
                  path={'/main/user/view-profile'}
                  title={'User'}
                />
                <AuthRoute
                  Component={EmailPreferencePage}
                  exact
                  path={'/main/user/email-preference'}
                  title={'User'}
                />
                <AuthRoute
                  Component={ChangePasswordPage}
                  exact
                  path={'/main/user/change-password'}
                  title={'User'}
                />
                <AuthRoute
                  Component={NotificationPage}
                  exact
                  path={'/main/notifications'}
                  title={'Notifications'}
                />
              </Switch>
            </BCAdminLayout>
          </Route>
        </Suspense>
      </Switch>
    </Router>
  );
}
export default Main;
