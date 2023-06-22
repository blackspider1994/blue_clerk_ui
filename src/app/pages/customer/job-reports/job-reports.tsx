import BCTableContainer from '../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { formatDatTimelll, formatDate } from 'helpers/format';
import { loadJobReportsActions, setDateFilterRange } from 'actions/customer/job-report/job-report.action';
import styles from '../customer.styles';
import { Grid, withStyles } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import EmailReportButton from './email-job-report';
import { MailOutlineOutlined } from '@material-ui/icons';
import {CSButtonSmall, CSChip, useCustomStyles} from "../../../../helpers/custom";
import moment from "moment";
import BCDateRangePicker, {Range}
  from "../../../components/bc-date-range-picker/bc-date-range-picker";
import {getAllJobReportsAPI} from 'api/job-report.api'
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword
} from 'actions/customer/job-report/job-report.action'
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function JobReportsPage({ classes, theme }: any) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const customStyles = useCustomStyles();
  // const { loading, jobReports, error } = useSelector(({ jobReport }: any) =>
  //   jobReport);
  const { loading, jobReports, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword, dateFilterRange} = useSelector(
    ({ jobReport }: any) => ({
      loading: jobReport.loading,
      jobReports: jobReport.jobReports,
      prevCursor: jobReport.prevCursor,
      nextCursor: jobReport.nextCursor,
      total: jobReport.total,
      currentPageIndex: jobReport.currentPageIndex,
      currentPageSize: jobReport.currentPageSize,
      keyword: jobReport.keyword,
      dateFilterRange: jobReport.dateFilterRange
    })
  );
  // const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [curTab, setCurTab] = useState(0);
  const history = useHistory();

  const location = useLocation<any>();

  // const locationState = location.state;

  // const prevPage = locationState && locationState.prevPage
  //   ? locationState.prevPage
  //   : null;

  // const [currentPage, setCurrentPage] = useState({
  //   'page': prevPage
  //     ? prevPage.page
  //     : 0,
  //   'pageSize': prevPage
  //     ? prevPage.pageSize
  //     : 10,
  //   'sortBy': prevPage
  //     ? prevPage.sortBy
  //     : []
  // });


  const columns: any = [
    {
      'Header': 'Job ID',
      'accessor': 'job.jobId',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Customer',
      'accessor': 'customerName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Date',
      'id': 'job-date',
      'accessor': (originalRow: any, rowIndex: number) => formatDate(originalRow.jobDate),
      'sortable': true
    },
    {
      'Header': 'Technician',
      'accessor': (originalRow: any) => {
        return originalRow?.contractorsObj?.length === 1 ? originalRow?.contractorsObj[0]?.info?.displayName || originalRow?.contractorsObj[0]?.info?.companyName : 'N/A';
      },
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Cell'({ row }: any) {
        return `${row.original.emailHistory[0]?.sentAt
          ? formatDatTimelll(row.original.emailHistory.reverse()[0]?.sentAt)
          : 'N/A'}`;
      },
      'Header': 'Last Email Send Date',
      'accessor': 'emailHistory.sentAt',
      'className': 'font-bold'
    },
    {
      'Cell'({ row }: any) {
        return row.original.invoiceCreated
          ? row.original.invoice?.isDraft ?
            <CSChip
              label={'Draft'}
              style={{ 'backgroundColor': '#FA8029',
                'color': '#fff' }}
            />
            : <CSChip
              label={'Yes'}
              style={{ 'backgroundColor': theme.palette.success.light,
                'color': '#fff' }}
            />
          : <CSChip
            color={'secondary'}
            label={'No'}
          />;
      },
      'Header': 'Invoiced',
      'accessor': 'invoiceCreated',
      'className': 'font-bold',
      'width': 60
    },
    {
      Cell({ row }: any) {
        return (
          <div className={customStyles.centerContainer}>
            <EmailReportButton
              Component={<CSButtonSmall
                variant="contained"
                classes={{
                  'root': classes.emailButton
                }}
                color="primary"
                size="small">
                <MailOutlineOutlined
                  className={customStyles.iconBtn}
                />
              </CSButtonSmall>}
              jobReport={row.original}
            />
          </div>
        );
      },
      'id': 'action',
      'sortable': false,
      'width': 100
    }
  ];

  const filteredReports = dateFilterRange ? jobReports.filter((report: any) => {
    // return moment(report.jobDate).isBetween(selectionRange.startDate, selectionRange.endDate, 'day', '[]');
    return true
  }) : jobReports;

  useEffect(() => {

    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      // dispatch(loadJobReportsActions.fetch());
      dispatch(getAllJobReportsAPI(undefined,undefined,undefined,undefined,currentDivision.params));
      return () => {
        dispatch(setKeyword(''));
        dispatch(setDateFilterRange(null));
        dispatch(setCurrentPageIndex(currentPageIndex));
        dispatch(setCurrentPageSize(currentPageSize));
      }
    }
  }, [currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  useEffect(() => {
    dispatch(getAllJobReportsAPI(currentPageSize, currentPageIndex, keyword, dateFilterRange, currentDivision.params));
    dispatch(setCurrentPageIndex(0));
  }, [dateFilterRange]);

  useEffect(() => {
    if(location?.state?.option?.search || location?.state?.option?.pageSize || location?.state?.option?.pageIndex || location?.state?.option?.dateFilterRange){
      dispatch(setKeyword(location.state.option.search));
      dispatch(setDateFilterRange(location.state.option.dateFilterRange));
      dispatch(getAllJobReportsAPI(location.state.option.pageSize, location?.state?.option?.pageIndex, location.state.option.search , location.state.option.dateFilterRange, currentDivision.params));
      dispatch(setCurrentPageSize(location.state.option.pageSize));
      dispatch(setCurrentPageIndex(location?.state?.option?.pageIndex));
      window.history.replaceState({}, document.title)
    }
  }, [location]);


  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const handleViewMore = (row: any) => {
    const jobReportId = row.original._id;
    localStorage.setItem('nestedRouteKey', `${jobReportId}`);
    history.push({
      'pathname': `/main/customers/job-reports/detail/${jobReportId}`,
      'state': {
        keyword,
        currentPageSize,
        currentPageIndex,
        dateFilterRange
      }
    });
  };

  const handleRowClick = (event: any, row: any) => handleViewMore(row);

  function Toolbar() {
    return  <BCDateRangePicker
      range={dateFilterRange}
      onChange={(range: Range | null) => {
        dispatch(setCurrentPageIndex(0));
        dispatch(setDateFilterRange(range));
      }}
      showClearButton={true}
      title={'Filter by Job Date...'}
      classes={{button: classes.noLeftMargin}}
    />
  }

  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
          <BCTabs
            curTab={curTab}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            tabsData={[
              {
                'label': 'Job Report List',
                'value': 0
              }
              /*
               * {
               *   label: "Recent Activities",
               *   value: 1,
               * },
               */
            ]}
          />
          <SwipeableViews
            disabled
            index={curTab}>
            <div
              className={classes.dataContainer}
              hidden={curTab !== 0}
              id={'0'}>
              <BCTableContainer
                columns={columns}
                // currentPage={currentPage}
                initialMsg={'Nothing Here Yet'}
                isLoading={loading}
                onRowClick={handleRowClick}
                search
                searchPlaceholder={'Search Job Reports...'}
                // setPage={setCurrentPage}
                tableData={filteredReports}
                toolbarPositionLeft={true}
                toolbar={Toolbar()}
                manualPagination
                // fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>
                //   dispatch(getAllJobReportsAPI(num || currentPageSize, currentPageIndex, query === '' ? '' : query || keyword, selectionRange))
                // }
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => 
                  {
                    dispatch(setCurrentPageIndex(num));
                    if(apiCall)
                      dispatch(getAllJobReportsAPI(currentPageSize, num, keyword, dateFilterRange, currentDivision.params))
                  }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => {
                  dispatch(setCurrentPageSize(num));
                  dispatch(getAllJobReportsAPI(num || currentPageSize, currentPageIndex, keyword, dateFilterRange, currentDivision.params))
                }}
                setKeywordFunction={(query: string) => {
                  dispatch(setKeyword(query));
                  dispatch(setCurrentPageIndex(0));
                  dispatch(getAllJobReportsAPI(currentPageSize, 0,query, dateFilterRange, currentDivision.params))
                }}
                setDateFilterRangeFunction={(range: Range) => {
                  dispatch(setDateFilterRange(range));
                  dispatch(setCurrentPageIndex(0));
                  dispatch(getAllJobReportsAPI(currentPageSize, 0, keyword, range, currentDivision.params))
                }}
              />
            </div>
            <div
              hidden={curTab !== 1}
              id={'1'}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                />
              </Grid>
            </div>
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles, { 'withTheme': true })(JobReportsPage);
