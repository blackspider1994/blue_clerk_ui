import React, { useEffect } from 'react';
import styles from './dashboard.styles';
import styled from 'styled-components';
import { Fab, Grid, withStyles } from '@material-ui/core';
import BCButtonDashboard from 'app/components/bc-button-dashboard/bc-button-dashboard';
import BCTableDashboard from 'app/components/bc-table-dashboard/bc-table-dashboard';
import CustomersIcon from 'assets/img/icons/dashboard/Customers';
import JobsIcon from 'assets/img/icons/dashboard/Jobs';
import TicketsIcon from 'assets/img/icons/dashboard/Tickets';
import { useHistory } from 'react-router-dom';
import {
  getVendorDetailAction,
  getVendors,
  loadingSingleVender,
  loadingVendors
} from 'actions/vendor/vendor.action';
import { useDispatch, useSelector } from 'react-redux';
import {
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../constants';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { DivisionParams } from 'app/models/division';

interface RowStatusTypes {
  row: {
    original: {
      status: number;
    };
  };
}

interface StatusTypes {
  status: number;
}

function DashboardPage({ classes }: any): JSX.Element {
  const dispatch = useDispatch();
  const vendors = useSelector((state: any) => state.vendors);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const history = useHistory();

  const buttonLinks = [
    {
      'text': 'Customers',
      'icon': <CustomersIcon className={classes.icons} />,
      'link': '/main/customers'
    },
    {
      'text': 'Jobs',
      'icon': <JobsIcon
        fill={'#fff'}
        height={25}
        width={25}
      />,
      'link': '/main/customers/schedule/jobs'
    },
    {
      'text': 'Tickets',
      'icon': <TicketsIcon className={classes.icons} />,
      'link': '/main/customers/ticket-map-view'
    }
  ];

  function RenderStatus({ status }: StatusTypes) {
    const statusValues = ['Pending', 'Accepted', 'Cancelled', 'Rejected', 'Finished'];
    const classNames = [classes.statusPendingText, classes.statusConfirmedText, classes.cancelledText, classes.cancelledText, classes.finishedText];
    const circleClassNames = [classes.statusPendingCircle, classes.statusConfirmedCircle, classes.cancelledCircle, classes.cancelledCircle, classes.finishedCircle];
    const textStatus = statusValues[status];
    return (
      <div
        className={`${classes.Text} ${classNames[status]}`}>
        <div
          className={
            `${classes.statusCircle} ${circleClassNames[status]}`
          }
        />
        <div className={classes.statusText}>
          {textStatus}
        </div>
      </div>
    );
  }

  const renderViewMore = (row: any) => {
    const baseObj = row.original;
    let vendorCompanyName =
      baseObj.contractor.info &&
      baseObj.contractor.info.companyName !== undefined
        ? baseObj.contractor.info.companyName
        : 'N/A';
    const vendorId = baseObj.contractor._id;
    const vendorObj = { vendorCompanyName,
      vendorId };
    vendorCompanyName =
      vendorCompanyName !== undefined
        ? vendorCompanyName.replace(/[\/ ]/g, '')
        : 'vendorName';

    localStorage.setItem('nestedRouteKey', `${vendorCompanyName}`);

    dispatch(loadingSingleVender());
    dispatch(getVendorDetailAction(vendorId));

    history.push({
      'pathname': `/main/admin/vendors/${vendorCompanyName}`,
      'state': {
        ...vendorObj
      }
    });
  };

  const columns: any = [
    {
      'Header': 'Company Name',
      'accessor': 'contractor.info.companyName',
      'className': 'font-bold',
      'sortable': true,
      Cell({ row }: any) {
        return (
          <div className={classes.textTable}>
            {row.original?.contractor?.info?.companyName}
          </div>
        );
      }
    },
    {
      Cell({ row }: RowStatusTypes) {
        return <RenderStatus status={row.original.status} />;
      },
      'Header': 'Status',
      'accessor': 'status',
      'className': 'font-bold',
      'sortable': true
    }
  ];

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || currentDivision.isDivisionFeatureActivated && (currentDivision.params?.workType || currentDivision.params?.companyLocation || currentDivision.data?.name == 'All')) {
      dispatch(loadingVendors());
      let divisionParams: any = {};
      if (currentDivision.data?.name != 'All') {
        divisionParams = { 'workType': currentDivision.data?.workTypeId,
          'companyLocation': currentDivision.data?.locationId };
      }
      dispatch(getVendors(divisionParams));
    }
  }, [currentDivision.isDivisionFeatureActivated, currentDivision.data]);

  const openVendorModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Add Vendor',
        'removeFooter': false
      },
      'type': modalTypes.ADD_VENDOR_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  return (

    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div
          className={classes.pageContent}
          style={{ 'overflow': 'hidden' }}>
          <Grid
            className={classes.dashboardContainer}
            container
            direction={'column'}
            spacing={8} >
            <Grid
              item
              xs={12}>
              <Grid
                container
                justify={'center'}
                spacing={4}>
                {
                  buttonLinks.map((button:any, linkIdx: number) => {
                    const { text, icon, link } = button;
                    return (
                      <Grid
                        key={linkIdx}
                        item
                        md={3}
                        sm={4}
                        xs={12} >
                        <BCButtonDashboard
                          icon={icon}
                          onClick={() => history.push(link)}
                          text={text}
                        />
                      </Grid>
                    );
                  })}
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}>
              <Grid
                container
                justify={'center'}
                spacing={10}>
                <Grid
                  item
                  lg={9}
                  md={9}
                  sm={12}
                  xs={12}>
                  <BCTableDashboard
                    click={() => openVendorModal()}
                    columns={columns}
                    isLoading={vendors.loading}
                    onRowClick={(row: any) => renderViewMore(row)}
                    tableData={vendors.data.filter((vendor: any) => vendor.status <= 1)}
                    text={'Vendors'}
                    textButton={'Invite Vendor'}
                  />
                </Grid>

              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

const DashboardContainer = styled.div`
  padding: '3rem 0';
`;

export default withStyles(styles, { 'withTheme': true })(DashboardPage);
