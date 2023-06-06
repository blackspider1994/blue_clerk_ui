import BCTabs from '../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import styles from './ticket-map-view.style';
import {
  Dialog,
  DialogTitle,
  IconButton, List, ListItem, ListItemText,
  withStyles,
  withTheme
} from '@material-ui/core';
import { Info } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import './ticket-map-view.scss';
import MapViewTicketsScreen from './map-view/map-view-tickets';
import MapViewTodayJobsScreen from './map-view/map-view-today-jobs';
import MapViewJobsScreen from './map-view/map-view-jobs';
import MapViewRoutesScreen from './map-view/map-view-routes';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import CloseIcon from "@material-ui/icons/Close";
import {STATUSES} from "../../../../helpers/contants";
import BCMapFilterHead from "../../../components/bc-map-filter/bc-map-filter-head";
import { getCustomers } from "../../../../actions/customer/customer.action";
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';
import { getAllJobTypesAPI } from "api/job.api";
import { getContacts } from 'api/contacts.api';
import {getEmployeesForJobAction} from "../../../../actions/employees-for-job/employees-for-job.action";
import {getVendors} from "../../../../actions/vendor/vendor.action";
import preloader from '../../../../assets/img/preloader/loading-icon2.gif';
import {AM_COLOR, PM_COLOR} from "../../../../constants";

export  interface FilterTickets {
  jobId?: string | null,
  customerNames?: any,
  contact?: any,
  isHomeOccupied?: boolean,
}

export  interface FilterJobs {
  jobId?: string | null,
  customerNames?: any,
  contact?: any,
  jobStatus: number[],
  isHomeOccupied?: boolean,
  filterAMJobs?: boolean,
  filterPMJobs?: boolean,
  filterAllDayJobs?: boolean,
}

export  interface FilterRoutes {
  technician?: any,
  jobType?: any[],
}

const StatusContainer = withTheme(styled('div')`
  position: absolute;
  top: 8px;
  right: 30px;
  display: flex;
  align-items: center;
  .buttonLegend {
    background-color: transparent;
    border: 0;
    color: ${(props) => props.theme.palette.primary.main};
    cursor: pointer;
  }
  .infoLegend {
    color: ${(props) => props.theme.palette.primary.main};
    cursor: pointer;
  }

  @media(max-width: 1200px) {
    // position: relative;
    // top: 0;
    // margin-top: 10px;
    // margin-bottom: 5px;
    // right: 0;
    // justify-content: flex-end;
  }
  @media(max-width: 1420px) {
    .buttonLegend {
      display: none;
    }
  }
`);

function TicketsWithMapView({ classes }: any) {
  const dispatch = useDispatch();
  const [allDates, setAllDates] = useState([null, new Date(), null, new Date()]);
  const [curTab, setCurTab] = useState(0);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  
  const customers = useSelector(({ customers }: any) => customers.data);
  const contacts = useSelector(({contacts}: any) => contacts?.contacts);
  const { data: employees } = useSelector(({ employeesForJob }: any) => employeesForJob);
  const { data: vendors } = useSelector(({ vendors }: any) => vendors);
  const {data: jobTypes} = useSelector((state: any) => state.jobTypes);

  const { streaming, streamingScheduledJobs } = useSelector(
    ({ serviceTicket, jobState }: any) => ({
      streaming: serviceTicket.stream,
      streamingScheduledJobs: jobState.streaming,
    }));

  useEffect(() => {
    return () => {
      localStorage.setItem('prevPage', 'ticket-map-view')
    }
  }, [])

  useEffect(() => {
    const jsdIframe = document.getElementsByName('JSD widget')
    jsdIframe[0] && (jsdIframe[0].style.display = 'none');
    return () => {
      jsdIframe[0] && (jsdIframe[0].style.display = 'initial');
    }
  }, [])
  

  const [filterOpenTickets, setFilterOpenTickets] = useState<FilterTickets>({
    'customerNames': null,
    'jobId': '',
    'contact': null,
    'isHomeOccupied': false,
  });

  const [filterTodayJobs, setFilterTodayJobs] = useState<FilterJobs>({
    'customerNames': null,
    'jobId': '',
    'contact': null,
    'jobStatus': [-1],
    'isHomeOccupied': false,
    'filterAMJobs': false,
    'filterPMJobs': false,
    'filterAllDayJobs': false,
  });

  const [filterJobs, setFilterJobs] = useState<FilterJobs>({
    'customerNames': null,
    'jobId': '',
    'contact': null,
    'jobStatus': [0],
    'isHomeOccupied': false,
    'filterAMJobs': false,
    'filterPMJobs': false,
    'filterAllDayJobs': false,
  });

  const [filterRoutes, setFilterRoutes] = useState<FilterRoutes>({
    'technician': null,
    'jobType': [],
  });

  const allFilters = [
    [filterOpenTickets, setFilterOpenTickets],
    [filterTodayJobs, setFilterTodayJobs],
    [filterJobs, setFilterJobs],
    [filterRoutes, setFilterRoutes],
  ]

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getAllJobTypesAPI());
    dispatch(loadInvoiceItems.fetch());
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
  }, []);


  const dispatchGetContacts =(data:any) => {
    dispatch(getContacts(data));
  }

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const renderLegend = () => {
    return <Dialog
      classes= {{paper: classes.dialog}}
      onClose={() => setShowLegendDialog(false)}
      aria-labelledby="simple-dialog-title"
      open={showLegendDialog}>
      <DialogTitle classes={{root: classes.dialogTitle}} id="simple-dialog-title">
        Legend Information
        <IconButton classes={{root: classes.dialogClose}} onClick={() => setShowLegendDialog(false)}>
          <CloseIcon style={{color: '#828282'}}/>
        </IconButton>
      </DialogTitle>
      <List>
        {STATUSES.map((status) => {
          const StatusIcon = status.icon;
          return (
            <ListItem key={status.title}>
              <StatusIcon />
              <ListItemText style={{color: status.color, marginLeft: 15}} primary={status.title}/>
            </ListItem>
          )
        })}
        <ListItem key="allDayJobs">
          <span style={{
            height: "20px",
            width: "20px",
            backgroundColor: "ffffff",
            borderRadius: "50%",
            display: "inline-block", 
            border: "3px solid black"
          }}></span>
          <ListItemText style={{color: "black", marginLeft: 15}} primary="All day jobs"/>
        </ListItem>
        <ListItem key="amColor">
          <span style={{
            height: "20px",
            width: "20px",
            backgroundColor: "ffffff",
            borderRadius: "50%",
            display: "inline-block", 
            border: `3px solid ${AM_COLOR}`
          }}></span>
          <ListItemText style={{color: AM_COLOR, marginLeft: 15}} primary="AM jobs"/>
        </ListItem>
        <ListItem key="pmJobs">
          <span style={{
            height: "20px",
            width: "20px",
            backgroundColor: "ffffff",
            borderRadius: "50%",
            display: "inline-block", 
            border: `3px solid ${PM_COLOR}`
          }}></span>
          <ListItemText style={{color: PM_COLOR, marginLeft: 15}} primary="PM jobs"/>
        </ListItem>
      </List>
    </Dialog>
  }

  const handleDateChange = (date: Date) => {
    const tempDates = [...allDates];
    tempDates[curTab] = date;
    setAllDates(tempDates);
  }

  const ConfirmationNumberIcon = (props: {fillColor:string}) => (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.333 8.333V5c0-.925-.75-1.667-1.666-1.667H3.333A1.66 1.66 0 0 0 1.675 5v3.333c.917 0 1.658.75 1.658 1.667 0 .916-.741 1.666-1.666 1.666V15c0 .916.75 1.666 1.666 1.666h13.334c.916 0 1.666-.75 1.666-1.666v-3.334c-.916 0-1.666-.75-1.666-1.666 0-.917.75-1.667 1.666-1.667Zm-7.5 6.25H9.167v-1.667h1.666v1.667Zm0-3.75H9.167V9.166h1.666v1.667Zm0-3.75H9.167V5.416h1.666v1.667Z"
        fill={props.fillColor || "#828282"}
      />
    </svg>
  );
  
  const ScheduleIcon = (props: {fillColor:string}) => (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.992 1.667c-4.6 0-8.325 3.733-8.325 8.333s3.725 8.334 8.325 8.334c4.608 0 8.341-3.734 8.341-8.334S14.6 1.667 9.992 1.667Zm.008 15A6.665 6.665 0 0 1 3.333 10 6.665 6.665 0 0 1 10 3.334 6.665 6.665 0 0 1 16.667 10 6.665 6.665 0 0 1 10 16.667Z"
        fill={props.fillColor || "#828282"}
      />
      <path
        d="M10.417 5.833h-1.25v5l4.375 2.625.625-1.025-3.75-2.225V5.833Z"
        fill={props.fillColor || "#828282"}
      />
    </svg>
  );
  
  const WorkIcon = (props: {fillColor:string}) => (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.667 5h-3.334V3.334a1.66 1.66 0 0 0-1.666-1.667H8.333a1.66 1.66 0 0 0-1.666 1.667V5H3.333c-.925 0-1.658.742-1.658 1.667l-.008 9.167A1.66 1.66 0 0 0 3.333 17.5h13.334a1.66 1.66 0 0 0 1.666-1.666V6.667A1.66 1.66 0 0 0 16.667 5Zm-5 0H8.333V3.334h3.334V5Z"
        fill={props.fillColor || "#828282"}
      />
    </svg>
  );
  
  const RouteIcon = (props: {fillColor:string}) => (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.833 12.65V5.833a3.332 3.332 0 1 0-6.667 0v8.334c0 .916-.75 1.666-1.666 1.666-.917 0-1.667-.75-1.667-1.666V7.35A2.509 2.509 0 0 0 7.5 5c0-1.383-1.117-2.5-2.5-2.5A2.497 2.497 0 0 0 2.5 5c0 1.083.7 2 1.667 2.35v6.817a3.332 3.332 0 1 0 6.666 0V5.833c0-.916.75-1.666 1.667-1.666s1.667.75 1.667 1.666v6.817A2.497 2.497 0 0 0 15 17.5c1.383 0 2.5-1.117 2.5-2.5 0-1.083-.7-2-1.667-2.35Z"
        fill={props.fillColor || "#828282"}
      />
    </svg>
  );
  
  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={`${classes.pageContent} maps`}>
          <BCTabs
            curTab={curTab}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            responsiveLabel
            tabsData={[
              {
                'label': 'Open Tickets',
                'value': 0,
                'icon': streaming ? preloader : ConfirmationNumberIcon,
              },
              {
                'label': 'Today\'s Jobs',
                'value': 1,
                'icon': streamingScheduledJobs ? preloader : WorkIcon,
              },
              {
                'label': 'Scheduled Jobs',
                'value': 2,
                'icon': streamingScheduledJobs ? preloader : ScheduleIcon,
              },
              {
                'label': 'Routes',
                'value': 3,
                'icon': RouteIcon,
              },
            ]}
          />
          <StatusContainer>
            <BCMapFilterHead
              startDate={allDates[curTab]}
              disableDate={curTab === 1}
              placeholder={curTab === 0 ? "Due Date" : 'Schedule Date'}
              onChangeDate={handleDateChange}
              filter={allFilters[curTab]}
              shouldResetDate={curTab === 0 || curTab === 2}
              filterType={curTab === 0 ? 'ticket' : curTab === 3 ? 'route' : 'job'}
              customers={customers}
              contacts={contacts}
              dispatchGetContacts={dispatchGetContacts}
              employees={employees}
              vendors={vendors}
              jobTypes={jobTypes}
              showTechFilter={curTab === 0}
            />
            <button className={'buttonLegend'} onClick={() => setShowLegendDialog(true)}>Legend</button>
            <Info className={'infoLegend'} fontSize={'default'} onClick={() => setShowLegendDialog(true)}/>
          </StatusContainer>
          <SwipeableViews index={curTab}>
            <div
              className={`${classes.dataContainer} ${classes.dataContainer}_maps`}
              hidden={curTab !== 0}
              id={'map-swipeable-open'}>
              <MapViewTicketsScreen selectedDate={allDates[0]} filter={filterOpenTickets}/>
            </div>
            <div
              className={`${classes.dataContainer} ${classes.dataContainer}_maps`}
              hidden={curTab !== 1}
              id={'map-swipeable-today'}>
              <MapViewTodayJobsScreen filter={filterTodayJobs}/>
            </div>
            <div
              className={`${classes.dataContainer} ${classes.dataContainer}_maps`}
              hidden={curTab !== 2}
              id={'map-swipeable-schedule'}>
              <MapViewJobsScreen selectedDate={allDates[2]} filter={filterJobs}/>
            </div>
            <div
              className={`${classes.dataContainer} ${classes.dataContainer}_maps`}
              hidden={curTab !== 3}
              id={'map-swipeable-routes'}>
              <MapViewRoutesScreen selectedDate={allDates[3]} filter={filterRoutes}/>
            </div>
          </SwipeableViews>
        </div>
      </div>
      {renderLegend()}
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(TicketsWithMapView);
