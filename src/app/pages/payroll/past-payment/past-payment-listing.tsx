import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  withStyles
} from "@material-ui/core";
import styles from '../payroll.styles';
import { useLocation, useParams } from "react-router-dom";
import BCTableContainer from "../../../components/bc-table-container/bc-table-container";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import BCMenuButton from "../../../components/bc-menu-more";
import {
  openModalAction,
  setModalDataAction
} from "../../../../actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../../constants";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrency, formatDate, formatYMDDateTime } from "../../../../helpers/format";
import { sortArrByDate } from '../../../../utils/table-sort'
import BCDateRangePicker, { Range } from "../../../components/bc-date-range-picker/bc-date-range-picker";
import { HighlightOff } from "@material-ui/icons";
import BCItemsFilter from "../../../components/bc-items-filter/bc-items-filter";
import { getAllPaymentsAPI } from '../../../../api/payment.api'
import {
  getContractorPayments,
  getContractors,
  setContractorPayments
} from "../../../../actions/payroll/payroll.action";
import {
  Contractor,
  ContractorPayment
} from "../../../../actions/payroll/payroll.types";
import moment from "moment";
import { voidPayment, voidAdvancePayment } from 'api/payroll.api'
import { setPayments } from 'actions/invoicing/payments/payments.action';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
interface Props {
  classes: any;
}

const ITEMS = [
  { id: 0, title: 'Edit' },
  { id: 1, title: 'Delete' },
  { id: 2, title: 'View Detail' },
]

function PastPayments({ classes }: Props) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const location = useLocation<any>();
  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const { loading, payments, contractors } = useSelector((state: any) => state.payroll);

  const [filteredPayments, setFilteredPayments] = useState<ContractorPayment[]>([]);
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);

  
  const isFiltered = selectedIDs.length > 0 || selectionRange !== null;

  useEffect(() => {
    handleClearFilter();
  }, []);

  useEffect(() => {
    if (!currentDivision.isDivisionFeatureActivated || (currentDivision.isDivisionFeatureActivated && ((currentDivision.params?.workType || currentDivision.params?.companyLocation) || currentDivision.data?.name == "All"))) {
      const cont = contractors.find((contractor: any) => contractor._id === selectedIDs[0]);
      if (cont) {
        dispatch(getContractorPayments({ id: cont._id, type: cont.type },currentDivision.params));
      }
    }
  }, [selectedIDs, contractors,currentDivision.isDivisionFeatureActivated, currentDivision.params]);

  useEffect(() => {
    dispatch(setPayments(sortArrByDate(payments, 'createdAt')))

    if (selectionRange) {
      const filtered = payments.filter((payment: ContractorPayment) =>
        moment(payment.paidAt).isBetween(selectionRange?.startDate, selectionRange?.endDate, 'day', '[]')
      );
      setFilteredPayments(filtered.filter((payment: any) => !payment.isVoid));
    } else {
      setFilteredPayments(payments.filter((payment: any) => !payment.isVoid));
    }
  }, [selectionRange, payments]);

  const editPayment = (payment: any) => {
    if (payment.__t === 'AdvancePaymentVendor') {
      dispatch(setModalDataAction({
        data: {
          modalTitle: 'Edit Advance Payment',
          advancePayment: payment,
          payroll: payment.payedPerson,
          dateRange: { startDate: payment.startDate, endDate: payment.endDate },
        },
        'type': modalTypes.PAYROLL_RECORD_PAYMENT_MODAL
      }));
    } else {
      dispatch(setModalDataAction({
        data: {
          modalTitle: 'Edit Payment',
          payment,
          payroll: payment.payedPerson,
          dateRange: { startDate: payment.startDate, endDate: payment.endDate },
        },
        'type': modalTypes.PAYROLL_RECORD_PAYMENT_MODAL
      }));
    }

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
        action: payment.__t === 'AdvancePaymentVendor'
          ? voidAdvancePayment({ type: 'vendor', advancePaymentId: payment._id }, currentDivision.params)
          : voidPayment({ type: 'vendor', paymentId: payment._id }, currentDivision.params),
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

  const handleMenuButtonClick = (event: any, id: number, row: any) => {
    switch (id) {
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

  const renderPayrollTypeText = (string: string) => {
    switch (string) {
      case 'PaymentVendor':
        return 'Payroll Payment'
        break;
      case 'AdvancePaymentVendor':
        return 'Advance Payment'
        break;

      default:
        return string
        break;
    }
  }
  const sortByDate = (a: any, b: any) => {
    const dateA = formatYMDDateTime(a.original.paidAt);
    const dateB = formatYMDDateTime(b.original.paidAt);
    return dateB.localeCompare(dateA)
  }
  const columns: any = [
    {
      'Header': 'Vendor',
      'accessor': (originalRow: any) => originalRow.payedPerson.vendor,
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Type',
      'accessor': (originalRow: any) => renderPayrollTypeText(originalRow.__t),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Payment Date',
      'accessor': (originalRow: any) => formatDate(originalRow.paidAt),
      'className': 'font-bold',
      'sortable': true,
      'sortType': sortByDate,
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
          (originalRow.note.length < 100 ? originalRow.note : originalRow.note.substring(0, 100) + '...')
          : '',
      'sortable': true,
      'className': classes.tableCellWrap,
    },
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
    return <BCDateRangePicker range={selectionRange} onChange={setSelectionRange} />
  }

  function renderMenu() {
    return (
      <BCItemsFilter
        items={contractors.map((item: Contractor) => ({ id: item._id, value: item.vendor }))}
        selected={selectedIDs}
        single={true}
        onApply={setSelectedIDs}
      />
    )
  }

  const handleClearFilter = () => {
    setSelectedIDs([])
    setSelectionRange(null)
    dispatch(setContractorPayments([]))
  }

  const renderClearFilterButton = () => {
    return (selectedIDs.length > 0 || selectionRange ?
      <div style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', display: 'flex' }}>
        <Button
          variant={'text'}
          className={classes.filterClearButton}
          onClick={() => handleClearFilter()}
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
      initialMsg={isFiltered ? 'Nothing Here Yet' : 'Please select a vendor'}
      search
      searchPlaceholder='Search...'
      setPage={setCurrentPage}
      tableData={filteredPayments}
      toolbarPositionLeft={true}
      toolbar={[renderMenu(), renderDateRangePicker(), renderClearFilterButton()].map((tool: any, idx: number) => <React.Fragment key={idx}>{tool}</React.Fragment>)}
    />
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(PastPayments);
