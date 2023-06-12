import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {withStyles} from '@material-ui/core';
import {getAllJobAPI} from 'api/job.api';
import {getServiceTicketDetail} from "api/service-tickets.api";
import styles from './calendar.styles';

import { useDispatch, useSelector } from 'react-redux';
import moment from "moment";
import {RootState} from "../../../../reducers";
import CalendarHeader from "../../../components/bc-calendar/calendar-header";
import BCMonth from "../../../components/bc-calendar/calnedar-month";
import {error} from "../../../../actions/snackbar/snackbar.action";
import {Job} from "../../../../actions/job/job.types";
import {BCEVENT} from "./calendar-types";
import {clearSelectedEvent, setSelectedEvent} from "../../../../actions/calendar/bc-calendar.action";
import {getJobType, getVendor} from "../../../../helpers/job";
import BCJobFilter from "../../../components/bc-job-filter";
import {
  openModalAction,
  setModalDataAction
} from "../../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../../constants";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function JobPage() {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState(-1);
  const [currentTitle, setCurrentTitle] = useState('Customer');
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState<BCEVENT[]>([]);
  const [refresh, setRefresh] = useState(true);

  const calendarState = useSelector((state: RootState) => state.calendar);

  const getTitle = (job: any, type: string) => {
    switch (type) {
      case 'Customer':
        return job.customer?.profile?.displayName;
        break;
      case 'Job Type':
        return getJobType(job);
      case 'Technician':
        return getVendor(job);
      default:
        return job.jobId;
    }
  }

  const filterEvents = () => {
    return events.filter((event) => {
      let filter = currentStatus === -1 ? true : event.status === currentStatus;
      if (filter && searchText.trim()) {
        filter = event.title.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
      }
      return filter;
    });
  }

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      const params={
        startDate: moment(currentDate).utc().startOf('month').toDate(),
        endDate: moment(currentDate).utc().endOf('month').toDate(),
        pageSize: 1000,
      }
      setRefresh(true);
      setEvents([]);
      dispatch(clearSelectedEvent());
      getAllJobAPI(params, currentDivision.params).then((data) => {
        const {status, jobs, total} = data;
        if (status === 1) {
          const events = jobs.map((job: Job) => ({
            date: job.scheduledStartTime ? new Date(job.scheduledStartTime) : new Date(job.scheduleDate),
            hasTime: !!job.scheduledStartTime,
            title: getTitle(job, currentTitle),
            id: job._id,
            status: job.status,
            data: job,
            })
          );
          setEvents(events);
        }
        setRefresh(false);
      }).catch((e) => {
        dispatch(error(e.message));
        setRefresh(false);
      })
    }
  }, [currentDate,currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  const onTitleChange = (id: number, type: string) => {
    const eventsTemp = events.map((event) => ({...event, title: getTitle(event.data, type)}));
    setCurrentTitle(type);
    setEvents(eventsTemp);
  }

  const eventClickHandler = (isSelected:boolean, eventProps: any ) => {
    dispatch(isSelected ? clearSelectedEvent() :
      setSelectedEvent(eventProps)
    )
  }

  const openJobModalHandler = (job:any) => {
    dispatch(clearSelectedEvent());
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          removeFooter: false,
          maxHeight: '100%',
          modalTitle: '',
        },
        type: modalTypes.VIEW_JOB_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const openTicketModalHandler = (data:any, status:any, message:any) => {
    dispatch(clearSelectedEvent());
    if (status === 1) {
      dispatch(setModalDataAction({
        'data': {
          'modalTitle': '',
          'removeFooter': false,
          'job': data,
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
  }

  return (
    <DataContainer id={'0'}>
      <CalendarHeader
        date={currentDate}
        titleItems={[{title: 'Customer'}, {title: 'Job Type'}, {title: 'Technician'}, {title: 'Job ID'},]}
        onDateChange={(date) => setCurrentDate(date)}
        onCalendarChange={(id, type) => console.log(type)}
        onTitleChange={onTitleChange}
        searchLabel={'Search Jobs...'}
        onSearchChange={setSearchText}
      >
        <BCJobFilter onStatusChange={setCurrentStatus} />
      </CalendarHeader>
      <BCMonth
        month={currentDate}
        isLoading={refresh}
        events={filterEvents()}
        eventClickHandler={eventClickHandler}
        calendarState={calendarState}
        openJobModalHandler={openJobModalHandler}
        openTicketModalHandler={openTicketModalHandler}
        getServiceTicketDetail={getServiceTicketDetail}
      />
    </DataContainer>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;
`;

export default withStyles(styles, { withTheme: true })(JobPage);
