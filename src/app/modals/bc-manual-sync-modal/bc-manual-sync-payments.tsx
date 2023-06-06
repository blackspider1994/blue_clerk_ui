import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent, Tooltip,
  withStyles,
} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {
  closeModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import styles from './bc-manual-sync-modal.styles';
import BCTableContainer
  from "../../components/bc-table-container/bc-table-container";
import {formatCurrency, formatShortDateNoDay} from "../../../helpers/format";
import {
  error,
  success,
  warning
} from "../../../actions/snackbar/snackbar.action";
import {
  Sync as SyncIcon, SyncProblem as SyncProblemIcon,
  Warning as WarningIcon,
} from "@material-ui/icons";
import {SYNC_RESPONSE} from "../../models/payments";
import BCCircularLoader
  from "../../components/bc-circular-loader/bc-circular-loader";
import {getUnsyncedPayments, SyncPayments} from "../../../api/payment.api";
import BcSyncStatus from "./bc-sync-status";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';



function BcManualSyncPayment({classes, closeAction}: any): JSX.Element {
  const dispatch = useDispatch();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isSyncing, setSyncing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const getData = async () => {
    try {
      const payments = await getUnsyncedPayments(currentDivision.params);
      setPayments(payments.reverse());
    } catch (e) {
      dispatch(error(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [])

  const closeModal = () => {
    if (closeAction) {
      dispatch(closeAction);
    } else {
      dispatch(closeModalAction());
      setTimeout(() => {
        dispatch(setModalDataAction({
          'data': {},
          'type': ''
        }));
      }, 200);
    }
  };

  const handleSyncResponse = (response: SYNC_RESPONSE) => {
    const {ids, totalPaymentSynced, totalPaymentUnsynced} = response;
    const temp = [...payments];
    const newList = [...selectedIndexes];

    ids.forEach((update: any, index: number) => {
      const i = temp.findIndex((item) => item._id === update._id);
      const found = newList.indexOf(i);
      newList.splice(found, 1)
      temp[i] = {...temp[i], ...update};
    });
    setSelectedIndexes(newList);
    setPayments(temp);
    setSyncing(false);
    if (totalPaymentSynced && !totalPaymentUnsynced) {
      dispatch(success(`${totalPaymentSynced} payments synced.`))
    } else if (!totalPaymentSynced && totalPaymentUnsynced) {
      dispatch(error(`${totalPaymentUnsynced} payments not synced.`))
    } else {
      dispatch(warning(`${totalPaymentSynced} payments synced, and ${totalPaymentUnsynced} payments not synced.`))
    }
  }

  const confirm = async () => {
    const ids: string[] = selectedIndexes.map(index => payments[index]._id);

    try {
      setSyncing(true);
      const res: any= await dispatch(SyncPayments(ids));
      handleSyncResponse(res);
    } catch (e) {
      dispatch(error(e));
    }
  }

  const columns: any = [
    {
      Cell({ row }: any) {
        return <div className={classes.totalNumber}>
          <Checkbox
            color="primary"
            disabled={row.original.quickbookId}
            classes={{root: classes.checkbox}}
            checked={selectedIndexes.indexOf(row.index) >= 0}
          />
          <span>
            {row.original.line?.length ? 'Multiple Invoices' : row.original.invoice?.invoiceId}
          </span>
        </div>;
      },
      'Header': 'Invoice ID',
      'accessor': 'invoice',
      'sortable': true,
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'sortable': true
    },
    {
      Cell({ row }: any) {
        return row.original.paidAt
          ? formatShortDateNoDay(row.original.paidAt)
          : 'N/A';
      },
      'Header': 'Payment Date',
      'accessor': 'paidAt',
      'sortable': true
    },
    {
      'Header': 'Payment Type',
      'accessor': 'paymentType',
      'sortable': true
    },
    {
      'Header': 'Reference Number',
      'accessor': 'referenceNumber',
      'sortable': true
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.amountPaid),
      'Header': 'Amount Paid',
      'sortable': true,
      'width': 20
    },
    {
      Cell({row}: any) {
        return <BcSyncStatus data={row.original} />
      },
      'Header': 'Integrations',
      'id': 'qbSync',
      'sortable': false,
      'width': 30
    },
  ];

  const handleRowClick = (event: any, row: any) => {
    const found = selectedIndexes.indexOf(row.index);
    const newList = [...selectedIndexes];
    if (!row.original.quickbookId) {
      if (found >= 0) {
        newList.splice(found, 1)
        setSelectedIndexes(newList);
      } else {
        if (newList.length === 5) {
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 2000)
        } else {
          newList.push(row.index);
          setSelectedIndexes(newList);
        }
      }
    }
  };

  return (
    <DataContainer>
      <DialogContent classes={{ root: classes.dialogContent }}>
      <BCTableContainer
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        tableData={payments}
      />
      </DialogContent>


      <DialogActions classes={{
        'root': classes.dialogActions
      }}>
        {showWarning && <div className={classes.warningContainer}>
          <WarningIcon/>
          <span>Only five (5) payments may be manually synced at one time.</span>
        </div>
        }
        <Button
          disabled={isLoading || isSyncing}
          aria-label={'record-payment'}
          classes={{
            'root': classes.closeButton
          }}
          onClick={() => closeModal()}
          variant={'outlined'}>
          Close
        </Button>

        <Button
          aria-label={'create-job'}
          disabled={selectedIndexes.length === 0 || isLoading || isSyncing}
          classes={{
            root: classes.submitButton,
            disabled: classes.submitButtonDisabled
          }}
          color="primary"
          onClick={() => confirm()}
          variant={'outlined'}>
          {isSyncing && <><BCCircularLoader heightValue='20px' size={20}/>&nbsp;&nbsp;</>}
          {isSyncing ? 'Syncing...' : 'Sync Manually'}
        </Button>

      </DialogActions>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  margin: auto 0;

`;

export default withStyles(
  styles,
  {'withTheme': true}
)(BcManualSyncPayment);

const PaymentStatus = styled.div`
  width: 100px;
  background-color: ${props => props.color};
  color: white;
  border-radius: 8px;
  text-transform: capitalize;
  text-align: center;
  font-size: 13px;
`;
