import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  withStyles
} from '@material-ui/core';
import styles from './bc-invoice.styles';
import {createMuiTheme, makeStyles, MuiThemeProvider, Theme} from '@material-ui/core/styles';
import * as CONSTANTS from '../../../constants';
import styled from 'styled-components';
import InputBase from '@material-ui/core/InputBase';
import FormControl from '@material-ui/core/FormControl';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import PhoneIcon from '@material-ui/icons/Phone';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import StorefrontIcon from '@material-ui/icons/Storefront';
import IconButton from '@material-ui/core/IconButton';
import classNames from 'classnames';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {PageHeader} from '../../pages/customer/job-reports/view-invoice-edit';
import {useHistory} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {blue} from '@material-ui/core/colors';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {KeyboardDatePicker} from '@material-ui/pickers';
import InputAdornment from '@material-ui/core/InputAdornment';
import EventIcon from '@material-ui/icons/Event';
import {TextFieldProps} from '@material-ui/core/TextField';
import BCInvoiceItemsTableRow from './bc-invoice-table-row';
import AddIcon from '@material-ui/icons/Add';
import {callCreateInvoiceAPI, updateInvoice as updateInvoiceAPI} from "../../../api/invoicing.api";
import {CSChip} from "../../../helpers/custom";
import {resetEmailState, sendEmailAction} from "../../../actions/email/email.action";
import {getInvoiceEmailTemplate} from "../../../api/emailDefault.api";
import {openModalAction, setModalDataAction} from "../../../actions/bc-modal/bc-modal.action";
import {modalTypes} from "../../../constants";
import {error as errorSnackBar, error} from "../../../actions/snackbar/snackbar.action";
import BCButtonGroup from "../bc-button-group";

interface Props {
  classes?: any;
  invoiceDetail?: any;
}

const invoicePageStyles = makeStyles((theme: Theme) =>
  createStyles({
    companyLogo: {
      width: '100%',
      '& > img': {
        width: '100%',
      }
    },
    customerBox: {
      marginTop: '10px',
      fontSize: '12px',
      lineHeight: '14px',
      color: '#4F4F4F',
      '& > div': {
        fontSize: 12,
        display: 'flex',
        '& > span': {
          display: 'flex',
          marginLeft: 5,
          color: CONSTANTS.PRIMARY_DARK_GREY,
        }
      }
    },
    serviceAdd: {
      fontSize: '10px',
      lineHeight: '12px',
      textTransform: 'uppercase',
      color: '#828282',
    },
    infoBox: {
      display: 'flex',
      flexDirection: 'column',
      '& > div': {
        fontSize: 12,
        marginTop: 5,
        display: 'flex',
        '& > span': {
          marginLeft: 5,
          color: CONSTANTS.PRIMARY_DARK_GREY,
        }
      },
      '& > h4': {
        paddingLeft: 20,
        color: CONSTANTS.PRIMARY_DARK_GREY
      },
      '& > h5': {
        fontSize: 10,
        fontWeight: 300,
        lineHeight: '12px',
        textTransform: 'uppercase',
        marginBottom: 0,
        paddingLeft: 20,
        /* color: CONSTANTS.PRIMARY_DARK_GREY,*/
        color: '#828282',
      },
    },
    paddingContent: {
      paddingLeft: 20,
      /* color: CONSTANTS.PRIMARY_DARK_GREY,*/
      fontWeight: 500,
      fontSize: '12px',
      lineHeight: '14px',
      color: '#4F4F4F',

    },
    storeIcons: {
      fontSize: 12,
      /* color: CONSTANTS.PRIMARY_DARK_GREY*/
      color: '#D0D3DC',
    },

    margin: {
      margin: theme.spacing(1),
    },
    white: {
      color: '#fff',
    },
    bgDark: {
      backgroundColor: '#D0D3DC',
    },
    bcButton: {
      border: '1px solid #4F4F4F',
      borderRadius: '8px',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      color: '#4F4F4F',
      padding: '8px 16px',
    },
    bcBlueBt: {
      border: '1px solid #00AAFF',
      background: '#00AAFF',
      color: 'white',
    },
    bcBorderW: {
      borderLeftColor: '#FFF',
    },
    bcRMargin: {
      marginRight: '11px',
    },
    // custom input
    formField: {
      margin: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    formFieldFullWidth: {
      margin: theme.spacing(1),
      width: '100%'
    },
    formFieldRow: {
      margin: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      fontStyle: 'normal',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '16px',
      textTransform: 'uppercase',
      color: '#4F4F4F',

    },
    bootstrapRoot: {
      'label + &': {
        marginTop: 0,
        display: 'flex',
        minWidth: '50%'
      },
      '&': {
        marginTop: 0,
        display: 'flex',
        minWidth: '50%'
      },
    },
    bootstrapTextAreaRoot: {
      'label + &': {
        marginTop: 0,
        display: 'flex',
        minWidth: '100%'
      },
    },
    bootstrapRootError: {
      borderRadius: 8,
      border: `1px solid ${CONSTANTS.PRIMARY_ORANGE}`,
    },
    bootstrapInputLarge: {
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: '1px solid #E0E0E0',
      fontSize: 20,
      fontWeight: 'bold',
      width: '100%',
      padding: '5px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 8,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    noBorder: {
      border: 'none'
    },
    bootstrapInput: {
      color: '#4F4F4F!important',
      fontWeight: 'normal',
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: '1px solid #E0E0E0',
      fontSize: 14,
      width: '100%',
      padding: '12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 8,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    bootstrapTextAreaInput: {
      color: '#4F4F4F!important',
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: '1px solid #E0E0E0',
      fontSize: 14,
      width: '100%',
      minHeight: 100,
      padding: '11px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 8,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    bootstrapTextAreaInputError: {
      color: '#4F4F4F!important',
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${CONSTANTS.PRIMARY_ORANGE}`,
      fontSize: 14,
      width: '100%',
      minHeight: 100,
      padding: '11px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 8,
        borderColor: CONSTANTS.PRIMARY_ORANGE,
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    bootstrapTextTitle: {

      fontStyle: 'normal',
      fontWeight: 'bold',
      fontSize: 28,
      lineHeight: 35,
      textTransform: 'uppercase',
      color: '#4F4F4F',

    },
    bootstrapFormLabel15: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      transform: 'none',
      marginRight: 60,
      color: CONSTANTS.PRIMARY_DARK_GREY,
      paddingTop: '15px',
    },
    bootstrapFormLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      transform: 'none',
      marginRight: 20,
      color: CONSTANTS.PRIMARY_DARK_GREY
    },
    totalContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      minHeight: 195,
      fontWeight: 500,
      fontSize: '20px',
      lineHeight: '23px',
      textTransform: 'uppercase',
      color: '#828282',

      '& > div': {
        '& > small': {
          color: CONSTANTS.INVOICE_HEADING,
          fontSize: 14,
          marginBottom: 5
        },
      },
    },
    totalEnd: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      fontWeight: 500,
      fontSize: '48px',
      lineHeight: '56px',
      textAlign: 'right',
      color: '#4F4F4F',
      '& > h1': {
        margin: 0,
        padding: 0
      }
    },

    bgGray: {
      backgroundColor: CONSTANTS.INVOICE_TOP,
    },
    bgGray25: {
      backgroundColor: CONSTANTS.INVOICE_TOP,
      paddingRight: 25,
    },
    textCenter: {
      textAlign: 'center'
    },
    textRight: {
      textAlign: 'right'
    },
    textBold: {
      fontWeight: 'bold',
    },
    draftChip: {
      background: 'repeating-linear-gradient(-55deg,#EAECF3,#EAECF3 10px,#F4F5F9 10px,#F4F5F9 20px)',
      color: 'black',
      fontWeight: 700,
      fontSize: 14,
      marginLeft: 20,
    }
  }),
);

const useInvoiceTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    // items table
    itemsTableHeader: {
      padding: '15px 10px',
      backgroundColor: CONSTANTS.INVOICE_TOP,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
    },
    itemsTableRoot: {
      padding: '15px 0'
    },
    itemsTableActions: {
      padding: '0 5px',
      marginBottom: 20,
      marginTop: 20,
    },
  }),
);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'inherit'
      }
    },
    MuiCard: {
      root: {
        margin: 10,
        boxShadow: '0px 0px 5px 2px rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
      },
    },
    MuiCardHeader: {
      root: {
        padding: '18px 20px',
        backgroundColor: CONSTANTS.INVOICE_TOP,
        mixBlendMode: 'multiply',
        borderRadius: '4px 4px 0px 0px',
      },
      title: {
        fontStyle: 'normal',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '16px',
        textTransform: 'uppercase',
        color: '#828282',
      }
    },
    MuiCardContent: {
      root: {
        padding: '35px 20px',
      }
    },
    MuiFormControl: {
      root: {
        margin: 0
      }
    },
    MuiInputLabel: {
      formControl: {
        position: 'relative'
      }
    },
    MuiAccordionSummary: {
      root: {
        backgroundColor: CONSTANTS.SECONDARY_GREY,
        '&$expanded': {
          minHeight: 48
        },
      },
      content: {
        color: CONSTANTS.INVOICE_HEADING,
        '&$expanded': {
          margin: 0,
          color: CONSTANTS.INVOICE_HEADING,
        },
      },
      expandIcon: {
        padding: 0
      },
      expanded: {
        minHeight: 48
      }
    },
    MuiDivider: {
      root: {
        margin: '10px 0'
      }
    }
  },
});

interface Props {
  classes?: any;
  invoiceData?: any;
  isOld?: boolean;
}

const InvoiceValidationSchema = Yup.object().shape({
  newInvoice: Yup.boolean(),
  invoice_id: Yup.string()
    .when("newInvoice", {
      is: false,
      then: Yup.string().required('Required')
    }),
  invoice_title: Yup.string()
    .required('Required'),
/*  customer_po: Yup.string()
    .required('Required'),*/
  invoice_date: Yup.string()
    .required('Required'),
  due_date: Yup.string()
    .required('Required'),
  items: Yup.array()
    .required('Please add at least one item'),
  company: Yup.string()
    .required('Required'),
  customer: Yup.object()
    .required('Select a customer'),
});

function BCEditInvoice({classes, invoiceData, isOld}: Props) {
  const invoiceStyles = invoicePageStyles();
  const invoiceTableStyle = useInvoiceTableStyles();

  const history = useHistory();
  const dispatch = useDispatch();
  const simplifiedItems = invoiceData.items.map((item: any) => {
    const newItem = {...item.item, ...item};
    delete newItem.item;
    delete newItem.jobType;
    return newItem;
  })
  const [invoiceItems, setInvoiceItems] = useState(simplifiedItems);

  const {'data': paymentTerms, isLoading: loadingPaymentTerms, done, updating, error} = useSelector(({paymentTerms}: any) => paymentTerms);
  const {customerObj: customer, data: customers} = useSelector(({ customers }:any) => customers);
  const { itemTier, isCustomPrice, paymentTerm: customerPaymentTerm } = useMemo(() => customer, [customer]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [duedatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [subTotal, setSubTotal] = useState(invoiceData?.subTotal || 0);
  const [totalTax, setTotalTax] = useState(invoiceData.taxAmount || 0);
  const [totalAmount, setTotalAmount] = useState(invoiceData.total || 0);

  const [options, setOptions] =  React.useState(['Save and Continue', 'Save and Send', 'Save as Draft']);

  let serviceAddressLocation: any = invoiceData?.job?.jobLocation ? ({
    name: invoiceData?.job?.jobLocation?.name || '',
    street: invoiceData?.job?.jobLocation?.address?.street || '',
    city: invoiceData?.job?.jobLocation?.address?.city || '',
    state: invoiceData?.job?.jobLocation?.address?.state || '',
    zipcode: invoiceData?.job?.jobLocation?.address?.zipcode || '',
  }) : null;
  serviceAddressLocation = serviceAddressLocation ? Object.values(serviceAddressLocation).filter(key=>!!key) : '';

  let serviceAddressSite: any = invoiceData?.job?.jobSite ? ({
    name: invoiceData?.job?.jobSite?.name || '',
    street: invoiceData?.job?.jobSite?.address?.street || '',
    city: invoiceData?.job?.jobSite?.address?.city || '',
    state: invoiceData?.job?.jobSite?.address?.state || '',
    zipcode: invoiceData?.job?.jobSite?.address?.zipcode || '',
  }) : null;
  serviceAddressSite = serviceAddressSite ? Object.values(serviceAddressSite).filter(key=>!!key) : '';

  const sendInvoice = () => {
    dispatch(sendEmailAction.fetch({ 'email': customer?.info?.email,
      'id': invoiceData._id,
      'type': 'invoice'
    }));
  };

  const showSendInvoiceModal = async() => {
    try {
      const response = await getInvoiceEmailTemplate(invoiceData._id);
      const {emailTemplate: emailDefault, status, message} = response.data;
      console.log({emailDefault})
      if (status === 1) {
        dispatch(setModalDataAction({
          data: {
              'modalTitle': 'Send this invoice',
              'customer': customer?.profile?.displayName,
              'customerEmail': customer?.info?.email,
              'handleClick': sendInvoice,
              'id': invoiceData._id,
              'typeText': 'Invoice',
              'className': 'wideModalTitle',
              emailDefault,
              customerId: customer._id
          },
          'type': modalTypes.EMAIL_JOB_REPORT_MODAL
        }));
        dispatch(resetEmailState());
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
      } else {
        dispatch(error(message));
      }
    } catch (e) {
      dispatch(errorSnackBar('Something went wrong. Please try again'));
      console.log(e);
    }
  }

  const updateInvoice = (data: any) => {
    return new Promise((resolve, reject) => {
      const params: any = {
        invoiceId: data.invoice_id,
        issuedDate: new Date(data.invoice_date).toISOString(),
        dueDate: new Date(data.due_date).toISOString(),
        paymentTermId: data.paymentTerm,
        note: data.note,
        isDraft: data.isDraft,
        items: JSON.stringify(data.items.map((o: any) => {
          const item: any ={
            description: o.description ?? '',
            price: parseFloat(o.price),
            quantity: parseInt(o.quantity),
            tax: parseFloat(o.tax) ?? 0,
            isFixed: o.isFixed,
          }
          if (o._id)
            item.item = o._id;
          else
            item.name = o.name;
          return item;
        })),
        charges: 0,
      }
      if (data.customer_po) params.customerPO = data.customer_po;

      updateInvoiceAPI(params).then((response: any) => {
        history.push(`/main/invoicing/view/${data.invoice_id}`);
        return resolve(response);
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  };

  const createInvoice = (data: any) => {
    return new Promise((resolve, reject) => {
      const params: any = {
        invoiceNumber: data.invoiceId,
        issueDate: data.invoice_date,
        dueDate: data.due_date,
        paymentTermId: data.paymentTerm,
        note: data.note,
        isDraft: data.isDraft,
        customerId: data.customer._id,
        items: JSON.stringify(data.items.map((o: any) => {
          const item: any ={
            description: o.description ?? '',
            price: parseFloat(o.price),
            quantity: parseInt(o.quantity),
            tax: parseFloat(o.tax) ?? 0,
            isFixed: o.isFixed,
          }
          if (o._id)
            item.item = o._id;
          else
            item.name = o.name;
          return item;
        })),
        charges: 0,
      }
      if (data.customer_po) params.customerPO = data.customer_po;

      callCreateInvoiceAPI(params).then((response: any) => {
        history.goBack();
        return resolve(response);
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  };

  const handleFormSubmit = (data: any) => {
    if (isOld)
      return updateInvoice(data);
    else
      return createInvoice(data);
  };

  const calculateTotal = (itemsArray:any) => {
    if (isCustomPrice && invoiceData) {
      setTotalAmount(invoiceData.total);
    } else {
      const subtotalAmount = itemsArray.map((item:any) => item.price * item.quantity).reduce((a: any, b: any) => {
        return a + b;
      }, 0);

      const totalTax = itemsArray.map((item:any) => item.taxAmount).reduce((a: any, b: any) => {
        return a + b;
      }, 0);
      const amount = subtotalAmount + totalTax;
      setSubTotal(Math.round((subtotalAmount + Number.EPSILON) * 100) / 100);
      setTotalTax(Math.round((totalTax + Number.EPSILON) * 100) / 100);
      setTotalAmount(Math.round((amount + Number.EPSILON) * 100) / 100);
    }
    setInvoiceItems(itemsArray);
  };

  const addItem = () => {
    const item = {
      'description': '',
      'isFixed': true,
      'name': '',
      'price': 0,
      'quantity': 1,
      'tax': 0,
      'taxAmount': 0,
      'total': 0
    };

    const tempArray = [
      ...invoiceItems,
      item
    ];
    setInvoiceItems(tempArray);
  };

  const calculateDueDate = (setFieldValue: any, values: any, newTerm: any) => {
    if (newTerm !== '') {
      const paymentTerm = paymentTerms.find((term:any) => term._id === newTerm);
      setFieldValue('due_date', moment(values.invoice_date).add(paymentTerm.dueDays, 'day').format('MMM. DD, YYYY'));
    }
    setFieldValue('paymentTerm', newTerm);
  }

  const calculateDueDate2 = (setFieldValue: any, values: any, newInvoiceDate: any) => {
    if (values.paymentTerm === '') {
      if (newInvoiceDate > new Date(values.due_date))
        setFieldValue('due_date', moment(newInvoiceDate).format('MMM. DD, YYYY'));
    } else {
      const paymentTerm = paymentTerms.find((term:any) => term._id === values.paymentTerm);
      setFieldValue('due_date', moment(newInvoiceDate).add(paymentTerm.dueDays, 'day').format('MMM. DD, YYYY'));
    }
  }

  const changeCustomer = (id: string, values: any, setFieldValue: any) => {
    const selectedCustomer = customers.find((customer: any) => customer._id === id);
    if (selectedCustomer.paymentTerm) {
      calculateDueDate(setFieldValue, values, selectedCustomer.paymentTerm);
    }
    setFieldValue('customer', selectedCustomer);
  }

  const currentPaymentTerm = invoiceData?.paymentTerm ? invoiceData?.paymentTerm?._id
    : customerPaymentTerm?._id ? customerPaymentTerm._id : invoiceData?.company?.paymentTerm?._id;

  const calculateInitialDueDate = () => {
    if (invoiceData?.company?.paymentTerm) {
      return moment(invoiceData.createdAt).add(invoiceData.company.paymentTerm.dueDays, 'day').format('MMM. DD, YYYY');
    }
    return invoiceData.createdAt;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <Formik
        initialValues={{
          invoice_id: invoiceData?._id,
          invoice_title: 'INVOICE',
          invoiceId: invoiceData?.invoiceId,
          customer_po: invoiceData?.customerPO || '',
          invoice_date: invoiceData.issuedDate || invoiceData.createdAt,
          due_date: invoiceData.dueDate ? invoiceData.dueDate : calculateInitialDueDate(),
          paymentTerm: currentPaymentTerm,
          note: invoiceData?.note,
          items: invoiceItems,
          isDraft: invoiceData?.isDraft,
          customer: invoiceData?.customer,
          company: invoiceData?.company,
          newInvoice: !isOld,
          selectedSubmitAction: -1,
        }}
        validationSchema={InvoiceValidationSchema}
        validate ={(values: any) => {
            const errors: any = {};
            const indices = values.items.reduce((acc: any[], item:any, index:number) => {
              if (item.name === '') acc.push(index)
              return acc;
            },[]);
            if (indices.length > 0) errors.itemsNames = indices;
            return errors;
          }
        }
        onSubmit={(values, actions) => {
          switch (values.selectedSubmitAction) {
            case 0:
            case 2:
              handleFormSubmit(values);
              break;
            case 1:
              handleFormSubmit(values).then(() => {
                actions.setSubmitting(false);
                showSendInvoiceModal();
              });
              break;
            default:
              console.info(`You clicked ${options[values.selectedSubmitAction]}`);
          }
        }}
      >
        {({submitForm, handleChange, setFieldValue, values, isSubmitting, errors}) => {
          //console.log({errors})

          return (
            <Form>
              <PageHeader style={{padding: '0 10px'}}>
                <div style={{display: 'flex'}}>
                  <IconButton
                    color="default"
                    size="small"
                    className={classNames(invoiceStyles.bgDark, invoiceStyles.white)}
                    onClick={() => {
                      history.goBack();
                    }}
                  >
                    <ArrowBackIcon/>
                  </IconButton>
                  {invoiceData?.isDraft &&
                  <CSChip
                    label={'Draft'}
                    className={invoiceStyles.draftChip}
                  />
                  }
                </div>
                <div>
                  <Button
                    variant="outlined"
                    color="default"
                    className={classNames(invoiceStyles.bcButton, invoiceStyles.bcRMargin)}
                  >
                    Preview
                  </Button>
                  <BCButtonGroup
                    options={options}
                    disabled={isSubmitting}
                    disabledItems={[invoiceData?.isDraft ? -1 : 2]}
                    clickListener={(selected: number) => {
                      setFieldValue('selectedSubmitAction', selected);
                      setFieldValue('isDraft', selected === 2);
                      submitForm()
                    }}
                  />

                </div>
              </PageHeader>
              <DataContainer>
                <Card elevation={2}>
                  <CardHeader title={invoiceData?.company?.info?.companyName + ' INVOICE DETAILS'}/>
                  <CardContent>
                    <Grid container spacing={5}>
                      <Grid item xs={2}>
                        <div className={invoiceStyles.companyLogo}>
                          <img src={invoiceData?.company?.info?.logoUrl}/>
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <div className={invoiceStyles.infoBox}>
                          <h4>{invoiceData?.company?.info?.companyName}</h4>
                          <div><PhoneIcon
                            className={invoiceStyles.storeIcons}/><span>{invoiceData?.company?.contact?.phone}</span>
                          </div>
                          <div><MailOutlineIcon
                            className={invoiceStyles.storeIcons}/><span>{invoiceData?.company?.info?.companyEmail}</span>
                          </div>
                          <div><StorefrontIcon
                            className={invoiceStyles.storeIcons}/><span>{invoiceData?.company?.address?.street}, {invoiceData?.company?.address?.city}, {invoiceData?.company?.address?.state} {invoiceData?.company?.address?.zipCode}</span>
                          </div>
                          <h5>VENDOR NUMBER</h5>
                          <div className={invoiceStyles.paddingContent}>{values.customer?.vendorId}</div>
                        </div>
                      </Grid>
                      <Grid item xs>

                        <FormControl className={invoiceStyles.formField}>
                          <InputBase
                            id="invoice-title"
                            name="invoice_title"
                            disabled
                            defaultValue="INVOICE"
                            classes={{
                              root: classNames(invoiceStyles.bootstrapRoot),
                              input: classNames(invoiceStyles.bootstrapInputLarge, invoiceStyles.bootstrapTextTitle, invoiceStyles.textRight, invoiceStyles.noBorder),
                            }}

                          />
                        </FormControl>

                        <FormControl className={invoiceStyles.formField}>
                          <InputLabel disableAnimation htmlFor="invoice-id"
                                      className={invoiceStyles.bootstrapFormLabel}>
                            Invoice #
                          </InputLabel>
                          <InputBase
                            id="invoice-id"
                            name="invoiceId"
                            disabled={isOld}
                            value={values.invoiceId}
                            placeholder={'Invoice Number'}
                            error={!!errors.invoiceId}
                            onChange={handleChange('invoiceId')}
                            classes={{
                              root: classNames(invoiceStyles.bootstrapRoot, {
                                [invoiceStyles.bootstrapRootError]: !!errors.invoiceId
                              }),
                              input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textRight),
                            }}
                          />
                        </FormControl>

                        <FormControl className={invoiceStyles.formField}>
                          <InputLabel disableAnimation htmlFor="customer-po"
                                      className={invoiceStyles.bootstrapFormLabel}>
                            PO / SALES ORDER #
                          </InputLabel>
                          <InputBase
                            id="customer-po"
                            name="customer_po"
                            value={values.customer_po}
                            error={!!errors.customer_po}
                            onChange={handleChange}
                            classes={{
                              root: classNames(invoiceStyles.bootstrapRoot, {
                                [invoiceStyles.bootstrapRootError]: !!errors.customer_po
                              }),
                              input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textRight),
                            }}
                          />
                        </FormControl>

                        <FormControl className={invoiceStyles.formField}>
                          <InputLabel disableAnimation htmlFor="invoice-date"
                                      className={invoiceStyles.bootstrapFormLabel}>
                            INVOICE DATE
                          </InputLabel>
                          <KeyboardDatePicker
                            open={datePickerOpen}
                            margin="none"
                            size="small"
                            id="invoice-date"
                            name="invoice_date"
                            format="MMM. dd, yyyy"
                            value={values.invoice_date}
                            autoOk
                            onChange={(selectedInvoiceDate) => {
                              setDatePickerOpen(false);
                              calculateDueDate2(setFieldValue, values, selectedInvoiceDate);
                              setFieldValue('invoice_date', moment(selectedInvoiceDate).format('MMM. DD, YYYY'));
                            }}
                            KeyboardButtonProps={{
                              'aria-label': 'change date',
                            }}
                            onClick={() => setDatePickerOpen(true)}
                            onClose={() => setDatePickerOpen(false)}
                            TextFieldComponent={(props: TextFieldProps) => {
                              return (
                                <InputBase
                                  id="invoice-date"
                                  name="invoice_date"
                                  error={!!errors.invoice_date}
                                  onClick={(e) => {
                                    setDatePickerOpen(true);
                                  }}
                                  value={props.value}
                                  endAdornment={
                                    <InputAdornment position="end">
                                      <IconButton>
                                        <EventIcon/>
                                      </IconButton>
                                    </InputAdornment>
                                  }

                                  onChange={props.onChange}
                                  classes={{
                                    root: classNames(invoiceStyles.bootstrapRoot, {
                                      [invoiceStyles.bootstrapRootError]: !!errors.invoice_date
                                    }),
                                    input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textRight),
                                  }}
                                />
                              )
                            }}
                          />
                        </FormControl>

                        <FormControl className={invoiceStyles.formField}>
                          <InputLabel disableAnimation htmlFor="due-date" className={invoiceStyles.bootstrapFormLabel}>
                            DUE DATE
                          </InputLabel>
                          <KeyboardDatePicker
                            open={duedatePickerOpen}
                            InputAdornmentProps={{position: 'end'}}
                            margin="none"
                            size="small"
                            id="due-date"
                            name="due_date"
                            format="MMM. dd, yyyy"
                            value={values.due_date}
                            minDate={values.invoice_date}
                            autoOk
                            onChange={(selectedInvoiceDate) => {
                              setDueDatePickerOpen(false);
                              setFieldValue('due_date', moment(selectedInvoiceDate).format('MMM. DD, YYYY'));
                            }}
                            onClick={() => {
                                if (values.paymentTerm === '') setDueDatePickerOpen(true)
                              }
                            }
                            onClose={() => setDueDatePickerOpen(false)}

                            TextFieldComponent={(props: TextFieldProps) => {
                              return (
                                <InputBase
                                  id="due-date"
                                  name="due_date"
                                  error={!!errors.due_date}
                                  onClick={(e) => {
                                    if (values.paymentTerm === '')
                                      setDueDatePickerOpen(true);
                                  }}
                                  value={props.value}

                                  endAdornment={
                                    <InputAdornment position="end">
                                      <IconButton>
                                        <EventIcon/>
                                      </IconButton>
                                    </InputAdornment>
                                  }
                                  onChange={props.onChange}
                                  classes={{
                                    root: classNames(invoiceStyles.bootstrapRoot, {
                                      [invoiceStyles.bootstrapRootError]: !!errors.due_date
                                    }),
                                    input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textRight),
                                  }}
                                />
                              )
                            }}
                          />
                        </FormControl>

                        <FormControl className={invoiceStyles.formField}>
                          <InputLabel disableAnimation htmlFor="terms" className={invoiceStyles.bootstrapFormLabel}>
                            TERMS
                          </InputLabel>
                          <Select
                            onChange={(e) => calculateDueDate(setFieldValue, values, e.target.value)}
                            value={values.paymentTerm}
                            input={<InputBase
                              classes={{
                                root: classNames(invoiceStyles.bootstrapRoot, {
                                  [invoiceStyles.bootstrapRootError]: !!errors.paymentTerm
                                }),
                                input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textRight),
                              }}
                              error={!!errors.paymentTerm}/>}
                          >
                            <MenuItem value={''}>
                              <em>None</em>
                            </MenuItem>
                            {
                              paymentTerms.map((pitem: any, pindex: number) => {
                                return (
                                  <MenuItem key={pitem._id} value={pitem._id}>{pitem.name}</MenuItem>
                                )
                              })

                            }

                          </Select>
                        </FormControl>

                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Card elevation={2}>
                      <CardHeader title="BILL TO"/>
                      <CardContent style={{minHeight: '190px'}}>
                        <FormControl className={invoiceStyles.formFieldRow}>
                          <InputLabel disableAnimation htmlFor="company"
                                      className={invoiceStyles.bootstrapFormLabel15}>
                            COMPANY NAME
                          </InputLabel>
                          {isOld ?
                            <InputBase
                              id="invoice-id"
                              name="invoiceId"
                              disabled
                              value={customer?.profile?.displayName}
                              classes={{
                                root: classNames(invoiceStyles.bootstrapRoot),
                                input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textBold),
                              }}
                            />
                            :
                            <Select
                              id="company"
                              onChange={(e: any) => changeCustomer(e.target.value, values, setFieldValue)}
                              value={values.customer?._id}
                              input={<InputBase
                                classes={{
                                  root: classNames(invoiceStyles.bootstrapRoot, {
                                  [invoiceStyles.bootstrapRootError]: errors?.customer
                                }),
                                  input: classNames(invoiceStyles.bootstrapInput, invoiceStyles.textBold),
                                }}
                                error={!!errors.company}/>}
                            >
                              {customers.map((customer: any) => (
                                <MenuItem value={customer._id}>
                                  <em>{customer.profile.displayName}</em>
                                </MenuItem>
                              ))}
                            </Select>
                          }
                        </FormControl>
                        <Grid container spacing={1} className={invoiceStyles.customerBox}>
                          <Grid item xs={3} justify="flex-end">
                            <div>
                              <div><span><PhoneIcon className={invoiceStyles.storeIcons}/></span></div>
                              <div><span><MailOutlineIcon className={invoiceStyles.storeIcons}/></span></div>
                              <div><span><StorefrontIcon className={invoiceStyles.storeIcons}/></span></div>
                            </div>
                          </Grid>
                          <Grid item xs={4}>
                            <div>
                              <div><span>{values.customer?.contact?.phone}</span></div>
                              <div><span>{values.customer?.info?.email}</span></div>
                              <div>
                                <span>{values.customer?.address?.street}, {values.customer?.address?.city}, {values.customer?.address?.state} {values.customer?.address?.zipCode}</span>
                              </div>

                            </div>

                          </Grid>
                          <Grid item xs={5}>
                          {(serviceAddressSite || serviceAddressLocation) && (
                            <div>
                              <div className={invoiceStyles.serviceAdd}>service address</div>
                              <div><span>{serviceAddressSite ? serviceAddressSite[0].toUpperCase() : serviceAddressLocation[0].toUpperCase()}</span></div>
                              <div><span>{serviceAddressSite ? serviceAddressSite.slice(1).join(', ') : serviceAddressLocation.slice(1).join(', ')}</span></div>
                            </div>
                          )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs>
                    <Card elevation={2} style={{
                      border: '2px solid #D0D3DC',
                      boxSizing: 'border-box',
                      boxShadow: '0px 0px 5px 2px rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px'
                    }}>
                      <CardContent style={{padding: '20px'}}>
                        <div className={invoiceStyles.totalContainer}>
                          <div>
                            TOTAL
                          </div>
                          <div className={invoiceStyles.totalEnd}>
                            ${totalAmount}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card elevation={2}>
                  <BCInvoiceItemsTableRow
                    invoiceItems={invoiceItems}
                    itemTier={isOld ? itemTier : values.customer?.itemTier}
                    handleChange={(items) => {
                      setFieldValue('items', items);
                      calculateTotal(items)
                    }}
                    values={values}
                    errors={errors}
                  />

                  <div className={invoiceTableStyle.itemsTableActions}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={7}>
                        <Button color={!errors.items ? 'primary' : 'secondary'} onClick={addItem}>
                          <AddIcon color="inherit"/> Add item or service
                        </Button>
                      </Grid>
                      <Grid item xs={2} className={invoiceStyles.textRight}>
                        SUBTOTAL
                      </Grid>
                      <Grid item xs={1}>
                        <span>
                          $ {subTotal}
                        </span>
                      </Grid>
                      <Grid item xs={1} className={invoiceStyles.textRight}>
                        TAXES
                      </Grid>
                      <Grid item xs={1}>
                        <span>
                          $ {totalTax}
                        </span>
                      </Grid>
                    </Grid>
                  </div>
                </Card>

                <Card elevation={2}>
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      className={invoiceStyles.bgGray25}
                      expandIcon={<ArrowDropDownIcon/>}
                      aria-controls="message-to-customer"
                    >
                      MESSAGE TO CUSTOMER
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl className={invoiceStyles.formFieldFullWidth}>
                        <InputBase
                          id="note"
                          name="note"
                          multiline
                          value={values.note}
                          error={!!errors?.note}
                          placeholder="NOTE TO CUSTOMER"
                          onChange={(e) => setFieldValue('note', e.target.value)}
                          classes={{
                            root: invoiceStyles.bootstrapTextAreaRoot,
                            input: errors.note ? invoiceStyles.bootstrapTextAreaInputError : invoiceStyles.bootstrapTextAreaInput
                          }}
                        />
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                </Card>

                {/*                <Card elevation={2}>
                  <Accordion defaultExpanded>
                    <AccordionSummary

                      className={invoiceStyles.bgGray25}
                      expandIcon={<ArrowDropDownIcon/>}
                      aria-controls="invoice-footer"
                    >
                      FOOTER
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl className={invoiceStyles.formFieldFullWidth}>
                        <InputBase
                          id="invoice-footer"
                          name="invoice_footer"
                          defaultValue=""
                          multiline
                          placeholder="ldiservices.net"
                          onChange={handleChange('invoice_footer')}
                          classes={{
                            root: invoiceStyles.bootstrapTextAreaRoot,
                            input: invoiceStyles.bootstrapTextAreaInput,
                          }}
                        />
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                </Card>*/}

              </DataContainer>
              <PageHeader style={{padding: '0 10px', marginTop: '25px',}}>
                <div style={{display: 'flex'}}>
                  <IconButton
                    color="default"
                    size="small"
                    className={classNames(invoiceStyles.bgDark, invoiceStyles.white)}
                    onClick={() => {
                      history.goBack();
                    }}
                  >
                    <ArrowBackIcon/>
                  </IconButton>
                  {invoiceData?.isDraft &&
                  <CSChip
                    label={'Draft'}
                    className={invoiceStyles.draftChip}
                  />
                  }
                </div>
                <div>
                  <Button
                    variant="outlined"
                    color="default"
                    className={classNames(invoiceStyles.bcButton, invoiceStyles.bcRMargin)}
                  >
                    Preview
                  </Button>
                  <BCButtonGroup
                    options={options}
                    disabled={isSubmitting}
                    disabledItems={[invoiceData?.isDraft ? -1 : 2]}
                    clickListener={(selected: number) => {
                      setFieldValue('selectedSubmitAction', selected);
                      setFieldValue('isDraft', selected === 2);
                      submitForm()
                    }}
                    />
                </div>
              </PageHeader>
            </Form>
          )
        }}
      </Formik>
    </MuiThemeProvider>
  )
}

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
`;


export default withStyles(styles)(BCEditInvoice);
