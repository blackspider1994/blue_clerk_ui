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
  console.log("JOB", JSON.stringify(job))
  const costingList = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting.costingList
  );
  const { items } = useSelector(
    ({ invoiceItems }: RootState) => invoiceItems
  ),
    dispatch = useDispatch(),
    updateFields: {
      [key: string]: any;
    } = { additions: { amount: 0, note: "" }, deductions: { amount: 0, note: "" } },
    [update, setUpdates] = useState(updateFields),
    technicianTier = costingList?.find(({ tier }: { tier: any }) => tier?._id === job.contractorsObj[0]?.commissionTier)?.tier,
    jobCostingCharge = items?.find(({ jobType }) => jobType === job.tasks[0]?.jobTypes[0]?.jobType?._id)?.costing?.find(({ tier }) => tier?._id === technicianTier?._id)?.charge,
    technicianAmount = jobCostingCharge + Number(update.additions.amount) - Number(update.deductions.amount)

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
                  ${jobCostingCharge}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className='additions'>
            <Typography variant={'body1'} className={'previewCaption'}>additions and deductions</Typography>
          </Grid>
          <Grid container alignItems='center' spacing={2}>
            {Object.keys(updateFields).map((key) => {
              const { amount, note } = update[key],
                handleChange = ({ target }: { target: any }) => setUpdates(i => ({ ...i, [key]: { ...update[key], [target.name]: target.value } }))
              return <Grid item xs={12} key={key}>
                <Grid container alignItems='center' spacing={4}>
                  <Grid item xs={3}>
                    <Typography variant={'body1'} className={'previewCaption'}>{key}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <BcInput
                      handleChange={handleChange}
                      name={'amount'}
                      value={amount}
                      type="number"
                      margin={'none'}
                      placeholder="$0.00"
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
                      handleChange={handleChange}
                      name={'note'}
                      value={note}
                      margin={'none'}
                      placeholder="Note"
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
          <Grid item xs={12} className='additions'>
            <Grid container justify='flex-end'>
              <Typography variant={'body1'}>Technician Amount: ${technicianAmount}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <DialogActions>
        <Grid container alignItems='center' justify='space-between'>
          <Button
            color={'primary'}
            onClick={() => console.log("BIG")}
            variant={'contained'}
          >Complete</Button>
          <Button
            aria-label={'record-payment'}
            onClick={() => console.log("CLOSING")}
            classes={{
              root: classes.closeButton,
            }}
            variant={'outlined'}
          >
            Go Back
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

  .additions {
    margin-top: 25px !important;
  }

  .MuiButton-containedSecondary {
    margin-left: 15px !important;
}

`;

export default withStyles(styles, { withTheme: true })(BCEditJobCostingModal);
