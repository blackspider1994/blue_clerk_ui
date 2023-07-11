import React, { useEffect, useState, useRef } from 'react';
import { Button, IconButton, Tooltip, withStyles } from '@material-ui/core';
import styles from './payroll.styles';
import { useHistory, useLocation } from 'react-router-dom';
import BCTableContainer from '../../../components/bc-table-container/bc-table-container';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import BCMenuButton from '../../../components/bc-menu-more';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { ReactComponent as IconEdit } from '../../../../assets/img/icons/sidebar/admin/commision_edit.svg';
import {
  openModalAction,
  setModalDataAction,
} from '../../../../actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { getContractors } from '../../../../actions/payroll/payroll.action';
import HelpIcon from '@material-ui/icons/HelpOutline';

interface Props {
  classes: any;
}

const ITEMS = [
  { id: 0, title: 'Edit Commission' },
  { id: 1, title: 'View Edit History' },
  { id: 2, title: 'Payment History' },
];

function Payroll({ classes }: Props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const { loading, contractors } = useSelector((state: any) => state.payroll);
  const locationState = location.state;
  const prevPage =
    locationState && locationState.prevPage ? locationState.prevPage : null;

  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState({
    page: prevPage ? prevPage.page : 0,
    pageSize: prevPage ? prevPage.pageSize : 10,
    sortBy: prevPage ? prevPage.sortBy : [],
  });

  useEffect(() => {
    dispatch(getContractors());
  }, []);

  const renderCommission = (vendor: any) => {
    if (vendor.commission) {
      return (
        <span>{`${vendor.commissionType === 'fixed' ? '$' : ''}${
          vendor.commission
        }${vendor.commissionType === '%' ? '%' : ''}`}</span>
      );
    }

    return (
      <Button
        variant="text"
        className={classes.commissionAdd}
        onClick={() => editCommission(vendor)}
      >
        <IconEdit />
        <span className={classes.commissionAddText}>Not set</span>
      </Button>
    );
  };

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

  const handleMenuButtonClick = (event: any, id: number, row: any) => {
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

  const columns: any = [
    {
      Header: 'Vendor',
      accessor: 'vendor',
      className: 'font-bold',
      sortable: true,
    },
    {
      Cell({ row }: any) {
        return renderCommission(row.original);
      },
      Header: (
        <div style={{ display: 'inline' }}>
          <span>Commission</span>
          <Tooltip
            title="Percentage rate is based on the invoice total"
            placement="top-start"
            arrow
          >
            <IconButton aria-label="delete" style={{ padding: 4 }}>
              <HelpIcon fontSize={'small'} style={{ color: '#BDBDBD' }} />
            </IconButton>
          </Tooltip>
        </div>
      ),
      accessor: 'commission',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Contact',
      accessor: 'contact.displayName',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Email',
      accessor: 'email',
      className: 'font-bold',
      sortable: true,
    },
    {
      Header: 'Phone',
      accessor: 'phone',
      className: 'font-bold',
      sortable: true,
    },
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

  return (
    <BCTableContainer
      columns={columns}
      currentPage={currentPage}
      isLoading={loading}
      //onRowClick={handleRowClick}
      search
      searchPlaceholder="Search Vendor List..."
      setPage={setCurrentPage}
      tableData={contractors}
    />
  );
}

export default withStyles(styles, { withTheme: true })(Payroll);

