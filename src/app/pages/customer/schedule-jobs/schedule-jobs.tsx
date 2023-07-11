import BCTabs from '../../../components/bc-tab/bc-tab';
import JobPage from './job-page/job-page';
import ServiceTicket from './service-ticket/service-ticket';
import JobRequest from './job-request/job-request';
import SwipeableViews from 'react-swipeable-views';
import { modalTypes } from '../../../../constants';
import styles from './schedule-jobs.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, withStyles } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { getCustomers } from 'actions/customer/customer.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';
import { getAllJobTypesAPI } from 'api/job.api';
import "../../../../scss/popup.scss";
import { useLocation, useHistory } from 'react-router-dom';
import { CSButton } from "../../../../helpers/custom";
import { refreshServiceTickets } from 'actions/service-ticket/service-ticket.action';
import { ability } from 'app/config/Can';

function ScheduleJobsPage({ classes }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const location = useLocation<any>();
  const history = useHistory();
  const locationState = location.state;
  const [curTab, setCurTab] = useState(locationState?.curTab ? locationState.curTab : 0);
  const { numberOfJobRequest } = useSelector(({ jobRequests }: any) => ({
    numberOfJobRequest: jobRequests.numberOfJobRequest
  }));

  useEffect(() => {
    if(localStorage.getItem('prevPage') === 'ticket-map-view'){
      dispatch(refreshServiceTickets(true));
      localStorage.setItem('prevPage', 'schedule')
    }
    dispatch(getCustomers());
    // dispatch(loadInvoiceItems.fetch());
    dispatch(getAllJobTypesAPI());
    return () => {
      dispatch(refreshServiceTickets(false));
    }
  }, []);

  const handleTabChange = (newValue: number) => {
    let tempLocationState = { ...locationState };
    delete tempLocationState["onUpdatePage"];

    history.replace({
      ...history.location,
      state: {
        ...tempLocationState,
        curTab: newValue
      }
    });

    setCurTab(newValue);
  };

  const customers = useSelector(({ customers }: any) => customers.data);

  const openCreateTicketModal = () => {
    if (customers.length !== 0) {
      dispatch(setModalDataAction({
        'data': {
          'modalTitle': 'New Service Ticket',
          'removeFooter': false,
          'className': 'serviceTicketTitle',
          'error': {
            'status': false,
            'message': ''
          }
        },
        'type': modalTypes.CREATE_TICKET_MODAL
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);
    } else {
      dispatch(setModalDataAction({
        'data': {
          'removeFooter': false,
          'error': {
            'status': true,
            'message': 'You must add customers to create a service ticket'
          }
        },
        'type': modalTypes.CREATE_TICKET_MODAL
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);
    }
  };

  const openJobModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Create Job',
        'removeFooter': false
      },
      'type': modalTypes.CREATE_JOB_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

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
                'label': 'Jobs',
                'value': 0
              },
              {
                'label': 'Service Tickets',
                'value': 1
              },
              {
                'label': 'Job Requests',
                'value': 2,
                'badgeContent': numberOfJobRequest,
              },
            ]}
          />
          {curTab !== 2 && ability.can('manage', 'Tickets') && (
            <div className={classes.addButtonArea}>
              <CSButton
                aria-label={'new-ticket'}
                variant="contained"
                color="primary"
                size="small"
                onClick={() => openCreateTicketModal()}>
                {'New Ticket'}
              </CSButton>
            </div>
          )}
          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={curTab}
            disabled
          >
            <div className={classes.dataContainer} id={"0"}>
              <JobPage hidden={curTab !== 0} />
            </div>
            <div className={classes.dataContainer} id={"1"}>
              <ServiceTicket hidden={curTab !== 1} />
            </div>
            <div className={classes.dataContainer} id={"2"}>
              <JobRequest hidden={curTab !== 2} />
            </div>
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(ScheduleJobsPage);
