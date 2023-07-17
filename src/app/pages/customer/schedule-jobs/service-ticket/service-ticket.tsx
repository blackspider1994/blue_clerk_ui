import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import InfoIcon from '@material-ui/icons/Info';
import {
  getAllServiceTicketsAPI,
  getServiceTicketDetail
} from 'api/service-tickets.api';
import { modalTypes } from '../../../../../constants';
import { formatDate } from 'helpers/format';
import styled from 'styled-components';
import styles from '../../customer.styles';
import { Checkbox, FormControlLabel, Grid, withStyles } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { refreshServiceTickets, setCurrentPageIndex, setCurrentPageSize, setKeyword } from 'actions/service-ticket/service-ticket.action';
import { getCustomers } from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import { clearJobSiteStore, getJobSites, loadingJobSites } from 'actions/job-site/job-site.action';
import { getAllJobTypesAPI } from 'api/job.api';
import '../../../../../scss/popup.scss';
import EditIcon from '@material-ui/icons/Edit';
import {
  CSButtonSmall,
  CSIconButton,
  useCustomStyles
} from '../../../../../helpers/custom';
import { error, warning } from '../../../../../actions/snackbar/snackbar.action';
import BCDateRangePicker, { Range }
  from '../../../../components/bc-date-range-picker/bc-date-range-picker';
import { CSButton } from '../../../../../helpers/custom';
import { IDivision, ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { ability } from 'app/config/Can';
import { useHistory } from 'react-router-dom';
import PORequest from "./po-request";

function ServiceTicket({ classes, hidden }: any) {
  const dispatch = useDispatch();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);
  const [curTab, setCurTab] = useState(0);

  const divisions = useSelector((state: any) => state.divisions);
  const divisionList = divisions.data as IDivision[];
  const history = useHistory();
  
  const customers = useSelector(({ customers }: any) => customers.data);
  const [showAllTickets, toggleShowAllTickets] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const loadCount = useRef<number>(0);
  const customStyles = useCustomStyles();
  const { isLoading = true, tickets, refresh = true, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(({ serviceTicket }: any) => ({
    'isLoading': serviceTicket.isLoading,
    'refresh': serviceTicket.refresh,
    'tickets': serviceTicket.tickets,
    'prevCursor': serviceTicket.prevCursor,
    'nextCursor': serviceTicket.nextCursor,
    'total': serviceTicket.total,
    'currentPageIndex': serviceTicket.currentPageIndex,
    'currentPageSize': serviceTicket.currentPageSize,
    'keyword': serviceTicket.keyword
  }));
  const filteredTickets = tickets.filter((ticket: any) => {
    const cond = true;

    // If (!showAllTickets) cond = cond && ticket.status !== 2 && !ticket.jobCreated;
    return cond;
  });
  const canManageTickets = ability.can('manage', 'Tickets');
  const canManageJobs = ability.can('manage', 'Jobs');

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

    if (!divisionList.length && !divisions.loading) {
      history.push('/main/no-locations-assigned')
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
  const openEditTicketModal = (ticket: any) => {
    const reqObj = {
      'customerId': ticket.customer?._id,
      'locationId': ticket.jobLocation
    };
    /*
     * Dispatch(loadingJobLocations());
     * dispatch(getJobLocationsAction({customerId: reqObj.customerId}));
     */
    if (reqObj.locationId !== undefined && reqObj.locationId !== null) {
      dispatch(loadingJobSites());
      dispatch(getJobSites(reqObj));
    } else {
      dispatch(clearJobSiteStore());
    }
    dispatch(getAllJobTypesAPI());
    ticket.updateFlag = true;
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Edit Service Ticket',
        'removeFooter': false,
        'ticketData': ticket,
        'className': 'serviceTicketTitle',
        'maxHeight': '754px'
      },
      'type': modalTypes.EDIT_TICKET_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  function Toolbar() {
    useEffect(() => {
      if (loadCount.current !== 0) {
        dispatch(getAllServiceTicketsAPI(currentPageSize, currentPageIndex, showAllTickets, keyword, selectionRange, currentDivision.params));
        dispatch(setCurrentPageIndex(0));
      }
    }, [showAllTickets]);

    useEffect(() => {
      if (loadCount.current !== 0) {
        dispatch(getAllServiceTicketsAPI(currentPageSize, currentPageIndex, showAllTickets, keyword, selectionRange, currentDivision.params));
        dispatch(setCurrentPageIndex(0));
      }
    }, [selectionRange]);
    return <>
      <FormControlLabel
        classes={{ 'root': classes.noMarginRight }}
        control={
          <Checkbox
            checked={showAllTickets}
            onChange={() => {
              dispatch(setCurrentPageIndex(0));
              toggleShowAllTickets(!showAllTickets);
            }}
            name={'checkedB'}
            color={'primary'}
          />
        }
        label={'Display All Tickets'}
      />
      <BCDateRangePicker
        range={selectionRange}
        onChange={(range: Range | null) => {
          dispatch(setCurrentPageIndex(0));
          setSelectionRange(range);
        }}
        showClearButton={true}
        title={'Filter by Due Date...'}
      />
    </>;
  }

  const openDetailTicketModal = async (ticket: any) => {
    const { serviceTicket, status, message } = await getServiceTicketDetail(ticket._id);
    if (status === 1) {
      dispatch(setModalDataAction({
        'data': {
          'modalTitle': 'Service Ticket Details',
          'removeFooter': false,
          'job': serviceTicket,
          'className': 'serviceTicketTitle'
        },
        'type': modalTypes.VIEW_SERVICE_TICKET_MODAL
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);
    } else {
      dispatch(error(message));
    }
  };

  const openCreateJobModal = (ticket: any) => {
    dispatch(setModalDataAction({
      'data': {
        'job': {
          'customer': {
            '_id': ''
          },
          'description': '',
          'employeeType': false,
          'equipment': {
            '_id': ''
          },
          'scheduleDate': null,
          'scheduledEndTime': null,
          'scheduledStartTime': null,
          'technician': {
            '_id': ''
          },
          ticket,
          'type': {
            '_id': ''
          }
        },
        'modalTitle': 'Create Job',
        'removeFooter': false
      },
      'type': modalTypes.EDIT_JOB_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const columns: any = [
    {
      'Header': 'Ticket ID',
      'accessor': 'ticketId',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Due Date',
      'accessor': 'dueDate',
      'className': 'font-bold',
      'sortable': true,
      'Cell'({ row }: any) {
        const formattedDate = row.original.dueDate ? formatDate(row.original.dueDate) : '-';
        return (
          <div>
            {formattedDate}
          </div>
        );
      }
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          <CSIconButton
            // Variant="contained"
            color={'primary'}
            size={'small'}
            onClick={() => openDetailTicketModal(row.original)}>
            <InfoIcon className={customStyles.iconBtn} />
          </CSIconButton>
          {row.original && row.original.status !== 1 && canManageTickets
            ? <CSIconButton
              // Variant="contained"
              color={'primary'}
              size={'small'}
              aria-label={'edit-ticket'}
              onClick={e => {
                e.stopPropagation();
                openEditTicketModal(row.original);
              }}>
              <EditIcon className={customStyles.iconBtn} />
            </CSIconButton>
            : null
          }
          {
            !row.original.jobCreated && row.original.status !== 2 && row.original.customer?._id && canManageJobs
              ? <CSButtonSmall
                variant={'outlined'}
                color={'primary'}
                size={'small'}
                aria-label={'edit-ticket'}
                onClick={() => openCreateJobModal(row.original)}>
                {'Create Job\r'}
              </CSButtonSmall>
              : null
          }
        </div>;
      },
      'Header': 'Actions',
      'id': 'action-create-job',
      'sortable': false,
      'width': 60
    }
  ];

  useEffect(() => {
    if (refresh) {
      dispatch(getAllServiceTicketsAPI(undefined, undefined, showAllTickets, keyword, selectionRange, currentDivision.params));
      dispatch(setCurrentPageIndex(0));
      dispatch(setCurrentPageSize(10));
    }
    setTimeout(() => {
      loadCount.current++;
    }, 1000);
  }, [refresh]);

  useEffect(() => {
    dispatch(getAllServiceTicketsAPI(undefined, undefined, undefined, undefined, undefined, currentDivision.params));
    if (customers.length == 0) {
      dispatch(getCustomers());
    }
    dispatch(getAllJobTypesAPI());
    dispatch(setKeyword(''));
    dispatch(setCurrentPageIndex(0));
    dispatch(setCurrentPageSize(10));
  }, [currentDivision.params]);

  const handleRowClick = (event: any, row: any) => {
  };
  const handleTabChange = (newValue: number) => {
    setCurTab(newValue)
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
                'label': 'Tickets',
                'value': 0
              },
              {
                'label': 'PO Requests',
                'value': 1
              }
            ]}
          />
          <div className={classes.addButtonArea}>
            {canManageTickets && <CSButton
              aria-label={'new-ticket'}
              variant={'contained'}
              color={'primary'}
              size={'small'}
              onClick={() => openCreateTicketModal()}>
              {'New Ticket'}
            </CSButton>}
          </div>
          <SwipeableViews index={curTab}>
            <div
              className={classes.dataContainer}
              hidden={false}
              id={'0'}>
              <BCTableContainer
                columns={columns}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                search
                searchPlaceholder={'Search Tickets...'}
                tableData={filteredTickets}
                toolbarPositionLeft={true}
                toolbar={Toolbar()}
                manualPagination
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: boolean) => {
                  dispatch(setCurrentPageIndex(num));
                  if (apiCall) {
                    dispatch(getAllServiceTicketsAPI(currentPageSize, num, showAllTickets, keyword, selectionRange, currentDivision.params));
                  }
                }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentPageSize(num))}
                setKeywordFunction={(query: string) => {
                  dispatch(setKeyword(query));
                  dispatch(setCurrentPageIndex(0));
                  dispatch(getAllServiceTicketsAPI(currentPageSize, 0, showAllTickets, query, selectionRange, currentDivision.params));
                }}
              />
            </div>
            <div
              className={classes.dataContainer}
              hidden={false}
              id={'1'}>
                <PORequest></PORequest>
            </div>
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(ServiceTicket);
