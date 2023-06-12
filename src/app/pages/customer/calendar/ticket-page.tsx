import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {withStyles} from '@material-ui/core';
import styles from './calendar.styles';

import { useDispatch, useSelector } from 'react-redux';
import moment from "moment";
import {RootState} from "../../../../reducers";
import CalendarHeader from "../../../components/bc-calendar/calendar-header";
import BCMonth from "../../../components/bc-calendar/calnedar-month";
import {BCEVENT} from "./calendar-types";
import {getAllServiceTicketAPI,getServiceTicketDetail} from "api/service-tickets.api";
import {
  clearSelectedEvent,
  setSelectedEvent
} from "actions/calendar/bc-calendar.action";
import {
  openModalAction,
  setModalDataAction
} from "actions/bc-modal/bc-modal.action";
import {error} from "actions/snackbar/snackbar.action";
import {modalTypes} from "../../../../constants";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { refreshServiceTickets } from 'actions/service-ticket/service-ticket.action';

function TicketPage() {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTitle, setCurrentTitle] = useState('Customer');
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState<BCEVENT[]>([]);

  const calendarState = useSelector((state: RootState) => state.calendar);

  const { isLoading = true, tickets, refresh = true } = useSelector(({ serviceTicket }: any) => ({
    'isLoading': serviceTicket.isLoading,
    'refresh': serviceTicket.refresh,
    'tickets': serviceTicket.tickets
  }));

  const getTitle = (ticket: any, type: string) => {
    switch (type) {
      case 'Customer':
        return ticket.customer?.profile?.displayName;
      default:
        return ticket.ticketId;
    }
  }

  useEffect(() => {
    const startDate = moment(currentDate).utc().startOf('month');
    const endDate = moment(currentDate).utc().endOf('month');

    const filtered = tickets.reduce((acc: any[], ticket: any) => {
      if (moment(ticket.dueDate).isBetween(startDate, endDate, 'day', '[]')) {
        acc.push({
          date: ticket.dueDate,
          hasTime: false,
          title: getTitle(ticket, currentTitle),
          id: ticket._id,
          status: -1,
          data: ticket,
        })
      }
      return acc;
    }, []);
    setEvents(filtered);
  }, [tickets, currentDate]);

  useEffect(() => {
    if (refresh) {
      dispatch(getAllServiceTicketAPI(undefined, currentDivision.params));
    }
  }, [refresh, currentDivision.params]);

  const onTitleChange = (id: number, type: string) => {
    const eventsTemp = events.map((event) => ({...event, title: getTitle(event.data, type)}));
    setCurrentTitle(type);
    setEvents(eventsTemp);
  };

  const filterEvents = () => {
    return searchText.trim() ? events.filter((event) =>
        event.title.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)
    : events;
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
        titleItems={[{title: 'Customer'}, {title: 'Ticket ID'},]}
        onDateChange={(date) => setCurrentDate(date)}
        onCalendarChange={(id, type) => console.log(type)}
        onTitleChange={onTitleChange}
        searchLabel={'Search Tickets...'}
        onSearchChange={setSearchText}
      />
      <BCMonth
        month={currentDate}
        isLoading={isLoading}
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

export default withStyles(styles, { withTheme: true })(TicketPage);
