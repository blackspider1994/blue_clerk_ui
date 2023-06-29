import * as CONSTANTS from '../../../constants';
import moment from 'moment';
import styles from './bc-edit-commission-modal.styles';
import {
  DialogActions,
  Button,
  TableContainer,
  withStyles, Table, TableHead, TableRow, TableCell, TableBody
} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {closeModalAction, setModalDataAction} from 'actions/bc-modal/bc-modal.action';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import {error} from "../../../actions/snackbar/snackbar.action";
import {getCommissionHistoryAPI} from "api/payroll.api";
import BCCircularLoader from "../../components/bc-circular-loader/bc-circular-loader";
const TABLE_PADDING = 75;

function BcPaymentHistoryModal({
  classes,
  vendorId,
  handleGoingBack,
}: any): JSX.Element {
  const [histories, setHistories] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const dispatch = useDispatch();

  useEffect(() => {
    getCommissionHistoryAPI(vendorId)
      .then((response) => {
        if (response.status === 1 || response.status === 200) {
          setHistories(response.data || [])
          setLoading(false);
        } else {
          dispatch(error(response.message));
          closeModal();
        }
      }).catch((e) => {
        dispatch(error(e.message));
        closeModal();
      })
  }, []);

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const goBack = () => {
    if(handleGoingBack){
      return handleGoingBack()
    }
    closeModal()
  }

  return (
    <DataContainer className={'new-modal-design'}>
      {loading ? (
        <BCCircularLoader heightValue={'60vh'}/> 
      ) : (
        <>
          <TableContainer>
            <Table size={'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Edit Date</TableCell>
                  <TableCell>Effective Date</TableCell>
                    <TableCell>Commissions</TableCell>
                  <TableCell>Edited By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {histories.reverse().map((history: any) => {
                  const editDate = moment(history.updatedAt);
                  const effectiveDate = moment(history.effectiveDate);
                  return (
                    <TableRow key={history._id}>
                      <TableCell>
                        {editDate.format('MM/DD/YYYY')}
                      </TableCell>
                      <TableCell>
                        {effectiveDate.format('MM/DD/YYYY')}
                      </TableCell>
                      <TableCell>{history.commission}%</TableCell>
                      <TableCell>
                        {history.editedBy?.displayName}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogActions classes={{
            'root': classes.dialogActions
          }}>
            <div/>
            <Button
              aria-label={'go-back'}
              classes={{
                root: classes.viewHistoryButton,
                disabled: classes.submitButtonDisabled
              }}
              onClick={goBack}
              color="primary"
              type={'submit'}
              variant={'outlined'}>
              {handleGoingBack ? 'Back' : 'Close'}
            </Button>
          </DialogActions>
        </>
      )}
    </DataContainer>
  );
}

const DataContainer = styled.div`

  margin: auto 0;
  .MuiFormLabel-root {
    font-style: normal;
    font-weight: normal;
    width: 800px;
    font-size: 20px;
    color: ${CONSTANTS.PRIMARY_DARK};
    /* margin-bottom: 6px; */
  }
  .MuiFormControl-marginNormal {
    margin-top: .5rem !important;
    margin-bottom: 1rem !important;
    /* height: 20px !important; */
  }
  .MuiInputBase-input {
    color: #383838;
    font-size: 16px;
    padding: 12px 14px;
  }
  .MuiInputAdornment-positionStart {
    margin-right: 0;
  }
  .MuiInputAdornment-root + .MuiInputBase-input {
    padding: 12px 14px 12px 0;
  }
  .required > label:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
  .MuiTableContainer-root {
    height: 40vh;
    overflow: vertical;
  }
  td {
    vertical-align: top;
  }
  td:first-child {
    padding-left: ${TABLE_PADDING}px;
  }
  th:first-child {
    padding-left: ${TABLE_PADDING}px;
  }
  td:last-child {
    padding-right: ${TABLE_PADDING}px;
  }
  th:last-child {
    padding-right: ${TABLE_PADDING}px;
  }
  .save-customer-button {
    color: ${CONSTANTS.PRIMARY_WHITE};
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BcPaymentHistoryModal);
