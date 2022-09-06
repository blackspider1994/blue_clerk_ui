import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useHistory, useLocation } from "react-router-dom";
import styled from 'styled-components';
import styles from './../invoices-list.styles';
import {withStyles, Button, Tooltip} from "@material-ui/core";
import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableFilterService from 'utils/table-filter';
import { MailOutlineOutlined } from '@material-ui/icons';
import EmailInvoiceButton from '../email.invoice';
import { formatDatTimelll } from 'helpers/format';
import BCQbSyncStatus from "../../../../components/bc-qb-sync-status/bc-qb-sync-status";
import { useCustomStyles } from "../../../../../helpers/custom";
import {openModalAction, setModalDataAction} from "../../../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../../../constants";
import BCMenuButton from "../../../../components/bc-menu-button";
import {info} from "../../../../../actions/snackbar/snackbar.action";
import BCDateRangePicker
  , {Range} from "../../../../components/bc-date-range-picker/bc-date-range-picker";
// import moment from "moment";
import { getAllInvoicesAPI } from 'api/invoicing.api';
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword,
} from 'actions/invoicing/invoicing.action';

const getFilteredList = (state: any) => {
  const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoiceList.data);
  return sortedInvoices.filter((invoice: any) => !invoice.isDraft);
};

function InvoicingListListing({ classes, theme }: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const invoiceList = useSelector(getFilteredList);
  const customStyles = useCustomStyles()
  // const isLoading = useSelector((state: any) => state?.invoiceList?.loading);
  const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword} = useSelector(
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
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const columns: any = [
    {
      'Header': 'Invoice ID',
      'accessor': 'invoiceId',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Job ID',
      'accessor': 'job.jobId',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        const content = row.original.customerPO || row.original.job?.customerPO || row.original.job?.ticket?.customerPO || '-';
        return <Tooltip title={content}>
          <div style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: 125,
          }}>
            {content}
          </div>
        </Tooltip>;
      },
      'Header': 'Customer PO',
    },
    /*
     * {
     *   'Header': 'Type',
     *   'accessor': '',
     *   'className': 'font-bold',
     *   'sortable': true
     * },
     * {
     *   Cell({ row }: any) {
     *     return <div className={'flex items-center'}>
     *       {`$${row.original.charges}` || 0}
     *     </div>;
     *   },
     *   'Header': 'Amount',
     *   'sortable': true,
     *   'width': 60
     * },
     * {
     *   Cell({ row }: any) {
     *     return <div className={'flex items-center'}>
     *       {`$${row.original.tax}` || 0}
     *     </div>;
     *   },
     *   'Header': 'Tax',
     *   'sortable': true,
     *   'width': 60
     * },
     */
    {
      Cell({ row }: any) {
        return <div className={classes.totalNumber}>

          <span>
            {`$${row.original.total}` || 0}
          </span>
        </div>;
      },
      'accessor': 'total',
      'Header': 'Total',
      'sortable': true,
      'width': 20
    },
    { Cell({ row }: any) {
      const { status = '' } = row.original;
      const textStatus = status.split('_').join(' ').toLowerCase();
      return (
        <div className={customStyles.centerContainer}>
          <BCMenuButton status={status}  handleClick={(e, id) => handleMenuButtonClick(e, id, row.original)}/>
        </div>
      )
    },
    'Header': 'Payment Status',
    'accessor': 'paid',
    'className': 'font-bold',
    'sortable': true,
      'width': 10
    },
    { Cell({ row }: any) {
      return row.original.lastEmailSent
        ? formatDatTimelll(row.original.lastEmailSent)
        : 'N/A';
    },
    'Header': 'Last Email Send Date ',
    'accessor': 'lastEmailSent',
    'className': 'font-bold',
    'sortable': true
    },
    {
      Cell({ row }: any) {
        return row.original.createdAt
          ? formatDatTimelll(row.original.createdAt)
          : 'N/A';
      },
      'Header': 'Invoice Date',
      'accessor': 'createdAt',
      'className': 'font-bold',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        return (
          <BCQbSyncStatus data={row.original} showStatus/>
        );
      },
      'Header': 'Integrations',
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
    dispatch(getAllInvoicesAPI());
    return () => {
      dispatch(setKeyword(''));
      dispatch(setCurrentPageIndex(currentPageIndex));
      dispatch(setCurrentPageSize(currentPageSize));
    }
  }, []);

  useEffect(() => {
    dispatch(getAllInvoicesAPI(currentPageSize, undefined, undefined, keyword, selectionRange));
    dispatch(setCurrentPageIndex(0));
  }, [selectionRange]);

  useEffect(() => {
    if(location?.state?.tab === 0 && (location?.state?.option?.search || location?.state?.option?.pageSize)){
      dispatch(setKeyword(location.state.option.search));
      dispatch(getAllInvoicesAPI(location.state.option.pageSize, undefined, undefined, location.state.option.search , selectionRange));
      dispatch(setCurrentPageSize(location.state.option.pageSize));
      dispatch(setCurrentPageIndex(0));
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const showInvoiceDetail = (id:string) => {
    history.push({
      'pathname': `view/${id}`,
      'state': {
        keyword,
        currentPageSize,
      }
    });
  };

  const handleMenuButtonClick = (event: any, id: number, row:any) => {
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

  const filteredInvoices = selectionRange ? invoiceList.filter((invoice: any) =>  {
    // return moment(invoice.createdAt).isBetween(selectionRange.startDate, selectionRange.endDate, 'day', '[]');
    return true
  }) : invoiceList;

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
        tableData={filteredInvoices}
        toolbarPositionLeft={true}
        toolbar={Toolbar()}
        manualPagination
        fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>
          dispatch(getAllInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, selectionRange))
        }
        total={total}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndexFunction={(num: number) => dispatch(setCurrentPageIndex(num))}
        currentPageSize={currentPageSize}
        setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentPageSize(num))}
        setKeywordFunction={(query: string) => dispatch(setKeyword(query))}
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

export default withStyles(styles, { 'withTheme': true })(InvoicingListListing);
