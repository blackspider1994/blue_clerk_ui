import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { Checkbox, FormControlLabel, Grid, Menu, MenuItem, withStyles } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { getAllJobsAPI, getJobsListAPI } from 'api/job.api';
import { getAllJobTypesAPI } from 'api/job.api';
import { modalTypes } from '../../../../../constants';
import styles from '../../customer.styles';
import { statusReference } from 'helpers/contants';
import { convertMilitaryTime, formatDate } from 'helpers/format';
import {
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import { refreshJobs, setCurrentPageIndex, setCurrentPageSize, setKeyword } from 'actions/job/job.action';
import { getCustomers } from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'reducers';
import BCJobStatus from '../../../../components/bc-job-status';
import BCDateRangePicker
, { Range } from '../../../../components/bc-date-range-picker/bc-date-range-picker';
import moment from 'moment';
import { getVendor } from '../../../../../helpers/job';
import { CSButton } from '../../../../../helpers/custom';
import debounce from 'lodash.debounce';
import { warning } from 'actions/snackbar/snackbar.action';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { ability } from 'app/config/Can';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';

function JobsPage({ classes, hidden, currentPage, setCurrentPage }: any) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const customers = useSelector(({ customers }: any) => customers.data);
  // Const [showAllJobs, toggleShowAllJobs] = useState(true);
  const { _id } = useSelector(({ auth }: RootState) => auth);
  const { isLoading = true, jobs, jobsList, refresh = false, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(({ jobState }: any) => ({
    'isLoading': jobState.isLoading,
    'jobs': jobState.data,
    'jobsList': jobState.jobsList,
    'refresh': jobState.refresh,
    'prevCursor': jobState.prevCursor,
    'nextCursor': jobState.nextCursor,
    'total': jobState.total,
    'currentPageIndex': jobState.currentPageIndex,
    'currentPageSize': jobState.currentPageSize,
    'keyword': jobState.keyword
  }));
  const canManageTickets = ability.can('manage', 'Tickets');

  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('-1');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const loadCount = useRef<number>(0);

  const handleFilterClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  const handleSelectStatusFilter = (statusNumber: string) => {
    setSelectedStatus(statusNumber);
    setFilterMenuAnchorEl(null);
  };

  /*
   * Const filteredJobs = jobs.filter(
   *   (job: any) => [0, 1, 4, 5, 6].indexOf(job.status) >= 0
   * );
   */

  const filteredJobs = jobs.filter((job: any) => {
    let cond = true;
    /*
     * If (selectionRange) {
     *   cond = cond &&
     *     moment(job.scheduleDate).isBetween(selectionRange.startDate, selectionRange.endDate, 'day', '[]');
     * }
     */
    if (Number(selectedStatus) >= 0) {
      cond = cond && job.status === Number(selectedStatus);
    }
    return cond;
  });

  function getJobLocation(originalRow: any, rowIndex: number) {
    return originalRow?.jobLocationObj[0]?.name || '-';
  }

  function getJobTime(originalRow: any, rowIndex: number) {
    let startTime = 'N/A';
    let endTime = 'N/A';
    // Case for specific time
    if (originalRow.scheduledStartTime !== undefined || originalRow.scheduledEndTime !== undefined) {
      if (originalRow.scheduledStartTime !== undefined) {
        const formatScheduledObj = formatSchedulingTime(originalRow.scheduledStartTime);
        startTime = convertMilitaryTime(`${formatScheduledObj.hours}:${formatScheduledObj.minutes}`);
      }
      if (originalRow.scheduledEndTime !== undefined) {
        const formatScheduledObj = formatSchedulingTime(originalRow.scheduledEndTime);
        endTime = convertMilitaryTime(`${formatScheduledObj.hours}:${formatScheduledObj.minutes}`);
      }
      return `${startTime} - ${endTime}`;
    }
    // Case for AAM/PM range time

    switch (originalRow.scheduleTimeAMPM) {
      case 1: return 'AM';
      case 2: return 'PM';
      default: return 'N/A - N/A';
    }
  }
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
  const openEditJobModal = (job: any) => {
    dispatch(setModalDataAction({
      'data': {
        'job': job,
        'modalTitle': 'Edit Job',
        'removeFooter': false
      },
      'type': modalTypes.EDIT_JOB_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  /*
   * Const closeModal = () => {
   *   dispatch(closeModalAction());
   *   setTimeout(() => {
   *     dispatch(setModalDataAction({
   *       'data': {},
   *       'type': ''
   *     }));
   *   }, 200);
   * };
   */

  const openDetailJobModal = (job: any) => {
    dispatch(setModalDataAction({
      'data': {
        'job': job,
        'removeFooter': false,
        'maxHeight': '100%',
        'modalTitle': 'View Job'
      },
      'type': modalTypes.VIEW_JOB_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const formatSchedulingTime = (time: string) => {
    const timeAr = time.split('T');
    const timeWithSeconds = timeAr[1].substr(0, 5);
    const hours = timeWithSeconds.substr(0, 2);
    const minutes = timeWithSeconds.substr(3, 5);

    return { hours,
      minutes };
  };

  const columns: any = [
    {
      'Header': 'Job ID',
      'accessor': 'jobId',
      'className': 'font-bold',
      'sortable': true,
      'width': 50
    },
    {
      Cell({ row }: any) {
        return <BCJobStatus status={row.original.status} data={row.original} />;
      },
      'Header': 'Status',
      'accessor': 'status',
      'className': 'font-bold',
      'sortable': true,
      'width': 60
    },
    {
      'Header': 'Technician',
      'accessor': getVendor,
      'id': 'technician',
      'className': classes.capitalize,
      'sortable': true,
      'width': 100
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Subdivision',
      'id': 'job-location',
      'accessor': getJobLocation,
      'sortable': true
    },
    {
      Cell({ row }: any) {
        const scheduleDate = formatDate(row.original.scheduleDate);
        return <div className={'flex items-center'}>{scheduleDate}</div>;
      },
      'Header': 'Schedule Date',
      'id': 'job-schedulee-date',
      'accessor': 'scheduleDate',
      'sortable': true,
      'width': 60
    },
    {
      'Header': 'Time',
      'id': 'job-time',
      'accessor': getJobTime,
      'sortable': true,
      'width': 40
    }
  ];

  function Toolbar() {
    type IconComponentType = React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined; }>;
    const [IconComponent, setIconComponent] = useState<null | IconComponentType>(null);

    /*
     *    Const handleCheckBoxChange = () => {
     *    toggleShowAllJobs((current) => {
     *      if(current === false){
     *        setSelectedStatus('-1');
     *      } else {
     *        setSelectedStatus('-2');
     *      }
     *      return !current;
     *    });
     *    };
     */

    useEffect(() => {
      if (selectedStatus !== '-1' && selectedStatus !== '-2') {
        setIconComponent(statusReference[selectedStatus].icon);
        // ToggleShowAllJobs(false);
      } else if (selectedStatus === '-1') {
        // ToggleShowAllJobs(true);
        setIconComponent(null);
      } else {
        setIconComponent(null);
      }
      if (loadCount.current !== 0) {
        dispatch(getAllJobsAPI(currentPageSize, currentPageIndex, selectedStatus, keyword, selectionRange, currentDivision.params));
        dispatch(setCurrentPageIndex(0));
      }
    }, [selectedStatus]);

    useEffect(() => {
      if (loadCount.current !== 0) {
        dispatch(getAllJobsAPI(currentPageSize, currentPageIndex, selectedStatus, keyword, selectionRange, currentDivision.params));
        dispatch(setCurrentPageIndex(0));
      }
    }, [selectionRange]);

    return (
      <>
        {/*        <FormControlLabel
          control={
            <Checkbox
              checked={showAllJobs}
              onChange={handleCheckBoxChange}
              name="checkedB"
              color="primary"
            />
          }
          label="Display All Jobs"
        />*/}
        <div className={classNames(classes.filterMenu, classes.filterMenuLabel)}>
          {'View:\r'}
        </div>
        <div
          onClick={handleFilterClick}
          className={classNames(classes.filterMenu, classes.filterMenuContainer)}>
          {
            statusReference[selectedStatus] &&
            IconComponent &&
            <IconComponent className={classes.filterIcon} />
          }
          <span
            style={{ 'color': statusReference[selectedStatus] && statusReference[selectedStatus].color || 'inherit' }}>
            {
              statusReference[selectedStatus]
                ? statusReference[selectedStatus].text
                : selectedStatus === '-1'
                  ? 'All'
                  : 'Default'
            }
          </span>
          <span style={{ 'flex': 1,
            'textAlign': 'right' }}>
            <ArrowDropDownIcon />
          </span>
        </div>
        <Menu
          id={'filter-by-status-menu'}
          variant={'menu'}
          anchorEl={filterMenuAnchorEl}
          keepMounted
          open={Boolean(filterMenuAnchorEl)}
          onClose={() => setFilterMenuAnchorEl(null)}>
          <MenuItem
            classes={{
              'root': classes.filterMenuItemRoot,
              'selected': classes.filterMenuItemSelected
            }}
            selected={selectedStatus === '-1'}
            onClick={() => handleSelectStatusFilter('-1')}>
            {'All\r'}
          </MenuItem>
          {Object.values(statusReference).map(statusObj =>
            <MenuItem
              key={statusObj.statusNumber}
              classes={{
                'root': classes.filterMenuItemRoot,
                'selected': classes.filterMenuItemSelected
              }}
              style={{ 'color': statusObj.color || 'inherit' }}
              selected={statusObj.statusNumber === selectedStatus}
              onClick={() => handleSelectStatusFilter(statusObj.statusNumber)}>
              <statusObj.icon className={classes.filterIcon} />
              {statusObj.text}
            </MenuItem>)}
        </Menu>
        <BCDateRangePicker
          range={selectionRange}
          onChange={setSelectionRange}
          showClearButton={true}
          title={'Filter by Schedule Date...'}
        />
      </>
    );
  }

  useEffect(() => {
    if (refresh && !currentDivision.isDivisionFeatureActivated || currentDivision.isDivisionFeatureActivated && (currentDivision.params?.workType || currentDivision.params?.companyLocation || currentDivision.data?.name == 'All')) {
      dispatch(getAllJobsAPI(undefined, currentPageIndex, selectedStatus, keyword, selectionRange, currentDivision.params));
      dispatch(setCurrentPageIndex(0));
      dispatch(setCurrentPageSize(10));
    }
    setTimeout(() => {
      loadCount.current++;
    }, 1000);
  }, [refresh, currentDivision.params]);

  useEffect(() => {
    console.log('refetch', keyword);
    dispatch(getAllJobsAPI(currentPageSize, currentPageIndex, selectedStatus, keyword, selectionRange, currentDivision.params));
  }, [currentPageSize, currentPageIndex, selectedStatus, keyword, selectionRange]);

  useEffect(() => {
    dispatch(loadInvoiceItems.fetch());
    dispatch(getCustomers());
  }, []);

  const handleTabChange = (newValue: number) => {
  };
  const handleRowClick = (event: any, row: any) => {
    if (
      [0, 4].includes(row.original.status) &&
      (!row.original.employeeType ||
        row.original.createdBy?.profile?._id === _id)
    ) {
      openEditJobModal(row.original);
    } else {
      openDetailJobModal(row.original);
    }
  };

  const desbouncedSearchFunction = debounce((keyword: string) => {
    dispatch(setKeyword(keyword));
    dispatch(setCurrentPageIndex(0));
    dispatch(getAllJobsAPI(currentPageSize, 0, selectedStatus, keyword, selectionRange, currentDivision.params));
  }, 500);
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
                'label': 'Jobs',
                'value': 0
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
                searchPlaceholder={'Search Jobs...'}
                tableData={filteredJobs}
                toolbarPositionLeft={true}
                toolbar={Toolbar()}
                manualPagination
                /*
                 * FetchFunction={(num: number, isPrev:boolean, isNext:boolean, query :string) =>
                 *   dispatch(getAllJobsAPI(num || currentPageSize, currentPageIndex, selectedStatus, query === '' ? '' : query || keyword, selectionRange))
                 * }
                 */
                total={total}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndexFunction={(num: number, apiCall: Boolean) => {
                  dispatch(setCurrentPageIndex(num));
                  if (apiCall) {
                    dispatch(getAllJobsAPI(currentPageSize, num, selectedStatus, keyword, selectionRange, currentDivision.params));
                  }
                }}
                currentPageSize={currentPageSize}
                setCurrentPageSizeFunction={(num: number) => {
                  dispatch(setCurrentPageSize(num));
                  dispatch(getAllJobsAPI(num || currentPageSize, currentPageIndex, selectedStatus, keyword, selectionRange, currentDivision.params));
                }}
                setKeywordFunction={(query: string) => {
                  /*
                   * Dispatch(setKeyword(query));
                   * dispatch(getAllJobsAPI(currentPageSize, currentPageIndex, selectedStatus,query, selectionRange))
                   */
                  desbouncedSearchFunction(query);
                }}
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

export default withStyles(styles, { 'withTheme': true })(JobsPage);
