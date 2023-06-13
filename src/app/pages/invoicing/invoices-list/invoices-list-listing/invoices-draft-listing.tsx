import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useHistory, useLocation, useParams } from "react-router-dom";
import styled from 'styled-components';
import styles from './../invoices-list.styles';
import { withStyles, Button } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableFilterService from 'utils/table-filter';
import { formatDatTimelll } from 'helpers/format';
import { useCustomStyles } from "../../../../../helpers/custom";
import { getAllDraftInvoicesAPI } from 'api/invoicing.api';
import {
  setCurrentDraftPageIndex,
  setCurrentDraftPageSize,
  setDraftKeyword,
} from 'actions/invoicing/invoicing.action';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

const getFilteredList = (state: any) => {
  const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoiceList.draft);
  return sortedInvoices.filter((invoice: any) => invoice.isDraft);
};

function InvoicingDraftListing({ classes, theme }: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const invoiceList = useSelector(getFilteredList);
  const customStyles = useCustomStyles()
  // const isLoading = useSelector((state: any) => state?.invoiceList?.loading);
  const { loading, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword} = useSelector(
    ({ invoiceList }: any) => ({
      loading: invoiceList.loadingDraft,
      prevCursor: invoiceList.prevCursorDraft,
      nextCursor: invoiceList.nextCursorDraft,
      total: invoiceList.totalDraft,
      currentPageIndex: invoiceList.currentPageIndexDraft,
      currentPageSize: invoiceList.currentPageSizeDraft,
      keyword: invoiceList.keywordDraft,
    })
  );

  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const [lastNextCursor, setLastNextCursor] = useState<string | undefined>(location?.state?.option?.lastNextCursor)
  const [lastPrevCursor, setLastPrevCursor] = useState<string | undefined>(location?.state?.option?.lastPrevCursor)
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
        return row.original.createdAt
          ? formatDatTimelll(row.original.createdAt)
          : 'N/A';
      },
      'Header': 'Last Edited Date',
      'accessor': 'createdAt',
      'className': 'font-bold',
      'sortable': true
    },
  ];

  useEffect(() => {
    dispatch(getAllDraftInvoicesAPI(undefined, undefined, undefined, undefined,currentDivision.params));
    return () => {
      dispatch(setDraftKeyword(''));
      dispatch(setCurrentDraftPageSize(currentPageSize));
      dispatch(setCurrentDraftPageIndex(currentPageIndex));
    }
  }, [currentDivision.params]);


  useEffect(() => {
    if(location?.state?.tab === 2 && (location?.state?.option?.search || location?.state?.option?.pageSize)){
      dispatch(setDraftKeyword(location.state.option.search));
      dispatch(getAllDraftInvoicesAPI(location.state.option.pageSize, location?.state?.option?.pageSizeIndex, location.state.option.search,undefined,currentDivision.params));
      dispatch(setCurrentDraftPageSize(location.state.option.pageSize));
      dispatch(setCurrentDraftPageIndex(location?.state?.option?.currentPageIndex || 0));
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const showInvoiceDetail = (id:string) => {
    history.push({
      'pathname': `/main/invoicing/view/${id}`,
      'state': {
        keyword,
        currentPageSize,
        tab: 2,
        currentPageIndex,
        lastNextCursor,
        lastPrevCursor, 
      }
    });
  };

  const handleRowClick = (event: any, row: any) => showInvoiceDetail(row.original._id);

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
        tableData={invoiceList}
        manualPagination
        // fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>{
        //   setLastPrevCursor(isPrev ? prevCursor : undefined)
        //   setLastNextCursor(isNext ? nextCursor : undefined)
        //   dispatch(getAllDraftInvoicesAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, query === '' ? '' : query || keyword, undefined,currentDivision.params))
        // }}
        total={total}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => {
          dispatch(setCurrentDraftPageIndex(num));
          if (apiCall)
            dispatch(getAllDraftInvoicesAPI(currentPageSize, num, keyword, undefined,currentDivision.params))
        }}
        currentPageSize={currentPageSize}
        setCurrentPageSizeFunction={(num: number) => {
          dispatch(setCurrentDraftPageSize(num))
          dispatch(getAllDraftInvoicesAPI(num || currentPageSize, currentPageIndex, keyword, undefined,currentDivision.params))
        }}
        setKeywordFunction={(query: string) => dispatch(setDraftKeyword(query))}
        disableInitialSearch={location?.state?.tab !== 2}
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

export default withStyles(styles, { 'withTheme': true })(InvoicingDraftListing);
