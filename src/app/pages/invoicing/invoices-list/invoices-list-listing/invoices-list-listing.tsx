import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useHistory, useLocation, useParams } from "react-router-dom";
import styled from 'styled-components';
import styles from './../invoices-list.styles';
import { withStyles, Button, Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableFilterService from 'utils/table-filter';
import { MailOutlineOutlined, VolumeMute } from '@material-ui/icons';
import EmailInvoiceButton from '../email.invoice';
import {
  formatCurrency,
  formatDateMMMDDYYYY,
} from 'helpers/format';
import BCQbSyncStatus from "../../../../components/bc-qb-sync-status/bc-qb-sync-status";
import { useCustomStyles } from "../../../../../helpers/custom";
import { closeModalAction, openModalAction, setModalDataAction } from "../../../../../actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../../../constants";
import BCMenuButton from "../../../../components/bc-menu-button";
import { info } from "../../../../../actions/snackbar/snackbar.action";
// import BCDateRangePicker
//   , {Range} from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import { getAllInvoicesAPI } from 'api/invoicing.api';
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword,
} from 'actions/invoicing/invoicing.action';
import { resetAdvanceFilterInvoice } from 'actions/advance-filter/advance-filter.action'
import { initialAdvanceFilterInvoiceState } from 'reducers/advance-filter.reducer';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import debounce from 'lodash.debounce';

const getFilteredList = (state: any) => {
  const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoiceList.data);
  return sortedInvoices.filter((invoice: any) => !invoice.isDraft);
};

function InvoicingListListing({ classes, theme }: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const invoiceList = useSelector(getFilteredList);
  const customStyles = useCustomStyles();

  // const isLoading = useSelector((state: any) => state?.invoiceList?.loading);
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
  // const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const [fetchInvoices, setFetchInvoices] = useState(false);
  const [lastNextCursor, setLastNextCursor] = useState<string | undefined>(location?.state?.option?.lastNextCursor)
  const [lastPrevCursor, setLastPrevCursor] = useState<string | undefined>(location?.state?.option?.lastPrevCursor)

  const advanceFilterInvoiceData: any = useSelector(({ advanceFilterInvoiceState }: any) => advanceFilterInvoiceState);

  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  // Indicate if the data was not found using the advance filter
  const [dataNotFoundOnFilter, setDataNotFoundOnFilter] = useState(false)

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
        return <span>{row.original.invoiceId?.substring(8)}</span>
      },
      'Header': 'Invoice ID',
      //'accessor': 'invoiceId',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Job ID',
      Cell({ row }: any) {
        return <span>{row.original.job?.jobId?.substring(4)}</span>
      },
      'className': 'font-bold',
      'sortable': true
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
        return <div style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      'accessor': (originalRow: any) => formatCurrency(originalRow.total),
      'Header': 'Total',
      'sortable': true,
      'width': 20
    },
    {
      Cell({ row }: any) {
        const { status = '' } = row.original;
        const textStatus = status.split('_').join(' ').toLowerCase();
        return (
          <div className={customStyles.centerContainer}>
            <BCMenuButton status={status} handleClick={(e, id) => handleMenuButtonClick(e, id, row.original)} />
          </div>
        )
      },
      'Header': 'Payment Status',
      'accessor': 'paid',
      'className': 'font-bold',
      'sortable': true,
      'width': 10
    },
    {
      Cell({ row }: any) {
        return row.original.lastEmailSent
          ? formatDateMMMDDYYYY(row.original.lastEmailSent, true)
          : 'N/A';
      },
      'Header': 'Email Send Date ',
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
          Component={<Button
            variant="contained"
            classes={{
              'root': classes.emailButton
            }}
            color="primary"
            size="small">
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
    },
  ];

  useEffect(() => {
    // dispatch(getInvoicingList());
    // dispatch(loadingInvoicingList());
    dispatch(getAllInvoicesAPI(undefined, undefined, undefined, advanceFilterInvoiceData, undefined, undefined, undefined, undefined, undefined, undefined, currentDivision.params));
    return () => {
      dispatch(setKeyword(''));
      dispatch(setCurrentPageIndex(currentPageIndex));
      dispatch(setCurrentPageSize(currentPageSize));
    }
  }, [currentDivision.params]);

  // useEffect(() => {
  //   dispatch(getAllInvoicesAPI(currentPageSize, undefined, undefined, keyword, selectionRange));
  //   dispatch(setCurrentPageIndex(0));
  // }, [selectionRange]);

  useEffect(() => {
    if (fetchInvoices) {
      dispatch(getAllInvoicesAPI(currentPageSize, currentPageIndex, keyword, advanceFilterInvoiceData, undefined, undefined, undefined, undefined, undefined, undefined, currentDivision.params));
      dispatch(setCurrentPageIndex(0));
    }
    setFetchInvoices(false);
  }, [fetchInvoices]);

  useEffect(() => {
    if (location?.state?.tab === 1 && (location?.state?.option?.search || location?.state?.option?.pageSize || location?.state?.option?.lastPrevCursor
      || location?.state?.option?.lastNextCursor || location?.state?.option?.currentPageIndex)) {
      dispatch(setKeyword(location.state.option.search));
      dispatch(getAllInvoicesAPI(location.state.option.pageSize, location.state.option.pageSizeIndex, location.state.option.search, advanceFilterInvoiceData, undefined, undefined, undefined, undefined, undefined, undefined, currentDivision.params));
      dispatch(setCurrentPageSize(location.state.option.pageSize));
      dispatch(setCurrentPageIndex(location?.state?.option?.currentPageIndex || 0));
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const showInvoiceDetail = (id: string) => {
    history.push({
      'pathname': `/main/invoicing/view/${id}`,
      'state': {
        keyword,
        currentPageSize,
        tab: 1,
        currentPageIndex,
        lastNextCursor,
        lastPrevCursor,
      }
    });
  };

  const handleMenuButtonClick = (event: any, id: number, row: any) => {
    event.stopPropagation();
    switch (id) {
      case 0:
        recordPayment(row);
        break;
      case 1:
        historyPayment(row);
        break;
      default:
        dispatch(info('This feature is still under development!'));
    }
  }

  const recordPayment = (row: any) => {
    dispatch(setModalDataAction({
      'data': {
        invoice: row,
        modalTitle: 'Record a Payment',
        removeFooter: false,
      },
      'type': modalTypes.PAYMENT_RECORD_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const historyPayment = (row: any) => {
    dispatch(setModalDataAction({
      'data': {
        invoiceID: row._id,
        modalTitle: 'Payment History',
        removeFooter: false,
      },
      'type': modalTypes.PAYMENT_HISTORY_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const handleRowClick = (event: any, row: any) => showInvoiceDetail(row.original._id);

  /**
   * Receive the event modal closed on the modal(Nothing found)
   */
  const handleCloseModalNotDataFound = () => {
    setDataNotFoundOnFilter(false)
  }

  /**
   * Receive the event when the modal filter is sumited by the user
   * @param data 
   */
  const handleFilterSubmit = async (data: any) => {
    dataModalFilter.data.loading = true;
    dataModalFilter.refresh = true;
    dispatch(setModalDataAction(dataModalFilter));
    const { total } = await (getAllInvoicesAPI(currentPageSize, currentPageIndex, keyword, data, undefined, undefined, undefined, undefined, undefined, undefined, currentDivision.params))(dispatch);
    if (total === 0 || total === undefined) {
      dataModalFilter.data.loading = false;
      dataModalFilter.refresh = false;
      dispatch(setModalDataAction(dataModalFilter));
      setDataNotFoundOnFilter(true);
    } else {
      dispatch(closeModalAction());
    }

  }

  // Data used by modal filter
  const dataModalFilter = {
    data: {
      modalTitle: 'Filter Invoices',
      handleFilterSubmit,
      loading: false
    },
    type: modalTypes.ADVANCE_FILTER_INVOICE_MODAL,
    refresh: false
  }

  const handleOpenFilter = () => {
    dataModalFilter.data.loading = false;
    dispatch(setModalDataAction(dataModalFilter));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const handleClear = () => {
    dispatch(resetAdvanceFilterInvoice());
    setTimeout(() => {
      setFetchInvoices(true);
    }, 200);
  }

  const ButtonFilter = (props: any) => {
    const content = JSON.stringify(initialAdvanceFilterInvoiceState) !== JSON.stringify(advanceFilterInvoiceData)
    return (
      <>
        <Badge color="secondary" variant='dot' badgeContent={content ? ' ' : 0}>
          <Button
            style={{
              color: 'white',
              background: '#00AAFF',
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              border: '1px solid #00AAFF',
              fontSize: 14,
              borderRadius: 8,
              width: 105,
              height: 38,
            }}
            onClick={props.onClick}
          >
            <VolumeMute style={{
              transform: 'rotate(270deg)'
            }} />
            Filter
          </Button>
        </Badge>
        {!!content && (
          <div
            style={{
              color: '#00AAFF',
              textDecoration: 'underline',
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              fontSize: 12,
              width: 50,
              height: 38,
            }}
          >
            <span
              style={{
                cursor: 'pointer',
              }}
              onClick={props.onClear}
            >
              Clear
            </span>
          </div>
        )}
      </>
    )
  }

  // Dialog to be showed whent the filter modal doesn't return data
  const DialogNotData = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
    return (
      <Dialog
        open={open}
        onClose={() => handleClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogTitle >
          {"Nothing found"}
        </DialogTitle>
        <DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  function Toolbar() {
    return <>
      {/* <BCDateRangePicker
        range={selectionRange}
        onChange={setSelectionRange}
        showClearButton={true}
        title={'Filter by Invoice Date...'}
        classes={{button: classes.noLeftMargin}}
      /> */}
      <ButtonFilter onClick={handleOpenFilter} onClear={handleClear}>Filter</ButtonFilter>
    </>
  }

  const rowTooltip = (row: any) => {
    let rowData = row.original;
    if (currentDivision.isDivisionFeatureActivated && currentDivision.data?.name == "All" && (rowData.companyLocation?.name || rowData.workType?.title)) {
      return `${rowData.companyLocation?.name}  ${rowData.isMainLocation ? "(Main) " : ""}- ${rowData.workType?.title}`
    } else {
      return ""
    }
  }

  const desbouncedSearchFunction = debounce((keyword: string) => {
    dispatch(setKeyword(keyword));
    dispatch(setCurrentPageIndex(0));
    dispatch(getAllInvoicesAPI(currentPageSize, 0, keyword, advanceFilterInvoiceData,  undefined, undefined, undefined,undefined,undefined,undefined, currentDivision.params))
  }, 500);

  return (
    <DataContainer id={'0'}>
      <BCTableContainer
        columns={columns}
        isLoading={loading}
        onRowClick={handleRowClick}
        search
        searchPlaceholder={'Search Invoices...'}
        tableData={invoiceList}
        toolbarPositionLeft={true}
        toolbar={Toolbar()}
        manualPagination
        // fetchFunction={(num: number, isPrev: boolean, isNext: boolean, query: string) => {
        //   setLastPrevCursor(isPrev ? prevCursor : undefined)
        //   setLastNextCursor(isNext ? nextCursor : undefined)
        //   dispatch(getAllInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, advanceFilterInvoiceData, undefined, undefined, undefined,undefined,undefined,undefined, currentDivision.params))
        // }}
        total={total}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => {
          dispatch(setCurrentPageIndex(num));
          if (apiCall)
            dispatch(getAllInvoicesAPI(currentPageSize, num, keyword, advanceFilterInvoiceData, undefined, undefined, undefined, undefined, undefined, undefined, currentDivision.params))
        }}
        currentPageSize={currentPageSize}
        setCurrentPageSizeFunction={(num: number) => {
          dispatch(setCurrentPageSize(num));
          dispatch(getAllInvoicesAPI(num || currentPageSize, currentPageIndex, keyword, advanceFilterInvoiceData,  undefined, undefined, undefined,undefined,undefined,undefined, currentDivision.params))
        }}
        setKeywordFunction={(query: string) => {
          desbouncedSearchFunction(query);
        }}
        disableInitialSearch={location?.state?.tab !== 1}
        rowTooltip={rowTooltip}
      />
      {DialogNotData({ open: dataNotFoundOnFilter, handleClose: handleCloseModalNotDataFound })}
    </DataContainer>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  overflow: hidden;
`;

export default withStyles(styles, { 'withTheme': true })(InvoicingListListing);
