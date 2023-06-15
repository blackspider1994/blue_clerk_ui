import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import classNames from 'classnames';
import DateFnsUtils from '@date-io/date-fns';
import BCSent from '../../components/bc-sent';
import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
  withStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import React, { useState } from 'react';
import {
  closeModalAction,
  setModalDataAction,
  openModalAction,
} from 'actions/bc-modal/bc-modal.action';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as CONSTANTS from '../../../constants';
import styles from './bc-edit-commission-modal.styles';
import { updateCommissionAPI } from '../../../api/payroll.api';
import {
  error as snackError,
  success,
} from '../../../actions/snackbar/snackbar.action';
import { setContractor } from '../../../actions/payroll/payroll.action';
import { Contractor } from '../../../actions/payroll/payroll.types';
import { modalTypes } from '../../../constants';
import { StyledInput } from '../bc-invoice-item-modal/bc-invoice-item-modal';
import { DiagConsoleLogger } from '@opentelemetry/api';

interface Props {
  classes: any;
  vendorCommission: Contractor;
}

function BcEditCommissionModal({
  classes,
  vendorCommission,
}: Props): JSX.Element {
  const [error, setError] = useState(false);
  const [warning, setWarning] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [commissionType, setCommissionType] = useState<string>(
    vendorCommission.commissionType
  );
  const [commissionTier, setTier] = useState<string>(
    vendorCommission.commissionTier
  );
  const [commission, setCommission] = useState<number>(
    vendorCommission.commission || 0
  );
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const dispatch = useDispatch();
  const { costingList } = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting
  );

  const closeModal = (forceClose?: boolean) => {
    if ((error || warning) && !forceClose) {
      setError(false);
      setWarning(false);
      return;
    }
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(
        setModalDataAction({
          data: {},
          type: '',
        })
      );
    }, 200);
  };

  const viewHistory = () => {
    dispatch(
      setModalDataAction({
        data: {
          modalTitle: `${vendorCommission.vendor} \n Commission History`,
          vendorId: vendorCommission._id,
          handleGoingBack: () => {
            dispatch(
              setModalDataAction({
                data: {
                  modalTitle: 'Edit Commission',
                  vendorCommission: vendorCommission,
                },
                type: modalTypes.EDIT_COMMISSION_MODAL,
              })
            );

            setTimeout(() => {
              dispatch(openModalAction());
            }, 200);
          },
        },
        type: modalTypes.VIEW_COMMISSION_HISTORY_MODAL,
      })
    );

    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const submit = async () => {
    const commissionInt = commission;
    if (!commissionTier && (commissionInt < 1 || commissionInt >= 100)) {
      setError(true);
      return;
    }
    if (
      effectiveDate <
        new Date(new Date().setHours(new Date().getHours() - 1)) &&
      !warning
    ) {
      setWarning(true);
      return;
    } else {
      setWarning(false);
    }
    setSubmitting(true);
    const params = {
      id: vendorCommission._id,
      type: vendorCommission.type,
      commission,
      commissionType,
      commissionTier,
      commissionEffectiveDate: effectiveDate,
    };
    const contractor = await updateCommissionAPI(params);
    if (contractor.status === 0) {
      dispatch(snackError(contractor.message));
      setSubmitting(false);
    } else {
      dispatch(success(contractor.message));
      dispatch(setContractor(contractor.data));
      closeModal(warning);
    }
  };

  return (
    <DataContainer className={'new-modal-design'}>
      <DialogContent
        classes={{ root: !error && !warning ? classes.dialogContent : null }}
      >
        {error ? (
          <BCSent
            title={'Please enter an amount between 1 to 100 only.'}
            type={'error'}
            showLine={false}
          />
        ) : warning ? (
          <BCSent
            title={
              'You have selected a previous date.\n Do you want to proceed?'
            }
            titlePadding={'0'}
            subtitle={'Note: Payroll amounts will be recalculated.'}
            type={'error'}
            color={'#00AAFF'}
            showLine={false}
          />
        ) : (
          <Grid container direction={'column'} spacing={1}>
            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'center'}
                  xs={3}
                >
                  <Typography variant={'button'}>NAME</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant={'body2'}>
                    {vendorCommission.vendor}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'center'}
                  xs={3}
                >
                  <Typography variant={'button'}>COMMISSION TYPE</Typography>
                </Grid>
                <Grid
                  item
                  xs={9}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <Select
                    input={<StyledInput />}
                    name={'isFixed'}
                    onChange={(e: any) => setCommissionType(e.target.value)}
                    value={commissionType}
                  >
                    <MenuItem value={'fixed'}>{'Fixed'}</MenuItem>
                    <MenuItem value={'%'}>{'Percentage(%)'}</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>

            {commissionType === '%' ? (
              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={3}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'center'}
                    xs={3}
                  >
                    <Typography variant={'button'}>COMMISSION</Typography>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <TextField
                      autoFocus
                      autoComplete={'off'}
                      className={classNames([
                        classes.fullWidth,
                        classes.inputCommision,
                      ])}
                      id={'outlined-textarea'}
                      label={''}
                      name={'amount'}
                      onChange={(e: any) => setCommission(e.target.value)}
                      type={'number'}
                      value={commission}
                      variant={'outlined'}
                    />
                    &nbsp; &nbsp;
                    <Typography
                      variant={'body2'}
                      style={{ color: '#828282', fontSize: 14 }}
                    >
                      % of Invoice total
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={3}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'center'}
                    xs={3}
                  >
                    <Typography variant={'button'}>TIER</Typography>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Select
                      input={<StyledInput />}
                      name={'isFixed'}
                      onChange={(e: any) => setTier(e.target.value)}
                      value={commissionTier}
                    >
                      {costingList
                        .filter((t: any) => t.tier.isActive)
                        .map((t: any) => (
                          <MenuItem key={t.tier._id} value={t.tier._id}>
                            Tier {t.tier.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'center'}
                  xs={3}
                >
                  <Typography
                    variant={'button'}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    EFFECTIVE DATE
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      autoOk
                      onChange={(value) => value && setEffectiveDate(value)}
                      format={'MM/dd/yy'}
                      variant={'inline'}
                      inputVariant={'outlined'}
                      value={effectiveDate}
                      fullWidth
                      InputProps={{
                        className: classes.datePicker,
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'center'}
                  xs={3}
                >
                  <Typography variant={'button'}>CONTACT</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant={'body2'}>
                    {vendorCommission.contact.displayName}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'center'}
                  xs={3}
                >
                  <Typography variant={'button'}>EMAIL</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant={'body2'}>
                    {vendorCommission.email}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container direction={'row'} spacing={3}>
                <Grid
                  container
                  item
                  justify={'flex-end'}
                  alignItems={'flex-start'}
                  xs={3}
                >
                  <Typography variant={'button'}>PHONE</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant={'body2'}>
                    {vendorCommission.phone}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      {!error && !warning && (
        <div style={{ fontSize: 12, textAlign: 'center', color: '#828282' }}>
          * Changes to Commission will only be applied from Effective Date and
          onwards.
        </div>
      )}

      <DialogActions
        classes={{
          root: classes.dialogActions,
        }}
      >
        <div>
          {!error && !warning && (
            <Button
              aria-label={'cancel-edit-commission'}
              classes={{
                root: classes.closeButton,
              }}
              disabled={isSubmitting}
              onClick={() => closeModal()}
              variant={'outlined'}
            >
              Cancel
            </Button>
          )}
        </div>
        <div>
          {!error && !warning && (
            <Button
              aria-label={'view-history-commission'}
              classes={{
                root: classes.viewHistoryButton,
              }}
              disabled={isSubmitting}
              onClick={viewHistory}
              variant={'outlined'}
            >
              View History
            </Button>
          )}

          {(error || warning) && (
            <Button
              aria-label={'cancel-edit-commission'}
              classes={{
                root: classes.closeButton,
              }}
              disabled={isSubmitting}
              onClick={() => closeModal()}
              variant={'outlined'}
            >
              {error ? 'Close' : 'Cancel'}
            </Button>
          )}

          {!error && (
            <Button
              disabled={
                isSubmitting || (commissionTier === 'fixed' && !commissionTier)
              }
              aria-label={'submit-edit-commission'}
              classes={{
                root: classes.submitButton,
                disabled: classes.submitButtonDisabled,
              }}
              color="primary"
              type={'submit'}
              variant={'contained'}
              onClick={submit}
            >
              Submit
            </Button>
          )}
        </div>
      </DialogActions>
    </DataContainer>
  );
}

const DataContainer = styled.div`
    margin: auto 0;
    .MuiGrid-container {
      padding: 10px 0;
    }
    .MuiFormLabel-root {
      font - style: normal;
      font-weight: normal;
      width: 800px;
      font-size: 20px;
      color: ${CONSTANTS.PRIMARY_DARK};
      /* margin-bottom: 6px; */
    }
    .MuiFormControl-marginNormal {
      margin - top: .5rem !important;
      margin-bottom: 1rem !important;
      /* height: 20px !important; */
    }
    .MuiInputBase-input {
      color: #383838;
      font-size: 16px;
      padding: 6px 14px;
    }
    .MuiInputAdornment-positionStart {
      margin - right: 0;
    }
    .MuiInputAdornment-root + .MuiInputBase-input {
      padding: 12px 14px 12px 0;
    }
    .MuiOutlinedInput-multiline {
      padding: 0;
    }
    .required > label:after {
      margin - left: 3px;
      content: "*";
      color: red;
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit - appearance: none;
    margin: 0;
  }

    /* Firefox */
    input[type=number] {
    -moz - appearance: textfield;
  }
`;

export default withStyles(styles, { withTheme: true })(BcEditCommissionModal);

