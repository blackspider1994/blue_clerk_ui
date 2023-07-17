import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import styles from './bc-service-ticket-modal.styles';
import {
  Grid,
  Typography,
  withStyles,
} from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from 'helpers/format';
import styled from 'styled-components';
import { getEmployeesForJobAction } from 'actions/employees-for-job/employees-for-job.action';
import '../../../scss/job-poup.scss';
import moment from 'moment';
import classNames from "classnames";
import {getVendors} from "../../../actions/vendor/vendor.action";
import BCDragAndDrop from "../../components/bc-drag-drop/bc-drag-drop";
import { Button } from '@material-ui/core';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../constants';

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

function BCViewServiceTicketModal({
                          classes,
                          job = initialJobState,
                        }: any): JSX.Element {
  const dispatch = useDispatch();
  const customers = useSelector(({ customers }: any) => customers.data);
  const items = useSelector((state: any) => state.invoiceItems.items);

  const calculateJobType = () => {
    let title = [];
    if (job.tasks) {
      job.tasks.forEach((task: any) => 
      {
        let jobType = {
          title: task.jobType?.title,
          quantity: task.quantity || 1,
          price: 0
        };

        const item = items.find((res: any) => res.jobType == task.jobType?._id);
        const customer = customers.find((res: any) => res._id == job?.customer?._id);
        if (item) {
          let price = item?.tiers?.find((res: any) => res.tier?._id == customer?.itemTier)
          if (customer && price) {
            jobType.price = price?.charge * jobType.quantity;
          } else {
            price = item?.tiers?.find((res: any) => res.tier?.isActive == true)
            jobType.price = price?.charge * jobType.quantity;
          }
        }
        title.push(jobType);
      })
    } else if (job.jobType) {
      let jobType = {
        title: job.jobType.title || 'N/A',
        quantity: 1,
        price: 0
      };
      const item = items.find((res: any) => res.jobType == job.jobType?._id);
      const customer = customers.find((res: any) => res._id == job?.customer?._id);
      if (item) {
        let price = item?.tiers?.find((res: any) => res.tier?._id == customer?.itemTier)
        if (customer && price) {
          jobType.price = price?.charge * jobType.quantity;
        } else {
          price = item?.tiers?.find((res: any) => res.tier?.isActive == true)
          jobType.price = price?.charge * jobType.quantity;
        }
      }

      title.push(jobType);
    }
    return title;
  }

  const track = job.track ? job.track : [];

  const equipments = useSelector(({ inventory }: any) => inventory.data);
  const { loading, data } = useSelector(
    ({ employeesForJob }: any) => employeesForJob
  );
  const vendorsList = useSelector(({ vendors }: any) =>
    vendors.data.filter((vendor: any) => vendor.status <= 1)
  );
  const employeesForJob = useMemo(() => [...data], [data]);

  useEffect(() => {
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
  }, []);

  const columns: any = [
    {
      Header: 'User',
      id: 'user',
      sortable: true,
      Cell({ row }: any) {
        const user = row.original.user;
        const vendor = vendorsList.find((v: any) => v.contractor.admin._id === row.original.user);
        const { displayName } = user?.profile || vendor?.contractor.admin.profile || '';
        return <div>{displayName}</div>;
      },
    },
    {
      Header: 'Date',
      id: 'date',
      sortable: true,
      Cell({ row }: any) {
        const dataTime = moment(new Date(row.original.date)).format(
          'MM/DD/YYYY h:mm A'
        );
        return (
          <div style={{ color: 'gray', fontStyle: 'italic' }}>
            {`${dataTime}`}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      id: 'action',
      sortable: true,
      Cell({ row }: any) {
        const splittedActions = row.original.action.split('|');
        const actions = splittedActions.filter((action: any) => action !== '');
        return (
          <>
            {actions.length === 0 ? (
              <div />
            ) : (
              <ul className={classes.actionsList}>
                {actions.map((action: any) => (
                  <li>{action}</li>
                ))}
              </ul>
            )}
          </>
        );
      },
    },
  ];
  
  const scheduleDate = job?.dueDate;

  const sendPORequestEmail = () => {
    dispatch(setModalDataAction({
      'data': {
        'po_request': job,
        'modalTitle': `Send this ${job?.ticketId}`,
        'removeFooter': false,
      },
      'type': modalTypes.EMAIL_PO_REQUEST_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }
  

  return (
    <DataContainer className={'new-modal-design'}>
      <Grid container className={'modalPreview'} justify={'space-around'}>
        {job?.type == "PO Request" && (
          <Grid item xs={12}>
            <Button
              color='primary'
              variant="outlined"
              className={'whiteButton'}
              onClick={sendPORequestEmail}
            >
              Send PO Request
            </Button>
          </Grid>
        )}
        <Grid item style={{width: '40%'}}>
          <Typography variant={'caption'} className={'previewCaption'}>customer</Typography>
          <Typography variant={'h6'} className={'bigText'}>{job?.customer?.profile?.displayName || 'N/A'}</Typography>
        </Grid>
        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>due date</Typography>
          <Typography variant={'h6'} className={'previewTextTitle'}>{scheduleDate ? formatDate(scheduleDate) : 'N/A'}</Typography>
        </Grid>
        <Grid item xs />
        <Grid item xs />
      </Grid>
      <div className={'modalDataContainer'}>
        <Grid container className={'modalContent'} justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>subdivision</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.jobLocation?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>job address</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.jobSite?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>job type</Typography>
            <Typography variant={'h6'} className={'previewText'}>
              {calculateJobType().map((type:any) => <span className={'jobTypeText'}>{type.title} - {type.quantity} - ${type.price}</span>)}
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>equipment</Typography>
            <Typography variant={'h6'} className={'previewText'}>N/A</Typography>
          </Grid>
        </Grid>
        <Grid container className={'modalContent'} justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>contact associated</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.customerContactId?.name ||'N/A'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>Customer PO</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job.customerPO || 'N/A'}</Typography>
          </Grid>
          <Grid item style={{width: '50%'}}>
            <Typography variant={'caption'} className={'previewCaption'}>note</Typography>
            <Typography variant={'h6'} className={classNames('previewText', 'description')}>{job.note || 'N/A'}</Typography>
          </Grid>
        </Grid>
        <Grid container className={'modalContent'} justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>house is occupied</Typography>
            <Typography variant={'h6'} className={'previewText'}>{job?.isHomeOccupied ? 'YES' : 'NO'}</Typography>
          </Grid>
        </Grid>
        { 
          job?.isHomeOccupied 
          ? (
                <Grid container className={'modalContent'} justify={'space-around'}>                
                  <Grid item xs>
                    <Typography variant={'caption'} className={'previewCaption'}>home owner name</Typography>
                    <Typography variant={'h6'} className={'previewText'}>{job?.homeOwner?.profile?.displayName ||'N/A'}</Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant={'caption'} className={'previewCaption'}>home owner email</Typography>
                    <Typography variant={'h6'} className={'previewText'}>{job?.homeOwner?.info?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item style={{width: '50%'}}>
                    <Typography variant={'caption'} className={'previewCaption'}>home owner phone</Typography>
                    <Typography variant={'h6'} className={classNames('previewText', 'description')}>{job?.homeOwner?.contact?.phone || 'N/A'}</Typography>
                  </Grid>
                </Grid>  
            )
          : <div />
        }
        <Grid container className={classNames('modalContent', classes.lastContent)} justify={'space-between'}>
          <Grid item style={{width: '30%'}}>
            <Typography variant={'caption'} className={'previewCaption'}>&nbsp;</Typography>
            <BCDragAndDrop images={job.images?.map((image: any) => image.imageUrl) || []} readonly={true}  />
          </Grid>
          <Grid item style={{width: '68%'}}>
            <Typography variant={'caption'} className={'previewCaption'}>&nbsp;&nbsp;ticket history</Typography>
            <div style={{height: 180, overflowY: 'auto'}}>
              <BCTableContainer
                className={classes.tableContainer}
                columns={columns}
                initialMsg={'No history yet'}
                isDefault
                isLoading={loading}
                onRowClick={() => {}}
                pageSize={5}
                pagination={true}
                stickyHeader
                tableData={[{action: 'Service Ticket Created', date: job.createdAt, user: job.createdBy}, ...track].reverse()}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </DataContainer>
  );
}

const Label = styled.div`
  color: red;
  font-size: 15px;
`;

const DataContainer = styled.div`
  margin: auto 0;

  ::-webkit-scrollbar {
    width: 12px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      -webkit-border-radius: 10px;
      border-radius: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
      -webkit-border-radius: 10px;
      border-radius: 10px;
      background: rgba(255,0,0,0.8);
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
  }
  .MuiTableCell-root {
    line-height: normal;
  }

  .MuiTableCell-sizeSmall {
    padding: 0px 16px;
  }

  .whiteButton {
    background-color: #ffffff;
    border-radius: 6px;
  }  
`;

export default withStyles(styles, { withTheme: true })(BCViewServiceTicketModal);
