import BCTableContainer from '../../../components/bc-table-container/bc-table-container';
import BCBackButtonNoLink from '../../../components/bc-back-button/bc-back-button-no-link';
import BCAdminCard from '../../../components/bc-admin-card/bc-admin-card';
import BCTabs from '../../../components/bc-tab/bc-tab';
import ReportsIcon from 'assets/img/icons/customers/Reports';
import JobsIcon from 'assets/img/icons/customers/Jobs';
import TicketsIcon from 'assets/img/icons/customers/Tickets';
import EquipmentIcon from 'assets/img/icons/customers/Equipment';
import SwipeableViews from 'react-swipeable-views';
import styles from './view-more.styles';
import {FormControl, Grid, MenuItem, Select, withStyles} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import CustomerInfoPage from './customer-info';
import { useLocation } from 'react-router-dom';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../constants';
import { getJobLocationsAction, loadingJobLocations } from 'actions/job-location/job-location.action';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import '../../../../scss/index.scss';
import { useHistory } from 'react-router-dom';
import CustomerContactsPage from './contacts/contacts';
import Pricing from './pricing/pricing';
import { loadTierListItems } from 'actions/invoicing/items/items.action';
import {CSButton, CSIconButton, useCustomStyles} from "helpers/custom";
import EditIcon from '@material-ui/icons/Edit';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

function ViewMorePage({ classes }: any) {
  const dispatch = useDispatch();
  const customStyles = useCustomStyles();
  const jobLocations = useSelector((state: any) => state.jobLocations);
  const customerState = useSelector((state: any) => state.customers);
  const location = useLocation<any>();
  const [showLocation, setShowLocation] = useState('active');
  const customerObject = location.state;
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);

  const prevPage = customerObject && customerObject.prevPage ? customerObject.prevPage : null;
  const filteredJobLocations = showLocation === 'all' ? jobLocations.data :
    jobLocations.data.filter((location: any) => showLocation === 'active' ? location.isActive : !location.isActive)
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });

  const renderJobSiteComponent = (jobLocation: any, customerState: any) => {
    const baseObj = customerState;
    let customerName =
      baseObj.profile && baseObj.profile !== undefined
        ? baseObj.profile.displayName
        : 'N/A';

/*    customerName =
      customerName !== undefined
        ? customerName.replace(/[\/ ]/g, '')
        : 'customername';*/

    const locationName = jobLocation.name;
    const locationNameLink = locationName !== undefined ? locationName.replace(/[\/ ]/g, '') : 'locationName';
    const linkKey: any = localStorage.getItem('nestedRouteKey');
    localStorage.setItem('prevNestedRouteKey', linkKey);
    localStorage.setItem('nestedRouteKey', `location/${locationNameLink}`);
    history.push({
      'pathname': `/main/customers/location/${locationNameLink}`,
      'state': {
        ...jobLocation,
        currentPage,
        customerName
      }
    });
  };


  const renderJobEquipmentButton = (customerState: any, link: string) => {
    const baseObj = customerState;
    let customerName =
      baseObj.profile && baseObj.profile !== undefined
        ? baseObj.profile.displayName
        : 'N/A';
    const customerId =
      baseObj._id && baseObj._id !== undefined
        ? baseObj._id
        : 'N/A';
    const customerObj = {
      ...customerObject,
      customerName,
      customerId
    };
    customerName =
      customerName !== undefined
        ? customerName.replace(/[\/ ]/g, '')
        : 'customername';
    let url = `${customerName}/job-equipment-info/${link}`;

    if (["tickets","jobs","reports"].includes(link)) {
      url = currentDivision.urlParams ? `${customerName}/job-equipment-info/${link}/${currentDivision.urlParams}` : `${customerName}/job-equipment-info/${link}`;
    }
    
    const linkKey: any = localStorage.getItem('nestedRouteKey');
    localStorage.setItem('prevNestedRouteKey', linkKey);
    localStorage.setItem('nestedRouteKey', url);
    history.push({
      'pathname': `/main/customers/${url}`,
      'state': customerObj
    });
  };

  const columns: any = [
    {
      'Header': 'Subdivision',
      'accessor': 'name',
      'className': 'font-bold',
      'sortable': true,
      'width': 50
    },
    {
      'Header': 'Street Address',
      'accessor': 'address',
      'Cell': function (row: any) {
        return (
          <div>
            <span>
              {`${row.value && row.value.street ? row.value.street : ''}` + ' '}
            </span>
            <span>
              {`${row.value && row.value.city ? row.value.city : ''}` + ' '}
            </span>
            <span>
              {`${row.value && row.value.state && row.value.state !== 'none' ? row.value.state : ''}` + ' '}
            </span>
            <span>
              {`${row.value && row.value.zipcode ? row.value.zipcode : ''}` + ' '}
            </span>
          </div>
        );
      },
      'className': 'font-bold',
      'sortable': true
    },

    {
      'Header': 'Latitude',
      'accessor': 'location.coordinates[1]',
      'className': 'font-bold',
      'sortable': false,
      'width': 40
    },
    {
      'Header': 'Longitude',
      'accessor': 'location.coordinates[0]',
      'className': 'font-bold',
      'sortable': false,
      'width': 40
    },
    {
      'Header': 'Status',
      'accessor': 'isActive',
      'Cell': function (row: any) {
        return (
          <div className={`${row.value ? '' : classes.inactiveStyle}`}>
            {`${row.value ? 'Active' : 'Inactive'}`}
          </div>
        );
      },
      'className': 'font-bold',
      'sortable': true,
      width: 40,
    },
    {
      'Cell'({ row }: any) {
        return (
          <CSButton
            color="primary"
            size="small"
            aria-label={'edit-job-location'}
            onClick={(e) => {
              e.stopPropagation();
              openLocationActivationModal(row.original);
            }}
          >
            {row?.original?.isActive ? 'Deactivate' : 'Activate'}
          </CSButton>
        );
      },
      'Header': 'Actions',
      'id': 'action-edit-job-location',
      'sortable': false,
      'width': 40,
    },
  ];

  useEffect(() => {
    if (jobLocations.refresh) {
      const obj: any = location.state;
      const { customerId } = obj;
      dispatch(loadingJobLocations());
      dispatch(getJobLocationsAction({customerId}));
    }
  }, [jobLocations.refresh]);

  useEffect(() => {
    const obj: any = location.state;
    const { customerId } = obj;
    dispatch(loadingJobLocations());
    dispatch(getJobLocationsAction({customerId}));
  }, [location.pathname]);

  useEffect(() => {
    if (customerObject.from === 1) {
      setCurTab(1);
    } else if (customerObject.from === 2) {
      setCurTab(2);
    }
  }, [customerObject]);

  useEffect(() => {
    dispatch(loadTierListItems.fetch());
  }, []);

  const handleTabChange = (newValue: number) => {
    const state = {
      ...customerObject,
      'from': newValue
    };

    history.replace({ ...history.location,
      state });
    setCurTab(newValue);
  };

  const openLocationActivationModal = (row: any) => {
    dispatch(setModalDataAction({
      'data': {
        'locationObj': row,
        'modalTitle': '',
        'removeFooter': false
      },
      'type': modalTypes.ACTIVATE_JOB_LOCATION
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const openJobLocationModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'locationObj': customerObject,
        'modalTitle': 'New Subdivision',
        'removeFooter': false
      },
      'type': modalTypes.ADD_JOB_LOCATION
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const handleRowClick = (event: any, row: any) =>
    renderJobSiteComponent(row.original, customerState.customerObj);

  const handleBackButtonClick = () => {
    history.push({
      'pathname': '/main/customers',
      'state': {
        'prevPage': location.state.currentPage
      }
    });
  }

  function Toolbar() {
    return <div style={{display: 'flex', alignItems: 'center'}}>
      <strong style={{fontSize: 16}}>{'Show:'}&nbsp;</strong>
      <FormControl variant="standard" style={{minWidth: 80}}>
        <Select
          labelId="location-status-label"
          id="location-status-select"
          value={showLocation}
          label="Age"
          onChange={(event: any) => setShowLocation(event.target.value)}
        >
          <MenuItem value={'active'}>Active Subdivisions</MenuItem>
          <MenuItem value={'inactive'}>Inactive Subdivisions</MenuItem>
          <MenuItem value={'all'}>All Subdivisions</MenuItem>
        </Select>
      </FormControl>
    </div>
  }

  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>

          <Grid container>
            <BCBackButtonNoLink
              func={handleBackButtonClick}
            />

            <div className={'tab_wrapper'}>
              <BCTabs
                curTab={curTab}
                indicatorColor={'primary'}
                onChangeTab={handleTabChange}
                tabsData={[
                  {
                    'label': 'CUSTOMER INFO',
                    'value': 0
                  },
                  {
                    'label': 'JOB/EQUIPMENT INFO',
                    'value': 1
                  },
                  {
                    'label': 'CONTACTS',
                    'value': 2
                  },
                  {
                    'label': 'PRICING',
                    'value': 3
                  }
                ]}
              />
            </div>
          </Grid>

          {
            customerState.loading ? <BCCircularLoader heightValue={'200px'} />
              : <SwipeableViews
                className={'swipe_wrapper'}
                index={curTab}>
                <div
                  className={`${classes.dataContainer} `}
                  hidden={curTab !== 0}
                  id={'0'}>
                  <PageContainer className={'info_wrapper alignAddJobLocation'}>
                    <CustomerInfoPage customerObj={customerObject} />
                    <CSButton
                      aria-label={'delete'}
                      color={'primary'}
                      onClick={() => openJobLocationModal()}
                      variant={'contained'}>
                      {'Add Subdivision'}
                    </CSButton>
                  </PageContainer>

                  <BCTableContainer
                    columns={columns}
                    cellSize={"medium"}
                    currentPage={currentPage}
                    initialMsg={'There are no Subdivisions!'}
                    isLoading={jobLocations.loading}
                    onRowClick={handleRowClick}
                    search
                    searchPlaceholder={'Search Subdivisions...'}
                    setPage={setCurrentPage}
                    tableData={filteredJobLocations}
                    toolbarPositionLeft={true}
                    toolbar={Toolbar()}
                  />
                </div>

                <div
                  hidden={curTab !== 1}
                  id={'1'}
                  style={{
                    'padding': '40px'
                  }}>

                  <Grid
                    container
                    spacing={5}>
                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Reports'}
                        color={'primary'}
                        func={() => renderJobEquipmentButton(customerState.customerObj, 'reports')}>
                        <ReportsIcon />
                      </BCAdminCard>
                    </Grid>

                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Jobs'}
                        color={'secondary'}
                        func={() => renderJobEquipmentButton(customerState.customerObj, 'jobs')}>
                        <JobsIcon />
                      </BCAdminCard>
                    </Grid>

                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Tickets'}
                        color={'info'}
                        func={() => renderJobEquipmentButton(customerState.customerObj, 'tickets')}>
                        <TicketsIcon />
                      </BCAdminCard>
                    </Grid>

                    <Grid
                      item>
                      <BCAdminCard
                        cardText={'Equipment'}
                        color={'primary-red'}
                        func={() => renderJobEquipmentButton(customerState.customerObj, 'equipment')}>
                        <EquipmentIcon />
                      </BCAdminCard>
                    </Grid>
                  </Grid>
                </div>


                <div
                  className={`${classes.dataContainer} `}
                  hidden={curTab !== 2}
                  id={'2'}
                  style={{
                    'marginTop': '20px'
                  }}>

                  <CustomerContactsPage
                    id={location.state.customerId}
                    type={'Customer'}
                  />
                </div>
                <div
                  className={`${classes.dataContainer} `}
                  hidden={curTab !== 3}
                  id={'3'}
                  style={{
                    'marginTop': '20px'
                  }}>

                  <Pricing customer={customerState.customerObj} />
                </div>
              </SwipeableViews>
          }
        </div>
      </div>
    </div>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 0px;
  padding-right: 65px;
  margin: 0 auto;
`;
export default withStyles(
  styles,
  { 'withTheme': true }
)(ViewMorePage);
