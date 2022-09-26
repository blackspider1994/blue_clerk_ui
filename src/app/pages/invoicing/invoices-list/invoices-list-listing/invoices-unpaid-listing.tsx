import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useHistory, useLocation } from "react-router-dom";
import styled from 'styled-components';
import styles from './../invoices-list.styles';
import {withStyles, Tooltip} from "@material-ui/core";
import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmailInvoiceButton from '../email.invoice';
import {
  formatCurrency,
  formatDateMMMDDYYYY,
} from 'helpers/format';
import BCQbSyncStatus from "../../../../components/bc-qb-sync-status/bc-qb-sync-status";
import {GRAY2, PRIMARY_GREEN} from "../../../../../constants";
import BCDateRangePicker
  , {Range} from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import {getUnpaidInvoicesAPI} from 'api/invoicing.api';
import {setCurrentUnpaidPageIndex, setCurrentUnpaidPageSize, setUnpaidKeyword} from 'actions/invoicing/invoicing.action';
import moment from "moment";

// const getFilteredList = (state: any) => {
//   const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoiceList.unpaid);
//   return sortedInvoices.filter((invoice: any) => !invoice.isDraft);
// };

function InvoicingUnpaidListing({ classes, theme }: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const { unpaidInvoices, loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword} = useSelector(
    ({ invoiceList }: any) => ({
      unpaidInvoices: invoiceList.unpaid,
      loading: invoiceList.loadingUnpaid,
      prevCursor: invoiceList.prevCursorUnpaid,
      nextCursor: invoiceList.nextCursorUnpaid,
      total: invoiceList.totalUnpaid,
      currentPageIndex: invoiceList.currentPageIndexUnpaid,
      currentPageSize: invoiceList.currentPageSizeUnpaid,
      keyword: invoiceList.keywordUnpaid,
    })
  );
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      border: '1px solid #dadde9',
    },
  }))(Tooltip);

  const columns: any = [
    { Cell({ row }: any) {
      let status = 'open';
      if (moment(row.original.dueDate).isBefore(moment(), 'day')) status = 'overdue'
      else if (moment(row.original.dueDate).isSame(moment(), 'day')) status = 'due today'
      else if (moment(row.original.dueDate).diff(moment(), 'day') <= 7) status = 'due soon'

      return (
        <PaymentStatus status={status}>
          {status}
        </PaymentStatus>
      )
      },
      'Header': 'Status',
      'accessor': 'paid',
      'className': 'font-bold',
      'sortable': true,
      'width': 10
    },
    {
      Cell({row}: any) {
        return <span>{formatDateMMMDDYYYY(row.original.dueDate)}</span>
      },
      'Header': 'Due Date',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Customer',
      //'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
      'sortable': true,
      Cell({ row }: any) {
        return <div style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <HtmlTooltip
            placement='bottom-start'
            title={row.original.customer?.profile?.displayName}>
            <span>{row.original.customer?.profile?.displayName}</span>
          </HtmlTooltip>
        </div>
      },
    },
    {
      Cell({row}: any) {
        return <span>{row.original.invoiceId?.substring(8)}</span>
      },
      'Header': 'Invoice ID',
      //'accessor': 'invoiceId',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.total),
      'Header': 'Total',
      'sortable': true,
      'width': 20
    },

    { Cell({ row }: any) {
      return row.original.lastEmailSent
        ? formatDateMMMDDYYYY(row.original.lastEmailSent)
        : 'N/A';
    },
    'Header': 'Last Emailed',
    'accessor': 'lastEmailSent',
    'className': 'font-bold',
    'sortable': true
    },
    {
      'Header': 'Invoice Date',
      'accessor': (originalRow: any) => formatDateMMMDDYYYY(originalRow.issuedDate || originalRow.createdAt),
      'className': 'font-bold',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        return (
          <BCQbSyncStatus data={row.original}/>
        );
      },
      //'Header': 'Integrations',
      'id': 'qbSync',
      'sortable': false,
      'width': 30
    },
    {
      Cell({ row }: any) {
        // return <div className={customStyles.centerContainer}>
        return <EmailInvoiceButton
            Component={<span className={classes.reminderText}>Send Reminder</span>}
            invoice={row.original}
          />;
        // </div>;
      },
      'Header': 'Actions',
      'id': 'action-send-email',
      'sortable': false,
      'width': 60
    },
  ];

  useEffect(() => {
    dispatch(getUnpaidInvoicesAPI(currentPageSize, undefined, undefined, keyword, selectionRange));
    dispatch(setCurrentUnpaidPageIndex(0));
    return () => {
      dispatch(setUnpaidKeyword(''));
      dispatch(setCurrentUnpaidPageIndex(currentPageIndex));
      dispatch(setCurrentUnpaidPageSize(currentPageSize));
    }
  }, [selectionRange]);

  useEffect(() => {
    if(location?.state?.tab === 0 && (location?.state?.option?.search || location?.state?.option?.pageSize)){
      dispatch(setUnpaidKeyword(location.state.option.search));
      dispatch(getUnpaidInvoicesAPI(location.state.option.pageSize, undefined, undefined, location.state.option.search , selectionRange));
      dispatch(setCurrentUnpaidPageSize(location.state.option.pageSize));
      dispatch(setCurrentUnpaidPageIndex(0));
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const showInvoiceDetail = (id:string) => {
    history.push({
      'pathname': `view/${id}`,
      'state': {
        keyword,
        currentPageSize,
        tab: 0,
      }
    });
  };

  const handleRowClick = (event: any, row: any) => showInvoiceDetail(row.original._id);

  function Toolbar() {
    return <BCDateRangePicker
      range={selectionRange}
      onChange={setSelectionRange}
      showClearButton={true}
      title={'Filter by Invoice Date...'}
      classes={{button: classes.noLeftMargin}}
    />
  }

  return (
    <DataContainer id={'0'}>
      <BCTableContainer
        columns={columns}
        isLoading={loading}
        onRowClick={handleRowClick}
        search
        searchPlaceholder={'Search Invoices...'}
        tableData={unpaidInvoices}
        toolbarPositionLeft={true}
        toolbar={Toolbar()}
        manualPagination
        fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>
          dispatch(getUnpaidInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, selectionRange))
        }
        total={total}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndexFunction={(num: number) => dispatch(setCurrentUnpaidPageIndex(num))}
        currentPageSize={currentPageSize}
        setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentUnpaidPageSize(num))}
        setKeywordFunction={(query: string) => dispatch(setUnpaidKeyword(query))}
        disableInitialSearch={location?.state?.tab !== 0}
      />
    </DataContainer>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  overflow: hidden;
`;

export default withStyles(styles, { 'withTheme': true })(InvoicingUnpaidListing);


const PaymentStatus = styled.div<{status: string}>`
  width: 75px;
  background-color: ${props => props.status === 'overdue' || props.status === 'due today'? '#F5005768' : props.status === 'due soon' ? '#E5F7FF' : PRIMARY_GREEN};
  background-image: ${props => props.status === 'overdue' ? 'repeating-linear-gradient(-60deg,#F5005720 0px 8px,#F5005701 8px 12px);' : 'none'};
  font-weight: bold;
  color: ${props => props.status === 'overdue' ? '#F50057' : props.status === 'open' ? 'white' : GRAY2};
  border-radius: 8px;
  text-transform: capitalize;
  text-align: center;
  font-size: 13px;
`;