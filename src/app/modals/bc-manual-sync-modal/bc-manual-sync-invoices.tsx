import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Tooltip,
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
import {formatCurrency, formatDatTimelll} from "../../../helpers/format";
import {getUnsyncedInvoices, SyncInvoices} from "../../../api/invoicing.api";
import {
  error,
  success,
  warning
} from "../../../actions/snackbar/snackbar.action";
import {
  Warning as WarningIcon,
} from "@material-ui/icons";
import {PAYMENT_STATUS_COLORS} from "../../../helpers/contants";
import {SYNC_RESPONSE} from "../../models/invoices";
import BCCircularLoader
  from "../../components/bc-circular-loader/bc-circular-loader";
import BcSyncStatus from "./bc-sync-status";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';


function BcManualSyncInvoices({classes, action, closeAction}: any): JSX.Element {
  const dispatch = useDispatch();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isSyncing, setSyncing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const getData = async () => {
    try {
      const invoices = await getUnsyncedInvoices(currentDivision.params);
      setInvoices(invoices);
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
    const {ids, totalInvoiceSynced, totalInvoiceUnsynced} = response;
    const temp = [...invoices];
    const newList = [...selectedIndexes];

    ids.forEach((update: any, index: number) => {
      const i = temp.findIndex((item) => item._id === update._id);
      const found = newList.indexOf(i);
      newList.splice(found, 1)
      temp[i] = {...temp[i], ...update};
    });
    setSelectedIndexes(newList);
    setInvoices(temp);
    setSyncing(false);
    if (totalInvoiceSynced && !totalInvoiceUnsynced) {
      dispatch(success(`${totalInvoiceSynced} invoices synced.`))
    } else if (!totalInvoiceSynced && totalInvoiceUnsynced) {
      dispatch(error(`${totalInvoiceUnsynced} invoices not synced.`))
    } else {
      dispatch(warning(`${totalInvoiceSynced} invoices synced, and ${totalInvoiceUnsynced} invoices not synced.`))
    }
  }

  const confirm = async () => {
    const ids: string[] = selectedIndexes.map(index => invoices[index]._id);

    try {
      setSyncing(true);
      const res: any = await dispatch(SyncInvoices(ids));
      handleSyncResponse(res);
    } catch (e) {
      dispatch(error(e));
    }
  }

  const columns: any = [
    {
      'Header': 'Invoice ID',
      'accessor': 'invoiceId',
      'className': 'font-bold',
      'sortable': true,
      Cell({row}: any) {
        return <div className={classes.totalNumber}>
          <Checkbox
            color="primary"
            disabled={row.original.quickbookId}
            classes={{root: classes.checkbox}}
            checked={selectedIndexes.indexOf(row.index) >= 0}
          />
          <span>
            {row.original.invoiceId}
          </span>
        </div>;
      },
    },
    {
      'Header': 'Job ID',
      'accessor': 'job.jobId',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Customer',
      'accessor': 'customer.profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'accessor': (originalRow: any) => formatCurrency(originalRow.total),
      'Header': 'Total',
      'sortable': true,
      'width': 20
    },
    { Cell({ row }: any) {
        const { status = '' } = row.original;
        const textStatus = status.split('_').join(' ').toLowerCase();
        return (
          <PaymentStatus color={PAYMENT_STATUS_COLORS[row.original.status]}>
            {row.original.status.replace('_', ' ').toLowerCase()}
          </PaymentStatus>
        )
      },
      'Header': 'Payment Status',
      'accessor': 'paid',
      'className': 'font-bold',
      'sortable': true,
      'width': 10
    },
    {
      Cell({row}: any) {
        return row.original.createdAt
          ? formatDatTimelll(row.original.createdAt)
          : 'N/A';
      },
      'Header': 'Invoice Date',
      'accessor': 'createdAt',
      'className': 'font-bold',
      'sortable': true
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
        tableData={invoices}
      />
      </DialogContent>


      <DialogActions classes={{
        'root': classes.dialogActions
      }}>
        {showWarning && <div className={classes.warningContainer}>
          <WarningIcon/>
          <span>Only five (5) invoices may be manually synced at one time.</span>
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
)(BcManualSyncInvoices);

const PaymentStatus = styled.div`
  width: 100px;
  background-color: ${props => props.color};
  color: white;
  border-radius: 8px;
  text-transform: capitalize;
  text-align: center;
  font-size: 13px;
`;
