import styles from './bc-job-modal.styles';
import {
  Button, DialogActions,
  Grid,
  Typography,
  withStyles,
} from '@material-ui/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import '../../../scss/job-poup.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'reducers';
import BcInput from 'app/components/bc-input/bc-input';
import { replaceAmountToDecimal } from 'utils/validation';
import { updateJobCommission } from 'api/invoicing.api';
import { closeModalAction, openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../constants';
import {
  error as errorSnackBar,
  success,
} from 'actions/snackbar/snackbar.action';

const initialJobState = {
  customer: {
    _id: '',
  },
  description: '',
  employeeType: false,
  equipment: {
    _id: '',
  },
  dueDate: '',
  scheduleDate: null,
  scheduledEndTime: null,
  scheduledStartTime: null,
  technician: {
    _id: '',
  },
  contractor: {
    _id: '',
  },
  ticket: {
    _id: '',
  },
  type: {
    _id: '',
  },
  jobLocation: {
    _id: '',
  },
  jobSite: {
    _id: '',
  },
  jobRescheduled: false,
};
function BCEditJobCostingModal({
  classes,
  job = initialJobState,
}: any): JSX.Element {
  const costingList = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting.costingList
  );
  const { items } = useSelector(
    ({ invoiceItems }: RootState) => invoiceItems
  ),
    dispatch = useDispatch(),
    [editing, setEdit] = useState(false),
    [loading, setLoading] = useState(false),
    updateFields: {
      [key: string]: any;
    } = { addition: { amount: 0, note: "" }, deduction: { amount: 0, note: "" } },
    [update, setUpdates] = useState(updateFields),
    contractorId = job.tasks?.length && job.tasks[0]?.contractor?._id || job.contractorsObj?.length && job.contractorsObj[0]?._id,
    commissionTier = job?.tasks?.length ? job?.tasks[0].contractor?.commissionTier : job.contractorsObj[0]?.commissionTier,
    technicianTier = costingList?.find(({ tier }: { tier: any }) => tier?._id === (commissionTier))?.tier,
    jobCostingCharge = items?.find(({ jobType }) => jobType === job.tasks[0]?.jobTypes[0]?.jobType?._id)?.costing?.find(({ tier }) => tier?._id === technicianTier?._id)?.charge || "0",
    technicianAmount = jobCostingCharge + Number(update.addition.amount) - Number(update.deduction.amount)

  const openDetailJobModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          job: job,
          removeFooter: false,
          maxHeight: '100%',
          modalTitle: 'View Job',
        },
        type: modalTypes.VIEW_JOB_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };
  const handleClose = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  return (
    <DataContainer className={'new-modal-design'}>
      <Grid container className={'modalPreview'} justify={'space-around'}>
        <Grid item xs={12}>
          <Typography variant="body1">{job.jobId?.replace(" ", " #")}</Typography>
        </Grid>
      </Grid>
      <div className={'modalContent'}>
        <Grid container>
          <Grid item sm={7}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'body1'} className={'previewCaption'}>technician</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant={'h6'} className={'previewCaption'}>{job.tasks[0]?.technician?.profile?.displayName} - Tier {technicianTier?.name}</Typography>
                <Typography variant={'body1'}>
                  {job.tasks[0]?.contractor?.info?.companyEmail}
                </Typography>
                <Typography variant={'body1'}>
                  {job.tasks[0]?.contractor?.contact?.phone}
                </Typography>
              </Grid>
            </Grid>

          </Grid>
          <Grid item sm={3}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'body1'} className={'previewCaption'}>item name</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant={'body1'}>
                  {job.tasks[0]?.jobTypes[0]?.jobType?.title}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={2}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant={'body1'} className={'previewCaption'}>amount to tech</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant={'body1'}>
                  ${replaceAmountToDecimal(String(jobCostingCharge))}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className='addition'>
            <Typography variant={'body1'} className={'previewCaption'}>addition and deduction</Typography>
          </Grid>
          <Grid container alignItems='center' spacing={2}>
            {Object.keys(updateFields).map((key) => {
              const { amount, note } = update[key],
                handleChange =
                  (e: any, isBlur: boolean) => {
                    const { target }: { target: any } = e
                    return setUpdates(i => ({
                      ...i, [key]: {
                        ...update[key],
                        [target.name]:
                          isBlur && target.name === 'amount' ?
                            replaceAmountToDecimal(target.value)
                            : target.value
                      }
                    }))
                  }
              return <Grid item xs={12} key={key}>
                <Grid container alignItems='center' spacing={4}>
                  <Grid item xs={3}>
                    <Typography variant={'body1'} className={'previewCaption'}>{key}s</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <BcInput
                      name='amount'
                      value={amount}
                      type="number"
                      margin={'none'}
                      placeholder="$0.00"
                      disabled={!editing}
                      handleChange={handleChange}
                      onBlur={(e: any) => handleChange(e, true)}
                      inputProps={{
                        style: {
                          padding: '12px 14px',
                        },
                      }}
                      InputProps={{
                        style: {
                          borderRadius: 8,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <BcInput
                      name={'note'}
                      value={note}
                      margin={'none'}
                      placeholder="Note"
                      disabled={!editing}
                      onBlur={handleChange}
                      handleChange={handleChange}
                      inputProps={{
                        style: {
                          padding: '12px 14px',
                        },
                      }}
                      InputProps={{
                        style: {
                          borderRadius: 8,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            })}
          </Grid>
          <hr />
          <Grid item xs={12} className='addition'>
            <Grid container justify='flex-end'>
              <Typography variant={'body1'}>Technician Amount: ${replaceAmountToDecimal(String((technicianAmount)))}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <DialogActions>
        <Grid container alignItems='center' justify='space-between' direction={editing ? `row-reverse` : 'row'}>
          <Button
            color='primary'
            disabled={loading || (editing && (!update.addition.amount && !update.deduction.amount))}
            onClick={async () => {
              if (!editing) return setEdit(true)
              try {
                setLoading(true)
                await updateJobCommission(job._id, { ...update, balance: technicianAmount })
                dispatch(success(`Update successful`));
                setEdit(false)
                dispatch(closeModalAction())
              } catch (error) {
                dispatch(errorSnackBar('Error updating commission'));
              }
              setLoading(false)
            }}
            variant='contained'
          >{editing ? 'Complete' : 'Edit'}</Button>
          <Button
            aria-label='update-job-costing'
            onClick={async () => {
              if (job.isInvoice) return handleClose()
              if (editing) return setEdit(false)
              openDetailJobModal()
            }}
            classes={{
              root: classes.closeButton,
            }}
            variant='outlined'
          >
            {editing ? 'Cancel' : 'Go Back'}
          </Button>
        </Grid>
      </DialogActions>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  margin: auto 0;

  .modalContent {
    padding-top: 15px !important;
  }

  .addition {
    margin-top: 25px !important;
  }

  .MuiButton-containedSecondary {
    margin-left: 15px !important;
}

`;

export default withStyles(styles, { withTheme: true })(BCEditJobCostingModal);