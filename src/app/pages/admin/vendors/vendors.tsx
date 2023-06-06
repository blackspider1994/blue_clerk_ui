import BCTableContainer from './../../../components/bc-table-container/bc-table-container';
import BCTabs from './../../../components/bc-tab/bc-tab';
import Fab from '@material-ui/core/Fab';
import SwipeableViews from 'react-swipeable-views';
import {modalTypes} from '../../../../constants';
import styles from './vendors.styles';
import { Grid, MenuItem, Select, withStyles } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { getVendorDetailAction, getVendors, loadingSingleVender, loadingVendors } from 'actions/vendor/vendor.action';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { editableStatus } from 'app/models/contract';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import {CSButton, CSButtonSmall} from "../../../../helpers/custom";
import {remindVendorApi} from "../../../../api/vendor.api";
import {error, info} from "../../../../actions/snackbar/snackbar.action";
import BCItemsFilter from "../../../components/bc-items-filter/bc-items-filter";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface StatusTypes {
  status: number;
}


interface RowStatusTypes {
  row: {
    original: {

      status: number
    }
  };
}

const status = [
  {
    'id': 'active',
    'value': 'Active'
  },
  {
    'id': 'inactive',
    'value': 'Inactive'
  }
];

function AdminVendorsPage({ classes }: any) {
  const dispatch = useDispatch();
  const vendors = useSelector((state: any) => state.vendors);
  const [curTab, setCurTab] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [vendorStatus, setVendorStatus] = useState(true);
  const history = useHistory();
  const location = useLocation<any>();
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const activeVendors = useMemo(() => vendors.data.filter((vendor:any) => [0, 1, 5].includes(vendor.status)), [vendors]);
  const nonActiveVendors = useMemo(() => vendors.data.filter((vendor:any) => ![0, 1, 5].includes(vendor.status)), [vendors]);

  function RenderStatus({ status }: StatusTypes) {
    const statusValues = ['Active', 'Active', 'Cancelled', 'Rejected', 'Inactive'];
    const classNames = [classes.statusConfirmedText, classes.statusConfirmedText, classes.cancelledText, classes.cancelledText, classes.cancelledText];
    const textStatus = statusValues[status];
    return <div className={`${classes.Text} ${classNames[status]}`}>
      {textStatus}
    </div>;
  }

  function ToolBar({ handleChange }:any) {
    return <BCItemsFilter
      items={status}
      single={true}
      selected={[vendorStatus ? 'active' : 'inactive']}
      onApply={handleChange}
      type={'outlined'}
    />
  }

  const locationState = location.state;

  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;

  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });

  function callRemind(row: any) {
      remindVendorApi({contractId: row.original?._id, status: 'remind'}).then((response: any) => {
      if (response.status === 0) {
        dispatch(error(response.message));
      } else {
        dispatch(info(response.message));
      }
    });
  }

  const columns: any = [
    {
      'Header': 'Display Name',
      'accessor': 'contractor.info.displayName',
      'className': 'font-bold',
      'sortable': true,
      Cell({ row }: any) {
        let isNotAssigned = "";
        let isNotAssignedTooltip = "";
        if (currentDivision.isDivisionFeatureActivated && !vendors.assignedVendors?.includes(row.original?.contractor?._id)) {
          isNotAssigned = "!";
          isNotAssignedTooltip = "This vendor is not assigned to any division or work type"
        }

        return <span>
            <Tooltip title={isNotAssignedTooltip}>
              <span style={{
                color: "red",
                fontWeight: 'bold'
              }}>{isNotAssigned} </span>  
            </Tooltip> 
            {row.original?.contractor?.info?.displayName  || row.original?.displayName || 'N/A' }</span>;
      }
    },
    {
      'Header': 'Company Name',
      'accessor': 'contractor.info.companyName',
      'className': 'font-bold',
      'sortable': true,
      Cell({ row }: any) {
        return <span> 
            {row.original?.contractor?.info?.companyName || row.original?.contractorEmail}</span>;
      }
    },
    {
      'Header': 'Contact Name',
      'accessor': 'contractor.admin.profile.displayName',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Contact Email',
      'accessor': 'contractor.admin.auth.email',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Contact Phone',
      'accessor': 'contractor.admin.contact.phone',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Cell'({ row }: any) {
        return row.original?.contractor?.info?.companyName
          ? <RenderStatus status={row.original.status} />
          : <Tooltip arrow title='Account not created'>
              <CSButtonSmall
                aria-label={'remind'}
                color={'primary'}
                onClick={() => callRemind(row)}
                variant={'contained'}>
                {'Remind'}
              </CSButtonSmall>
          </Tooltip>;
      },
      'Header': 'Status',
      'accessor': 'status',
      'className': 'font-bold',
      'sortable': true
    }
  ];

  useEffect(() => {
    if (vendors) {
      setTableData(activeVendors);
    }
  }, [vendors, currentDivision.isDivisionFeatureActivated]);

  useEffect(() => {
    dispatch(loadingVendors());
    dispatch(getVendors({assignedVendorsIncluded: true}));
  }, []);

  const resetLocationState = () => {
    window.history.replaceState({}, document.title)
  }

  useEffect(() => {
    window.addEventListener("beforeunload", resetLocationState);
    return () => {
      window.removeEventListener("beforeunload", resetLocationState);
    };
  }, []);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const handleRowClick = (event: any, row: any) => {
    if (row.original?.contractor?.info?.companyName) {
      localStorage.setItem('companyContractId', row.original._id);
      localStorage.setItem('companyContractStatus', vendorStatus.toString());
      renderViewMore(row);
    } else {
      // TODO: add action
    }
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

  const handleFilterChange = (ids:string[]) => {
    setVendorStatus(!vendorStatus);
    if (ids[0] === 'active') {
      setTableData(activeVendors);
    } else {
      setTableData(nonActiveVendors);
    }
  };

  const renderViewMore = (row: any) => {
    const baseObj = row.original;
    let vendorCompanyName =
      baseObj.contractor.info &&
        baseObj.contractor.info.companyName !== undefined
        ? baseObj.contractor.info.companyName
        : 'N/A';
    const vendorId = baseObj.contractor._id;
    const vendorObj:any = {
      vendorCompanyName,
      vendorId,
      currentPage,
    };

    if(location?.state?.prevPage?.search){
      vendorObj.currentPage.search = location.state.prevPage.search
    }

    vendorCompanyName =
      vendorCompanyName !== undefined
        ? vendorCompanyName.replace(/[\/ ]/g, '')
        : 'vendorName';

    localStorage.setItem('nestedRouteKey', `${vendorCompanyName}`);


    dispatch(loadingSingleVender());
    dispatch(getVendorDetailAction(vendorId));

    history.push({
      'pathname': `vendors/${vendorCompanyName}`,
      'state': {
        ...vendorObj,
      }
    });
  };

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
                ? <CSButton
                  aria-label={'new-job'}
                  color={'primary'}
                  onClick={() => openVendorModal()}
                  variant={'contained'}>
                  {'Invite Vendor'}
                </CSButton>
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
                currentPage={currentPage}
                isLoading={vendors.loading}
                onRowClick={handleRowClick}
                search
                searchPlaceholder = 'Search Vendors...'
                setPage={setCurrentPage}
                tableData={tableData.reverse()}
                toolbar={<ToolBar handleChange={handleFilterChange}/>}
                toolbarPositionLeft={true}
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
