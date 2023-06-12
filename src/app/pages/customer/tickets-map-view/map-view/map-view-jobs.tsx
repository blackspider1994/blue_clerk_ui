import Config from 'config';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Grid, withStyles } from '@material-ui/core';
import MemoizedMap from 'app/components/bc-map-with-marker-list/bc-map-with-marker-list';
import '../ticket-map-view.scss';
import styles from '../ticket-map-view.style';
import SidebarJobs from "../sidebar/sidebar-jobs";
import { FilterJobs } from "../tickets-map-view";
import { useDispatch, useSelector } from "react-redux";
import { parseISOMoment } from "../../../../../helpers/format";
import { getAllJobsAPI } from "api/job.api";
import {
  setCurrentPageIndex,
  setCurrentPageSize,
  setKeyword,
} from "actions/job/job.action";
import { RootState } from "reducers";
import { CompanyProfileStateType } from "actions/user/user.types";
import { setTicketSelected } from "actions/map/map.actions";
import { openModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface Props {
  classes: any;
  selectedDate: Date | null;
  filter: FilterJobs;
}

function MapViewJobsScreen({ classes, selectedDate, filter: filterJobs }: Props) {
  const dispatch = useDispatch();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const { isLoading = true, jobs, refresh = true } = useSelector(
    ({ jobState }: any) => ({
      isLoading: jobState.isLoading,
      jobs: jobState.data,
      refresh: jobState.refresh
    })
  );
  const { streaming: streamingTickets } = useSelector(({ serviceTicket }: any) => ({
    streaming: serviceTicket.stream,
  }));
  const selected = useSelector((state: RootState) => state.map.ticketSelected);
  const { coordinates }: CompanyProfileStateType = useSelector((state: any) => state.profile);

  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('0');
  const [jobIdFilter, setJobIdFilter] = useState('');

  const filterScheduledJobs = (jobs: any) => {
    return jobs.filter((job: any) => {
      let filter = true;
      if (filterJobs.jobStatus.indexOf(-1) === -1) {
        filter = filterJobs.jobStatus.indexOf(job.status) >= 0;
      }

      if (filterJobs.jobId) {
        filter = filter && (job.jobId.indexOf(filterJobs.jobId) >= 0);
      }

      if (filterJobs.isHomeOccupied && filterJobs.isHomeOccupied === true) {
        filter = filter && job.isHomeOccupied === true;
      }

      if(filterJobs.filterAMJobs || filterJobs.filterPMJobs || filterJobs.filterAllDayJobs) {
        const timeFilter = 
          (filterJobs.filterAMJobs === true && job.scheduleTimeAMPM === 1) || 
          (filterJobs.filterPMJobs === true && job.scheduleTimeAMPM === 2) || 
          (filterJobs.filterAllDayJobs === true && ![1, 2].includes(job.scheduleTimeAMPM));
        filter = filter && timeFilter;
      }
      if (filterJobs.customerNames) {
        filter = filter && (job.customer._id === filterJobs.customerNames._id);
        if (filterJobs.contact) {
          filter = filter && (job.customerContactId?._id === filterJobs.contact._id);
        }
      }

      if (selectedDate) {
        // const offset = moment.parseZone().utcOffset();
        const parsedDate = moment.utc(job.scheduleDate).isValid() ? moment.utc(job.scheduleDate).format().slice(0, 10) : '';
        const parsedSelectedDate = moment(selectedDate).isValid() ? moment(selectedDate).format().slice(0, 10) : '';
        filter = filter && parsedDate === parsedSelectedDate;
      }
      return filter;
    });
  };


  useEffect(() => {
    if (filterJobs.jobStatus.length === 1) {
      setStatusFilter(`${filterJobs.jobStatus[0]}`)
    } else {
      setStatusFilter('-1')
    }
    if (filterJobs.jobId) {
      setJobIdFilter(filterJobs.jobId)
    } else {
      setJobIdFilter('')
    }
  }, [filterJobs])

  const getJobsData = () => {
    dispatch(getAllJobsAPI(2020, undefined, statusFilter, jobIdFilter, undefined, currentDivision.params));
    dispatch(setKeyword(''));
    dispatch(setCurrentPageIndex(0));
    dispatch(setCurrentPageSize(2020));
  }


  useEffect(() => {
    if (refresh) {
      getJobsData();
    }
  }, [refresh]);

  useEffect(() => {
    getJobsData();
  }, [statusFilter, jobIdFilter]);

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      getJobsData();
    }
  }, [currentDivision.isDivisionFeatureActivated, currentDivision.params])

  useEffect(() => {
    setFilteredJobs(filterScheduledJobs(jobs));
  }, [jobs, selectedDate, filterJobs])

  const dispatchUnselectTicket = () => {
    dispatch(setTicketSelected({ _id: '' }));
  }

  const openModalHandler = (modalDataAction: any) => {
    dispatch(setModalDataAction(modalDataAction));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  return (
    <Grid
      container
      item
      lg={12} >
      <Grid
        container
        item
        lg={12}
        className={'ticketsMapContainer'}
      >
        {
          <MemoizedMap
            reactAppGoogleKeyFromConfig={Config.REACT_APP_GOOGLE_KEY}
            list={filteredJobs}
            streamingTickets={streamingTickets}
            selected={selected}
            coordinates={currentDivision.data?.address?.coordinates || coordinates}
            dispatchUnselectTicket={dispatchUnselectTicket}
            openModalHandler={openModalHandler}
          />
        }
      </Grid>

      <SidebarJobs jobs={filteredJobs} isLoading={isLoading} />
    </Grid>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(MapViewJobsScreen);
