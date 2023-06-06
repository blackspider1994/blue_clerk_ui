import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  withStyles
} from "@material-ui/core";
import styles from './payroll.styles';
import { useHistory, useLocation, useParams } from "react-router-dom";
import BCTableContainer from "../../components/bc-table-container/bc-table-container";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import BCMenuButton from "../../components/bc-menu-more";
import {
  openModalAction,
  setModalDataAction
} from "../../../actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import {
  formatCurrency, formatDateYMD,
} from "../../../helpers/format";
import BCDateRangePicker
, { Range } from "../../components/bc-date-range-picker/bc-date-range-picker";
import { HighlightOff } from "@material-ui/icons";
import BCItemsFilter from "../../components/bc-items-filter/bc-items-filter";
import { getPayrollBalance, refreshContractorPayment } from "../../../actions/payroll/payroll.action";
import { Contractor } from "../../../actions/payroll/payroll.types";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { warning } from 'actions/snackbar/snackbar.action';

interface Props {
  classes: any;
}

const ITEMS = [
  { id: 0, title: 'Record Payment' },
  { id: 1, title: 'Past Payment' },
  // {id: 2, title:'View Details'},
]

function Payroll({ classes }: Props) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const { loading, contractors, refresh } = useSelector((state: any) => state.payroll);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      if (selectionRange) {
        dispatch(getPayrollBalance(formatDateYMD(selectionRange.startDate), formatDateYMD(selectionRange.endDate), currentDivision.params));
      } else {
        dispatch(getPayrollBalance(undefined, undefined,currentDivision.params));
      }
      if (refresh) {
        dispatch(refreshContractorPayment(false));
      }
    }
  }, [selectionRange, refresh, currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  useEffect(() => {
    setTableData(selectedIDs.length > 0 ?
      contractors.filter((item: any) => selectedIDs.indexOf(item._id) >= 0) : contractors);
  }, [selectedIDs, contractors])

  const recordPayment = (vendor: any) => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: 'Record Payment',
        payroll: vendor,
        dateRange: selectionRange,
      },
      'type': modalTypes.PAYROLL_RECORD_PAYMENT_MODAL
    }));

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const handleMenuButtonClick = (event: any, id: number, row: any) => {
    event.stopPropagation();
    switch (id) {
      case 0:
        recordPayment(row);
        break;
      case 1:
        const contractorName = row.vendor.replace(/[\/ ]/g, '');
        localStorage.setItem('nestedRouteKey', `${contractorName}`);
        history.push({
          'pathname': `/main/payroll/pastpayment/${contractorName}`,
          'state': {
            contractor: row,
            currentPage
          }
        });
        break;
    }
  }

  const columns: any = [
    {
      'Header': 'Vendor',
      'accessor': 'vendor',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Total Balance',
      'accessor': (originalRow: any, rowIndex: number) => formatCurrency(originalRow.commissionTotal - originalRow.creditAvailable),
      'className': 'font-bold',
      'sortable': true,
      'sortType': (a: any, b: any) => (a.original.commissionTotal - a.original.creditAvailable) - (b.original.commissionTotal - b.original.creditAvailable)
    },
    // {
    //   'Header': 'Due Date',
    //   'accessor': (originalRow: any, rowIndex: number) => formatShortDateNoDay(new Date()),
    //   'className': 'font-bold',
    //   'sortable': true,
    // },
    {
      Cell({ row }: any) {
        return (
          <BCMenuButton
            icon={MoreHorizIcon}
            items={ITEMS}
            handleClick={(e, id) => handleMenuButtonClick(e, id, row.original)} />
        )
      },
      'Header': 'Actions',
      'className': 'font-bold',
      'sortable': false,
      'width': 100
    },
  ];

  function renderDateRangePicker() {
    return <BCDateRangePicker
      noDay
      range={selectionRange}
      disabled={loading}
      onChange={(range) => setSelectionRange(range)}
    />;
  }

  function renderMenu() {
    return (
      <BCItemsFilter
        items={contractors.map((item: Contractor) => ({ id: item._id, value: item.vendor }))}
        selected={selectedIDs}
        onApply={setSelectedIDs}
      />
    )
  }

  const renderClearFilterButton = () => {
    return (selectedIDs.length > 0 || selectionRange ?
      <div style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', display: 'flex' }}>
        <Button
          variant={'text'}
          className={classes.filterClearButton}
          onClick={() => { setSelectedIDs([]); setSelectionRange(null) }}
          endIcon={<HighlightOff />}
        >Clear Filters</Button></div> : null
    )
  }

  return (
    <BCTableContainer
      columns={columns}
      currentPage={currentPage}
      isLoading={loading}
      //onRowClick={handleRowClick}
      search
      searchPlaceholder='Search...'
      setPage={setCurrentPage}
      tableData={tableData}
      toolbarPositionLeft={true}
      toolbar={[renderMenu(), renderDateRangePicker(), renderClearFilterButton()].map((tool: any, idx: number) => <React.Fragment key={idx}>{tool}</React.Fragment>)}
    />
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(Payroll);
