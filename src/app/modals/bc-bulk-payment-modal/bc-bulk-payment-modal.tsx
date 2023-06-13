import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  withStyles,
  Tooltip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import styles from './bc-bulk-payment-modal.styles';
import BCDateTimePicker from 'app/components/bc-date-time-picker/bc-date-time-picker';
import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import BCSent from 'app/components/bc-sent';
import { createStyles, makeStyles } from '@material-ui/core';
import styled from 'styled-components';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CSButtonSmall } from "helpers/custom";
import TableFilterService from 'utils/table-filter';
import {formatCurrency, formatShortDateNoDay} from 'helpers/format';
import { getAllInvoicesForBulkPaymentsAPI } from 'api/invoicing.api';
import { recordPayment } from 'api/payment.api';
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword,
} from 'actions/invoicing/invoices-for-bulk-payments/invoices-for-bulk-payments.action';
import { RootState } from 'reducers';
import { error } from "actions/snackbar/snackbar.action";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

const StyledGrid = withStyles(() => ({
  item: {
    '& .form-filter-input': {
      maxWidth: 200,
      margin: 'auto',
    },
  },
}))(Grid);

const useDebounceInputStyles = makeStyles(() =>
  createStyles({
    textField: {
      '& .MuiOutlinedInput-input': {
        padding: '5px 10px',
      }
    }
  })
);

const getFilteredList = (state: any) => {
  const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoicesForBulkPayments.data);
  return sortedInvoices.filter((invoice: any) => !invoice.isDraft);
};

function BCBulkPaymentModal({ classes, modalOptions, setModalOptions }: any): JSX.Element {
  const dispatch = useDispatch();
  const [customerValue, setCustomerValue] = useState<any>(null);
  const [localInvoiceList, setLocalInvoiceList] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const customers = useSelector(({ customers }: any) => customers.data);
  const debounceInputStyles = useDebounceInputStyles();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const invoiceList = useSelector(getFilteredList);
  const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(
    ({ invoicesForBulkPayments }: RootState) => ({
      loading: invoicesForBulkPayments.loading,
      prevCursor: invoicesForBulkPayments.prevCursor,
      nextCursor: invoicesForBulkPayments.nextCursor,
      total: invoicesForBulkPayments.total,
      currentPageIndex: invoicesForBulkPayments.currentPageIndex,
      currentPageSize: invoicesForBulkPayments.currentPageSize,
      keyword: invoicesForBulkPayments.keyword,
    })
  );

  const paymentTypeReference = [
    {
      '_id': 0,
      'label': 'ACH'
    },
    {
      '_id': 1,
      'label': 'Bank Wire'
    },
    {
      '_id': 2,
      'label': 'Credit Card/Debit Card'
    },
    {
      '_id': 3,
      'label': 'Check'
    },
    {
      '_id': 4,
      'label': 'Cash'
    }
  ];

  const bgColors: { [index: string]: string } = { PAID: '#81c784', UNPAID: '#F50057', PARTIALLY_PAID: '#FA8029' };

  const {
    'values': FormikValues,
    'handleChange': formikChange,
    'handleSubmit': FormikSubmit,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    'initialValues': {
      'customerId': '',
      'query': '',
      'dueDate': null,
      'paymentType': '',
      'paymentDate': new Date(),
      'referenceNumber': '',
      'showPaid': false,
      totalAmount: 0,
      totalAmountToBePaid: 0,
    },
    'onSubmit': (values: any, { setSubmitting }: any) => {
      setSubmitting(true);
      if(!isValid()){
        return setSubmitting(false);
      }
      const line:any = []
      localInvoiceList.forEach(invoice => {
        if(invoice.checked && invoice.amountToBeApplied){
          const lineObject:any = {
            invoiceId: invoice._id,
            amountPaid: invoice.amountToBeApplied,
          };
          line.push(lineObject)
        }
      })
      const paramObj:any = {
        line: JSON.stringify(line),
        customerId: values.customerId,
        paidAt: values.paymentDate,
        referenceNumber: values.referenceNumber,
      };
      if(values.paymentType !== ''){
        paramObj.paymentType = paymentTypeReference.filter(type => type._id == values.paymentType)[0].label
      }
      dispatch(recordPayment(paramObj,currentDivision.params))
        .then((response: any) => {
          if (response.status === 1) {
            setIsSuccess(true);
            setSubmitting(false);
          } else {
            dispatch(error(response.message))
            setSubmitting(false);
          }
        }).catch((e: any) => {
          dispatch(error(e.message));
          setSubmitting(false);
        })
    },
  });

  const isCustomerErrorDisplayed = !FormikValues.customerId && (!!FormikValues.totalAmountToBePaid || !!FormikValues.totalAmount);

  const isSumAmountDifferent = () => parseFloat(`${FormikValues.totalAmountToBePaid}`).toFixed(2) != parseFloat(`${FormikValues.totalAmount}`).toFixed(2);

  const isValid = () => {
    if(!FormikValues.customerId) {
      return false;
    }
    if(localInvoiceList.filter(invoice => invoice.checked && !invoice.amountToBeApplied).length){
      return false
    }
    if(localInvoiceList.filter(invoice => invoice.checked && invoice.amountToBeApplied).length === 0){
      return false
    }
    if(isSumAmountDifferent()){
      return false
    }
    return true;
  };

  const handleCustomerChange = (event: any, setFieldValue: any, newValue: any) => {
    const customerId = newValue ? newValue._id : '';
    setFieldValue('customerId', customerId);
    setCustomerValue(newValue);
  };

  const handleDueDateChange = (date: string) => {
    setFieldValue('dueDate', date);
  };

  const handlePaymentDateChange = (date: string) => {
    setFieldValue('paymentDate', date);
  };

  const handleQueryChange = (event: any) => {
    setFieldValue('query', event.target.value);
    debouncedFetchFunction(event.target.value, FormikValues);
  };

  const debouncedFetchFunction = useCallback(
    debounce((value, FormikValues) => {
      setKeyword(value);
      dispatch(getAllInvoicesForBulkPaymentsAPI(currentPageSize, currentPageIndex, value, undefined, FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid,currentDivision.params))
      dispatch(setCurrentPageIndex(0));
    }, 500),
    []
  );

  const handleAmountToBeAppliedChange = (id: string, value: string) => {
    let newInvoiceList: any = [...localInvoiceList];
    const index = newInvoiceList.findIndex((invoice: any) => invoice._id === id);
    newInvoiceList[index].amountToBeApplied = parseFloat(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      newInvoiceList[index].amountToBeApplied = parsedValue;
    } else {
      newInvoiceList[index].amountToBeApplied = 0;
    }
    newInvoiceList = newInvoiceList.map((invoice:any) => ({...invoice, checked: invoice.amountToBeApplied ? 1 : 0}));
    newInvoiceList.sort((invoiceA: any, invoiceB: any) => invoiceB.checked - invoiceA.checked);
    setLocalInvoiceList(newInvoiceList);
  };

  const handleOnFocus = (setCellValue: (text: string) => void, value: string) => {
    if(value === '0'){
      setCellValue('')
    }
  };

  const handleCheckedChange = (id: string, checkedValue: boolean) => {
    const newInvoiceList: any = [...localInvoiceList];
    const index = newInvoiceList.findIndex((invoice: any) => invoice._id === id);
    newInvoiceList[index].checked = checkedValue ? 1 : 0;
    if(!checkedValue){
      newInvoiceList[index].amountToBeApplied = 0;
    }
    newInvoiceList.sort((invoiceA: any, invoiceB: any) => invoiceB.checked - invoiceA.checked)
    setLocalInvoiceList(newInvoiceList);
  }

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  useEffect(() => {
    dispatch(getAllInvoicesForBulkPaymentsAPI(currentPageSize, currentPageIndex, FormikValues.query, undefined, FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid,currentDivision.params));
    dispatch(setCurrentPageIndex(0));
  }, [FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid]);


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
      Cell({ row }: any) {
        return <div>
          <FormControlLabel
            control={
              <Checkbox
                disabled={row.original.status === "PAID"}
                checked={!!row.original.checked}
                onChange={(event) => handleCheckedChange(row.original._id, event.target.checked)}
                name="checkedB"
                color="primary"
              />
            }
            label=""
          />
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
      'Header': 'Invoice ID',
      'accessor': 'invoiceId',
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
      'accessor': (originalRow: any) => formatCurrency(originalRow.balanceDue ?? originalRow.total),
      'Header': 'Amount Due',
      'width': 20
    },
    {
      Cell({ row }: any) {
        const { status = '' } = row.original;
        const textStatus = status.split('_').join(' ').toLowerCase();
        return (
          <div>
            <CSButtonSmall
              variant="contained"
              style={{
                backgroundColor: bgColors[status],
                color: '#fff',
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{textStatus}</span>
            </CSButtonSmall>
          </div>

        )
      },
      'Header': 'Payment Status',
      'accessor': 'paid',
    },
    {
      Cell({ row }: any) {
        const [cellValue, setCellValue] = useState(row.original.amountToBeApplied)
        useEffect(() => {
          setCellValue(row.original.amountToBeApplied)
        }, [row.original.amountToBeApplied])

        return (
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney style={{color: '#BDBDBD'}}/>
                </InputAdornment>
              ),
              style: { background: '#fff' },
            }}
            disabled={row.original.status === "PAID"}
            classes={{ root: debounceInputStyles.textField }}
            onFocus={(event: any)=> handleOnFocus(setCellValue, event.target.value)}
            onBlur={(event: any) => handleAmountToBeAppliedChange(row.original._id, event.target.value)}
            onChange={(event: any) => setCellValue(event.target.value)}
            type={'number'}
            value={cellValue}
            variant={'outlined'}
          />
        )
      },
      'Header': 'Amount to be Applied',
      'accessor': 'amountToBeApplied'
    },
  ];

  useEffect(() => {
    if (invoiceList.length > 0) {
      const newInvoiceList = invoiceList.map((item: any) => ({
        ...item,
        'amountToBeApplied': 0,
        'checked': 0,
      }));
      setLocalInvoiceList([...newInvoiceList]);
    } else {
      setLocalInvoiceList([]);
    }
  }, [invoiceList])

  useEffect(() => {
    setFieldValue('totalAmount', localInvoiceList.reduce((total, invoice) => {
      return total + invoice.amountToBeApplied;
    }, 0))
  }, [localInvoiceList])

  return (
    <DataContainer className={'new-modal-design'}>
      <form onSubmit={FormikSubmit}>
        {isSuccess ? (
          <BCSent title={'The payment was recorded.'}/>
        ) : (
          <>
            <Grid container className={'modalPreview'} justify={'space-between'} spacing={4}>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <Typography variant={'caption'} className={'previewCaption'}>Customer</Typography>
                  <Autocomplete
                    disabled={loading}
                    getOptionLabel={option => option.profile?.displayName ? option.profile.displayName : ''}
                    getOptionDisabled={(option) => !option.isActive}
                    id={'tags-standard'}
                    onChange={(ev: any, newValue: any) => handleCustomerChange(ev, setFieldValue, newValue)}
                    options={customers && customers.length !== 0 ? customers.sort((a: any, b: any) => a.profile.displayName > b.profile.displayName ? 1 : b.profile.displayName > a.profile.displayName ? -1 : 0) : []}
                    renderInput={params => <TextField
                      {...params}
                      InputProps={{ ...params.InputProps, style: { background: '#fff' } }}
                      variant={'outlined'}
                      error={isCustomerErrorDisplayed}
                      helperText={isCustomerErrorDisplayed && 'Please Select A Customer'}
                    />
                    }
                    value={customerValue}
                  />
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Search</Typography>
                  <TextField
                    fullWidth
                    variant={'outlined'}
                    name={'query'}
                    onChange={handleQueryChange}
                    InputProps={{
                      style: { background: '#fff' },
                      startAdornment: <InputAdornment position="start">
                        <SearchIcon classes={{ root: classes.searchIcon }} />
                      </InputAdornment>,
                    }}
                    value={FormikValues.query}
                  />
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Due on or before</Typography>
                  <BCDateTimePicker
                    disabled={loading}
                    handleChange={handleDueDateChange}
                    name={'dueDate'}
                    id={'dueDate'}
                    placeholder={'Date'}
                    value={FormikValues.dueDate}
                    whiteBackground
                  />
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Total Amount To Be Paid</Typography>
                  <TextField
                    disabled={loading}
                    fullWidth
                    variant={'outlined'}
                    type={'number'}
                    name={'totalAmountToBePaid'}
                    onFocus={(e) => {
                      if(e.target.value === '0'){
                        setFieldValue('totalAmountToBePaid', '')
                      }
                    }}
                    onBlur={(e) => {
                      const parsedValue = parseFloat(e.target.value);
                      if (!isNaN(parsedValue)) {
                        setFieldValue('totalAmountToBePaid', parsedValue);
                      } else {
                        setFieldValue('totalAmountToBePaid', 0);
                      }
                    }}
                    onChange={formikChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney style={{color: '#BDBDBD'}}/>
                        </InputAdornment>
                      ),
                      style: { background: '#fff' },
                    }}
                    value={FormikValues.totalAmountToBePaid}
                    error={isSumAmountDifferent()}
                    // helperText={isSumAmountDifferent() && 'The total amount is not the same as the sum of all invoice payments'}
                    helperText={isSumAmountDifferent() && 'The total amount is not match'}
                  />
                  {!!FormikValues.totalAmount && (
                    <div style={{marginTop: 10}}>
                      <Typography variant={'caption'} className={'previewCaption'}>Total Amount Applied</Typography>
                      <br />
                      <Typography variant={'h6'} className={'previewCaption'} style={{marginBottom: 0, width: 147, textAlign: 'center'}}>
                        $ {parseFloat(`${FormikValues.totalAmount}`).toFixed(6).slice(-6) === '000000' ? FormikValues.totalAmount : parseFloat(`${FormikValues.totalAmount}`).toFixed(2)}
                        {/* $ {FormikValues.totalAmount} */}
                      </Typography>
                    </div>
                  )}
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Payment date</Typography>
                  <BCDateTimePicker
                    disabled={loading}
                    handleChange={handlePaymentDateChange}
                    name={'paymentDate'}
                    id={'paymentDate'}
                    placeholder={'Date'}
                    value={FormikValues.paymentDate}
                    whiteBackground
                  />
                </div>
                <div className={'form-filter-input'}>
                  <Typography variant={'caption'} className={'previewCaption'}>Mode of Payment</Typography>
                  <FormControl variant="outlined" fullWidth>
                    <Select
                      name={'paymentType'}
                      value={FormikValues.paymentType}
                      onChange={formikChange}
                      style={{ background: '#fff' }}
                      disabled={loading}
                    >
                      {paymentTypeReference.map(({ label, _id }: { label: string; _id: number }) => {
                        return <MenuItem key={_id} value={_id}>{label}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                </div>
              </StyledGrid>
              <StyledGrid item xs={3}>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={loading}
                        checked={FormikValues.showPaid}
                        onChange={formikChange}
                        name="showPaid"
                        color="primary"
                      />
                    }
                    style={{marginTop: 21}}
                    label="Show Paid"
                  />
                </div>
                <div className={'form-filter-input'} style={{ paddingBottom: 5 }}>
                  <Typography variant={'caption'} className={'previewCaption'}>Reference No.</Typography>
                  <TextField
                    disabled={loading}
                    fullWidth
                    variant={'outlined'}
                    name={'referenceNumber'}
                    onChange={formikChange}
                    InputProps={{
                      style: { background: '#fff' },
                    }}
                    value={FormikValues.referenceNumber}
                  />
                </div>
              </StyledGrid>
            </Grid>
            <DialogContent>
              <BCTableContainer
                columns={columns}
                isLoading={loading}
                tableData={localInvoiceList}
                manualPagination
                // fetchFunction={(num: number, isPrev: boolean, isNext: boolean) => {
                //     dispatch(getAllInvoicesForBulkPaymentsAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, FormikValues.query === '' ? '' : FormikValues.query || keyword, undefined, FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid, currentDivision.params))
                //   }
                // }
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => {
                  dispatch(setCurrentPageIndex(num));
                  if (apiCall)
                    dispatch(getAllInvoicesForBulkPaymentsAPI(currentPageSize, num, keyword, undefined, FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid, currentDivision.params))
                }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => {
                  dispatch(setCurrentPageSize(num));
                  dispatch(getAllInvoicesForBulkPaymentsAPI(num || currentPageSize, currentPageIndex, keyword, undefined, FormikValues.customerId, FormikValues.dueDate, FormikValues.showPaid, currentDivision.params))
                }}
                setKeywordFunction={(query: string) => dispatch(setKeyword(query))}
              />
            </DialogContent>
          </>
        )}
        <div className={'modalDataContainer'}>
          <DialogActions>
            {/* <Typography variant={'h5'}>
              {!!FormikValues.totalAmount && `Total Amount: $${FormikValues.totalAmount}`}
            </Typography> */}
            <Button
              disabled={isSubmitting}
              disableElevation={true}
              onClick={() => closeModal()}
              variant={'outlined'}
            >
              Close
            </Button>
            {!isSuccess && (
              <Button
                color={'primary'}
                disableElevation={true}
                disabled={isSubmitting || loading || !isValid()}
                type={'submit'}
                variant={'contained'}
              >
                Submit All
              </Button>
            )}
          </DialogActions>
        </div>
      </form>
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
)(BCBulkPaymentModal);
