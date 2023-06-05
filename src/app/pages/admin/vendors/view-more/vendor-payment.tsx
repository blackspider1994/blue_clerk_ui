import React, {useEffect, useState, useRef} from 'react';
import {withStyles} from "@material-ui/core";
import styles from './view-more.styles';
import {useLocation} from "react-router-dom";
import BCTableContainer
  from "../../../../components/bc-table-container/bc-table-container";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import BCMenuButton from "../../../../components/bc-menu-more";
import BCDateRangePicker
  , {Range} from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import {useDispatch, useSelector} from "react-redux";
import {
  formatCurrency, formatDate,
} from "../../../../../helpers/format";
import {ContractorPayment} from "../../../../../actions/payroll/payroll.types";
import moment from "moment";
import {
  openModalAction,
  setModalDataAction
} from "../../../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../../../constants";
import {deleteVendorPayment} from "../../../../../actions/vendor/vendor.action";

interface Props {
  classes: any;
}

const ITEMS = [
  {id: 0, title:'Edit'},
  {id: 1, title:'Delete'},
  {id: 2, title:'View Details'},
]

function VendorPayment({classes}: Props) {
  const dispatch = useDispatch();
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const location = useLocation<any>();
  const { vendorObj, vendorPayments } = useSelector((state: any) => state.vendors);
  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const [filteredPayments, setFilteredPayments] = useState<ContractorPayment[]>([])
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });

  const editPayment = (payment: any) => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: 'Edit Payment',
        payment,
        payroll: payment.payedPerson,
        dateRange: {startDate: payment.startDate, endDate: payment.endDate},
      },
      'type': modalTypes.PAYROLL_RECORD_PAYMENT_MODAL
    }));

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const deletePayment = (payment: any) => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: '         ',
        message: 'Are you sure you want to delete this Payment Record?',
        subMessage: 'This action cannot be undone.',
        action: deleteVendorPayment(payment),
      },
      'type': modalTypes.WARNING_MODAL
    }));

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const viewPayment = (payment: any) => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: payment.__t === 'AdvancePaymentVendor' ? 'Advance Payment Details' : 'Payroll Details',
        payment,
      },
      'type': modalTypes.PAYROLL_DETAIL_PAYMENT_MODAL
    }));

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const handleMenuButtonClick = (event: any, id: number, row:any) => {
    switch(id) {
      case 0:
        editPayment(row);
        break;
      case 1:
        deletePayment(row);
        break;
      case 2:
        viewPayment(row);
        break;
    }
  }

  const calculateDefaultRange = () => {
    const paymentDates = vendorPayments?.map((payment: any) =>  (new Date(payment.paidAt)).getTime());
    if (paymentDates) {
      const newRange = {
        startDate: new Date(Math.min(...paymentDates)),
        endDate: new Date(Math.max(...paymentDates)),
      }
      return newRange;
    }else{
      return null
    }
  }

  useEffect(() => {
    const range = calculateDefaultRange();
    setSelectionRange(range);
  }, [vendorPayments]);

  useEffect(() => {
    if (selectionRange) {
      const filtered = vendorPayments.filter((payment: ContractorPayment) =>
        moment(payment.paidAt).isBetween(selectionRange?.startDate, selectionRange?.endDate, 'day', '[]')
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(vendorPayments);
    }
  }, [selectionRange])

  const columns: any = [
    {
      'Header': 'Vendor',
      'accessor': (originalRow: any) => vendorObj.info.companyName,
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Payment Date',
      'accessor': (originalRow: any) => formatDate(originalRow.paidAt),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Amount',
      'accessor': (originalRow: any) => formatCurrency(originalRow.amountPaid),
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
      'accessor': (originalRow: any) =>
        originalRow.note ?
          (originalRow.note.length < 100 ? originalRow.note : originalRow.note.substring(0, 100)+'...')
          : '',
      'sortable': true,
      'className': classes.tableCellWrap,
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
    return vendorPayments?.length > 0 ? (
      <BCDateRangePicker
        range={selectionRange}
        onChange={setSelectionRange}
      />) : null;
  }

  return (
    <BCTableContainer
      columns={columns}
      currentPage={currentPage}
      //isLoading={vendors.loading}
      //onRowClick={handleRowClick}
      search
      searchPlaceholder = 'Search Payments...'
      setPage={setCurrentPage}
      tableData={filteredPayments}
      toolbarPositionLeft={true}
      toolbar={renderDateRangePicker()}
    />
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(VendorPayment);
