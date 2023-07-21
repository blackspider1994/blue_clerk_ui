import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  withStyles,
  Chip,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState, useEffect} from 'react';
import {
  closeModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import styled from 'styled-components';
import styles from './bc-email-modal.styles';
import { useDispatch, useSelector } from 'react-redux';
import * as CONSTANTS from '../../../constants';
import { useFormik } from 'formik';
import { CompanyProfileStateType } from '../../../actions/user/user.types';
import { sendEmailAction } from '../../../actions/email/email.action';
import BCCircularLoader from '../../components/bc-circular-loader/bc-circular-loader';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { getCustomersContact } from 'api/customer.api';
import { stringSortCaseInsensitive } from 'helpers/sort';
import { error as SnackBarError } from 'actions/snackbar/snackbar.action';
import { PRIMARY_GREEN } from '../../../constants';
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import { getAllInvoicesAPI } from 'api/invoicing.api';

const EmailJobReportModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 40px 10px;
  text-align: center;
  svg {
    margin: 0 auto;
    width: 50%;
    height: 150px;
  }

  p {
    line-height: 30px;
    font-weight: 400;
    font-size: 18px;
    span {
      font-weight: 800;
      font-size: 22px;
    }
  }
  > div {
    margin-top: 30px;
    display: flex;
    justify-content: space-around;
    .MuiButton-containedPrimary {
      color: white;
    }
    button {
      width: 50%;
    }
  }
`;

function EmailJobReportModal({ classes, data }: any) {
  const { sent, loading, error } = useSelector(({ email }: any) => email);
  const profileState: CompanyProfileStateType = useSelector(
    (state: any) => state.profile
    );
  const { user } = useSelector((state: any) => state.auth);
  const [customerContacts, setCustomerContacts] = useState<any[]>([]);
  const [loadingCustomerContacts, setLoadingCustomerContacts] = useState<boolean>(false);
  const [invoiceToView, setInvoiceToView] = useState<any>({});
  const [invoiceInMultipleView, setInvoiceInMultipleView] = useState<number>(0);
  const [invoicesToSend, setInvoicesToSend] = useState<any[]>([]);
  const [sendAllButtonState, setSendAllButtonState] = useState<string>("Send All");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const dispatch = useDispatch();
  // data: {id, ids, customerEmail, customer, emailDefault, customerId, multiple, multipleInvoices}

  const closeModal = () => {
    dispatch(closeModalAction());
    dispatch(getAllInvoicesAPI(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
    setTimeout(() => {
      dispatch(
        setModalDataAction({
          data: {},
          type: '',
        })
      );
    }, 200);
  };

  useEffect(() => {
    //map the props to Invoice To View accordingly

    if (!data?.multiple) {
      setInvoiceToView({
        id: data?.id,
        ids: data?.ids,
        from: data?.from || user?.auth?.email,
        customerEmail: data?.customerEmail,
        customer: data?.customer,
        emailDefault: data?.emailDefault,
        customerId: data?.customerId,
      });
    } else {
      //set the first one, the changer function will handle the switching
      setInvoiceToView({
        id: data?.multipleInvoices[0]?.id,
        ids: data?.multipleInvoices[0]?.ids,
        from: data?.multipleInvoices[0]?.from || user?.auth?.email,
        customerEmail: data?.multipleInvoices[0]?.customerEmail,
        customer: data?.multipleInvoices[0]?.customer,
        emailDefault: data?.multipleInvoices[0]?.emailDefault,
        customerId: data?.multipleInvoices[0]?.customerId,
      });
    }
  }, []);

  useEffect(() => {
    if (invoiceToView?.customerId ) {
      setLoadingCustomerContacts(true);
      getCustomersContact(invoiceToView?.customerId)
        .then((res) => {
          if (res.status === 1) {
            const custContacts = res.contacts
              .filter((contact: { email: string }) => !!contact.email)
              .filter(
                (
                  contact: { email: string },
                  index: number,
                  self: { email: string }[]
                ) => index === self.findIndex((t) => t.email === contact.email)
              );
            setCustomerContacts(custContacts);
            if (custContacts.length) {
              const initialContact = custContacts.filter(
                (contact: any) => invoiceToView?.customerEmail === contact.email
              );
              if (initialContact && !invoiceToView?.receipients) {
                FormikSetFieldValue('to', initialContact);
              }
            }
          }
          setLoadingCustomerContacts(false);
        })
        .catch(() => {
          dispatch(
            SnackBarError(
              "Something went wrong when fetching Customer's contacts. Please try again."
            )
          );
        });
    }
  }, [invoiceToView.customerId]);

  useEffect(() => {
    if (error) {
      dispatch(SnackBarError('Something went wrong'));
    }
  }, [error]);

  const handleRecipientChange = (fieldName: string, data: any) => {
    if (typeof data[data.length - 1] === 'string') {
      const trimmedInput = data[data.length - 1].trim();
      const test = trimmedInput
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      if (!test) {
        return;
      }
    }
    FormikSetFieldValue(
      fieldName,
      data.map((datum: any) => {
        if (typeof datum === 'string') {
          return { email: datum.trim() };
        } else {
          return datum;
        }
      })
    );
  };

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      from: invoiceToView?.from || user?.auth?.email,
      to: invoiceToView?.receipients || [{ email: invoiceToView.customerEmail }],
      subject: invoiceToView?.emailDefault?.subject,
      message: invoiceToView?.emailDefault?.message,
      sendToMe: invoiceToView?.emailDefault?.sendToMe || false,
    },

    onSubmit: (values: any, { setSubmitting }: any) => {
      if (!values.to.length) {
        dispatch(SnackBarError('Please Add Recipient(s)'));
        return;
      }
      const params: any = {
        ...(invoiceToView.id && {
          id: invoiceToView.id,
          invoiceId: invoiceToView.id,
          invoicePdf: true,
        }),
        ...(invoiceToView.ids && {
          ids: invoiceToView.ids,
          invoiceIds: JSON.stringify(invoiceToView.ids),
          customerId: invoiceToView.customerId,
        }),
        recipients: JSON.stringify(
          values.to.map((recipient: any) => recipient.email)
        ),
        subject: values.subject,
        message: values.message,
        copyToMyself: values.sendToMe,
      };
      dispatch(
        sendEmailAction.fetch({
          email:
            values.to.map((recipient: any) => recipient.email).join(',') ||
            invoiceToView.customer?.info?.email,
          data: params,
          type: invoiceToView.ids ? 'invoices' : 'invoice',
        })
      );
    },
  });

  const {
    errors: FormikErrors,
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    setFieldValue: FormikSetFieldValue,
    //getFieldMeta,
    //isSubmitting
  } = form;

  const slideNextInvoice = (e: any) => {
    e.stopPropagation();
    
    if (invoicesToSend[invoiceInMultipleView + 1]) {
        //use it
       const tempEmailDefault = {
        subject:invoicesToSend[invoiceInMultipleView + 1]?.subject,
        message:invoicesToSend[invoiceInMultipleView + 1]?.message,
        sendToMe:invoicesToSend[invoiceInMultipleView + 1]?.sendToMe,
      }

      const tempReceipients = [...invoicesToSend[invoiceInMultipleView + 1]?.to]
     
      setInvoiceToView({
        id: data?.multipleInvoices[invoiceInMultipleView + 1]?.id,
        ids: data?.multipleInvoices[invoiceInMultipleView + 1]?.ids,
        customerEmail:
          data?.multipleInvoices[invoiceInMultipleView + 1]?.customerEmail,
        customer: data?.multipleInvoices[invoiceInMultipleView + 1]?.customer,
        emailDefault: tempEmailDefault,
        receipients:tempReceipients,
        customerId: data?.multipleInvoices[invoiceInMultipleView + 1]?.customerId,
        from: data?.multipleInvoices[invoiceInMultipleView + 1]?.from || user?.auth?.email,
      });
    } else {
       setInvoiceToView({
        id: data?.multipleInvoices[invoiceInMultipleView + 1]?.id,
        ids: data?.multipleInvoices[invoiceInMultipleView + 1]?.ids,
        customerEmail:
          data?.multipleInvoices[invoiceInMultipleView + 1]?.customerEmail,
        customer: data?.multipleInvoices[invoiceInMultipleView + 1]?.customer,
        emailDefault:
          data?.multipleInvoices[invoiceInMultipleView + 1]?.emailDefault,
        customerId: data?.multipleInvoices[invoiceInMultipleView + 1]?.customerId,
        from: data?.multipleInvoices[invoiceInMultipleView + 1]?.from || user?.auth?.email,
      });
    }  

    const invoicesToSendClone = [...invoicesToSend];

    //form tem obj
    const tempObj = {
      ...form.values,
      ids: data?.multipleInvoices[invoiceInMultipleView]?.ids,
      customerId: data?.multipleInvoices[invoiceInMultipleView]?.customerId,
    }

    
    invoicesToSendClone.splice(invoiceInMultipleView,1,tempObj)
    // }
    // invoicesToSendClone.push(tempObj);
    setInvoicesToSend(invoicesToSendClone);

    setInvoiceInMultipleView(invoiceInMultipleView + 1);

    
  };

  const sendAll = () => {
    // setSendAllButtonState('Sending Invoices...')
    setIsLoadingSubmit(true);


    const invoicesToSendClone = [...invoicesToSend];
    const tempObj = {
      ...form.values,
      ids: data?.multipleInvoices[invoiceInMultipleView]?.ids,
      customerId: data?.multipleInvoices[invoiceInMultipleView]?.customerId,
    }
    invoicesToSendClone.splice(invoiceInMultipleView,1,tempObj)
    setInvoicesToSend(invoicesToSendClone);
    

    
    invoicesToSendClone.map((invoice) => {

      //form object
       const params: any = {
        ...(invoice.id && {
          id: invoice.id,
          invoiceId: invoice.id,
          invoicePdf: true,
        }),
        ...(invoice.ids && {
          ids: invoice.ids,
          invoiceIds: JSON.stringify(invoice.ids),
          customerId: invoice.customerId,
        }),
        recipients: JSON.stringify(
          invoice.to.map((recipient: any) => recipient.email)
        ),
        subject: invoice.subject,
        message: invoice.message,
        copyToMyself: invoice.sendToMe,
      };

            
      dispatch(
        sendEmailAction.fetch({
          email:
            invoice?.to.map((recipient: any) => recipient.email).join(',') ||
            invoiceToView.customer?.info?.email,
          data: params,
          type: 'invoices',
        })
      );
    });
    return setSendAllButtonState("Send All")
  };

  useEffect(()=>{
    if(!sent) setIsLoadingSubmit(false);
  },[sent, error, loading])
  const slidePreviousInvoice = () => {

    
    //is viewing the final one, so add it to invoices to Send for memorization
    const invoicesToSendClone = [...invoicesToSend];
    const tempObj = {
      ...form.values,
      ids: data?.multipleInvoices[invoiceInMultipleView]?.ids,
      customerId: data?.multipleInvoices[invoiceInMultipleView]?.customerId,
    }
    invoicesToSendClone.splice(invoiceInMultipleView,1,tempObj)
    setInvoicesToSend(invoicesToSendClone);

    
    //obviously there's something to show from invoicesToSend
    //create temporary emailDefault
    const tempEmailDefault = {
      subject:invoicesToSend[invoiceInMultipleView - 1]?.subject,
      message:invoicesToSend[invoiceInMultipleView - 1]?.message,
      sendToMe:invoicesToSend[invoiceInMultipleView - 1]?.sendToMe,
    }

    const tempReceipients = [...invoicesToSend[invoiceInMultipleView - 1]?.to]
    tempReceipients.forEach(receipient => {
      delete receipient.name;
      delete receipient.phone;
    })

    setInvoiceToView({
      id: data?.multipleInvoices[invoiceInMultipleView - 1]?.id,
      ids: data?.multipleInvoices[invoiceInMultipleView - 1]?.ids,
      customerEmail:
        data?.multipleInvoices[invoiceInMultipleView - 1]?.customerEmail,
      customer: data?.multipleInvoices[invoiceInMultipleView - 1]?.customer,
      emailDefault: tempEmailDefault,
      receipients:tempReceipients,
      customerId: data?.multipleInvoices[invoiceInMultipleView - 1]?.customerId,
      from: data?.multipleInvoices[invoiceInMultipleView - 1]?.from,
    });

    setInvoiceInMultipleView(invoiceInMultipleView - 1);
  };

  const emailSent = () => {
    return (
      <div style={{ textAlign: 'center', height: '20vh' }}>
        <CheckCircleIcon style={{ color: PRIMARY_GREEN, fontSize: 100 }} />
        <br />
        <span style={{ color: '#4F4F4F', fontSize: 30, fontWeight: 'bold' }}>
          {invoiceToView.id
            ? 'This invoice was sent'
            : 'Multiple invoices sent'}
        </span>
      </div>
    );
  };

  return (
    <DataContainer>
      {data.multiple && !sent && (
        <Typography
          align="center"
          variant={'h6'}
          className={'previewTextTitle'}
        >{`Email ${invoiceInMultipleView + 1} of ${
          data.multipleInvoices.length
        }`}</Typography>
      )}
      <hr
        style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }}
      />

      <form onSubmit={FormikSubmit}>
        <DialogContent classes={{ root: classes.dialogContent }}>
          {loading ? (
            <BCCircularLoader heightValue={'20vh'} />
          ) : sent ? (
            emailSent()
          ) : (
            <Grid container direction={'column'} spacing={1}>
              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'center'}
                    xs={2}
                  >
                    <Typography variant={'button'}>FROM</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      disabled
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      name={'from'}
                      onChange={(e: any) => formikChange(e)}
                      value={FormikValues.from}
                      variant={'outlined'}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'center'}
                    xs={2}
                  >
                    <Typography variant={'button'}>TO</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    {!customerContacts.length ? (
                      <TextField
                        disabled
                        autoComplete={'off'}
                        className={classes.fullWidth}
                        id={'to'}
                        name={'to'}
                        onChange={(e: any) => formikChange(e)}
                        value={FormikValues.to[0].email}
                        variant={'outlined'}
                        placeholder="getting contact, please wait..."
                      />
                    ) : (
                      <Autocomplete
                        classes={{
                          inputRoot:
                            FormikValues.to.length > 1
                              ? classes.inputRoot
                              : classes.inputRootSingle,
                        }}
                        freeSolo
                        clearOnBlur
                        fullWidth
                        autoSelect
                        getOptionLabel={(option) => {
                          const { name, email } = option;
                          return `${name}, ${email}`;
                        }}
                        multiple
                        onInputChange={(ev: any, newValue: any) => {
                          if (
                            newValue.endsWith(',') ||
                            newValue.endsWith(';') ||
                            newValue.endsWith(' ')
                          ) {
                            ev?.target.blur();
                            ev?.target.focus();
                          }
                        }}
                        onChange={(ev: any, newValue: any) =>
                          handleRecipientChange('to', newValue)
                        }
                        options={
                          customerContacts && customerContacts.length !== 0
                            ? stringSortCaseInsensitive(
                                customerContacts,
                                'name'
                              )
                            : []
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant={'outlined'}
                            required={!customerContacts.length}
                          />
                        )}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => {
                            return (
                              <Chip
                                key={index}
                                label={`${option.email}`}
                                {...getTagProps({ index })}
                              />
                            );
                          })
                        }
                        value={FormikValues.to}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'center'}
                    xs={2}
                  >
                    <Typography variant={'button'}>SUBJECT</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      autoFocus
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      name={'subject'}
                      onChange={formikChange}
                      type={'text'}
                      value={FormikValues.subject}
                      variant={'outlined'}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'flex-start'}
                    xs={2}
                  >
                    <Typography
                      variant={'button'}
                      style={{ marginTop: '10px' }}
                    >
                      MESSAGE
                    </Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <TextField
                      autoComplete={'off'}
                      className={classes.fullWidth}
                      id={'outlined-textarea'}
                      name={'message'}
                      multiline={true}
                      rows={7}
                      onChange={(e: any) => formikChange(e)}
                      type={'text'}
                      value={FormikValues.message}
                      variant={'outlined'}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction={'row'} spacing={1}>
                  <Grid
                    container
                    item
                    justify={'flex-end'}
                    alignItems={'flex-start'}
                    xs={2}
                  ></Grid>
                  <Grid item xs={10}>
                    <FormControlLabel
                      classes={{ label: classes.checkboxLabel }}
                      control={
                        <Checkbox
                          color={'primary'}
                          checked={FormikValues.sendToMe}
                          onChange={formikChange}
                          name="sendToMe"
                          classes={{ root: classes.checkboxInput }}
                        />
                      }
                      label={`Send copy to myself at ${FormikValues.from}`}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <hr
          style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }}
        />
        <DialogActions
          classes={{
            root: classes.dialogActions,
          }}
        >
          <Grid container justify={'space-between'}>
            <Grid item>
              {!loading && !sent && (
                <>
                  {data.multiple ? (
                    //check where which data is in preview, if first or middle, show next, if end  show send all
                    <>
                      {invoiceInMultipleView === 0 ? (
                        <Button
                          aria-label={'record-payment'}
                          classes={{
                            root: classes.closeButton,
                          }}
                          onClick={() => closeModal()}
                          variant={'outlined'}
                        >
                          Cancel
                        </Button>
                      ) : (
                          <Button
                          startIcon={<ChevronLeft />}
                          aria-label={'create-job'}
                          color="primary"
                          type={'button'}
                          onClick={slidePreviousInvoice}
                          variant={'outlined'}  
                          disabled={customerContacts.length ? loadingCustomerContacts : false}
                        >
                          Back
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      aria-label={'record-payment'}
                      classes={{
                        root: classes.closeButton,
                      }}
                      onClick={() => closeModal()}
                      variant={'outlined'}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              )}
            </Grid>
            <Grid item>
              {!loading && !sent ? (
                <>
                  <Button
                    aria-label={'record-payment'}
                    classes={{
                      root: classes.closeButton,
                    }}
                    variant={'outlined'}
                  >
                    Preview as customer
                  </Button>
                  <>
                    {data.multiple ? (
                      //check where which data is in preview, if first or middle, show next, if end  show send all
                      <>
                        {invoiceInMultipleView <
                        data?.multipleInvoices?.length - 1 ? (
                          <Button
                            aria-label={'create-job'}
                            color="primary"
                            type={'button'}
                            onClick={slideNextInvoice}
                              variant={'outlined'}
                              endIcon={<ChevronRight />}
                            disabled={customerContacts.length ? loadingCustomerContacts : false}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            aria-label={'create-job'}
                            classes={{
                              root: classes.submitButton,
                              disabled: classes.submitButtonDisabled,
                            }}
                            color="primary"
                            onClick={sendAll}
                            variant={'contained'}
                            disabled={isLoadingSubmit}
                          >
                            {sendAllButtonState}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        aria-label={'create-job'}
                        classes={{
                          root: classes.submitButton,
                          disabled: classes.submitButtonDisabled,
                        }}
                        color="primary"
                        type={'submit'}
                        variant={'contained'}
                      >
                        Submit
                      </Button>
                    )}
                  </>
                </>
              ) : (
                <Button
                  disabled={loading}
                  aria-label={'record-payment'}
                  classes={{
                    root: classes.closeButton,
                  }}
                  onClick={() => closeModal()}
                  variant={'outlined'}
                >
                  Close
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogActions>
      </form>
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
    margin-top: 0.5rem !important;
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
  .MuiOutlinedInput-multiline {
    padding: 5px 14px;
    align-items: flex-start;
  }
  .required > label:after {
    margin-left: 3px;
    content: '*';
    color: red;
  }
  .save-customer-button {
    color: ${CONSTANTS.PRIMARY_WHITE};
  }
`;

export default withStyles(styles, { withTheme: true })(EmailJobReportModal);