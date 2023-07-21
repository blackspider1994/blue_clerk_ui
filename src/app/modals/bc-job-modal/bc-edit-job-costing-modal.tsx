import styles from './bc-job-modal.styles';
import {
  Button, DialogActions,
  Grid,
  Typography,
  withStyles,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
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
import { refreshJobs } from 'actions/job/job.action';
import BCTabs from 'app/components/bc-tab/bc-tab';
import SwipeableViews from 'react-swipeable-views';
import { getCommissionHistoryByJob } from 'api/commission-history.api';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';

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
  );

  const dispatch = useDispatch()
  const [editing, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commissionLoading, setCommissionLoading] = useState(true);
  const updateFields: {
    [key: string]: any;
  } = { addition: { amount: 0, note: "" }, deduction: { amount: 0, note: "" } };

  const [updatedCost, setUpdatedCost] = useState<{ [key: string]: any; }>({});
  const [update, setUpdates] = useState(updateFields);
  const [tabsData, setTabsData] = useState([]);
  const [curTab, setCurTab] = useState(0);
  const [technicianAmount, setTechnicianAmount] = useState(0);
  const [jobCommisionHistory, setJobCommisionHistory] = useState([]);

  useEffect(() => {
    const newTabsData: any = job.tasks.filter((res: any) => res.contractor?.commissionTier).map((res: any, index: number) => {
      return {
        label: "Task " + (index + 1),
        task: res,
        value: index,
      }
    })

    setTabsData(newTabsData);

    //Get Commission Histories
    getCommissionHistoryByJob(job._id).then((res) => {
      setJobCommisionHistory(res);
      setCommissionLoading(false);
    });
  }, []);

  useEffect(() => {
    handleTabChange(0);
  }, [jobCommisionHistory])

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

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
    const res: any = tabsData.find((res: any) => res.value == newValue);
    if (res) {
      const technicianTier = costingList?.find(({ tier }: { tier: any }) => tier?._id === (res.task?.contractor?.commissionTier))?.tier;

      let jobCostingCharge = 0;
      res.task.jobTypes.forEach((taskJobType: any) => {
        const costingList = items?.find(({ jobType }) => jobType === taskJobType?.jobType?._id)?.costing;
        const charge = costingList?.find(({ tier }) => tier?._id === technicianTier?._id)?.charge
        jobCostingCharge += Number(charge || 0) * (taskJobType.quantity || 1)
      });

      const commisionHistory: any = getCommissionHistory(res.task?.contractor?._id);
      setUpdates(
        {
          addition: {
            amount: commisionHistory?.addition?.amount || 0,
            note: commisionHistory?.addition?.note || ""
          },
          deduction: {
            amount: commisionHistory?.deduction?.amount || 0,
            note: commisionHistory?.deduction?.note || ""
          }
        }
      )

      setTechnicianAmount(jobCostingCharge + Number(commisionHistory?.addition.amount || 0) - Number(commisionHistory?.deduction.amount || 0));
    }
  };

  const getCommissionHistory = (contractorId: string) => {
    if (updatedCost[contractorId]) {
      return updatedCost[contractorId];
    } else if (jobCommisionHistory.length) {
      let result = null;
      jobCommisionHistory.forEach((commission: any) => {
        if (commission.technicianOrContractor === contractorId) {
          result = commission
        }
      });
      return result;
    } else {
      return null
    }
  }

  const submitCommission = async () => {
    if (!editing) return setEdit(true)
    try {
      setLoading(true)
      Object.keys(updatedCost).forEach(async key => {
        await updateJobCommission(key, { ...updatedCost[key], balance: technicianAmount, job: job._id })
      })
      dispatch(success(`Update successful`));
      dispatch(refreshJobs(false));
      dispatch(refreshJobs(true));
      setEdit(false)
      dispatch(closeModalAction())
    } catch (error) {
      dispatch(errorSnackBar('Error updating commission'));
    }
    setLoading(false)
  }

  return (
    <DataContainer className={'new-modal-design'}>
      <Grid container className={'modalPreview'} justify={'space-around'}>
        <Grid item xs={12}>
          <Typography variant="body1">{job.jobId?.replace(" ", " #")}</Typography>
        </Grid>
      </Grid>
      {commissionLoading ? (
        <BCCircularLoader heightValue={'20vh'} />
      ) : (
        <div>
            <div className={'modalContent'}>
              <BCTabs
                curTab={curTab}
                indicatorColor={'primary'}
                onChangeTab={handleTabChange}
                tabsData={tabsData}
              />
              <SwipeableViews index={curTab}>
                {tabsData.map((res: any) => {
                  const technicianTier = costingList?.find(({ tier }: { tier: any }) => tier?._id === (res.task?.contractor?.commissionTier))?.tier;
                  let jobCostingCharge = 0;
                  let jobTypesTitle: string[] = [];
                  res.task.jobTypes.forEach((taskJobType: any) => {
                    const costingList = items?.find(({ jobType }) => jobType === taskJobType?.jobType?._id)?.costing;
                    const charge = costingList?.find(({ tier }) => tier?._id === technicianTier?._id)?.charge
                    jobCostingCharge += Number(charge || 0) * (taskJobType.quantity || 1);

                    jobTypesTitle.push(taskJobType.jobType?.title);
                  });
                  return (
                    <div
                      className={classes.jobCostingContent}
                      hidden={false}
                      id={res.value}>
                      <Grid container className={'pt'}>
                        <Grid item sm={7}>
                          <Grid container>
                            <Grid item xs={12}>
                              <Typography variant={'body1'} className={'previewCaption'}>technician</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant={'subtitle1'} className={'previewCaption'}>{res.task.contractor.info.displayName || res.task.contractor.info.companyName} - Tier {technicianTier?.name}</Typography>
                              <Typography variant={'body1'}>
                                {res.task.contractor?.info?.companyEmail}
                              </Typography>
                              <Typography variant={'body1'}>
                                {res.task.contractor?.contact?.phone}
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
                                {jobTypesTitle.toString()}
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
                                  const { target }: { target: any } = e;

                                  let newUpdatedCost = updatedCost;
                                  newUpdatedCost[res.task?.contractor?._id] = {
                                    ...update, [key]: {
                                      ...update[key],
                                      [target.name]:
                                        isBlur && target.name === 'amount' ?
                                          replaceAmountToDecimal(target.value)
                                          : target.value
                                    }
                                  };
                                  setUpdatedCost(newUpdatedCost);
                                  setTechnicianAmount(jobCostingCharge + Number(newUpdatedCost[res.task?.contractor?._id].addition.amount || 0) - Number(newUpdatedCost[res.task?.contractor?._id]?.deduction.amount || 0));

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
                            <Typography variant={'body1'}>Total after additions and/or deductions: ${replaceAmountToDecimal(String((technicianAmount)))}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </div>)
                })}
              </SwipeableViews>
            </div>
            <DialogActions>
              <Grid container alignItems='center' justify='space-between' direction={editing ? `row-reverse` : 'row'}>
                <Button
                  color='primary'
                  disabled={loading || (editing && (!update.addition.amount && !update.deduction.amount))}
                  onClick={submitCommission}
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
        </div>
      )}
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
