import React, {useEffect, useRef, useState} from 'react';
import { Grid, withStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import MemoizedMap from 'app/components/bc-map-with-marker-list/bc-map-with-marker-list';

import '../ticket-map-view.scss';
import styles from '../ticket-map-view.style';
import SidebarTickets from '../sidebar/sidebar-tickets';
import {io} from "socket.io-client";
import Config from "../../../../../config";
import {SocketMessage} from "../../../../../helpers/contants";
import {getOpenServiceTicketsStream} from "../../../../../api/service-tickets.api";
import moment from "moment";

function MapViewTicketsScreen({ classes, filter: filterTickets, selectedDate }: any) {
  const { token } = useSelector(({ auth }: any) => auth);
  const tempTokens = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);

  console.log({filterTickets, allTickets})

  const filterOpenTickets = (tickets: any) => {
    return tickets.filter((ticket: any) => {
      let filter = true;

      if (filterTickets.jobId) {
        filter = filter && (ticket.ticketId.indexOf(filterTickets.jobId) >= 0);
      }

      if (filterTickets.customerNames) {
        filter = filter && (ticket.customer?._id === filterTickets.customerNames._id);
        if (filterTickets.contact) {
          filter = filter && (ticket.customerContactId?._id === filterTickets.contact._id);
        }
      }

      if(selectedDate) {
        filter = filter && moment(ticket.dueDate).isSame(selectedDate, 'day');
      }
      return filter;
    });
  };

  useEffect(() => {
    const socket = io(`${Config.socketSever}`, {
      'extraHeaders': { 'Authorization': token }
    });

    socket.on(SocketMessage.SERVICE_TICKETS, data => {
      const {count, serviceTicket} = data;
      if (serviceTicket) {
        tempTokens.current.push(serviceTicket);
        if (count % 100 === 0) {
          setIsLoading(false);
          setAllTickets(tempTokens.current);
          setFilteredTickets([...tempTokens.current]);
        }
      }
    });

    getOpenServiceTicketsStream();

    return () => {
      socket.close();
    };
  }, [token]);

  useEffect(() => {
    setFilteredTickets(filterOpenTickets(allTickets));
  }, [selectedDate, filterTickets])

  return (
    <Grid container item lg={12}>
      <Grid
        container
        item
        lg={12}
        className="ticketsMapContainer"
      >
        <MemoizedMap
          list={filteredTickets}
          isTicket={true}
        />
      </Grid>

      <SidebarTickets tickets={filteredTickets} isLoading={isLoading}/>
    </Grid>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(MapViewTicketsScreen);
