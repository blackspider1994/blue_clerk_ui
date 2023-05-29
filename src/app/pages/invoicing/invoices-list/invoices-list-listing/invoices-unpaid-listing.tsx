import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useHistory, useLocation, useParams } from "react-router-dom";
import styled from 'styled-components';
import styles from './../invoices-list.styles';
import { withStyles, Tooltip } from "@material-ui/core";
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmailInvoiceButton from '../email.invoice';
import {
  formatCurrency,
  formatDateMMMDDYYYY,
} from 'helpers/format';
import BCQbSyncStatus from "../../../../components/bc-qb-sync-status/bc-qb-sync-status";
import { GRAY2, PRIMARY_GREEN } from "../../../../../constants";
import BCDateRangePicker
, { Range } from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import { getUnpaidInvoicesAPI } from 'api/invoicing.api';
import { setCurrentUnpaidPageIndex, setCurrentUnpaidPageSize, setUnpaidKeyword } from 'actions/invoicing/invoicing.action';
import moment from "moment";
import TableFilterService from 'utils/table-filter';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

const getSortedInvoices = (state: any) => {
  return TableFilterService.filterByDateDesc(state?.invoiceList.unpaid);
};

function InvoicingUnpaidListing({ classes, theme }: any) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const callUnpaidInvoicesCount = useRef(0);

  const unpaidInvoices = useSelector(getSortedInvoices)
  const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(
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
  const [selectionRange, setSelectionRange] = useState<Range | null>(location?.state?.option?.selectionRange || null);
  const [lastNextCursor, setLastNextCursor] = useState<string | undefined>(location?.state?.option?.lastNextCursor)
  const [lastPrevCursor, setLastPrevCursor] = useState<string | undefined>(location?.state?.option?.lastPrevCursor)

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
      Cell({ row }: any) {
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
      Cell({ row }: any) {
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

    {
      Cell({ row }: any) {
        return row.original.lastEmailSent
          ? formatDateMMMDDYYYY(row.original.lastEmailSent, true)
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
          <BCQbSyncStatus data={row.original} />
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
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      dispatch(getUnpaidInvoicesAPI(currentPageSize, undefined, undefined, keyword, selectionRange, callUnpaidInvoicesCount.current === 0, currentDivision.params));
      dispatch(setCurrentUnpaidPageIndex(0));
      return () => {
        dispatch(setUnpaidKeyword(''));
        dispatch(setCurrentUnpaidPageIndex(currentPageIndex));
        dispatch(setCurrentUnpaidPageSize(currentPageSize));
      }
    }
  }, [selectionRange, currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  useEffect(() => {
    if (location?.state?.tab === 0 && (location?.state?.option?.search || location?.state?.option?.pageSize
      || location?.state?.option?.currentPageIndex || location?.state?.option?.lastNextCursor || location?.state?.option?.lastPrevCursor)) {
      dispatch(setUnpaidKeyword(location.state.option.search));
      dispatch(getUnpaidInvoicesAPI(location.state.option.pageSize, location?.state?.option?.lastPrevCursor, location?.state?.option?.lastNextCursor, location.state.option.search, selectionRange, undefined,currentDivision.params));
      dispatch(setCurrentUnpaidPageSize(location.state.option.pageSize));
      dispatch(setCurrentUnpaidPageIndex(location?.state?.option?.currentPageIndex || 0));
      setSelectionRange(location?.state?.option?.selectionRange)
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const showInvoiceDetail = (id: string) => {
    history.push({
      'pathname': `/main/invoicing/view/${id}`,
      'state': {
        keyword,
        currentPageSize,
        tab: 0,
        currentPageIndex,
        lastNextCursor,
        lastPrevCursor,
        selectionRange,
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
      classes={{ button: classes.noLeftMargin }}
    />
  }

  const rowTooltip = (row: any) => {
    let rowData = row.original;
    if (currentDivision.isDivisionFeatureActivated && currentDivision.data?.name == "All" && (rowData.companyLocation?.name || rowData.workType?.title)) {
      return `${rowData.companyLocation?.name}  ${rowData.isMainLocation ? "(Main) " : ""}- ${rowData.workType?.title}`
    }else{
      return ""
    }
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
        fetchFunction={(num: number, isPrev: boolean, isNext: boolean, query: string) => {
          setLastPrevCursor(isPrev ? prevCursor : undefined)
          setLastNextCursor(isNext ? nextCursor : undefined)
          dispatch(getUnpaidInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, selectionRange,undefined,currentDivision.params))
        }}
        total={total}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndexFunction={(num: number) => dispatch(setCurrentUnpaidPageIndex(num))}
        currentPageSize={currentPageSize}
        setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentUnpaidPageSize(num))}
        setKeywordFunction={(query: string) => dispatch(setUnpaidKeyword(query))}
        disableInitialSearch={location?.state?.tab !== 0}
        rowTooltip={rowTooltip}
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


export const PaymentStatus = styled.div<{ status: string }>`
  width: 75px;
  background-color: ${props => props.status === 'overdue' || props.status === 'due today' ? '#F5005768' : props.status === 'due soon' ? '#E5F7FF' : PRIMARY_GREEN};
  background-image: ${props => props.status === 'overdue' ? 'repeating-linear-gradient(-60deg,#F5005720 0px 8px,#F5005701 8px 12px);' : 'none'};
  font-weight: bold;
  color: ${props => props.status === 'overdue' ? '#F50057' : props.status === 'open' ? 'white' : GRAY2};
  border-radius: 8px;
  text-transform: capitalize;
  text-align: center;
  font-size: 13px;
`;
