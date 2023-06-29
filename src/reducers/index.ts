import { CustomersState } from './customer.types';
import { JobsSate } from './invoicing.types';
import { SnackbarState } from './snackbar.type';
import auth from './auth.reducer';
import { combineReducers } from 'redux';
import companyEquipment from './company-equipment.reducer';
import { CustomersReducer as customers } from './customer.reducer';
import { customerEquipmentsReducer as customerEquipments } from './customer-equipments.reducer';
import { contactsReducer as contacts } from './contacts.reducer';
import { ImageReducer as image } from './image.reducer';
import { EmployeesReducer as employees } from './employee.reducer';
import { jobReducer as jobState } from './jobs.reducer';
import {jobRequestsReducer as jobRequests} from './job-request.reducer'
import { PayrollReducer as payroll } from './payroll.reducer';
import { CalendarReducer as calendar } from './calendar.reducer';
import { ChatReducer as chat } from './chat.reducer';
import jobTypes from './job-type.reducer';
import modal from './bc-modal.reducer';
import routeReducer from './route.reducer';
import serviceTicket from './service-ticket.reducer';
import { SnackbarReducer as snackbar } from './snackbar.reducer';
import tax from './tax.reduxer';
import paymentTerms from './payment-terms.reduer';
import { JobSiteReducer as jobSites } from './job-site.reducer';
import { JobLocationReducer as jobLocations } from './job-location.reducer';
import { EmployeesForJobReducer as employeesForJob } from './employees-for-job.reducer';
import { VendorsReducer as vendors } from './vendor.reducer';
import { GroupReducer as groups } from './group.reducer';
import { TechniciansReducer as technicians } from './technicians.reducer';
import { ManagersReducer as managers } from './managers.reducer';
import { OfficeAdminReducer as officeAdmin } from './office-admin.reducer';
import { InventoryReducer as inventory } from './inventory.reducer';
import { PurchasedTagsReducer as purchasedTags } from './tags.reducer';
import {
  InvoicingEstimatesReducer as estimates,
  InvoiceDetailReducer as invoiceDetail,
  InvoicingListReducer as invoiceList,
  InvoicingTodoReducer as invoiceTodos,
  InvoicingPurchaseOrderReducer as purchaseOrder
} from './invoicing.reducer';
import {
  InvoicesForBulkPaymentsState
} from 'actions/invoicing/invoices-for-bulk-payments/invoices-for-bulk-payments.types';
import {
  InvoicesForBulkPaymentsListReducer as invoicesForBulkPayments,
} from './invoices-for-bulk-payments.reducer'
import { PaymentsListReducer as paymentList } from './payments.reducer';
import { PaymentsState } from 'actions/invoicing/payments/payments.types';
import { BrandsReducer as brands } from './brands.reducer';
import { EquipmentTypeReducer as equipmentType } from './equipment-type.reducer';
import { CompanyProfileReducer as profile } from './user.reducer';
import { JobReportReducer as jobReport } from './job-report.reducer';
import { CompanyCardsReducer as companyCards } from './company-cards.reducer';
import tableState from './tableState.reducer';
import searchTerm from './searchText.reducer';
import { SubscriptionReducer as subscriptions } from './subscription.reducer';
import { NotificationsReducer as notifications } from './notifications.reducer';
import { NotificationState } from './notifications.types';
import { UserModel } from 'app/models/user';
import { VendorsState } from 'actions/vendor/vendor.types';
import { QuickbooksState, quickbooksReducer as quickbooks } from './quickbooks.reducer';
import { mapState, mapReducer as map } from './map.reducer';

import { InvoiceItemsState
  , InvoiceItemsReducer as invoiceItems
  , InvoiceItemsTierList as invoiceItemsTiers
  , InvoiceJobCostingList as InvoiceJobCosting} from './items.reducer';
import { EmailState, EmailReducer as email } from './email.reducer';
import {removeQBAuthStateLocalStorage} from "../utils/local-storage.service";
import {PayrollState} from "../actions/payroll/payroll.types";
import {CalendarState} from "../actions/calendar/bc-calendar.types";
import {ChatState} from "../actions/chat/bc-chat.types";
import { DiscountItemsReducer as discountItems} from './discount.reducer'
import { DiscountState } from 'actions/discount/discount.types';
import { reportReducer as reportState } from './report.reducer'
import { AdvanceFilterInvoiceReducer as advanceFilterInvoiceState } from './advance-filter.reducer'
import { MapTechnicianFilterReducer as mapTechnicianFilterState } from './map-technician-filter.reducer'
import { MapTechnicianJobsReducer as mapTechnicianJobsState } from './map-technician-jobs.reducer';
import { WorkTypeReducer as workTypes } from './work-type.reducer';
import { DivisionReducer as divisions } from './division.reducer';
import { FilterDivisionReducer as currentDivision } from "./filter-division.reducer";
import homeOwner from './home-owner.reducer';

export interface ReducerParamsInterface {
  payload: any;
  type: string;
}
export interface RootState {
  auth: UserModel
  jobState: JobsSate;
  snackbarState?: SnackbarState;
  customersState: CustomersState;
  notifications: NotificationState;
  vendors: VendorsState;
  serviceTicket: any
  invoiceItems: InvoiceItemsState;
  email: EmailState;
  quickbooks: QuickbooksState;
  map: mapState;
  payroll: PayrollState;
  calendar: CalendarState;
  chat: ChatState;
  discountItems: DiscountState;
  paymentList: PaymentsState;
  invoicesForBulkPayments: InvoicesForBulkPaymentsState;
}


const appReducer = combineReducers({
  auth,
  brands,
  companyCards,
  companyEquipment,
  contacts,
  customerEquipments,
  customers,
  email,
  employees,
  employeesForJob,
  equipmentType,
  estimates,
  groups,
  image,
  inventory,
  invoiceDetail,
  invoiceItems,
  invoiceItemsTiers,
  InvoiceJobCosting,
  invoiceList,
  invoicesForBulkPayments,
  invoiceTodos,
  jobLocations,
  jobRequests,
  jobReport,
  jobSites,
  jobState,
  jobTypes,
  managers,
  modal,
  notifications,
  officeAdmin,
  profile,
  purchaseOrder,
  purchasedTags,
  'routeData': routeReducer,
  searchTerm,
  quickbooks,
  serviceTicket,
  snackbar,
  subscriptions,
  tableState,
  tax,
  paymentList,
  paymentTerms,
  technicians,
  vendors,
  map,
  payroll,
  calendar,
  chat,
  discountItems,
  reportState,
  advanceFilterInvoiceState,
  mapTechnicianFilterState,
  mapTechnicianJobsState,
  workTypes,
  divisions,
  currentDivision,
  homeOwner
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_STORE') {
    state = undefined;
    // removeQBAuthStateLocalStorage();
  }
  return appReducer(state, action);
}

export default rootReducer;
