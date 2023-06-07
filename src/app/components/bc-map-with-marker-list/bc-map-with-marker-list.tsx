import { useRef, useState, useEffect } from 'react';
import useSupercluster from "use-supercluster";
import GoogleMapReact from 'google-map-react';
import styles from './bc-map-with-marker-list.style';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { bcMapStyle } from './bc-map-style';
import {IconButton} from '@material-ui/core';
import CloseIcon from "@material-ui/icons/Close";

import './bc-map-with-marker.scss';
import BCMapMarker from "../bc-map-marker/bc-map-marker";
import {DEFAULT_COORD} from "../../../utils/constants";
import {
  getJobTypesFromJob,
  getJobTypesFromTicket,
  getJobTypesTitle
} from "../../../helpers/utils";
import {ReactComponent as IconStarted} from "../../../assets/img/icons/map/icon-started.svg";
import {ReactComponent as IconCompleted} from "../../../assets/img/icons/map/icon-completed.svg";
import {ReactComponent as IconCancelled} from "../../../assets/img/icons/map/icon-cancelled.svg";
import {ReactComponent as IconRescheduled} from "../../../assets/img/icons/map/icon-rescheduled.svg";
import {ReactComponent as IconPaused} from "../../../assets/img/icons/map/icon-paused.svg";
import {ReactComponent as IconIncomplete} from "../../../assets/img/icons/map/icon-incomplete.svg";
import {ReactComponent as IconPending} from "../../../assets/img/icons/map/icon-pending.svg";
import {ReactComponent as IconJobRequest} from "../../../assets/img/icons/map/icon-job-request.svg";
import {ReactComponent as IconOpenServiceTicket} from "../../../assets/img/icons/map/icon-open-service-ticket.svg";
import { AM_COLOR, OCCUPIED_ORANGE, PM_COLOR } from "../../../constants";
interface BCMapWithMarkerListProps {
  reactAppGoogleKeyFromConfig: string;
  list: any;
  classes: any;
  lat?: any;
  lng?: any;
  showPins?: boolean;
  isTicket?: boolean;
  streamingTickets: boolean;
  selected: any;
  coordinates: any;
  tickets?: any[];
  dispatchUnselectTicket?: any;
  openModalHandler?: (modalDataAction:any) => void;
  openEditTicketModalPrepDispatcher?: (reqObj:any) => void;
  setServiceTicketDispatcher?: (updatedTickets:any) => void;
  getServiceTicketDetail?: any;
  getJobLocation?: any;
  getJobSite?: any;
  selectedTechnician?: {name: string;id: string}[];
  technicianColorCode?: any;
}
function createMapOptions() {
  return {
    styles: bcMapStyle,
    'gestureHandling': 'greedy'
  };
}

const Marker = ({ children } : any) => children;

const superClusterOptions = {
  radius: 75,
  maxZoom: 15,
  map: (props:any) => ({
    includeTicket: !!props.ticket?.ticketId,
    includeRequest: !!props.ticket?.requestId,
    includeJob: !!props.ticket?.jobId,
    isHomeOccupied: !!props.ticket?.isHomeOccupied,
    scheduleTimeAMPM: props.ticket?.scheduleTimeAMPM || 0,
  }),
  reduce: (acc:any, props:any) => {
    if(!!props.includeTicket) {
      acc.includeTicket = true;
    }
    if(!!props.includeRequest) {
      acc.includeRequest = true;
    }
    if(!!props.includeJob) {
      acc.includeJob = true;
    }
  },
}

const calculateColor = (cluster:any) => {
  if(cluster.properties?.includeRequest){
    return '#970505'
  }
  if(cluster.properties?.includeTicket){
    return '#2477FF'
  }
  return cluster.properties?.isHomeOccupied ? OCCUPIED_ORANGE : 'rgb(130,130,130)'
}
const calculateBorder = (cluster:any) => {
  if(cluster.properties?.includeJob){
    if(cluster.properties?.scheduleTimeAMPM !== 0) {
      switch(cluster.properties?.scheduleTimeAMPM) {
        case 1: return `3px solid ${AM_COLOR}`; 
        case 2: return `3px solid ${PM_COLOR}`;
        default: return '3px solid black';
      }
    }
    return '3px solid black'
  }
  if(cluster.properties?.includeTicket){
    return cluster.properties?.isHomeOccupied ? `3px solid ${OCCUPIED_ORANGE}` : '3px solid #2477FF';
  }
  if(cluster.properties?.includeRequest){
    return '3px solid #970505'
  }
  return '3px solid rgb(130,130,130)'
}

const calculateMarkerBorder = (ticket : any, isTicket : boolean, technicianColor : string) : string => {
  if(!isTicket && ticket.jobId?.length > 0) {
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
    return `3px solid ${technicianColor}`;
  }
  else {
    return ticket?.isHomeOccupied ? `3px solid ${OCCUPIED_ORANGE}` : 'none';
  }
}

function BCMapWithMarkerWithList({
  reactAppGoogleKeyFromConfig,
  classes,
  list,
  isTicket = false,
  showPins,
  streamingTickets,
  selected,
  coordinates,
  tickets = [],
  dispatchUnselectTicket = ()=>{},
  openModalHandler = ()=>{},
  openEditTicketModalPrepDispatcher = ()=>{},
  setServiceTicketDispatcher = ()=>{},
  getServiceTicketDetail = ()=>{},
  getJobLocation = ()=>{},
  getJobSite = ()=>{},
  selectedTechnician = [],
  technicianColorCode = {},
}: BCMapWithMarkerListProps) {
  const mapRef = useRef<any>();
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(11);
  const locationCoordinate = useRef<any>({});
  const overlappingCoordinates = useRef<any>([]);
  const [_, setRefresh] = useState(0);

  let centerLat = coordinates?.lat || DEFAULT_COORD.lat;
  let centerLng = coordinates?.lng || DEFAULT_COORD.lng;

  // if (selected._id !== '') {
  //   if (selected.jobSite) {
  //     centerLat = selected.jobSite.location && selected.jobSite.location.coordinates && selected.jobSite.location.coordinates[1] ? selected.jobSite.location.coordinates[1] : centerLat;
  //     centerLng = selected.jobSite.location && selected.jobSite.location.coordinates && selected.jobSite.location.coordinates[0] ? selected.jobSite.location.coordinates[0] : centerLng;
  //     centerLat -= 0.004;
  //     centerLng += 0.002;
  //   } else if (selected.jobLocation) {
  //     centerLat = selected.jobLocation.location && selected.jobLocation.location.coordinates && selected.jobLocation.location.coordinates[1] ? selected.jobLocation.location.coordinates[1] : centerLat;
  //     centerLng = selected.jobLocation.location && selected.jobLocation.location.coordinates && selected.jobLocation.location.coordinates[0] ? selected.jobLocation.location.coordinates[0] : centerLng;
  //     centerLat -= 0.004;
  //     centerLng += 0.002;
  //   } else if (selected.customer) {
  //     centerLat = selected.customer.location && selected.customer.location.coordinates && selected.customer.location.coordinates[1] ? selected.customer.location.coordinates[1] : centerLat;
  //     centerLng = selected.customer.location && selected.customer.location.coordinates && selected.customer.location?.coordinates[0] ? selected.customer.location.coordinates[0] : centerLng;
  //     centerLat -= 0.004;
  //     centerLng += 0.002;
  //   }
  // }

  useEffect(() => {
    if(mapRef.current){
      if (selected._id) {
        let lat = centerLat;
        let lng = centerLng;
        if (selected.jobSite && (selected.jobSite?.location?.coordinates[0] && selected.jobSite?.location?.coordinates[1])) {
          lat = selected.jobSite.location && selected.jobSite.location.coordinates && selected.jobSite.location.coordinates[1] ? selected.jobSite.location.coordinates[1] : lat;
          lng = selected.jobSite.location && selected.jobSite.location.coordinates && selected.jobSite.location.coordinates[0] ? selected.jobSite.location.coordinates[0] : lng;
          lat -= 0.002;
          lng += 0.002;
        } else if (selected.jobLocation && (selected.jobLocation?.location?.coordinates[0] && selected.jobLocation?.location?.coordinates[1])) {
          lat = selected.jobLocation.location && selected.jobLocation.location.coordinates && selected.jobLocation.location.coordinates[1] ? selected.jobLocation.location.coordinates[1] : lat;
          lng = selected.jobLocation.location && selected.jobLocation.location.coordinates && selected.jobLocation.location.coordinates[0] ? selected.jobLocation.location.coordinates[0] : lng;
          lat -= 0.002;
          lng += 0.002;
        } else if (selected.customer) {
          lat = selected.customer.location && selected.customer.location.coordinates && selected.customer.location.coordinates[1] ? selected.customer.location.coordinates[1] : lat;
          lng = selected.customer.location && selected.customer.location.coordinates && selected.customer.location?.coordinates[0] ? selected.customer.location.coordinates[0] : lng;
          lat -= 0.002;
          lng += 0.002;
        }
        mapRef.current.setZoom(16);
        mapRef.current.panTo({ lat, lng })
      }
    }
  }, [selected])

  const points = list.map((ticket: any) => {
    if(selected._id ===ticket._id && !isTicket){
      ticket.customer = selected.customer
    }
    let lat:any = centerLat;
    let lng:any = centerLng;
    if (ticket.jobSite && (ticket.jobSite?.location?.coordinates[0] && ticket.jobSite?.location?.coordinates[1])) {
      lat = ticket.jobSite.location && ticket.jobSite.location.coordinates && ticket.jobSite.location.coordinates[1] ? ticket.jobSite.location.coordinates[1] : centerLat;
      lng = ticket.jobSite.location && ticket.jobSite.location.coordinates && ticket.jobSite.location.coordinates[0] ? ticket.jobSite.location.coordinates[0] : centerLng;
    } else if (ticket.jobLocation && (ticket.jobLocation?.location?.coordinates[0] && ticket.jobLocation?.location?.coordinates[1])) {
      lat = ticket.jobLocation.location && ticket.jobLocation.location.coordinates && ticket.jobLocation.location.coordinates[1] ? ticket.jobLocation.location.coordinates[1] : centerLat;
      lng = ticket.jobLocation.location && ticket.jobLocation.location.coordinates && ticket.jobLocation.location.coordinates[0] ? ticket.jobLocation.location.coordinates[0] : centerLng;
    } else if (ticket.customer) {
      lat = ticket.customer.location && ticket.customer.location.coordinates && ticket.customer.location.coordinates[1] ? ticket.customer.location.coordinates[1] : centerLat;
      lng = ticket.customer.location && ticket.customer.location.coordinates && ticket.customer.location.coordinates[0] ? ticket.customer.location.coordinates[0] : centerLng;
    }
    return ({
      type: "Feature",
      properties: { cluster: false, ticketId: ticket._id, ticket },
      geometry: {
        type: "Point",
        coordinates: [
          parseFloat(lng),
          parseFloat(lat)
        ]
      },
    })
  });

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: superClusterOptions
  });

  useEffect(() => {
    locationCoordinate.current = {};
    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const ticket = cluster.properties.ticket;
      const {
        cluster: isCluster,
      } = cluster.properties;

      if (!isCluster) {
        const key = `${lat}~~~${lng}`;
        if (locationCoordinate.current[key] && locationCoordinate.current[key].length) {
          locationCoordinate.current[key].push({ lat, lng, ticket })
        } else {
          locationCoordinate.current[key] = [{ lat, lng, ticket }]
        }
      }
    })
    overlappingCoordinates.current = Object.values(locationCoordinate.current).filter((coordinates: any) => coordinates.length > 1)
    setRefresh(refresh => refresh + 1)
  }, [clusters])

  const OverlappingMarker = ({ data }: any) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    const toggleOverlay = () => {
      setIsOverlayOpen((prev) => !prev)
    }

    const handleItemClick = (_id: any) => {
      const marker = document.getElementById(`marker-${_id}`)
      if (marker) {
        marker.click();
        mapRef.current.setOptions({
          scrollwheel: true,
        });
        setIsOverlayOpen(false);
      }
    }

    return (
      <Marker>
        <div onClick={toggleOverlay} className={classes.markerBadge} style={{cursor: isTicket && streamingTickets ? 'wait' : 'pointer'}}>
          {data.length}
        </div>
        {isOverlayOpen && (
          <div
            onMouseEnter={(e) => {
              e.preventDefault();
              mapRef.current.setOptions({
                scrollwheel: false,
              });
            }}
            onMouseLeave={() => {
              mapRef.current.setOptions({
                scrollwheel: true,
              });
            }}
            className={classes.markerOverlayContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ paddingLeft: 10 }}>List of {isTicket ? 'Service Tickets/Job Requests' : 'Jobs'}</h3>
              <div className={'action-container'}>
                <IconButton className={'no-padding'} onClick={() => {
                  mapRef.current.setOptions({
                    scrollwheel: true,
                  });
                  setIsOverlayOpen(false);
                }}>
                  <CloseIcon style={{ color: '#BDBDBD' }} />
                </IconButton>
              </div>
            </div>
            {data.map((datum: any, idx: number) => {
              const title = getJobTypesTitle(isTicket ? getJobTypesFromTicket(datum.ticket) : getJobTypesFromJob(datum.ticket));
              const location = datum.ticket?.jobLocation && datum.ticket?.jobLocation?.name ? datum.ticket?.jobLocation.name : '';
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
              const status = isTicket && !datum.ticket?.jobId
              ? datum.ticket?.ticketId
                ? -1
                : -2
              : datum.ticket?.status;
              const CustomIcon = getStatusIcon(status);
              let  technicianColor:any;
              if (datum.ticket?.jobId) {
                technicianColor = technicianColorCode[selectedTechnician.findIndex((tech:{name:string;id:string}) => tech.id === datum.ticket.tasks[0].contractor?._id || tech.id === datum.ticket.tasks[0].technician._id)]
              }
              return (
                <div
                  key={idx}
                  className={classes.listItemContainer}
                  onClick={() => handleItemClick(datum.ticket._id)}
                >
                  <div>
                    <CustomIcon
                      style={{
                        marginRight: 5,
                        border: calculateMarkerBorder(datum.ticket, isTicket, technicianColor),
                        borderRadius: '50%',
                        width: 25,
                        height: 25,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    /> 
                  </div>
                  <div>{title}{title && location ? ' - ' : ''}{location}</div>
                </div>
              )
            })}
          </div>
        )}
      </Marker>
    )
  }

  return (
    <GoogleMapReact
      bootstrapURLKeys={{ 'key': reactAppGoogleKeyFromConfig }}
      center={{ 'lat': centerLat,
        'lng': centerLng }}
      defaultZoom={11}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={({ map }) => {
        mapRef.current = map;
      }}
      onChange={({ zoom, bounds }) => {
        setZoom(zoom);
        setBounds([
          bounds.nw.lng,
          bounds.se.lat,
          bounds.se.lng,
          bounds.nw.lat
        ]);
      }}
      options={createMapOptions}>
      {
        clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const ticket = cluster.properties.ticket;
          const {
            cluster: isCluster,
            point_count: pointCount
          } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                lat={lat}
                lng={lng}
              >
                <div
                  className={classes.clusterOutsideContainer}
                  style={{
                    backgroundColor: calculateColor(cluster),
                    border: calculateBorder(cluster),
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );
                    mapRef.current.setZoom(expansionZoom);
                    mapRef.current.panTo({ lat, lng });
                  }}
                >
                  <span
                    style={{
                      color: calculateColor(cluster),
                      marginTop: -40,
                      fontWeight: 'bold',
                    }}
                  >
                    {pointCount}
                  </span>
                </div>
              </Marker>
            );
          } else {
            let  technicianColor:any;
            if (ticket.jobId) {
              technicianColor = technicianColorCode[selectedTechnician.findIndex((tech:{name:string;id:string}) => tech.id === ticket.tasks[0].contractor?._id || tech.id === ticket.tasks[0].technician._id)]
            }

            return (
              <BCMapMarker
                key={`marker-${cluster.properties.ticketId}`}
                id={`marker-${cluster.properties.ticketId}`}
                lat={lat}
                lng={lng}
                ticket={ticket}
                isTicket={isTicket}
                streamingTickets={streamingTickets}
                tickets={tickets}
                selected={selected}
                dispatchUnselectTicket={dispatchUnselectTicket}
                openModalHandler={openModalHandler}
                openEditTicketModalPrepDispatcher={openEditTicketModalPrepDispatcher}
                setServiceTicketDispatcher={setServiceTicketDispatcher}
                getServiceTicketDetail={getServiceTicketDetail}
                getJobLocation={getJobLocation}
                getJobSite={getJobSite}
                technicianColor={technicianColor}
              />
            );
          }
        })
      }
      {overlappingCoordinates.current?.map((coordinate: any, idx: number) => {
        return <OverlappingMarker key={idx} data={coordinate} lat={coordinate[0].lat} lng={coordinate[0].lng} />
      })}
    </GoogleMapReact>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCMapWithMarkerWithList);
