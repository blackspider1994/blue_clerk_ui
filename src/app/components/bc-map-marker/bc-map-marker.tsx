import React, {useEffect, useState} from "react";
import {ReactComponent as IconStarted} from "../../../assets/img/icons/map/icon-started.svg";
import {ReactComponent as IconCompleted} from "../../../assets/img/icons/map/icon-completed.svg";
import {ReactComponent as IconCancelled} from "../../../assets/img/icons/map/icon-cancelled.svg";
import {ReactComponent as IconRescheduled} from "../../../assets/img/icons/map/icon-rescheduled.svg";
import {ReactComponent as IconPaused} from "../../../assets/img/icons/map/icon-paused.svg";
import {ReactComponent as IconIncomplete} from "../../../assets/img/icons/map/icon-incomplete.svg";
import {ReactComponent as IconPending} from "../../../assets/img/icons/map/icon-pending.svg";
import {ReactComponent as IconJobRequest} from "../../../assets/img/icons/map/icon-job-request.svg";
import {ReactComponent as IconOpenServiceTicket} from "../../../assets/img/icons/map/icon-open-service-ticket.svg";

import {AM_COLOR, NON_OCCUPIED_GREY, OCCUPIED_GREEN, OCCUPIED_ORANGE, PM_COLOR, modalTypes} from "../../../constants";
import {Button, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import {withStyles} from "@material-ui/core/styles";
import styles from "./bc-map-marker.style";
import './bc-map-marker.scss';
import {formatDate, formatTime} from "../../../helpers/format";
import {
  getJobTypesFromJob,
  getJobTypesFromTicket,
  getJobTypesTitle
} from "../../../helpers/utils";

interface Props {
  classes: any,
  ticket: any,
  lat: number,
  lng: number,
  isTicket?: boolean,
  id?: string,
  streamingTickets?: boolean;
  tickets?: any[];
  selected?: any;
  dispatchUnselectTicket?: any;
  openModalHandler?: (modalDataAction:any) => void;
  openEditTicketModalPrepDispatcher?: (reqObj:any) => void;
  setServiceTicketDispatcher?: (updatedTickets:any) => void;
  getServiceTicketDetail?: any;
  getJobLocation?: any;
  getJobSite?: any;
  technicianColor?: string;
}

function BCMapMarker({
  classes,
  ticket,
  isTicket = false,
  id = '',
  streamingTickets,
  tickets = [],
  selected = {},
  dispatchUnselectTicket = ()=>{},
  openModalHandler = ()=>{},
  openEditTicketModalPrepDispatcher = ()=>{},
  setServiceTicketDispatcher = ()=>{},
  getServiceTicketDetail = ()=>{},
  getJobLocation = ()=>{},
  getJobSite = ()=>{},
  technicianColor = 'black'
}: Props) {
  let CustomIcon;
  const [showInfo, setShowInfo] = useState({show: false, inside: true});

  const title = getJobTypesTitle(isTicket && !ticket.jobId ? getJobTypesFromTicket(ticket) : getJobTypesFromJob(ticket));

  const note = ticket.description || ticket.note || 'N/A';
  const notes = note.length > 500 ? `${note.substr(0, 500)}...` : note;

  useEffect(() => {
    if(!streamingTickets){
      localStorage.removeItem('afterCancelJob')
    }
  }, [streamingTickets])

  useEffect(() => {
    if (selected._id === ticket._id) {
      setShowInfo({show: true, inside: false});
    }
    else if (!showInfo.inside) {
      setShowInfo({show: false, inside: true})
    }

  }, [selected]);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case -2:
        return IconJobRequest;
      case -1:
        return IconOpenServiceTicket;
      case 1:
        return IconStarted;
      case 2:
        return IconCompleted;
      case 3:
        return IconCancelled;
      case 4:
        return IconRescheduled;
      case 5:
        return IconPaused;
      case 6:
        return IconIncomplete;
      default:
        return IconPending;
    }
  }

  const calculateMarkerBorder = (ticket : any) : string => {
    if(!isTicket && ticket?.jobId) {
      if(ticket?.scheduleTimeAMPM !== 0) {
        switch(ticket?.scheduleTimeAMPM) {
          case 1: return `3px solid ${AM_COLOR}`; 
          case 2: return `3px solid ${PM_COLOR}`;
          default: return '3px solid black';
        }
      }
      return '3px solid black'
    }
    else if(isTicket && ticket?.jobId) {
      return `3px solid ${technicianColor}`
    }
    else {
      return ticket?.isHomeOccupied ? `3px solid ${OCCUPIED_ORANGE}` : 'none';
    }
  }

  const openCreateJobModal = () => {
    const modalDataAction = {
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
          },
          'jobFromRequest': !!ticket.requestId,
          'jobFromMap': true
        },
        'modalTitle': 'Create Job',
        'removeFooter': false

      },
      'type': modalTypes.EDIT_JOB_MODAL
    }
    openModalHandler(modalDataAction);
  };

  const openEditTicketModal = (ticket: any) => {
    const reqObj = {
      customerId: ticket.customer?._id,
      locationId: ticket.jobLocation?._id || ticket.jobLocation
    }
    openEditTicketModalPrepDispatcher(reqObj)
    ticket.updateFlag = true;
    const modalDataAction = {
      'data': {
        'modalTitle': 'Edit Service Ticket',
        'removeFooter': false,
        'ticketData': ticket,
        'className': 'serviceTicketTitle',
        'maxHeight': '754px',
        'refreshTicketAfterEditing': false,
        'onSubmit': async (response: any, ticketId: string) => {
          closeInfo();
          let data = {...ticket, images: []};
          const {status, serviceTicket} = await getServiceTicketDetail(ticket._id);
          if (status === 1) {
            data = serviceTicket;
          }
          let updatedJobLocation: any;
          if(data?.jobLocation?._id){
            const response = await getJobLocation(data?.jobLocation?._id);
            if(response.length && response[0]?.location?.coordinates?.length){
              updatedJobLocation = {...data.jobLocation, location: response[0].location}
            } else {
              updatedJobLocation = {...data.jobLocation}
            }
          }
          let updatedJobSite: any;
          if(data?.jobSite?._id){
            const response = await getJobSite(data?.jobSite?._id);
            if(response.length && response[0]?.location?.coordinates?.length){
              updatedJobSite = {...data.jobSite, location: response[0].location}
            } else {
              updatedJobSite = {...data.jobSite}
            }
          }
          const { customer, customerContactId, customerPO, dueDate, images, note, tasks, track } = data;
          const updatedTickets = tickets.map((ticket:any, index: number)=>{
            if(ticket._id === ticketId){
              const newTicket = {
                ...ticket,
                customer,
                customerContactId,
                customerPO,
                dueDate,
                images,
                note,
                tasks,
                track,
              };
              if(updatedJobLocation){
                newTicket.jobLocation = updatedJobLocation;
              } else {
                newTicket.jobLocation = null;
              }
              if(updatedJobSite){
                newTicket.jobSite = updatedJobSite;
              } else {
                newTicket.jobSite = null;
              }
              return newTicket;
            }
            return ticket
          });
          setServiceTicketDispatcher(updatedTickets)
        }
      },
      'type': modalTypes.EDIT_TICKET_MODAL
    };
    openModalHandler(modalDataAction)
  }

  const openDetailJobModal = (job: any) => {
    const modalDataAction = {
      'data': {
        job: job,
        modalTitle: '',
        removeFooter: true,
        maxHeight: '100%',
      },
      'type': modalTypes.VIEW_JOB_MODAL
    };
    openModalHandler(modalDataAction)
  };

  const openViewTicketModal = async(ticket: any) => {
    let data = {...ticket, images: []};
    try {
      const {status, serviceTicket} = await getServiceTicketDetail(ticket._id);
      if (status === 1) {
        data = serviceTicket;
      }
    } catch (e) {
    }
    const modalDataAction = {
      'data': {
        'job': data,
        'modalTitle': '',
        'removeFooter': true,
      },
      'type': modalTypes.VIEW_SERVICE_TICKET_MODAL
    }
    openModalHandler(modalDataAction);
  };

  const openViewJobRequestModal = async(jobRequest: any) => {
    const modalDataAction = {
      data: {
        jobRequest: jobRequest,
        removeFooter: false,
        maxHeight: '100%',
        modalTitle: 'Job Request',
      },
      type: modalTypes.VIEW_JOB_REQUEST_MODAL,
    };
    openModalHandler(modalDataAction);
  };

  const closeInfo = () => {
    if (showInfo.inside) {
      setShowInfo({show: false, inside: true});
    } else {
      dispatchUnselectTicket();
    }
  }

  const scheduleDate = isTicket && !ticket.jobId ? ticket.dueDate : ticket.scheduleDate;

  const jobTime = () => {
    let text = '';
    if (ticket.scheduledStartTime) {
      text += formatTime(ticket.scheduledStartTime);
      if (ticket.scheduledEndTime) {
        text += ' - ' + formatTime(ticket.scheduledEndTime);
      }
    } else {
      text += ' N/A';
    }
    return text;
}
  interface Task {
    employeeType:boolean;
    contractor?: {
      info: {
        companyName: string;
        companyEmail: string,
        displayName: string,
      };
    };
    technician?: {
      profile: {
        displayName: string;
      }
    }
  }

  const techs = ticket.tasks.map((task:Task):string=>{
    let tech = '';
    if(task.employeeType && task.contractor){
      tech = `${task.contractor.info.displayName ? task.contractor.info.displayName : task.contractor.info.companyName} (${task.contractor.info.companyEmail})`;
    } else if(task.technician){
      tech = `${task.technician.profile.displayName}`
    }
    return tech
  })

  return <div
    className={classes.marker}
    style={{zIndex: showInfo.show ? 10 : 1}}
    //onMouseLeave={() => setShowinfo(false)}
  >
    {(() => {
      const status = isTicket && !ticket.jobId
        ? ticket?.ticketId
          ? -1
          : -2
        : ticket?.status;
      CustomIcon = getStatusIcon(status);
    })()}
    <span
      id={id}
      style={{
        border: calculateMarkerBorder(ticket),
        borderRadius: '50%',
        width: 25,
        height: 25,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={(e) => setShowInfo({ show: true, inside: true })}>
      <CustomIcon />
    </span>
    {showInfo.show && <div
      className={`${classes.markerPopup} marker_dropdown elevation-4`}
      style={{
        'width': '270px',
      }}>
      <div className={'action-container'}>
        <IconButton className={'no-padding'} onClick={closeInfo}>
          <CloseIcon style={{color: '#BDBDBD'}}/>
        </IconButton>
      </div>
      <div className={'title-container'}>
          <CustomIcon style={{
            border: calculateMarkerBorder(ticket),
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}/>
        <span>{title}</span>
        <span style={{
            marginLeft: 5,
            marginTop: 5,
            height: "10px",
            width: "10px",
            backgroundColor: ticket.isHomeOccupied ? OCCUPIED_GREEN : NON_OCCUPIED_GREY,
            borderRadius: "50%",
            display: "flex", 
            justifyContent: 'center',
            alignItems: 'center',
          }}></span>
      </div>
      <span className={'company'}>
        {ticket.jobLocation && ticket.jobLocation.name ? ticket.jobLocation.name : ` `}
      </span>
      <hr />
      <div className={'date-container'}>
        <span>Description</span>
        <div style={{display: 'flex', alignItems: 'center'}}>
            <span className={'date'}>
              {scheduleDate ? formatDate(scheduleDate) : ''}
            </span>
          <InfoIcon
            className={'info-button'}
            onClick={() => isTicket && !ticket.jobId
              ? ticket?.ticketId
                ? openViewTicketModal(ticket)
                : openViewJobRequestModal(ticket)
              : openDetailJobModal(ticket)}
          />
        </div>
      </div>
      <span className={'note'}>
        {notes}
      </span>
      {!isTicket &&
      <span className={'note'}><strong>Suggested Time: </strong>{jobTime()}</span>
      }
      {techs.map((tech:string, index:number) => (
        <div key={index}>
          <span><strong>{tech}</strong></span>
        </div>
      ))}
      {isTicket && ticket.customer?._id && !ticket.jobId &&
        <div className={'button-wrapper-ticket'}>
          <div>
            {ticket?.ticketId && <Button disabled={streamingTickets && !!localStorage.getItem('afterCancelJob')} onClick={() => openEditTicketModal(ticket)}>Edit Ticket</Button>}
          </div>
          <div>
            <Button onClick={() => openCreateJobModal()}>Create Job</Button>
          </div>
        </div>
      }
    </div>}
  </div>
}


export default withStyles(
  styles,
  { 'withTheme': true }
)(BCMapMarker);
