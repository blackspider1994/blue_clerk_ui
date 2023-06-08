import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import InfoIcon from '@material-ui/icons/Info';
import {
  getServiceTicketDetail,
  getAllServiceTicketsAPI
} from 'api/service-tickets.api';
import { modalTypes } from '../../../../../constants';
import { formatDate } from 'helpers/format';
import styled from 'styled-components';
import styles from '../../customer.styles';
import { Checkbox, FormControlLabel, withStyles, Grid } from "@material-ui/core";
import React, { useEffect, useState, useRef } from 'react';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { refreshServiceTickets, setCurrentPageIndex, setCurrentPageSize, setKeyword } from 'actions/service-ticket/service-ticket.action';
import { getCustomers } from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import { clearJobSiteStore, getJobSites, loadingJobSites } from 'actions/job-site/job-site.action';
import { getAllJobTypesAPI } from 'api/job.api';
import "../../../../../scss/popup.scss";
import EditIcon from '@material-ui/icons/Edit';
import {
  CSButtonSmall,
  CSIconButton,
  useCustomStyles
} from "../../../../../helpers/custom";
import { error, warning } from "../../../../../actions/snackbar/snackbar.action";
import BCDateRangePicker, { Range }
  from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import { CSButton } from "../../../../../helpers/custom";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function ServiceTicket({ classes, hidden }: any) {
  const dispatch = useDispatch();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const customers = useSelector(({ customers }: any) => customers.data);
  const [showAllTickets, toggleShowAllTickets] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const loadCount = useRef<number>(0);
  const customStyles = useCustomStyles();
  const { isLoading = true, tickets, refresh = true, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(({ serviceTicket }: any) => ({
    isLoading: serviceTicket.isLoading,
    refresh: serviceTicket.refresh,
    tickets: serviceTicket.tickets,
    prevCursor: serviceTicket.prevCursor,
    nextCursor: serviceTicket.nextCursor,
    total: serviceTicket.total,
    currentPageIndex: serviceTicket.currentPageIndex,
    currentPageSize: serviceTicket.currentPageSize,
    keyword: serviceTicket.keyword,
  }));
  const filteredTickets = tickets.filter((ticket: any) => {
    let cond = true

    // if (!showAllTickets) cond = cond && ticket.status !== 2 && !ticket.jobCreated;
    return cond;
  });

  const openCreateTicketModal = () => {
    //To ensure that all tickets are detected by the division, and check if the user has activated the division feature.
    if ((currentDivision.isDivisionFeatureActivated && currentDivision.data?.name != "All") || !currentDivision.isDivisionFeatureActivated) {
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
      dispatch(warning("Please select a division before creating a ticket."))
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
      customerId: ticket.customer?._id,
      locationId: ticket.jobLocation
    }
    //dispatch(loadingJobLocations());
    //dispatch(getJobLocationsAction({customerId: reqObj.customerId}));
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
        'maxHeight': '754px',
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
        classes={{ root: classes.noMarginRight }}
        control={
          <Checkbox
            checked={showAllTickets}
            onChange={() => toggleShowAllTickets(!showAllTickets)}
            name="checkedB"
            color="primary"
          />
        }
        label="Display All Tickets"
      />
      <BCDateRangePicker
        range={selectionRange}
        onChange={setSelectionRange}
        showClearButton={true}
        title={'Filter by Due Date...'}
      />
    </>
  }

  const openDetailTicketModal = async (ticket: any) => {
    const { serviceTicket, status, message } = await getServiceTicketDetail(ticket._id);
    if (status === 1) {
      dispatch(setModalDataAction({
        'data': {
          'modalTitle': 'Service Ticket Details',
          'removeFooter': false,
          'job': serviceTicket,
          'className': 'serviceTicketTitle',
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
        'removeFooter': false,
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
        let formattedDate = row.original.dueDate ? formatDate(row.original.dueDate) : '-';
        return (
          <div>
            {formattedDate}
          </div>
        )
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
            //variant="contained"
            color="primary"
            size="small"
            onClick={() => openDetailTicketModal(row.original)}
          >
            <InfoIcon className={customStyles.iconBtn} />
          </CSIconButton>
          {row.original && row.original.status !== 1
            ? <CSIconButton
              //variant="contained"
              color="primary"
              size="small"
              aria-label={'edit-ticket'}
              onClick={(e) => {
                e.stopPropagation();
                openEditTicketModal(row.original);
              }}
            >
              <EditIcon className={customStyles.iconBtn} />
            </CSIconButton>
            : null
          }
          {
            !row.original.jobCreated && row.original.status !== 2 && row.original.customer?._id
              ? <CSButtonSmall
                variant="outlined"
                color="primary"
                size="small"
                aria-label={'edit-ticket'}
                onClick={() => openCreateJobModal(row.original)}
              >
                Create Job
              </CSButtonSmall>
              : null
          }
        </div>;
      },
      'Header': 'Actions',
      'id': 'action-create-job',
      'sortable': false,
      'width': 60
    },
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
  }, [currentDivision.params])

  const handleRowClick = (event: any, row: any) => {
  };
  const handleTabChange = (newValue: number) => {
  };
  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
          <BCTabs
            curTab={0}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            tabsData={[
              {
                'label': 'Tickets',
                'value': 0
              }
            ]}
          />
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
          <SwipeableViews index={0}>
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
                fetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>{}
                  //dispatch(getAllServiceTicketsAPI(num || currentPageSize, isPrev ? prevCursor : undefined, isNext ? nextCursor : undefined, showAllTickets, query === '' ? '' : query || keyword, selectionRange))
                }
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: boolean) => {
                  dispatch(setCurrentPageIndex(num))
                  if(apiCall){
                    dispatch(getAllServiceTicketsAPI(currentPageSize, num,  showAllTickets,keyword, selectionRange, currentDivision.params))
                  }
                }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentPageSize(num))}
                setKeywordFunction={(query: string) => dispatch(setKeyword(query))}
              />
            </div>
            <div
              hidden={true}
              id={'1'}>
              <Grid
                item
                xs={12}
              />
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
