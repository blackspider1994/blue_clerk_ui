import * as CONSTANTS from '../../../constants';
import styled from 'styled-components';
import { AppBar, Grid, List, ListItem, Tab, Tabs, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';


interface BCSidebarProps {
  children?: React.ReactNode;
  setContentGrid?: Function;
  isMobile: boolean
}


function a11yProps(index: any) {
  return {
    'id': `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  };
}

const tabStyles = makeStyles(theme => ({
  'root': {
    'flexGrow': 1,
    'width': '100%',
    'textTransform': 'capitalize'
  },
  'link': {
    'textTransform': 'none'
  }
}));


function ScrollableTabs({ items, pathName, onClickLink, nestedRouteKey }: any) {
  const classes = tabStyles();

  return (
    <div className={classes.root}>
      <AppBar
        color={'default'}
        position={'static'}>
        <Tabs
          aria-label={'scrollable auto tabs example'}
          indicatorColor={'primary'}
          scrollButtons={'on'}
          textColor={'primary'}
          value={pathName}
          variant={'scrollable'}>
          {items && items.map((item: any, idx: number) => {
              let mainPath = pathName.split("/main/")[1]; // eslint-disable-line
            if (mainPath) {
                mainPath = mainPath.split("/")[0]; // eslint-disable-line
            } else {
              mainPath = 'dashboard';
            }
            return item.link.startsWith(`/main/${mainPath}`) &&
              <Tab
                classes={{ 'root': classes.link }}
                component={Link}
                key={item?.link}
                label={item?.label}
                to={item?.link}
                value={item?.link}
                {...a11yProps(idx)}
              />;
          })}
        </Tabs>
      </AppBar>
    </div>
  );
}

function BCSidebar({ children, setContentGrid, isMobile }: BCSidebarProps) {
  const history = useHistory();
  const location = useLocation();
  const pathName = location.pathname;
  const nestedRouteKey = localStorage.getItem('nestedRouteKey');
  const LINK_DATA = [
    {
      'label': 'Customer List',
      'link': '/main/customers'
    },
    {
      'label': 'New Customer',
      'link': '/main/customers/new-customer'
    },
    {
      'label': 'Schedule/Jobs',
      'link': '/main/customers/schedule'
    },
    {
      'label': 'Map View',
      'link': '/main/customers/ticket-map-view'
    },
    {
      'label': 'Job Reports',
      'link': '/main/customers/job-reports'
    },
    /*
     * {
     *   'label': "Todo's",
     *   'link': '/main/invoicing/todos'
     * },
     */
    {
      'label': 'Invoices',
      'link': '/main/invoicing/invoices-list'
    },
    {
      'label': 'Purchase Order',
      'link': '/main/invoicing/purchase-order'
    },
    {
      'label': 'Estimates',
      'link': '/main/invoicing/estimates'
    },
    {
      'label': 'Billing',
      'link': '/main/admin/billing'
    },
    {
      'label': 'Brands',
      'link': '/main/admin/brands'
    },
    {
      'label': 'Company Profile',
      'link': '/main/admin/company-profile'
    },
    {
      'label': 'Employees',
      'link': '/main/admin/employees'
    },
    {
      'label': 'Equipment Type',
      'link': '/main/admin/equipment-type'
    },
    {
      'label': 'Groups',
      'link': '/main/admin/groups'
    },
    {
      'label': 'Invoicing',
      'link': '/main/admin/invoicing'
    },
    {
      'label': 'Job Types',
      'link': '/main/admin/job-types'
    },
    {
      'label': 'Report Number',
      'link': '/main/admin/report-number'
    },
    {
      'label': 'Roles/Permissions',
      'link': '/main/admin/roles-permissions'
    },
    {
      'label': 'Vendors',
      'link': '/main/admin/vendors'
    },
    // {
    //   'label': 'Payroll',
    //   'link': '/main/admin/payroll'
    // },
    {
      'label': 'Integrations',
      'link': '/main/admin/integrations'
    },
    {
      'label': 'Groups',
      'link': '/main/employees/group'
    },
    {
      'label': 'Technicians',
      'link': '/main/employees/technician'
    },
    {
      'label': 'Managers',
      'link': '/main/employees/managers'
    },
    {
      'label': 'Office Admin',
      'link': '/main/employees/office-admin'
    },
    {
      'label': 'Company Inventory',
      'link': '/main/inventory'
    },
    {
      'label': 'Purchased Tag',
      'link': '/main/tags/purchasedtag'
    },
    {
      'label': 'Buy Blue Tag',
      'link': '/main/tags/bluetag'
    },
    {
      'label': 'Profile',
      'link': '/main/user/view-profile'
    },
    {
      'label': 'Change Password',
      'link': '/main/user/change-password'
    },
    {
      'label': 'Email Preferences',
      'link': '/main/user/email-preference'
    }
  ];

  const withSidebar = !['/main/dashboard', '/main/notifications'].includes(pathName);

  useEffect(() => {
    if (withSidebar) {
      const gridSize = isMobile ? 12 : 10;

      setContentGrid &&
        setContentGrid({
          'lg': gridSize,
          'md': gridSize,
          'sm': gridSize
        });
    } else {
      setContentGrid &&
        setContentGrid({
          'lg': 12,
          'md': 12,
          'sm': 12
        });
    }
  }, [location, isMobile]);

  const onClickLink = (strLink: string): void => {
    history.push(strLink);
  };

  return withSidebar
    ? <Grid
      id={'navbar-container'}
      item
      lg={2}
      md={2}
      sm={12}
      style={{ 'padding': 0 }}
      xl={1}
      xs={12}>
      {isMobile
        ? <ScrollableTabs
          items={LINK_DATA}
          nestedRouteKey={nestedRouteKey}
          onClickLink={onClickLink}
          pathName={pathName}
        />
        : <ComponentContainer>
          <StyledList aria-label={'customers sidebar list'}>
            {LINK_DATA.map((item: any, idx: number) => {
              let mainPath = pathName.split("/main/")[1]; // eslint-disable-line
              if (mainPath) {
                mainPath = mainPath.split("/")[0]; // eslint-disable-line
              } else {
                mainPath = 'dashboard';
              }
              return item.link.startsWith(`/main/${mainPath}`)
                ? <StyledListItem
                  button
                  key={idx}
                  onClick={() => onClickLink(item.link)}
                  selected={
                    pathName === item.link ||
                    pathName === `${item.link}/${nestedRouteKey}`
                  }>
                  {item.label}
                </StyledListItem>
                : null;
            })}
          </StyledList>
        </ComponentContainer>}
    </Grid>
    : null;
}

const ComponentContainer = styled.div`
  margin-left: 0;
  flex: 0 0 ${CONSTANTS.SIDEBAR_WIDTH}px;
  background-color: ${CONSTANTS.PRIMARY_WHITE};
  transition: all 0.3s ease-in-out;
  position: fixed;
  height: 100%;
  z-index: 1;
  width: 185px;
`;

const StyledList = styled(List)``;

const StyledListItem = styled(ListItem)`
  font-size: 16px;
  line-height: 20px;
  height: 40px;
  color: #000;
  &.Mui-selected {
    background-color: #c4c4c4;
  }
`;

export default BCSidebar;
