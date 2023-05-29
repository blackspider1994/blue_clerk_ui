import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import styled from 'styled-components';
import moment from 'moment';
import styles from '../invoices-list.styles';
import { withStyles, Button } from "@material-ui/core";
import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableFilterService from 'utils/table-filter';
import {
  formatCurrency,
  formatDateYMD,
  formatShortDateNoDay
} from 'helpers/format';
import BCQbSyncStatus from "../../../../components/bc-qb-sync-status/bc-qb-sync-status";
import { useCustomStyles } from "../../../../../helpers/custom";
import {openModalAction, setModalDataAction} from "../../../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../../../constants";
import BCDateRangePicker
  , {Range} from "../../../../components/bc-date-range-picker/bc-date-range-picker";
  import { getAllPaymentsAPI } from 'api/payment.api';
import { RootState } from 'reducers';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

const getFilteredList = (state: any) => {
  const sortedPayments = TableFilterService.filterByDateDesc(state?.paymentList.data);
  return sortedPayments.filter((payment: any) => !payment.isVoid);
};

function InvoicingPaymentListing({ classes, theme }: any) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const paymentList = useSelector(getFilteredList);
  const customStyles = useCustomStyles()
  // const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword} = useSelector(
  //   ({ invoiceList }: any) => ({
  //     loading: invoiceList.loading,
  //     prevCursor: invoiceList.prevCursor,
  //     nextCursor: invoiceList.nextCursor,
  //     total: invoiceList.total,
  //     currentPageIndex: invoiceList.currentPageIndex,
  //     currentPageSize: invoiceList.currentPageSize,
  //     keyword: invoiceList.keyword,
  //   })
  // );
  const { loading } = useSelector(
    ({ paymentList }: RootState) => ({
      loading: paymentList.loading,
    })
  );
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const showPaymentDetail = (paymentRow:any) => {
    dispatch(setModalDataAction({
      'data': {
        data: paymentRow,
        modalTitle: paymentRow.line?.length ? 'Bulk Payment History' : 'Payment History',
        removeFooter: false,
      },
      'type': modalTypes.BULK_PAYMENT_HISTORY_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const columns: any = [
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        return <div>
          <span>
            {row.original.line?.length ? 'Multiple Invoices' : row.original.invoice?.invoiceId}
          </span>
        </div>;
      },
      'Header': 'Invoice ID',
      'accessor': 'invoice',
      'sortable': true,
    },
    {
      Cell({ row }: any) {
        return row.original.paidAt
          ? formatShortDateNoDay(row.original.paidAt)
          : 'N/A';
      },
      'accessor': (originalRow: any) => originalRow.paidAt ? formatDateYMD(originalRow.paidAt) : '-',
      'Header': 'Payment Date',
      'sortDirection': 'desc',
      'sortable': true
    },
    {
      'Header': 'Payment Type',
      'accessor': 'paymentType',
      'sortable': true
    },
    {
      'Header': 'Reference Number',
      'accessor': 'referenceNumber',
      'sortable': true
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.amountPaid),
      'Header': 'Amount Paid',
      'sortable': true,
      'width': 20
    },
    {
      Cell({ row }: any) {
        return (
          <BCQbSyncStatus data={row.original} />
        );
      },
      'Header': '',
      'id': 'qbSync',
      'sortable': false,
      'width': 30
    },
  ];

  useEffect(() => {
    // dispatch(getAllInvoicesAPI());
    // return () => {
    //   dispatch(setKeyword(''));
    //   dispatch(setCurrentPageIndex(currentPageIndex));
    //   dispatch(setCurrentPageSize(currentPageSize));
    // }
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      dispatch(getAllPaymentsAPI(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,currentDivision.params));
    }
  }, [currentDivision.isDivisionFeatureActivated,currentDivision.params]);

  // useEffect(() => {
  //   dispatch(getAllInvoicesAPI(currentPageSize, undefined, undefined, keyword, selectionRange));
  //   dispatch(setCurrentPageIndex(0));
  // }, [selectionRange]);

  const handleRowClick = (event: any, row: any) => showPaymentDetail(row.original);

  const filteredPayments = selectionRange ? paymentList.filter((payment: any) =>  {
    return moment(payment.paidAt).isBetween(selectionRange.startDate, selectionRange.endDate, 'day', '[]');
  }) : paymentList;

  function Toolbar() {
    return <BCDateRangePicker
      range={selectionRange}
      onChange={setSelectionRange}
      showClearButton={true}
      title={'Filter by Payment Date...'}
      classes={{button: classes.noLeftMargin}}
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
        searchPlaceholder={'Search Payments...'}
        tableData={filteredPayments}
        toolbarPositionLeft={true}
        toolbar={Toolbar()}
        rowTooltip={rowTooltip}
        // manualPagination
        // fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>
        //   dispatch(getAllInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, selectionRange))
        // }
        // total={total}
        // currentPageIndex={currentPageIndex}
        // setCurrentPageIndexFunction={(num: number) => dispatch(setCurrentPageIndex(num))}
        // currentPageSize={currentPageSize}
        // setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentPageSize(num))}
        // setKeywordFunction={(query: string) => dispatch(setKeyword(query))}
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

export default withStyles(styles, { 'withTheme': true })(InvoicingPaymentListing);
