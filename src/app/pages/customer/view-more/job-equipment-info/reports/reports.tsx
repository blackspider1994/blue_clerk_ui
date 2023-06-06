import BCBackButtonNoLink from '../../../../../components/bc-back-button/bc-back-button-no-link';
import BCTableContainer from '../../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../../components/bc-tab/bc-tab';
import {Grid, Typography} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import styles from '../job-equipment-info.style';
import { withStyles } from '@material-ui/core/styles';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "helpers/format";
import {CSButtonSmall} from "../../../../../../helpers/custom";
import {loadJobReportsActions} from "../../../../../../actions/customer/job-report/job-report.action";
import { getAllJobReportsAPI } from 'api/job-report.api';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface LocationStateTypes {
  customerName: string;
  customerId: string;
}

function CustomersJobEquipmentInfoReportsPage({ classes }: any) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();

  const { loading: isLoading = true, jobReports, error } = useSelector(({ jobReport }: any) =>
    jobReport);
  const location = useLocation<any>();
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);
  const [filteredJobs, setFilterJobs] = useState<any[]>([]);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;

  const [currentPage, setCurrentPage] = useState({
    page: prevPage ? prevPage.page : 0,
    pageSize: prevPage ? prevPage.pageSize : 10,
    sortBy: prevPage ? prevPage.sortBy : [],
  });

  const handleFilterData = (jobs: any, location: LocationStateTypes) => {
    const filteredJobs = jobs.filter((resJob: any) =>
      resJob.job?.customer?._id === location.customerId);
    setFilterJobs(filteredJobs);
  }

  const renderGoBack = (location: any) => {
    const baseObj = location;
/*    let customerName =
      baseObj["customerName"] && baseObj["customerName"] !== undefined
        ? baseObj["customerName"]
        : "N/A";*/
    let customerName = baseObj["customerName"].replace(/[\/ ]/g, '');
    let customerId =
      baseObj["customerId"] && baseObj["customerId"] !== undefined
        ? baseObj["customerId"]
        : "N/A";

    let linkKey: any = localStorage.getItem('nestedRouteKey');
    localStorage.setItem('prevNestedRouteKey', linkKey);
    localStorage.setItem('nestedRouteKey', `${customerName}`);

    history.push({
      pathname: `/main/customers/${customerName}`,
      state: {
        ...location,
        customerName,
        customerId,
        from: 1
      }
    });
  }

  const columns: any = [
    {
      Cell({ row }: any) {
        return <div className={"flex items-center"}>{row.index + 1}</div>;
      },
      Header: "No#",
      className: "font-bold",
      sortable: true,
    },
    {
      Header: "Job ID",
      accessor: "job.jobId",
      className: "font-bold",
      sortable: true,
    },
    // {
    //   Header: "Customer",
    //   accessor: "customer.profile.displayName",
    //   className: "font-bold",
    //   sortable: true,
    // },
    {
      Cell({ row }: any) {
        const Date = formatDate(row.original.jobDate);
        return (
          <div className={"flex items-center"}>
            {Date}
          </div>
        );
      },
      Header: "Date",
      id: "job-date",
      sortable: true,
    },
    {
      Header: "Technician",
      accessor: "technicianName",
      className: "font-bold",
      sortable: true,
    },
  ];

  const handleRowClick = (event: any, row: any) => {
    const jobReportId = row.original._id;
    localStorage.setItem('nestedRouteKey', `${jobReportId}`);
    history.push({
      'pathname': `job-report/${jobReportId}`,
      'state': {
        currentPage
      }
    });

  };

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      dispatch(getAllJobReportsAPI(undefined,undefined,undefined,undefined,currentDivision.params));
    }
  }, [currentDivision.isDivisionFeatureActivated, currentDivision.params]);


  useEffect(() => {
    if (jobReports) {
      handleFilterData(jobReports, location.state);
    }
  }, [jobReports]);

  return (
    <>
      <div className={classes.pageMainContainer}>
        <div className={classes.pageContainer}>
          <div className={classes.pageContent}>

            <Grid
              container>
              <BCBackButtonNoLink
                func={() => renderGoBack(location.state)}
              />
              <div className="tab_wrapper">
                <BCTabs
                  curTab={curTab}
                  indicatorColor={'primary'}
                  onChangeTab={handleTabChange}
                  tabsData={[
                    {
                      'label': 'CUSTOMER REPORTS',
                      'value': 0
                    },
                  ]}
                />
              </div>
              <div style={{ flexGrow: 1 }}></div>

              <div className={classes.customerNameLocation}>
                <Typography><strong>Customer Name: </strong>{locationState?.customerName}</Typography>
              </div>
            </Grid>

            <div
              style={{
                'height': '15px'
              }}
            />

            <div
              className={`${classes.dataContainer} `}
              hidden={curTab !== 0}
              id={'0'}>
              <BCTableContainer
                currentPage={currentPage}
                setPage={setCurrentPage}
                columns={columns}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                search
                searchPlaceholder={"Search...(Keyword, Date, Tag, etc.)"}
                tableData={filteredJobs}
                initialMsg="There are no data!"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(CustomersJobEquipmentInfoReportsPage);
