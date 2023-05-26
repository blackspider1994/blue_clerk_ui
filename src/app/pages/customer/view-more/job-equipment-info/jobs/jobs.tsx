import BCBackButtonNoLink from '../../../../../components/bc-back-button/bc-back-button-no-link';
import BCTableContainer from '../../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../../components/bc-tab/bc-tab';
import {Grid, Typography} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styles from '../job-equipment-info.style';
import { withStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { formatDate, convertMilitaryTime } from "helpers/format";
import { openModalAction, setModalDataAction, } from "actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../../../../constants";
import { getAllJobsByCustomerAPI } from "api/job.api";
import { getCustomerDetailAction, loadingSingleCustomers } from 'actions/customer/customer.action';
import { Job } from 'actions/job/job.types';
import {CSButtonSmall} from "../../../../../../helpers/custom";
import BCJobStatus from "../../../../../components/bc-job-status";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface LocationStateTypes {
  customerName: string;
  customerId: string;
}
function CustomersJobEquipmentInfoJobsPage({ classes }: any) {
  const dispatch = useDispatch();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const { isLoading = true, jobs, refresh = true } = useSelector(
    ({ jobState }: any) => ({
      'isLoading': jobState.isLoading,
      'jobs': jobState.data,
      'refresh': jobState.refresh,
    })
  );

  const { customerObj } = useSelector((state: any) => state.customers);

  const location = useLocation<LocationStateTypes>();
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);
  const [filteredJobs, setFilterJobs] = useState<Job[] | []>([]);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

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

  const handleButtonClick = (row: any) => {
    if ([0, 4].includes(row.original.status)){
      openEditJobModal(row.original)
    } else {
      openDetailJobModal(row.original)
    }
  };

  const openEditJobModal = (job: any) => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          modalTitle: "Edit Job",
          removeFooter: false,
        },
        type: modalTypes.EDIT_JOB_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const openDetailJobModal = (job: any) => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          removeFooter: false,
          maxHeight: '100%',
          modalTitle: 'View Job',
        },
        type: modalTypes.VIEW_JOB_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const formatSchedulingTime = (time: string) => {
    let timeAr = time.split("T");
    let timeWithSeconds = timeAr[1].substr(0, 5);
    let hours = timeWithSeconds.substr(0, 2);
    let minutes = timeWithSeconds.substr(3, 5);

    return { hours, minutes };
  };

  const handleFilterData = (jobs: Job[] | [], location: LocationStateTypes) => {
    const oldJobs = jobs;
    let filteredJobs = oldJobs;

    filteredJobs = filteredJobs.filter((resJob: any) =>
      resJob.customer._id === location.customerId);

    setFilterJobs(filteredJobs);
  }

  const columns: any = [
    {
      Header: "Job ID",
      accessor: "jobId",
      className: "font-bold",
      sortable: true,
    },
    {
      Cell({ row }: any) {
        return <BCJobStatus status={row.original.status} />;
      },
      Header: "Status",
      accessor: "status",
      className: "font-bold",
      sortable: true,
    },
    {
      Header: "Technician",
      accessor: getVendor,
      id: 'technician',
      className: classes.capitalize,
      sortable: true,
    },
    // {
    //   Header: "Customer",
    //   accessor: "customer.profile.displayName",
    //   className: "font-bold",
    //   sortable: true,
    // },
    {
      Header: "Type",
      accessor: getJobType,
      id: 'job-type',
      className: classes.capitalize,
      sortable: true,
    },
    {
      Cell({ row }: any) {
        const scheduleDate = formatDate(row.original.scheduleDate);
        return (
          <div className={"flex items-center"}>
            {scheduleDate}
          </div>
        );
      },
      Header: "Schedule Date",
      accessor: 'scheduleDate',
      id: "job-schedule-date",
      sortable: true,
    },
    {
      Header: "Time",
      id: "job-time",
      accessor: getJobTime,
      sortable: true,
    },
    {
      Cell({ row }: any) {
        return (
          <div className={"flex items-center"}>
            <CSButtonSmall
              aria-label={"edit-job"}
              color={"primary"}
              onClick={() => handleButtonClick(row)}
              variant={"contained"}
            >
              {[0, 4].includes(row.original.status) ? "Edit" : "View"}
            </CSButtonSmall>
          </div>
        );
      },
      Header: "Options",
      id: "action-options",
      sortable: false,
      width: 60,
    },
  ];

  function getVendor (originalRow: any, rowIndex: number) {
    const {tasks} = originalRow;
    let value = '';
    if (tasks) {
      if (tasks.length === 0) return null;
      else if (tasks.length > 1) value = 'Multiple Techs';
      else if (tasks[0].vendor) {
        value = tasks[0].vendor.profile
          ? tasks[0].vendor.profile.displayName
          : tasks[0].vendor.info.companyName;
      } else if (tasks[0].technician) {
        value =  tasks[0].technician.profile
          ? tasks[0].technician.profile.displayName
          : tasks[0].technician.info.companyName;
      }
    }
    return value.toLowerCase();
  }

  function getJobType(originalRow: any, rowIndex: number) {
    const allTypes = originalRow.tasks.reduce((acc: string[], task: any) => {
      if (task.jobType?.title) {
        if (acc.indexOf(task.jobType.title) === -1) acc.push(task.jobType.title);
        return acc;
      }

      const all = task.jobTypes?.map((item: any) => item.jobType?.title);
      all.forEach((item: string) => {
        if (item && acc.indexOf(item) === -1) acc.push(item);
      })
      return acc;
    }, []);

    return allTypes.length === 1 ? allTypes[0].toLowerCase() : 'multiple jobs';
  }

  function getJobTime(originalRow: any, rowIndex: number) {
    let startTime = 'N/A';
    let endTime = 'N/A';
    if (originalRow.scheduledStartTime !== undefined) {
      const formatScheduledObj = formatSchedulingTime(
        originalRow.scheduledStartTime
      );
      startTime = convertMilitaryTime(
        `${formatScheduledObj.hours}:${formatScheduledObj.minutes}`
      );
    }
    if (originalRow.scheduledEndTime !== undefined) {
      const formatScheduledObj = formatSchedulingTime(
        originalRow.scheduledEndTime
      );
      endTime = convertMilitaryTime(
        `${formatScheduledObj.hours}:${formatScheduledObj.minutes}`
      );
    }
    return `${startTime} - ${endTime}`;
  }

  useEffect(() => {
    if (jobs) {
      handleFilterData(jobs, location.state);
    }
  }, [jobs]);

  useEffect(() => {
    if ((refresh && !currentDivision.isDivisionFeatureActivated) || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      dispatch(getAllJobsByCustomerAPI(undefined, customerObj._id || location.state?.customerId,currentDivision.params));
    }

    if (customerObj._id === '') {
      const obj: any = location.state;
      const customerId = obj.customerId;
      dispatch(loadingSingleCustomers());
      dispatch(getCustomerDetailAction({ customerId }));
    }
  }, [refresh, currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      if (!refresh) {
        dispatch(getAllJobsByCustomerAPI(undefined, customerObj._id || location.state?.customerId,currentDivision.params));
      }
  
      if (customerObj._id === '') {
        const obj: any = location.state;
        const customerId = obj.customerId;
        dispatch(loadingSingleCustomers());
        dispatch(getCustomerDetailAction({ customerId }));
      }
    }
  }, [currentDivision.isDivisionFeatureActivated, currentDivision.params]);


  // const handleRowClick = (event: any, row: any) => { };

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
                      'label': 'CUSTOMER JOBS',
                      'value': 0
                    },
                  ]}
                />
              </div>
              <div style={{ flexGrow: 1 }}></div>

              <div className={classes.customerNameLocation}>
                <Typography><strong>Customer Name: </strong>{location?.state?.customerName}</Typography>
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
                columns={columns}
                isLoading={isLoading}
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

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(CustomersJobEquipmentInfoJobsPage);
