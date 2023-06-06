import BCTableContainer from '../../components/bc-table-container/bc-table-container';
import BCTabs from '../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import styles from './customer.styles';
import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  withStyles
} from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import {
  getCustomerDetailAction,
  getCustomers,
  loadingCustomers,
  loadingSingleCustomers,
  setKeyword
} from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import BCQbSyncStatus from "../../components/bc-qb-sync-status/bc-qb-sync-status";

function CustomersPage({ classes }: any) {
  const dispatch = useDispatch();
  const {loading, data, keyword} = useSelector((state: any) => state.customers);
  const [curTab, setCurTab] = useState(0);

  const history = useHistory();
  const location = useLocation<any>();
  const locationState = location.state;

  const prevPage =
    locationState && locationState.prevPage ? locationState.prevPage : null;
  const [showCustomer, setShowCustomer] = useState(prevPage?.showCustomer || 'active');
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });

  const columns: any = [
    {
      'Header': 'Name',
      'accessor': 'profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Phone',
      'accessor': 'contact.phone',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Email',
      'accessor': 'info.email',
      'className': 'font-bold',
      'sortable': true
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
      'sortable': true
    },
    {
      Cell({ row }: any) {
        return (
          <BCQbSyncStatus data={row.original} />
        );
      },
      'id': 'qbSync',
      'sortable': false,
      'width': 30
    }
  ];

  const resetLocationState = () => {
    window.history.replaceState({}, document.title)
  }

  useEffect(() => {
    dispatch(setKeyword(''));
    window.addEventListener("beforeunload", resetLocationState);
    return () => {
      window.removeEventListener("beforeunload", resetLocationState);
    };
  }, []);

  useEffect(() => {
    if(location?.state?.currentPage?.search){
      dispatch(setKeyword(location.state.currentPage.search));
    }
  }, [location]);

  useEffect(() => {
    const active = showCustomer === 'inactive' ? false : true;
    const inactive = showCustomer === 'active' ? false : true;
    dispatch(loadingCustomers());
    dispatch(getCustomers(active, inactive));
  }, [showCustomer]);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const handleRowClick = (event: any, row: any) => renderViewMore(row);

  const renderViewMore = (row: any) => {
    const baseObj = row.original;
    let customerName =
      baseObj.profile && baseObj.profile !== undefined
        ? baseObj.profile.displayName
        : 'N/A';
    const customerId = row.original._id;
    const customerObj:any = { customerName,
      customerId,
      currentPage: {...currentPage, showCustomer, search: keyword} };
      if(location?.state?.prevPage?.search){
      customerObj.currentPage.search = location.state.prevPage.search
    }
    customerName =
      customerName !== undefined
        ? customerName.replace(/[\/ ]/g, '')
        : 'customername';
    localStorage.setItem('nestedRouteKey', `${customerName}`);
    dispatch(loadingSingleCustomers());
    dispatch(getCustomerDetailAction(customerObj));
    history.push({
      'pathname': `customers/${customerName}`,
      'state': customerObj
    });
  };

  function Toolbar() {
    return <div style={{display: 'flex', alignItems: 'center'}}>
      <strong style={{fontSize: 16}}>{'Show:'}&nbsp;</strong>
      <FormControl variant="standard" style={{minWidth: 80}}>
        <Select
          labelId="location-status-label"
          id="location-status-select"
          value={showCustomer}
          label="Age"
          onChange={(event: any) => setShowCustomer(event.target.value)}
        >
          <MenuItem value={'active'}>Active Customers</MenuItem>
          <MenuItem value={'inactive'}>Inactive Customers</MenuItem>
          <MenuItem value={'all'}>All Customers</MenuItem>
        </Select>
      </FormControl>
    </div>
  }

  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
          <BCTabs
            curTab={curTab}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            tabsData={[
              {
                'label': 'Customer List',
                'value': 0
              }
              /*
               * {
               *   label: "Recent Activities",
               *   value: 1,
               * },
               */
            ]}
          />
          <SwipeableViews index={curTab}>
            <div
              className={classes.dataContainer}
              hidden={curTab !== 0}
              id={'0'}>
              <BCTableContainer
                columns={columns}
                currentPage={currentPage}
                isLoading={loading}
                isPageSaveEnabled
                onRowClick={handleRowClick}
                search
                setPage={setCurrentPage}
                tableData={data}
                toolbarPositionLeft={true}
                toolbar={Toolbar()}
                setKeywordFunction={(query: string) => {
                  dispatch(setKeyword(query));
                }}
              />
            </div>
            <div
              hidden={curTab !== 1}
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

export default withStyles(styles, { 'withTheme': true })(CustomersPage);
