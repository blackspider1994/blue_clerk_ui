import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import debounce from 'lodash.debounce';
import AttachMoney from '@material-ui/icons/AttachMoney';
import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
  Checkbox,
  withStyles,
  Tooltip,
  Box,
} from '@material-ui/core';
import {
  closeModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import styles from './bc-send-invoices-modal.styles';
import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import BCSent from 'app/components/bc-sent';
import { createStyles, makeStyles } from '@material-ui/core';
import styled from 'styled-components';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CSButtonSmall } from "helpers/custom";
import TableFilterService from 'utils/table-filter';
import {
  formatCurrency,
  formatDateMMMDDYYYY,
  formatDatTimelll,
  formatShortDateNoDay
} from 'helpers/format';
import { useCustomStyles } from "helpers/custom";
import {
  getAllInvoicesAPI,
  getAllInvoicesForBulkPaymentsAPI
} from 'api/invoicing.api';
import { getContacts } from 'api/contacts.api';
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword,
} from 'actions/invoicing/invoicing.action';
import BCDateRangePicker
, { Range } from "../../components/bc-date-range-picker/bc-date-range-picker";
import DropDownMenu
  from "../../components/bc-select-dropdown/bc-select-dropdown";
import { PAYMENT_STATUS_COLORS } from "../../../helpers/contants";
import moment from "moment/moment";
import { getInvoiceEmailTemplate } from "../../../api/emailDefault.api";
import { error } from "../../../actions/snackbar/snackbar.action";
import { modalTypes } from "../../../constants";
import { resetEmailState } from "../../../actions/email/email.action";
import { setTimeout } from 'timers';
import { PaymentStatus } from 'app/pages/invoicing/invoices-list/invoices-list-listing/invoices-unpaid-listing';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import EmailInvoiceButton from 'app/pages/invoicing/invoices-list/email.invoice';
import { MailOutlineOutlined } from '@material-ui/icons';
import classNames from 'classnames';

const SHOW_OPTIONS = [
  {
    value: 'unpaid',
    label: 'Unpaid',
    selectable: true,
  },
  {
    value: '-1',
    label: 'Overdue 1 day or more',
    selectable: true,
  },
  {
    value: '-7',
    label: 'Overdue 7 days or more',
    selectable: true,
  },
  {
    value: '-14',
    label: 'Overdue 14 days or more',
    selectable: true,
  },
  {
    value: '+7',
    label: 'Due within 7 days',
    selectable: true,
  },
  {
    value: 'all',
    label: 'All Invoices',
    selectable: true,
  },
];


const useDebounceInputStyles = makeStyles(() =>
  createStyles({
    textField: {
      '& .MuiOutlinedInput-input': {
        padding: '5px 10px',
      }
    }
  })
);

function BcSendInvoicesModal({ classes, modalOptions, setModalOptions }: any): JSX.Element {
  const dispatch = useDispatch();
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [invoicesToDispatch, setInvoicesToDispatch] = useState<any[]>([]);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [customerValue, setCustomerValue] = useState<any>(null);
  const [checkMissingPo, setMissingPO] = useState<any>(null);
  const [customerContactValue, setCustomerContactValue] = useState<any>(null);
  const [showValue, setShowValue] = useState<string>('unpaid');
  const [localInvoiceList, setLocalInvoiceList] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const customers = useSelector(({ customers }: any) => customers.data);
  const contacts: any[] = useSelector(({ contacts }: any) => contacts.contacts);
  const debounceInputStyles = useDebounceInputStyles();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const contactOptions = contacts.map((contact: any) => ({ value: contact._id, label: contact.name }))
  contactOptions.sort((a, b) => a.label.localeCompare(b.label))

  const getFilteredList = (state: any) => {
    return TableFilterService.filterByDateDesc(state?.invoiceList.data);
  };

  const invoiceList = useSelector(getFilteredList);
  const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(
    ({ invoiceList }: any) => ({
      loading: invoiceList.loading,
      prevCursor: invoiceList.prevCursor,
      nextCursor: invoiceList.nextCursor,
      total: invoiceList.total,
      currentPageIndex: invoiceList.currentPageIndex,
      currentPageSize: invoiceList.currentPageSize,
      keyword: invoiceList.keyword,
    })
  );

  const customStyles = useCustomStyles();
  const handleRowClick = (event: any, row: any) => {

    // if (selectedInvoices.length === 0 && !customerValue) setCustomerValue(row.original.customer);
    const found = selectedInvoices.findIndex((invoice => invoice._id === row.original._id))
    const selectedInvoicesListClone = [...selectedInvoices];
    let localInvoiceListClone = [...localInvoiceList]
    if (found >= 0) {
      selectedInvoicesListClone.splice(found, 1)
      localInvoiceListClone.splice(found, 1)
      localInvoiceListClone.splice(selectedInvoicesListClone.length, 0, row.original)
    } else {
      selectedInvoicesListClone.push(row.original);
      localInvoiceListClone = localInvoiceListClone.filter(inv => inv._id !== row.original._id)
      localInvoiceListClone.splice(selectedInvoicesListClone.length - 1, 0, row.original)

    }
    setSelectedInvoices(selectedInvoicesListClone);
    setLocalInvoiceList(localInvoiceListClone)

  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      // setSelectedIndexes(localInvoiceList.map((invoice) => invoice._id));
      setSelectedInvoices(localInvoiceList)
    } else {
      setSelectedInvoices([]);
    }
  }

  const handleCustomerChange = (event: any, newValue: any) => {
    setCustomerValue(newValue);
    if (!newValue) setSelectedInvoices([]);
  };

  const handleCustomerContactChange = (event: any, newValue: any) => {
    setCustomerContactValue(newValue);
    if (!newValue) setSelectedInvoices([]);
  };

  const handleMissingPO = (event: any, newValue: any) => {
    setMissingPO(newValue);
    if (!newValue) setSelectedInvoices([]);
  };

  const handleSend = async (e: any) => {
    // e.stopPropagation();

    //need to sort the data as per emails.. for same email, push the indices toether and send to BE,, else just send single
    //..then group the responses

    const invoicesToDispatchClone: any[] = []

    //cycle thru the array for individual objects
    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoice = selectedInvoices[i];
      if (invoice?.customerContactId) {
        const email = invoice.customerContactId?.email;

        //first check if email is in array

        // if in state, ignore, else filter to get similar invoices, then send to BE and get templates
        if (invoicesToDispatchClone.some(inv => inv.customerEmail === email)) {
          //do nothing

          continue;
        } else {
          const tempArray = selectedInvoices.filter(inv => inv.customerContactId?.email === email);
          const invoicesArray: any = []
          tempArray.map((inv) => {
            invoicesArray.push(inv._id)
          })
          try {
            const response = await getInvoiceEmailTemplate(invoicesArray);
            const { emailTemplate: emailDefault, status, message } = response.data
            if (status === 1) {
              const data = {
                'modalTitle': 'Send Invoices',
                'customerEmail': email,
                'handleClick': () => { },
                'ids': invoicesArray,
                'typeText': 'Invoice',
                'className': 'wideModalTitle',
                'customerId': invoice.customer?._id,
                'from': invoice?.companyLocation?.billingAddress?.emailSender,
              };
              const combined: any = { ...data, emailDefault }

              invoicesToDispatchClone.push(combined)

            }
          } catch (e) {
            //setIsLoading(false);
            console.log(e)

          }
        }
      } else {
        // do as before,, send to default email instead
        const email = invoice.customer.info.email
        //check if in array
        if (invoicesToDispatchClone.some(inv => inv.customerEmail === customerValue?.info?.email || inv.customerEmail === email)) {
          //do nothing
          continue;
        } else {

          //filter to get those with empty contactObj's first
          const contactlessInvoices = selectedInvoices.filter(inv => !inv.customerContactId && inv.customer.info.email === email)
          if (contactlessInvoices.length) {
            //get the id's
            const invoicesArray: any = []
            contactlessInvoices.map((inv) => {
              invoicesArray.push(inv._id)
            })
            try {
              const response = await getInvoiceEmailTemplate(invoicesArray);
              const { emailTemplate: emailDefault, status, message } = response.data
              if (status === 1) {
                const data = {
                  'modalTitle': 'Send Invoices',
                  'customerEmail': invoice.customer?.info?.email,
                  'handleClick': () => { },
                  'ids': invoicesArray,
                  'typeText': 'Invoice',
                  'from': invoice?.companyLocation?.billingAddress?.emailSender,
                  'className': 'wideModalTitle',
                  'customerId': invoice.customer?._id,
                };
                const combined: any = { ...data, emailDefault }
                invoicesToDispatchClone.push(combined)

              }
            } catch (e) {
              console.log(e)
            }

          }
        }

      }
    }

    dispatch(setModalDataAction({
      data: {
        multiple: true,
        multipleInvoices: invoicesToDispatchClone,
        'customerId': customerValue?._id,
        "modalTitle": "Send Invoices",
      },
      'type': modalTypes.EMAIL_JOB_REPORT_MODAL
    }));

    dispatch(resetEmailState());
    dispatch(setCurrentPageIndex(0));
    dispatch(getAllInvoicesAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,currentDivision.params));
  };

  const closeModal = () => {

    dispatch(setCurrentPageIndex(0));
    dispatch(getAllInvoicesAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,currentDivision.params));
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const getContactsData = async (data: any) => {
    const res: any = await dispatch(getContacts(data));
  }

  useEffect(() => {
    dispatch(setCurrentPageIndex(0));
    dispatch(getAllInvoicesAPI(
      currentPageSize,
      currentPageIndex,
      '',
      { invoiceDateRange: selectionRange },
      customerValue?._id,
      customerContactValue?.value,
      checkMissingPo,
      true,
      isNaN(parseInt(showValue)) ? null : moment().add(parseInt(showValue), 'day').toDate(),
      showValue === 'all',
      currentDivision.params
    ));

    const data: any = {
      'type': 'Customer',
      'referenceNumber': customerValue?._id
    };

    getContactsData(data);
  }, [customerValue, customerContactValue, selectionRange, showValue, checkMissingPo]);


  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      border: '1px solid #dadde9',
    },
  }))(Tooltip);

  const columns: any = [
    {
      'Header': () => <>
        <Checkbox
          color="primary"
          classes={{ root: classes.checkbox }}
          checked={selectedInvoices.length === localInvoiceList.length}
          indeterminate={selectedInvoices.length > 0 && selectedInvoices.length < localInvoiceList.length}
          disabled={!customerValue}
          onChange={handleSelectAll}
        />
        <span>Status</span>
      </>,
      'accessor': 'paid',
      'className': 'font-bold',
      'sortable': false,
      Cell({ row }: any) {
        // for payment 
        let status = 'open';
        if (moment(row.original.dueDate).isBefore(moment(), 'day')) status = 'overdue'
        else if (moment(row.original.dueDate).isSame(moment(), 'day')) status = 'due today'
        else if (moment(row.original.dueDate).diff(moment(), 'day') <= 7) status = 'due soon'
        return <Box display="flex" flexDirection="row">
          <Checkbox
            color="primary"
            classes={{ root: classes.checkbox }}
            checked={selectedInvoices.findIndex((invoice => invoice._id === row.original._id)) >= 0}
          />
          <PaymentStatus status={status}>
            {status}
          </PaymentStatus>
        </Box>;
      },
    },

    {
      Cell({ row }: any) {
        return <div>
          {row.original.invoiceId}
        </div>
      },
      'Header': 'Invoice ID',
      'accessor': 'invoiceId',
      'className': 'font-bold',
    },
    {
      Cell({ row }: any) {
        return <div>
          {row.original.dueDate
            ? formatShortDateNoDay(row.original.dueDate)
            : 'N/A'}
        </div>
      },
      'Header': 'Due Date',
      'accessor': 'dueDate',
      'className': 'font-bold',
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
    },
    {
      Cell({ row }: any) {
        return <div style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <HtmlTooltip
            placement='bottom-start'
            title={
              row.original.customerPO || row.original.job?.customerPO || row.original.job?.ticket?.customerPO || '-'
            }
          >
            <span>
              {row.original.customerPO || row.original.job?.customerPO || row.original.job?.ticket?.customerPO || '-'}
            </span>
          </HtmlTooltip>
        </div>
      },
      'Header': 'Customer PO',
    },
    {
      Cell({ row }: any) {
        return <div>
          <span>
            {formatCurrency(row.original.balanceDue ?? row.original.total)}
          </span>
        </div>;
      },
      'Header': 'Amount Due',
      'width': 20
    },

    {
      Cell({ row }: any) {
         return row.original?.customerContactId?.name || 'N/A';
      },
      'Header': 'Contact',
      'accessor': 'row.original.customerContactId?.name',
      'className': 'font-bold',
      'sortable': true
    },

    {
      Cell({ row }: any) {
        return row.original?.customerContactId?.email || 'N/A';
      },
      'Header': 'Email',
      'accessor': 'row.original.customerContactId?.email',
      'className': 'font-bold',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        // return <div className={customStyles.centerContainer}>
        return <EmailInvoiceButton
          Component={
          <Button
            variant="contained"
            classes={{
              'root': classes.emailButton
            }}
            color="primary"
            size="small"
            >
              <MailOutlineOutlined
              className={customStyles.iconBtn}
              />
          </Button>}
          invoice={row.original}
        />;
        // </div>;
      },
      'Header': 'Actions',
      'id': 'action-send-email',
      'sortable': false,
      'width': 60
    }

  ];

  useEffect(() => {
    if (invoiceList.length > 0) {
      const newInvoiceList = invoiceList.map((item: any) => ({
        ...item,
        'amountToBeApplied': 0,
        'checked': 0,
      }));
      const allInvoices: any[] = [...selectedInvoices, ...newInvoiceList]
      //if item is in newInvoice list and is already in selecedInvoices, do not show it
      const uniqueInvoiceList: any[] = allInvoices.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t._id === value._id
        ))
      )
      setLocalInvoiceList(uniqueInvoiceList);
    } else {
      setLocalInvoiceList([...selectedInvoices]);
    }
  }, [invoiceList])

  return (
    <DataContainer className={'new-modal-design'}>
      {isSuccess ? (
        <BCSent title={'The payment was recorded.'} />
      ) : (
          <>
            <Grid container className={'modalPreview'} justify={'space-between'} spacing={2} style={{ width: '100%', paddingLeft: 65, paddingRight: 45 }}>
              <Grid item xs={4}>
                <Typography variant={'caption'} className={'previewCaption'}>Customer</Typography>
                <Autocomplete
                  disabled={loading}
                  getOptionLabel={option => option.profile?.displayName ? option.profile.displayName : ''}
                  getOptionDisabled={(option) => !option.isActive}
                  id={'tags-standard'}
                  onChange={(ev: any, newValue: any) => handleCustomerChange(ev, newValue)}
                  disableClearable={customerValue !== null}
                  options={customers && customers.length !== 0 ? customers.sort((a: any, b: any) => a.profile.displayName > b.profile.displayName ? 1 : b.profile.displayName > a.profile.displayName ? -1 : 0) : []}
                  renderInput={params => <TextField
                    {...params}
                    InputProps={{ ...params.InputProps, style: { background: '#fff' } }}
                    variant={'outlined'}
                  // error={isCustomerErrorDisplayed}
                  // helperText={isCustomerErrorDisplayed && 'Please Select A Customer'}
                  />
                  }
                  value={customerValue}
                />
                <div style={{ width: 10 }} >&nbsp;</div>
              </Grid>

              <Grid item xs={4}>
                <Typography variant={'caption'} className={'previewCaption'}>Customer Contact</Typography>
                <Autocomplete
                  disabled={loading}
                  getOptionLabel={option => option.label ? option.label : ''}
                  getOptionDisabled={(option) => option.isActive}
                  id={'tags-standard'}
                  onChange={(ev: any, newValue: any) => handleCustomerContactChange(ev, newValue)}
                  disableClearable={customerContactValue !== null}
                  options={contactOptions}
                  renderInput={params => <TextField
                    {...params}
                    InputProps={{ ...params.InputProps, style: { background: '#fff' } }}
                    variant={'outlined'}
                  // error={isCustomerErrorDisplayed}
                  // helperText={isCustomerErrorDisplayed && 'Please Select A Customer'}
                  />
                  }
                  value={customerContactValue}
                />
                <div style={{ width: 10 }} >&nbsp;</div>
              </Grid>

              <Grid item xs={4} >
                <Typography variant={'caption'} className={'previewCaption'} style={{ marginLeft: 12 }}>Date Range</Typography>
                <BCDateRangePicker
                  range={selectionRange}
                  onChange={setSelectionRange}
                  showClearButton={true}
                  title={'Filter by Invoice Date...'}
                  classes={{ button: classes.datePicker }}
                />
              </Grid>

              <Grid item xs={4}>
                <Typography variant={'caption'} className={'previewCaption'}>SHOW</Typography>
                <DropDownMenu
                  // minwidth='180px'
                  selectedItem={showValue}
                  items={SHOW_OPTIONS}
                  onSelect={(e, item) => setShowValue(item.value)}
                />
              </Grid>
              <Grid item xs={7} className={classes.invoiceCheckboxTopPadding}>
                <Checkbox
                  color="primary"
                  className={classes.checkbox}
                  checked={checkMissingPo}
                  onChange={(ev: any, newValue: any) => handleMissingPO(ev, newValue)}
                />
                MISSING P.O.
              </Grid>
              <Grid item xs={1} />
            </Grid>
            <DialogContent classes={{ root: classes.dialogContent }}>
              <BCTableContainer
                columns={columns}
                isLoading={loading}
                tableData={localInvoiceList}
                onRowClick={handleRowClick}
                manualPagination
                // fetchFunction={(num: number, isPrev: boolean, isNext: boolean) => {
                //   dispatch(getAllInvoicesAPI(
                //     num || currentPageSize,
                //     isPrev ? prevCursor : undefined,
                //     isNext ? nextCursor : undefined,
                //     '',
                //     { invoiceDateRange: selectionRange },
                //     customerValue?._id,
                //     customerContactValue?.value,
                //     checkMissingPo,
                //     true,
                //     isNaN(parseInt(showValue)) ? null : moment().add(parseInt(showValue), 'day').toDate(),
                //     showValue === 'all',
                //     currentDivision.params
                //   ))
                // }}
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => {
                  dispatch(setCurrentPageIndex(num));
                  if (apiCall)
                    dispatch(getAllInvoicesAPI(currentPageSize, num, keyword, { invoiceDateRange: selectionRange }, undefined, customerContactValue?.value, checkMissingPo, true, undefined, undefined, currentDivision.params))
                }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => {
                  dispatch(setCurrentPageSize(num));
                  dispatch(getAllInvoicesAPI(num || currentPageSize, currentPageIndex, keyword, { invoiceDateRange: selectionRange }, undefined, customerContactValue?.value, checkMissingPo, true, undefined, undefined, currentDivision.params))
                }}
                setKeywordFunction={(query: string) => dispatch(setKeyword(query))}
              />
            </DialogContent>
          </>
        )}
      <div className={'modalDataContainer'}>
        <DialogActions style={{ paddingRight: 80 }}>
          {/* <Typography variant={'h5'}>
              {!!FormikValues.totalAmount && `Total Amount: $${FormikValues.totalAmount}`}
            </Typography> */}
          <Button
            disableElevation={true}
            onClick={() => closeModal()}
            variant={'outlined'}
          >
            Cancel
            </Button>
          {!isSuccess && (
            <Button
              color={'primary'}
              disabled={selectedInvoices.length === 0}
              onClick={handleSend}
              disableElevation={true}
              //disabled={isSubmitting || loading || !isValid()}
              type={'submit'}
              variant={'contained'}
            >
              Send
            </Button>
          )}
        </DialogActions>
      </div>
    </DataContainer >
  );
};

const DataContainer = styled.div`
  *:not(.MuiGrid-container) > .MuiGrid-container {
    width: 100%;
    padding: 10px 40px;
  }
  .MuiGrid-spacing-xs-4 > .MuiGrid-spacing-xs-4 {
    margin: -16px 0;
  }
  .MuiGrid-grid-xs-true {
    padding: 16px;
  }
  .MuiOutlinedInput-root {
    border-radius: 8px;
    padding: 2px;
  }

  .MuiOutlinedInput-input {
    padding: 9.5px 4px;
  }

  span.required:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
`;


export default withStyles(
  styles,
  { 'withTheme': true }
)(BcSendInvoicesModal);
