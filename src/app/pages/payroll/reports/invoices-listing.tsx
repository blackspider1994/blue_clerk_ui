import React, {useEffect, useState, useRef} from 'react';
import {
  Button, Chip,
  withStyles
} from "@material-ui/core";
import styles from '../payroll.styles';
import {useLocation, useParams} from "react-router-dom";
import BCTableContainer  from "../../../components/bc-table-container/bc-table-container";
import {useDispatch, useSelector} from "react-redux";
import {
  formatCurrency, formatShortDateNoDay
} from "../../../../helpers/format";
import BCDateRangePicker, {Range} from "../../../components/bc-date-range-picker/bc-date-range-picker";
import {HighlightOff} from "@material-ui/icons";
import BCItemsFilter from "../../../components/bc-items-filter/bc-items-filter";
import {
  getContractorPayments,
  getContractors, removeContractorPayment
} from "../../../../actions/payroll/payroll.action";
import {
  Contractor,
  ContractorPayment
} from "../../../../actions/payroll/payroll.types";
import moment from "moment";
import {getPayrollReportAPI} from "../../../../api/payroll.api";
import {error} from "../../../../actions/snackbar/snackbar.action";
import classNames from "classnames";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface Props {
  classes: any;
}
function PayrollInvoices({classes}: Props) {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const location = useLocation<any>();
  const locationState = location.state;
  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const { contractors } = useSelector((state: any) => state.payroll);
  // const [contractors, setContractors] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filteredInvoices, setFilteredInvoices] = useState<ContractorPayment[]>([]);
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [totals, setTotals] = useState({invoices: 0, commissions: 0});

  const isFiltered =  selectedIDs.length > 0 || selectionRange;

  const getData = async(type?: string, id?: string) => {
    setLoading(true);
    const response: any = await getPayrollReportAPI(undefined,undefined,currentDivision.params);
    if (response.status === 1) {
      setInvoices(response.data);
    } else {
      dispatch(error(response.message));
    }
    setLoading(false);
  }

  useEffect(() => {
    dispatch(getContractors(currentDivision.params));
    getData();
  }, []);

  useEffect(() => {
    const cont = contractors.find((contractor: any) => contractor._id === selectedIDs[0]);
    if (cont) {
      dispatch(getContractorPayments({id: cont._id, type: cont.type},currentDivision.params));
    }
  }, [selectedIDs]);

  useEffect(() => {
    let totalInvoicesAmount = 0;
    let totalCommissions = 0;
    const filtered = invoices.filter((item: any) => {
      let cond = true;
      if (selectionRange) {
        cond = cond &&
          moment(item.invoice.dueDate).isBetween(selectionRange?.startDate, selectionRange?.endDate, 'day', '[]');
      }
      if (selectedIDs.length > 0) {
        cond = cond && selectedIDs.indexOf(item.payedPerson._id) >= 0;
      }
      return cond;
    }).map((item: any) => {
      let technicianCount = 0;
      let technicianIds: string[] = [];
      item.invoice.job.tasks.forEach((task:any) => {
        if(task.contractor){
          !technicianIds.includes(task.contractor._id) && technicianCount++;
          technicianIds.push(task.contractor._id)
        } else {
          !technicianIds.includes(task.technician._id) && technicianCount++;
          technicianIds.push(task.technician._id)
        }
      })
      totalInvoicesAmount += item.invoice.total / (technicianCount || 1);
      totalCommissions += item.commissionAmount;
      setTotals({invoices: totalInvoicesAmount, commissions: totalCommissions});
      return {
        ...item,
        invoice: {
          ...item.invoice,
          technicianCount
        }
      }
    })
    ;
    setFilteredInvoices(isFiltered ? filtered : []);
  }, [selectionRange, invoices, selectedIDs]);

  const columns: any = [
    {
      'Header': 'Invoice',
      'accessor': (originalRow: any) => originalRow.invoice.invoiceId,
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Vendor',
      'accessor': (originalRow: any) => originalRow.payedPerson.vendor,
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Invoice Amount',
      'accessor': (originalRow: any) => formatCurrency(originalRow.invoice.total),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': '# of Technicians',
      'accessor': 'invoice.technicianCount',
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Commission',
      'accessor': (originalRow: any) => formatCurrency(originalRow.commissionAmount),
      'className': 'font-bold',
      'sortable': true,
    },
    {
      'Header': 'Date',
      'accessor': (originalRow: any) => formatShortDateNoDay(originalRow.invoice.dueDate),
      'className': 'font-bold',
      'sortable': true,
    },
    { Cell({ row }: any) {
        return (
          <Chip
            label={row.original.invoice.status.split('_').join(' ').toLowerCase()}
            className={
              classNames({
                [classes.statusChip]: true,
                [classes.unPaidChip]: row.original.invoice.status === 'UNPAID',
                [classes.partiallyPaidChip]: row.original.invoice.status === 'PARTIALLY_PAID',
              })
            }
          />
        )
      },
      'Header': 'Status',
      'className': 'font-bold',
      'sortable': false,
      'width': 100
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
  ];

  function renderDateRangePicker () {
    return <BCDateRangePicker range={selectionRange} onChange={setSelectionRange} showClearButton={true} />
  }

  function renderMenu () {
    return (
      <BCItemsFilter
        items={contractors.map((item: Contractor) => ({id: item._id, value: item.vendor}))}
        selected={selectedIDs}
        onApply={setSelectedIDs}
        />
    )
  }

  function renderTotals () {
    return (
      loading || !isFiltered ? null :
        <div className={classes.totalContainer}>
          <div style={{display: 'flex', flex: 1}}>
            <span className={classes.totalText}>Total Amount</span>
            <span
              className={classes.totalValue}>{formatCurrency(totals.invoices)}</span>
          </div>
          <div style={{display: 'flex', flex: 1}}>
            <span
              className={classNames(classes.totalText, classes.totalTextSmall)}>Commissions</span>
            <span
              className={classNames(classes.totalValue, classes.totalTextSmall)}>{formatCurrency(totals.commissions)}</span>
          </div>
        </div>

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
      initialMsg={isFiltered ? 'Nothing Here Yet' : 'Please filter to view report'}
      search
      searchPlaceholder = 'Search Invoices...'
      isLoading={loading}
      setPage={setCurrentPage}
      tableData={filteredInvoices}
      toolbarPositionLeft={true}
      toolbar={[renderMenu(), renderDateRangePicker(), renderTotals()].map((tool:any, idx:number) => <React.Fragment key={idx}>{tool}</React.Fragment>)}
    />
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(PayrollInvoices);
