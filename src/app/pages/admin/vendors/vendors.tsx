import BCTableContainer from './../../../components/bc-table-container/bc-table-container';
import BCTabs from './../../../components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { modalTypes } from '../../../../constants';
import styles from './vendors.styles';
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  withStyles,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getVendorDetailAction,
  getVendors,
  loadingSingleVender,
  loadingVendors,
} from 'actions/vendor/vendor.action';
import {
  openModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { editableStatus } from 'app/models/contract';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import { CSButton, CSButtonSmall } from '../../../../helpers/custom';
import { remindVendorApi } from '../../../../api/vendor.api';
import { error, info } from '../../../../actions/snackbar/snackbar.action';
import BCItemsFilter from '../../../components/bc-items-filter/bc-items-filter';
import BCMenuButton from '../../../components/bc-menu-more';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { getContractors } from 'actions/payroll/payroll.action';

interface StatusTypes {
  status: number;
}

interface RowStatusTypes {
  row: {
    original: {
      status: number;
    };
  };
}

const status = [
  {
    id: 'active',
    value: 'Active',
  },
  {
    id: 'inactive',
    value: 'Inactive',
  },
];
const ITEMS = [
  { id: 0, title: 'Edit Commission' },
  { id: 1, title: 'View Edit History' },
  { id: 2, title: 'Payment History' },
];

function AdminVendorsPage({ classes }: any) {
  const dispatch = useDispatch();
  const { loading, contractors } = useSelector((state: any) => state.payroll);
  const [curTab, setCurTab] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [vendorStatus, setVendorStatus] = useState(true);
  const history = useHistory();
  const location = useLocation<any>();
  const { costingList } = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting
  );

  const activeVendors = useMemo(
    () =>
      contractors.filter((vendor: any) => [0, 1, 5].includes(vendor.status)),
    [contractors]
  );
  const nonActiveVendors = useMemo(
    () =>
      contractors.filter((vendor: any) => ![0, 1, 5].includes(vendor.status)),
    [contractors]
  );

  function RenderStatus({ status }: StatusTypes) {
    const statusValues = [
      'Active',
      'Active',
      'Cancelled',
      'Rejected',
      'Inactive',
    ];
    const classNames = [
      classes.statusConfirmedText,
      classes.statusConfirmedText,
      classes.cancelledText,
      classes.cancelledText,
      classes.cancelledText,
    ];
    const textStatus = statusValues[status];
    return (
      <div className={`${classes.Text} ${classNames[status]}`}>
        {textStatus}
      </div>
    );
  }

  function ToolBar({ handleChange }: any) {
    return (
      <BCItemsFilter
        items={status}
        single={true}
        selected={[vendorStatus ? 'active' : 'inactive']}
        onApply={handleChange}
        type={'outlined'}
      />
    );
  }

  const locationState = location.state;

  const prevPage =
    locationState && locationState.prevPage ? locationState.prevPage : null;

  const [currentPage, setCurrentPage] = useState({
    page: prevPage ? prevPage.page : 0,
    pageSize: prevPage ? prevPage.pageSize : 10,
    sortBy: prevPage ? prevPage.sortBy : [],
  });

  function callRemind(row: any) {
    remindVendorApi({ contractId: row.original?._id, status: 'remind' }).then(
      (response: any) => {
        if (response.status === 0) {
          dispatch(error(response.message));
        } else {
          dispatch(info(response.message));
        }
      }
    );
  }

  const editCommission = (vendor: any) => {
    dispatch(
      setModalDataAction({
        data: {
          modalTitle: 'Edit Commission',
          vendorCommission: vendor,
        },
        type: modalTypes.EDIT_COMMISSION_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };
  const viewHistory = (vendor: any) => {
    dispatch(
      setModalDataAction({
        data: {
          modalTitle: `${vendor.vendor} \n Commission History`,
          vendorId: vendor._id,
        },
        type: modalTypes.VIEW_COMMISSION_HISTORY_MODAL,
      })
    );

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const handleMenuButtonClick = (event: any, id: any, row: any) => {
    event.stopPropagation();
    switch (id) {
      case 0:
        editCommission(row);
        break;
      case 1:
        viewHistory(row);
        break;
      case 2:
        const contractorName = row.vendor.replace(/[\/ ]/g, '');
        localStorage.setItem('nestedRouteKey', `${contractorName}`);
        history.push({
          pathname: `/main/payroll/pastpayment/${contractorName}`,
          state: {
            contractor: row,
            currentPage,
          },
        });
        break;
    }
  };
  const renderCommission = (vendor: any) => {
    let commissionValue = '';
    if (vendor.commissionType === 'fixed') {
      if (vendor.commissionTier)
        costingList.forEach((t: any) => {
          if (t.tier.isActive && t.tier._id === vendor.commissionTier) {
            commissionValue = 'Tier ' + t.tier.name;
          }
        });
    } else if(vendor.commission) {
      commissionValue = vendor.commission + '%';
    }
    return <span>{commissionValue}</span>;
  };

  const columns: any = [
    /*
     * {
     *   'Cell'({ row }: any) {
     *     return <div className={'flex items-center'}>
     *       {row.index + 1}
     *     </div>;
     *   },
     *   'Header': 'No#',
     *   'sortable': true,
     *   'width': 60
     * },
     */
    {
      Header: 'Company Name',
      accessor: 'vendor',
      className: 'font-bold',
      sortable: true,
      Cell({ row }: any) {
        return (
          <span>{row.original?.vendor || row.original?.contractorEmail}</span>
        );
      },
    },
    {
      Cell({ row }: any) {
        return renderCommission(row.original);
      },
      Header: (
        <div style={{ display: 'inline' }}>
          <span>Type of Pay</span>
        </div>
      ),
      accessor: 'commission',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Contact Name',
      accessor: 'contact.displayName',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Contact Email',
      accessor: 'contact.email',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Contact Phone',
      accessor: 'contact.phone',
      className: 'font-bold',
      sortable: true,
    },
    // {
    //   Cell({ row }: any) {
    //     return null;
    //     return row.original?.info?.companyName ? (
    //       <RenderStatus status={row.original.status} />
    //     ) : (
    //       <Tooltip arrow title="Account not created">
    //         <CSButtonSmall
    //           aria-label={'remind'}
    //           color={'primary'}
    //           onClick={() => callRemind(row)}
    //           variant={'contained'}
    //         >
    //           {'Remind'}
    //         </CSButtonSmall>
    //       </Tooltip>
    //     );
    //   },
    //   Header: 'Status',
    //   accessor: 'status',
    //   className: 'font-bold',
    //   sortable: true,
    // },
    {
      Cell({ row }: any) {
        return (
          <BCMenuButton
            icon={MoreHorizIcon}
            items={ITEMS}
            handleClick={(e, id) => handleMenuButtonClick(e, id, row.original)}
          />
        );
      },
      Header: 'Actions',
      className: 'font-bold',
      sortable: false,
      width: 100,
    },
  ];

  useEffect(() => {
    if (contractors) {
      setTableData(nonActiveVendors);
      // setTableData(activeVendors);
    }
  }, [contractors]);

  useEffect(() => {
    // dispatch(loadingVendors());
    // dispatch(getVendors());
    dispatch(getContractors());
  }, []);

  const resetLocationState = () => {
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', resetLocationState);
    return () => {
      window.removeEventListener('beforeunload', resetLocationState);
    };
  }, []);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const handleRowClick = (event: any, row: any) => {
    if (row.original?.vendor) {
      // localStorage.setItem('companyContractId', row.original._id);
      // localStorage.setItem('companyContractStatus', vendorStatus.toString());
      renderViewMore(row);
    } else {
      // TODO: add action
    }
  };

  const openVendorModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          modalTitle: 'Add Vendor',
          removeFooter: false,
        },
        type: modalTypes.ADD_VENDOR_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const handleFilterChange = (ids: string[]) => {
    setVendorStatus(!vendorStatus);
    if (ids[0] === 'active') {
      setTableData(activeVendors);
    } else {
      setTableData(nonActiveVendors);
    }
  };

  const renderViewMore = (row: any) => {
    const baseObj = row.original;
    let vendorCompanyName = baseObj.vendor ? baseObj.vendor : 'N/A';
    const vendorId = baseObj._id;
    const vendorObj: any = {
      vendorCompanyName,
      vendorId,
      currentPage,
    };

    if (location?.state?.prevPage?.search) {
      vendorObj.currentPage.search = location.state.prevPage.search;
    }

    vendorCompanyName =
      vendorCompanyName !== undefined
        ? vendorCompanyName.replace(/[\/ ]/g, '')
        : 'vendorName';

    localStorage.setItem('nestedRouteKey', `${vendorCompanyName}`);

    dispatch(loadingSingleVender());
    dispatch(getVendorDetailAction(vendorId));

    history.push({
      pathname: `vendors/${vendorCompanyName}`,
      state: {
        ...vendorObj,
      },
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
                label: 'Vendors List',
                value: 0,
              },
              {
                label: 'Recent Activities',
                value: 1,
              },
            ]}
          />
          <div className={classes.addButtonArea}>
            {curTab === 0 ? (
              <CSButton
                aria-label={'new-job'}
                color={'primary'}
                onClick={() => openVendorModal()}
                variant={'contained'}
              >
                {'Invite Vendor'}
              </CSButton>
            ) : null}
          </div>
          <SwipeableViews index={curTab}>
            <div
              className={classes.dataContainer}
              hidden={curTab !== 0}
              id={'0'}
            >
              <BCTableContainer
                columns={columns}
                currentPage={currentPage}
                isLoading={loading}
                onRowClick={handleRowClick}
                search
                searchPlaceholder="Search Vendors..."
                setPage={setCurrentPage}
                tableData={tableData}
                // toolbar={<ToolBar handleChange={handleFilterChange} />}
                toolbarPositionLeft={true}
              />
            </div>

            <div
              className={classes.dataContainer}
              hidden={curTab !== 1}
              id={'1'}
            >
              <Grid container>
                <Grid item xs={12} />
              </Grid>
            </div>
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(AdminVendorsPage);
