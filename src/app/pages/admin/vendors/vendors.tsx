import BCTableContainer from './../../../components/bc-table-container/bc-table-container';
import BCTabs from './../../../components/bc-tab/bc-tab';
import Fab from '@material-ui/core/Fab';
import SwipeableViews from 'react-swipeable-views';
import { modalTypes } from '../../../../constants';
import styles from './vendors.styles';
import { Grid, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getVendors, loadingVendors, getVendorDetailAction } from 'actions/vendor/vendor.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

function AdminVendorsPage({ classes }: any) {
  const dispatch = useDispatch();
  const vendors = useSelector((state: any) => state.vendors);
  const [curTab, setCurTab] = useState(0);
  const history = useHistory();
  const columns: any = [
    {
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          {row.index + 1}
        </div>;
      },
      'Header': 'No#',
      'sortable': true,
      'width': 60
    },
    {
      'Header': 'Company Name',
      'accessor': 'contractor.info.companyName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Status',
      'accessor': 'status',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          <Fab
            aria-label={'delete'}
            classes={{
              'root': classes.fabRoot
            }}
            color={'primary'}
            onClick={() => renderViewMore(row)}
            variant={'extended'}>
            {'View More'}
          </Fab>
        </div>;
      },
      'id': 'action',
      'sortable': false,
      'width': 60
    }
  ];

  useEffect(() => {
    dispatch(loadingVendors());
    dispatch(getVendors());
  }, []);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const handleRowClick = (event: any, row: any) => {
    console.log(event, row);
  };

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

  const renderViewMore = (row: any) => {
    let customerId =  row['original']['contractor']['_id'];
    // dispatch(loadingSingleCustomers())
    dispatch(getVendorDetailAction(customerId));
    history.push({
      pathname: `vendors/${customerId}`,
      state: customerId
    });
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
                'label': 'Vendors List',
                'value': 0
              },
              {
                'label': 'Recent Activities',
                'value': 1
              }
            ]}
          />
          <div className={classes.addButtonArea}>
            {
              curTab === 0
                ? <Fab
                  aria-label={'new-job'}
                  classes={{
                    'root': classes.fabRoot
                  }}
                  color={'primary'}
                  onClick={() => openVendorModal()}
                  variant={'extended'}>
                  {'Invite Vendor'}
                </Fab>
                : null
            }
          </div>
          <SwipeableViews index={curTab}>
            <div
              className={classes.dataContainer}
              hidden={curTab !== 0}
              id={'0'}>
              <BCTableContainer
                columns={columns}
                isLoading={vendors.loading}
                onRowClick={handleRowClick}
                search
                tableData={vendors.data}
              />
            </div>

            <div
              className={classes.dataContainer}
              hidden={curTab !== 1}
              id={'1'}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                />
              </Grid>
            </div>
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(AdminVendorsPage);