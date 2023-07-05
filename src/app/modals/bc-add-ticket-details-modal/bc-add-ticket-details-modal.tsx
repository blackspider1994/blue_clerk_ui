import {
  Button,
  DialogActions, FormControlLabel,
  Grid,
  Typography,
  withStyles
} from "@material-ui/core";
import React, {useEffect, useMemo, useState} from "react";
import styles from './bc-add-ticket-details-modal.styles';
import {useDispatch, useSelector} from "react-redux";
import {
  getVendors
} from "../../../actions/vendor/vendor.action";
import {
  closeModalAction,
  setModalDataAction
} from "../../../actions/bc-modal/bc-modal.action";

import BCTableContainer
  from "../../components/bc-table-container/bc-table-container";
import styled from "styled-components";
import classNames from "classnames";
import BCTicketMessagesNotes from "./bc-ticket-messages-notes";
import moment from "moment/moment";
import {formatDate, formatTime} from "../../../helpers/format";
import {
  error as errorSnackBar,
  success
} from "../../../actions/snackbar/snackbar.action";
import {useHistory} from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import {getContacts} from "../../../api/contacts.api";
import {updateInvoiceMessages} from '../../../api/invoicing.api';
import {
  getEmployeesForJobAction
} from "../../../actions/employees-for-job/employees-for-job.action";


function BcAddTicketDetailsModal({classes, props}: any): JSX.Element {
  const {invoiceData, isEditing} = props;

  const history = useHistory();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComments, setSelectedComments] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showJobId, setShowJobId] = useState(true);

  const technicianImages =
    invoiceData.job?.technicianImages?.map((image: any) => ({
      date: image.createdAt,
      imageUrl: image.imageUrl,
      uploader: image.uploadedBy?.profile?.displayName,
    })) || [];


  const comments = (invoiceData.job?.tasks || [])
    .filter((task: any) => task.comment)
    .map((task: any) => {
      return {
        comment: task.comment,
        id: task._id,
      }

    });

  const startTime = invoiceData?.job?.scheduledStartTime ? formatTime(invoiceData?.job?.scheduledStartTime) : '';
  const endTime = invoiceData?.job?.scheduledEndTime ? formatTime(invoiceData?.job?.scheduledEndTime) : '';

  const scheduleTimeAMPM = invoiceData?.job?.scheduleTimeAMPM ?
    invoiceData?.job?.scheduleTimeAMPM === 1 ? 'AM' :
      invoiceData?.job?.scheduleTimeAMPM === 2 ? 'PM' : '' : '';

  const jobData = {
    commentValues: [{
      comment: invoiceData?.job?.description|| invoiceData?.job?.ticket?.note || '',
      id: invoiceData?.job?.ticket?._id
    }] || [],
    images: invoiceData?.job?.ticket?.images || []
  };

  const technicianData = {
    commentValues: comments,
    images: technicianImages
  }

  const allComments = [...jobData.commentValues, ...technicianData.commentValues];
  const allImages = [...jobData.images, ...technicianData.images];

  let technicianNotes = invoiceData.job?.tasks?.length ? invoiceData.job.tasks.filter((task: any) => task.comment).map((task: any) => {
    return {
      user: 'tech',
      action: task.comment,
      date: '',
    }
  }) : [];


  const {loading, data} = useSelector(
    ({employeesForJob}: any) => employeesForJob
  );
  const vendorsList = useSelector(({vendors}: any) =>
    vendors.data.filter((vendor: any) => vendor.status <= 1)
  );

  const employeesForJob = useMemo(() => [...data], [data]);

  const {contacts} = useSelector((state: any) => state.contacts);
  const customerContact = invoiceData?.job?.customerContactId?.name ||
    contacts.find((contact: any) => contact._id === invoiceData?.job?.customerContactId)?.name;

  // if (!isEditing) {
  //   jobData.commentValues = jobData.commentValues.filter((c: any) => invoiceData.technicianMessages.notes.filter((comment: any) => comment.id === c.id)?.length > 0);
  //   jobData.images = jobData.images.filter((i: any) => invoiceData.technicianMessages.images.filter((image: any) => image === i.imageUrl)?.length > 0);
  //
  //   technicianData.commentValues = technicianData.commentValues.filter((c: any) => invoiceData.technicianMessages.notes.filter((comment: any) => comment.id === c.id)?.length > 0);
  //   technicianData.images = technicianData.images.filter((i: any) => invoiceData.technicianMessages.images.filter((image: any) => image === i.imageUrl)?.length > 0);
  // }

  useEffect(() => {

    // Set selected comments all if isEditing is true otherwise set selected comments to invoiceData.technicianMessages.notes
    if (isEditing) {
      setSelectedComments(allComments.filter((comment: any) => invoiceData.technicianMessages.notes.filter((c: any) => c.id === comment.id)?.length > 0));
      setSelectedImages(allImages.filter((image: any) => invoiceData.technicianMessages.images.filter((i: any) => i === image.imageUrl)?.length > 0));
      setShowJobId(invoiceData.showJobId || false);
    }
    const data: any = {
      type: 'Customer',
      referenceNumber: invoiceData.job.customer,
    };
    dispatch(getContacts(data));
    dispatch(getEmployeesForJobAction());
    dispatch(getVendors());
  }, [])

  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const updateInvoiceMessagesAction = ({
                                         invoiceId,
                                         notes,
                                         images,
                                         showJobId
                                       }: any, callback?: Function) => {
    return async (dispatch: any) => {
      const result: any = await updateInvoiceMessages({
        invoiceId,
        notes,
        images,
        showJobId
      });
      if (result.status === 1) {
        dispatch(success(result?.message || 'Invoice updated successfully'));
        callback && callback({
          status: result.status,
          message: result?.message || 'Invoice updated successfully'
        });
      } else {
        dispatch(errorSnackBar(result?.message || 'Something went wrong'));
      }
    }
  }

  // Handle Submit Modal
  const handleSubmitModal = async () => {
    setIsSubmitting(true);
    const requestObj = {
      invoiceId: invoiceData._id,
      notes: selectedComments,
      images: selectedImages.map((image: any) => image.imageUrl),
      showJobId: showJobId,
    };
    try {
      await dispatch(updateInvoiceMessagesAction(requestObj, ({
                                                                status,
                                                                message
                                                              }: {
        status: number,
        message: string
      }) => {
        if (status === 1) {
          dispatch(success(message));
          closeModal();
          history.replace(`/main/invoicing/view/${invoiceData._id}`, history.location.state)
        } else {
          dispatch(errorSnackBar(message));
        }
        setIsSubmitting(false);
      }))
    } catch (err) {
      dispatch(errorSnackBar("Something's wrong"));
      setIsSubmitting(false);
    }
  }

  const columns: any = [
    {
      Header: 'User',
      id: 'user',
      sortable: true,
      Cell({row}: any) {
        if (row.original.user === 'tech') {
          return <div>{'Technician\'s comment'}</div>
        }
        const user = employeesForJob.filter(
          (employee: any) => employee._id === row.original.user?._id
        )[0];
        const vendor = vendorsList.find((v: any) => v.contractor.admin?._id === row.original.user?._id);
        const {displayName} = user?.profile || vendor?.contractor.admin.profile || '';
        return <div>{displayName}</div>;
      },
    },
    {
      Header: 'Date',
      id: 'date',
      sortable: true,
      Cell({row}: any) {
        const dataTime = row.original.date ? moment(new Date(row.original.date)).format(
          'MM/DD/YYYY h:mm A'
        ) : '-';
        return (
          <div style={{color: 'gray', fontStyle: 'italic'}}>
            {`${dataTime}`}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      id: 'action',
      sortable: true,
      Cell({row}: any) {
        const splittedActions = row.original.action.split('|');
        const actions = splittedActions.filter((action: any) => action !== '');
        if (row.original.note) {
          actions.push(`Note: ${row.original.note}`);
        }
        return (
          <>
            {actions.length === 0 ? (
              <div/>
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
  const address = `${invoiceData?.job?.customer?.address?.street ?? ''} ${invoiceData?.job?.customer?.address?.city ?? ''} ${invoiceData?.job?.customer?.address?.state ?? ''} ${invoiceData?.job?.customer?.address?.zipCode ?? ''}`

  return <>
    <DataContainer className={'new-modal-design'}>
      {invoiceData?.job._id &&
        <Typography variant={'caption'} className={'jobIdText'}>{invoiceData?.job.jobId}
          {
            isEditing && invoiceData?.job._id && <>
            <Checkbox
              style={{marginLeft: 25}}
              className={classes.customcheck}
              // Modify the checked condition based on your requirement
              checked={showJobId}
              disabled={!isEditing}
              onChange={() => {
                setShowJobId(!showJobId)
              }}
              color={'primary'}
            />
            <Typography variant={'caption'} className={classes.marginTop12}>
              Add to Invoice
            </Typography>
          </>
          }
        </Typography>
      }
      {/*<BCMiniSidebar data={invoiceData}/>*/}
      <Grid container className={'modalPreview'} justify={'space-around'}>
        <Grid item style={{width: '40%'}}>
          <Typography variant={'caption'}
                      className={'previewCaption'}>customer</Typography>
          <Typography variant={'h6'}
                      className={'bigText'}>{invoiceData.customer?.profile?.displayName || ' '}</Typography>
        </Grid>
        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>DUE
            DATE</Typography>
          <Typography variant={'h6'}
                      className={'previewText'}><span>{invoiceData?.dueDate ? formatDate(invoiceData?.dueDate) : ' '}</span></Typography>
        </Grid>

        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>SCHEDULE
            DATE</Typography>
          <Typography variant={'h6'}
                      className={'previewText'}>{invoiceData?.job?.scheduleDate ? formatDate(invoiceData?.job?.scheduleDate) : ' '}</Typography>
        </Grid>

        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>OPEN
            TIME</Typography>
          <Typography variant={'h6'}
                      className={'previewText'}>{startTime}</Typography>
        </Grid>

        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>CLOSE
            TIMe</Typography>
          <Typography variant={'h6'}
                      className={'previewText'}>{endTime}</Typography>
        </Grid>

        <Grid item xs>
          <Typography variant={'caption'} className={'previewCaption'}>AM/PM</Typography>
          <Typography variant={'h6'}
                      className={'previewText'}>{scheduleTimeAMPM}</Typography>
        </Grid>

      </Grid>

      <div className={`modalDataContainer ${classes.customModalDataContainer}`}>
        <Grid container className={classes.customModalContent}
              justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>TECHNICIAN
              TYPE</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.tasks[0]?.employeeType ? 'Contractor' : 'Employee'}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'}
                        className={'previewCaption'}>TECHNICIAN</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.tasks[0]?.technician?.profile?.displayName || ' '}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>JOB
              TYPE</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.tasks[0]?.jobTypes[0]?.jobType?.title || ' '}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'}
                        className={'previewCaption'}>EQUIPMENT</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}> </Typography>
          </Grid>

          <Grid item style={{width: 100}}>
          </Grid>
        </Grid>

        <Grid container className={classes.customModalContent}
              justify={'space-around'}>
          <Grid item xs>
            <Typography variant={'caption'}
                        className={'previewCaption'}>SUBDIVISION</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.customer?.address?.state || ' '}</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>JOB
              ADDRESS</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.customer?.address?.city || ''}</Typography>
          </Grid>

          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>CONTACT
              ASSOCIATED</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.customerContactId?.name ||''}</Typography>
          </Grid>

          <Grid item xs>
            <Typography variant={'caption'} className={'previewCaption'}>CUSTOMER
              PO</Typography>
            <Typography variant={'h6'}
                        className={'previewText'}>{invoiceData?.job?.customerPO || ''}</Typography>
          </Grid>
          <Grid item style={{width: 100}}>
          </Grid>
        </Grid>
        <Grid container className={classes.customModalContent}
              justify={'space-between'}>
          <Grid container xs={12}>
            <FormControlLabel
              classes={{label: classes.checkboxLabel}}
              control={
                <Checkbox
                  color={'primary'}
                  checked={invoiceData?.job?.isHomeOccupied}
                  name="isHomeOccupied"
                  classes={{root: classes.checkboxInput}}
                  disabled
                />
              }
              label={`HOUSE IS OCCUPIED`}
            />
          </Grid>
          {
            // Check if home occupied is true then show the following fields
            invoiceData?.job?.isHomeOccupied &&
            <Grid container xs={12}>
              <Grid item xs>
                <Typography variant={'caption'}
                            className={'previewCaption'}>FIRST NAME</Typography>
                <Typography variant={'h6'}
                            className={'previewText'}>{invoiceData?.job?.homeOwner?.profile?.firstName || ' ' || ' '}</Typography>
              </Grid>
              <Grid item xs>
                <Typography variant={'caption'} className={'previewCaption'}>LAST
                  NAME</Typography>
                <Typography variant={'h6'}
                            className={'previewText'}>{invoiceData?.job?.homeOwner?.profile?.lastName || ' ' || ' '}</Typography>
              </Grid>

              <Grid item xs>
                <Typography variant={'caption'}
                            className={'previewCaption'}>EMAIL</Typography>
                <Typography variant={'h6'}
                            className={'previewText'}>{invoiceData?.job?.homeOwner?.info?.email || ' '}</Typography>
              </Grid>

              <Grid item xs>
                <Typography variant={'caption'}
                            className={'previewCaption'}>PHONE</Typography>
                <Typography variant={'h6'}
                            className={'previewText'}>{invoiceData?.job?.homeOwner?.contact?.phone || ' ' || ' '}</Typography>
              </Grid>
              <Grid item style={{width: 100}}>
              </Grid>
            </Grid>
          }
        </Grid>

        {
          jobData && ((jobData.commentValues?.length > 0
              && jobData.commentValues.filter(c => Boolean(c.comment))?.length > 0)
            || jobData.images?.length > 0) && <>
            <hr className={classes.horizontalLine}/>
            {
              isEditing && <Typography variant={'caption'}
                                       className={`previewCaption ${classes.padding}`}>Check
                each box if you would like to add this to the invoice</Typography>
            }
            <BCTicketMessagesNotes invoiceData={jobData}
               selectedComments={selectedComments}
               setSelectedComments={setSelectedComments}
               selectedImages={selectedImages}
               setSelectedImages={setSelectedImages}
               isEditing={isEditing}
               isInvoiceMainView = {false}
               isPadding={true}
               isJob={true}
            />
          </>
        }
        {
          technicianData && (technicianData.commentValues?.length > 0 || technicianData.images?.length > 0) && <>
            <hr className={classes.horizontalLine}/>
            <BCTicketMessagesNotes invoiceData={technicianData}
               selectedComments={selectedComments}
               setSelectedComments={setSelectedComments}
               selectedImages={selectedImages}
               setSelectedImages={setSelectedImages}
               isEditing={isEditing}
               isInvoiceMainView = {false}
               isPadding={true}
               isJob={false}
            />
          </>
        }




            <Typography variant={'caption'}
                        className={`previewCaption ${classes.paddingLeft}`}>&nbsp;&nbsp;job
              history</Typography>
            <div>
              <BCTableContainer
                className={classes.tableContainer}
                columns={columns}
                initialMsg={'No history yet'}
                isDefault
                isLoading={loading}
                onRowClick={() => {
                }}
                pageSize={5}
                pagination={true}
                noPadding={true}
                stickyHeader
                tableData={[...invoiceData.job.track, ...technicianNotes]}
              />
            </div>



        <DialogActions>
          <div className={classes.actionsContainer}>
            <Button
              disabled={isSubmitting}
              onClick={() => closeModal()}
              variant={'outlined'}
            >Close</Button>
            {isEditing && <Button
              color={'primary'}
              disabled={isSubmitting}
              type={'submit'}
              variant={'contained'}
              style={{marginLeft: 30}}
              onClick={() => handleSubmitModal()}
            >Submit</Button>}
          </div>
        </DialogActions>
      </div>

    </DataContainer>


  </>
}

const DataContainer = styled.div`
  overflow-y: hidden;

  *:not(.MuiGrid-container) > .MuiGrid-container {
    width: 100%;
    padding: 0px 40px;
  }
  width: 100%;
  .MuiGrid-spacing-xs-4 > .MuiGrid-spacing-xs-4 {
    margin: 0;
  }

  .MuiGrid-root.MuiGrid-item > .MuiGrid-root.MuiGrid-container {
    padding: 0;
  }

  .MuiOutlinedInput-root {
    border-radius: 8px;
    padding: 2px;
  }

  .MuiOutlinedInput-input {
    padding: 9.5px 4px;
  }

  span.required:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }

  margin: auto 0;

  .modalContent {
    padding-top: 15px !important;
  }

  .MuiTableCell-root {
    line-height: normal;
  }

  .MuiTableCell-sizeSmall {
    padding: 0px 16px;
  }

  .MuiButton-containedSecondary {
    margin-left: 15px !important;
  }
`;


export default withStyles(
  styles,
  {'withTheme': true}
)(BcAddTicketDetailsModal);
