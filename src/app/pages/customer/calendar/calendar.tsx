import BCTabs from '../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { modalTypes } from '../../../../constants';
import styles from './calendar.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getCustomers } from 'actions/customer/customer.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';
import { getAllJobTypesAPI } from 'api/job.api';
import '../../../../scss/popup.scss';
import { useHistory, useLocation } from 'react-router-dom';
import { CSButton } from '../../../../helpers/custom';
import { refreshServiceTickets } from 'actions/service-ticket/service-ticket.action';
import JobPage from './job-page';
import TicketPage from './ticket-page';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { warning } from 'actions/snackbar/snackbar.action';
import { Can, ability } from 'app/config/Can';

function ScheduleJobsPage({ classes }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const location = useLocation<any>();
  const history = useHistory();
  const locationState = location.state;
  const [curTab, setCurTab] = useState(locationState?.curTab ? locationState.curTab : 0);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  useEffect(() => {
    if (localStorage.getItem('prevPage') === 'ticket-map-view') {
      dispatch(refreshServiceTickets(true));
      localStorage.setItem('prevPage', 'schedule');
    }
    dispatch(getCustomers());
    dispatch(loadInvoiceItems.fetch());
    dispatch(getAllJobTypesAPI());
    return () => {
      dispatch(refreshServiceTickets(false));
    };
  }, []);

  const handleTabChange = (newValue: number) => {
    const tempLocationState = { ...locationState };
    delete tempLocationState.onUpdatePage;

    history.replace({
      ...history.location,
      'state': {
        ...tempLocationState,
        'curTab': newValue
      }
    });

    setCurTab(newValue);
  };

  const customers = useSelector(({ customers }: any) => customers.data);

  const openCreateTicketModal = () => {
    // To ensure that all tickets are detected by the division, and check if the user has activated the division feature.
    if (currentDivision.isDivisionFeatureActivated && currentDivision.data?.name != 'All' || !currentDivision.isDivisionFeatureActivated) {
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
    } else {
      dispatch(warning('Please select a division before creating a ticket.'));
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

  const tabs = [];

  if (ability.can('manage', 'Jobs')) {
    tabs.push({
      'label': 'Jobs',
      'value': 0
    });
  }

  if (ability.can('manage', 'Tickets')) {
    tabs.push({
      'label': 'Service Tickets',
      'value': 1
    });
  }

  return (
    <div className={classes.pageContent}>
      <BCTabs
        curTab={curTab}
        indicatorColor={'primary'}
        onChangeTab={handleTabChange}
        tabsData={tabs}
      />
      <div className={classes.addButtonArea}>
        <Can I={'manage'} a={'Tickets'}>
          <CSButton
            aria-label={'new-ticket'}
            variant={'contained'}
            color={'primary'}
            size={'small'}
            onClick={() => openCreateTicketModal()}>
            {'New Ticket'}
          </CSButton>
        </Can>
      </div>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={curTab}
        disabled>
        <Can I={'manage'} a={'Jobs'}>
          <div className={classes.dataContainer} id={'0'}>
            <JobPage />
          </div>
        </Can>
        <Can I={'manage'} a={'Tickets'}>
          <div className={classes.dataContainer} id={'1'}>
            <TicketPage />
          </div>
        </Can>
      </SwipeableViews>
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(ScheduleJobsPage);
