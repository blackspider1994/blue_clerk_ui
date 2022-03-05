import React, {useEffect, useState, useRef} from 'react';
import {
  Button,
  withStyles
} from "@material-ui/core";
import styles from '../payroll.styles';
import {useLocation} from "react-router-dom";
import BCTableContainer  from "../../../components/bc-table-container/bc-table-container";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import BCMenuButton from "../../../components/bc-menu-more";
import {
  openModalAction,
  setModalDataAction
} from "../../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../../constants";
import {useDispatch, useSelector} from "react-redux";
import {
  formatCurrency,
  formatDateYMD,
  formatShortDateNoDay
} from "../../../../helpers/format";
import BCDateRangePicker from "../../../components/bc-date-range-picker/bc-date-range-picker";
import {HighlightOff} from "@material-ui/icons";
import BCItemsFilter from "../../../components/bc-items-filter/bc-items-filter";
import {
  getVendorDetailAction,
  loadingSingleVender
} from "../../../../actions/vendor/vendor.action";
import {
  getContractorPayments,
  getContractors
} from "../../../../actions/payroll/payroll.action";
import {
  Contractor,
  ContractorPayment
} from "../../../../actions/payroll/payroll.types";
import userEvent from "@testing-library/user-event";

interface Props {
  classes: any;
}

const ITEMS = [
  {id: 0, title:'Edit'},
  {id: 1, title:'Delete'},
  {id: 2, title:'Send Receipt'},
]

function PastPayments({classes}: Props) {
  const dispatch = useDispatch();
  const location = useLocation<any>();
  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const { loading, payments, contractors } = useSelector((state: any) => state.payroll);
  const [contractor, setContractor] = useState<Contractor|null>(null)
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);

  useEffect(() => {
      dispatch(getContractors());
  }, []);

  useEffect(() => {
    const obj: any = location.state;
    if (obj?.contractor) {
      dispatch(getContractorPayments({id: obj.contractor._id, type: obj.contractor.type}));
      setSelectedIDs([obj.contractor._id]);
      setContractor(obj.contractor);
    } else {
      if (contractors.length > 0) {
        setSelectedIDs([contractors[0]._id]);
        setContractor(contractors[0]);
        dispatch(getContractorPayments({id: contractors[0]._id, type: contractors[0].type}));
      }
    }
  }, [contractors]);

  useEffect(() => {
    setTableData(payments);
  }, [payments]);

  useEffect(() => {
    const cont = contractors.find((contractor: any) => contractor._id === selectedIDs[0]);
    if (cont) {
      setContractor(cont);
      dispatch(getContractorPayments({id: cont._id, type: cont.type}));
    }

  }, [selectedIDs])

  const handleMenuButtonClick = (event: any, id: number, row:any) => {
    switch (id) {
      case 0:
        break;
    }
  }

  const columns: any = [
    {
      'Header': 'Vendor',
      'accessor': (originalRow: any) => <span>{contractor?.vendor}</span>,
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Payment Date',
      'accessor': (originalRow: any) => formatDateYMD(new Date(originalRow.paidAt)),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Amount',
      'accessor': (originalRow: any, rowIndex: number) => formatCurrency(originalRow.amountPaid),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Method',
      'accessor': 'paymentType',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Reference No.',
      'accessor': 'referenceNumber',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Notes',
      'accessor': 'notes',
      'className': 'font-bold',
      'sortable': true,
    },
    { Cell({ row }: any) {
        return (
          <BCMenuButton
            icon={MoreHorizIcon}
            items={ITEMS}
            handleClick={(e, id) => handleMenuButtonClick(e, id, row.original)}/>
        )
      },
      'Header': 'Actions',
      'className': 'font-bold',
      'sortable': false,
      'width': 100
    },
  ];

  function renderDateRangePicker () {
    return tableData.length > 0 ? (
      <BCDateRangePicker
        range={selectionRange}
        onChange={setSelectionRange}
    />) : null;
  }

  function renderMenu () {
    return (
      <BCItemsFilter
        items={contractors.map((item: Contractor) => ({id: item._id, value: item.vendor}))}
        selected={selectedIDs}
        single={true}
        onApply={setSelectedIDs}
        />
    )
  }

  const renderClearFilterButton = () => {
    return(selectedIDs.length > 0 ?
      <div style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', display: 'flex'}}>
        <Button
          variant={'text'}
          className={classes.filterClearButton}
          onClick={() => setSelectedIDs([])}
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
      searchPlaceholder = 'Search Vendor...'
      setPage={setCurrentPage}
      tableData={tableData}
      toolbarPositionLeft={true}
      toolbar={[renderMenu(), renderDateRangePicker()]}
    />
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(PastPayments);
