import React, {useEffect, useState} from "react";
import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, CardHeader, Chip, createStyles, Divider, Grid, withStyles, Typography } from "@material-ui/core";
import styles from "./bc-invoice.styles";
import { makeStyles, Theme } from "@material-ui/core/styles";
import * as CONSTANTS from "../../../constants";
import styled from "styled-components";
import moment from "moment";

import classNames from "classnames";
import {formatCurrency} from "../../../helpers/format";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import BCTicketMessagesNotes
  from "../../modals/bc-add-ticket-details-modal/bc-ticket-messages-notes";
import {LABEL_GREY} from "../../../constants";

interface Props {
  classes?: any;
  invoiceDetail?: any;
}

const invoicePageStyles = makeStyles((theme: Theme) =>
  createStyles({
    invoiceTop: {
      backgroundColor: CONSTANTS.INVOICE_TOP,
      paddingTop: theme.spacing(8),
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
    },
    companyDetails: {
      display: 'flex',
      flex: '1 1 0%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    },
    companyLogo: {
      width: '100%',
      '& > img': {
        width: '100%',
      },
    },
    companyInfo: {
      '& > span': {
        color: CONSTANTS.PRIMARY_DARK,
        display: 'flex',
      },
      '& > small': {
        color: CONSTANTS.PRIMARY_DARK_GREY,
        display: 'flex',
        fontSize: 10,
        marginBottom: 5
      },
      '& > h4': {
        marginTop: 0,
      },
      flex: 1,
    },
    invoiceDetails: {
      height: '100%',
      display: 'flex',
      flex: '1 1 0%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      '& > div': {
        '& > h2': {
          color: CONSTANTS.INVOICE_HEADING,
          textAlign: 'right'
        },
      },
    },
    dateContainer: {
      display: 'flex',
      flex: '1 1 0%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      '& > div': {
        '& > label': {
          fontSize: 10,
          display: 'block',
          textAlign: 'right',
          color: CONSTANTS.PRIMARY_DARK_GREY,
          '& > span': {
            fontSize: 14,
            color: CONSTANTS.INVOICE_HEADING,
            marginLeft: 20,
            fontWeight: 200
          },
        }
      }
    },
    divider: {
      margin: '0 20px',
    },
    invoiceInfoContainer: {
      flex: 3,
      marginBottom: 20,
    },
    totalContainer: {
      backgroundColor: CONSTANTS.INVOICE_TOTAL_CONTAINER,
      width: '100%',
      padding: 10,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      minHeight: 100,
      '& > div': {
        '& > small': {
          color: CONSTANTS.PRIMARY_DARK_GREY,
          fontSize: 10,
          marginBottom: 5
        },
      },
      flex: 1,
    },
    totalEnd: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      '& > h1': {
        margin: 0,
        padding: 0
      }
    },
    invoiceBottom: {
      backgroundColor: CONSTANTS.PRIMARY_WHITE,
      marginTop: theme.spacing(6),
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
      paddingBottom: theme.spacing(10),
    },
    invoiceBottomInner: {
      backgroundColor: CONSTANTS.INVOICE_TOP,
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      '& > div': {
        '&:first-child': {
          width: '60%'
        },
        '&:last-child': {
          width: '40%'
        },
        '& > div > span': {
          color: CONSTANTS.PRIMARY_DARK_GREY,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          fontSize: 10,
          marginBottom: 5
        },
        '& > div > h3': {
          margin: 0,
          fontWeight: 400,
          color: CONSTANTS.PRIMARY_DARK_GREY,
        },
        '& > div > h2': {
          margin: 0,
          fontWeight: 400,
          color: CONSTANTS.PRIMARY_DARK_GREY,
        },
      }
    },
    invoiceBottomSubTotal: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      '& > div': {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '15px 10px',
      }
    },
    invoiceBottomTotal: {
      backgroundColor: CONSTANTS.INVOICE_TOTAL_CONTAINER,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      '& > div': {
        paddingRight: 10,
        '& > span': {
          justifyContent: 'flex-end!important'
        }
      }
    },
    bgGray: {
      border: '1px solid #f5f5f5;'
    },
    marginBottom40Px :{
      marginBottom: '40px'
    },
    invoiceBottomInfo: {
      '& > p': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        fontSize: 11,
        fontWeight: 400,
      }
    }
  }),
);

const invoiceTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    // items table
    itemsTable: {
      backgroundColor: CONSTANTS.PRIMARY_WHITE,
    },
    itemsTableHeader: {
      backgroundColor: CONSTANTS.INVOICE_TOP,
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
    },
    itemsTableHeaderText: {
      fontSize: 10,
      fontWeight: 200,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
      display: 'block',
      padding: '20px 0',
      borderRight: `1px solid ${CONSTANTS.PRIMARY_WHITE}`
    },
    itemsTableHeaderTextCenter: {
      textAlign: 'center',
    },
    itemsTableHeaderTextRight: {
      textAlign: 'right',
      paddingRight: '10px!important'
    },
    itemsTableBody: {
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
    },
    itemsTableBodyText: {
      fontSize: 14,
      fontWeight: 600,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
      display: 'block',
      borderRight: `1px solid ${CONSTANTS.PRIMARY_WHITE}`
    },
    itemsTableBodyDescription: {
      fontSize: 14,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
      display: 'block',
      borderRight: `1px solid ${CONSTANTS.PRIMARY_WHITE}`
    },
    itemsTableOneRow: {
      padding: '20px 0',
    },
    itemsTableFirstRow: {
      padding: '20px 0 2px 0',
    },
    itemsTableSecondRow: {
      padding: '2px 0 20px 0',
    }

  }),
);

function BCInvoice({ classes, invoiceDetail }: Props) {
  const invoiceStyles = invoicePageStyles();
  const invoiceTableStyle = invoiceTableStyles();
  /*  const dispatch = useDispatch();
    if (invoiceDetail.customer) {
      dispatch(getCustomerDetailAction({customerId: invoiceDetail.customer._id}));
    }
    dispatch(getAllSalesTaxAPI());*/

  const [selectedComments, setSelectedComments] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  const comments = (invoiceDetail.job?.tasks || [])
    .filter((task: any) => task.comment)
    .map((task: any) => {
      return {
        comment: task.comment,
        id: task._id,
      };
    });
  const technicianImages =
    invoiceDetail.job?.technicianImages?.map((image: any) => ({
      date: image.createdAt,
      imageUrl: image.imageUrl,
      uploader: image.uploadedBy?.profile?.displayName,
    })) || [];

  const technicianData = {
    commentValues: comments,
    images: technicianImages,
  };

  const jobData = {
    commentValues: [{
      comment:  invoiceDetail?.job?.description|| invoiceDetail?.job?.ticket?.note || '',
      id: invoiceDetail?.job?.ticket?._id
    }] || [],
    images: invoiceDetail?.job?.ticket?.images || []
  };
  var isEditing = false;

  const allComments = [...jobData.commentValues, ...technicianData.commentValues];
  const allImages = [...jobData.images, ...technicianData.images];

  jobData.commentValues = jobData.commentValues.filter((c: any) => invoiceDetail?.technicianMessages?.notes.filter((comment: any) => comment.id === c.id)?.length > 0);
  jobData.images = jobData.images.filter((i: any) => invoiceDetail?.technicianMessages?.images.filter((image: any) => image === i.imageUrl)?.length > 0);

  technicianData.commentValues = technicianData.commentValues.filter((c: any) => invoiceDetail?.technicianMessages?.notes.filter((comment: any) => comment.id === c.id)?.length > 0);
  technicianData.images = technicianData.images.filter((i: any) => invoiceDetail?.technicianMessages?.images?.filter((image: any) => image === i.imageUrl)?.length > 0);

  useEffect(() => {

    // Set selected comments all if isEditing is true otherwise set selected comments to invoiceData.technicianMessages.notes
    if (isEditing) {
      setSelectedComments(allComments.filter((comment: any) => invoiceDetail.technicianMessages.notes.filter((c: any) => c.id === comment.id)?.length > 0));
      setSelectedImages(allImages.filter((image: any) => invoiceDetail.technicianMessages.images.filter((i: any) => i === image.imageUrl)?.length > 0));
    }
  }, [])

  const composeAddress = () => {
    let address = '';
    if (invoiceDetail?.customer?.contact?.phone)  address+= invoiceDetail?.customer?.contact?.phone + '\n';
    if (invoiceDetail?.customer?.info?.email)  address+= invoiceDetail?.customer?.info?.email + '\n';
    if (invoiceDetail?.customer?.address?.street)  address+= invoiceDetail?.customer?.address?.street + '\n';
    if (invoiceDetail?.customer?.address?.city)  address+= invoiceDetail?.customer?.address?.city + ', ';
    if (invoiceDetail?.customer?.address?.state)  address+= invoiceDetail?.customer?.address?.state + ' ';
    if (invoiceDetail?.customer?.address?.zipCode)  address+= invoiceDetail?.customer?.address?.zipCode + ' ' ;
    return address;
  }

  const composeContactDetail = () => {
    let contactDetail = '';
    if (invoiceDetail?.customerContactId?.name)  contactDetail+= invoiceDetail?.customerContactId?.name + '\n';
    if (invoiceDetail?.customerContactId?.phone)  contactDetail+= invoiceDetail?.customerContactId?.phone + '\n';
    if (invoiceDetail?.customerContactId?.email)  contactDetail+= invoiceDetail?.customerContactId?.email + '\n';
    return contactDetail;
  }

  let customerAddress: any = invoiceDetail?.customer?.address ? ({
    street: invoiceDetail?.customer?.address?.street || '',
    city: invoiceDetail?.customer?.address?.city || '',
    state: invoiceDetail?.customer?.address?.state || '',
    zipCode: invoiceDetail?.customer?.address?.zipCode || '',
  }) : null;
  customerAddress = customerAddress ? Object.values(customerAddress).filter(key=>!!key) : '';

  let serviceAddressLocation: any = invoiceDetail?.job?.jobLocation ? ({
    name: invoiceDetail?.job?.jobLocation?.name || '',
    street: invoiceDetail?.job?.jobLocation?.address?.street || '',
    city: invoiceDetail?.job?.jobLocation?.address?.city || '',
    state: invoiceDetail?.job?.jobLocation?.address?.state || '',
    zipcode: invoiceDetail?.job?.jobLocation?.address?.zipcode || '',
  }) : null;
  serviceAddressLocation = serviceAddressLocation ? Object.values(serviceAddressLocation).filter(key=>!!key) : '';

  let serviceAddressSite: any = invoiceDetail?.job?.jobSite ? ({
    name: invoiceDetail?.job?.jobSite?.name || '',
    street: invoiceDetail?.job?.jobSite?.address?.street || '',
    city: invoiceDetail?.job?.jobSite?.address?.city || '',
    state: invoiceDetail?.job?.jobSite?.address?.state || '',
    zipcode: invoiceDetail?.job?.jobSite?.address?.zipcode || '',
  }) : null;
  serviceAddressSite = serviceAddressSite ? Object.values(serviceAddressSite).filter(key=>!!key) : '';

  let billingAddress = {
    street: invoiceDetail?.companyLocation ? (invoiceDetail?.companyLocation?.isAddressAsBillingAddress ? invoiceDetail?.companyLocation?.address?.street ?? '' : invoiceDetail?.companyLocation?.billingAddress?.street ?? '') : invoiceDetail?.company?.address?.street,
    city: invoiceDetail?.companyLocation ? (invoiceDetail?.companyLocation?.isAddressAsBillingAddress ? invoiceDetail?.companyLocation?.address?.city ?? '' : invoiceDetail?.companyLocation?.billingAddress?.city ?? '') : invoiceDetail?.company?.address?.city,
    state: invoiceDetail?.companyLocation ? (invoiceDetail?.companyLocation?.isAddressAsBillingAddress ? invoiceDetail?.companyLocation?.address?.state ?? '' : invoiceDetail?.companyLocation?.billingAddress?.state ?? '') : invoiceDetail?.company?.address?.state,
    zipcode: invoiceDetail?.companyLocation ? (invoiceDetail?.companyLocation?.isAddressAsBillingAddress ? invoiceDetail?.companyLocation?.address?.zipCode ?? '' : invoiceDetail?.companyLocation?.billingAddress?.zipCode ?? '') : invoiceDetail?.company?.address?.zipCode,
  };

  return (
    <DataContainer>
      <div className={invoiceStyles.invoiceTop}>
        {invoiceDetail?.job?._id &&
          <Typography variant={'caption'} className={'jobIdText'}>{invoiceDetail?.job?.jobId}</Typography>
        }
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails} style={{alignItems: 'center'}}>
                  <div className={invoiceStyles.companyInfo}>
                    <div className={invoiceStyles.companyLogo}>
                      <img src={invoiceDetail?.company?.info?.logoUrl}/>
                    </div>
                  </div>
                  <div className={invoiceStyles.companyDetails}>
                    <div className={invoiceStyles.companyInfo}>
                      <h4>{invoiceDetail?.company?.info?.companyName}</h4>
                      <span>{invoiceDetail?.company?.contact?.phone}</span>
                      <span>{invoiceDetail?.company?.info?.companyEmail}</span>
                      <span>{billingAddress.street}</span>
                      <span>{billingAddress.city}, {billingAddress.state} {billingAddress.zipcode}</span>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails}>
                  <div className={invoiceStyles.companyInfo}>
                    <small>BILL TO</small>
                    <h4>{invoiceDetail?.customer?.profile?.displayName}</h4>
                    <span>{composeAddress()}</span>
                  </div>
                  <div className={invoiceStyles.companyInfo}>
                    {!serviceAddressLocation &&!serviceAddressSite ? (
                      <>
                        <small>JOB ADDRESS</small>
                        <span>{customerAddress.length && Array.isArray(customerAddress) ? customerAddress.join(', ') : ''}</span>
                      </>
                    ) : serviceAddressSite && serviceAddressLocation ? (
                      <>
                        <small>SUBDIVISION</small>
                        <h4 style={{marginBottom: 0}}>{serviceAddressLocation[0]}</h4>
                        <span>{serviceAddressLocation.slice(1).join(', ')}</span>
                        <small style={{marginTop: 20}}>JOB ADDRESS</small>
                        <h4 style={{marginBottom: 0}}>{serviceAddressSite[0]}</h4>
                        <span>{serviceAddressSite.slice(1).join(', ')}</span>
                      </>
                    ) : serviceAddressLocation && (
                      <>
                        <small>JOB ADDRESS</small>
                        <h4 style={{marginBottom: 0}}>{serviceAddressLocation[0]}</h4>
                        <span>{serviceAddressLocation.slice(1).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails}>
                  <div className={invoiceStyles.companyInfo}>
                    <small>CONTACT DETAILS</small>
                    {invoiceDetail?.customerContactId && composeContactDetail().split('\n').map((detail, index) => (
                      <span key={index} style={{color: '#000000'}}>{detail}</span>
                    ))}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails}>
                  <div className={invoiceStyles.companyInfo}>
                    <small>NOTES/SPECIAL INSTRUCTIONS</small>
                    {invoiceDetail?.job?.ticket?.note && <span style={{color: '#000000'}}>{invoiceDetail.job.ticket.note}</span>}
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={invoiceStyles.invoiceDetails}>
              <div className={invoiceStyles.companyDetails} style={{flex: 2, alignItems: 'center'}}>
                <div className={invoiceStyles.companyInfo}>
                  <small>VENDOR NUMBER</small>
                  <h4>{invoiceDetail.vendorId}</h4>
                </div>
                {!invoiceDetail.isDraft &&
                <div className={invoiceStyles.companyInfo} style={{textAlign: 'right'}}>
                  {invoiceDetail.paid && invoiceDetail.status === 'PAID'
                    ? <Chip
                      label={'Paid'}
                      style={{
                        'backgroundColor': CONSTANTS.PRIMARY_GREEN,
                        'color': '#fff'
                      }}
                    />
                    : <Chip
                      style={{
                        textTransform: 'capitalize',
                        backgroundColor: invoiceDetail?.status === 'UNPAID' ? '#F50057' : '#FA8029',
                        color: '#fff'
                      }}
                      label={invoiceDetail?.status?.split('_').join(' ').toLowerCase()}
                    />}
                </div>
                }
              </div>
              <div className={invoiceStyles.invoiceInfoContainer}>
                <h2>INVOICE</h2>
                <div className={invoiceStyles.dateContainer}>
                  <div>
                    <VerticalCenterLabel>INVOICE #: <FixedWidthSpan>{invoiceDetail.invoiceId}</FixedWidthSpan></VerticalCenterLabel>
                    <VerticalCenterLabel>CUSTOMER P.O. : <FixedWidthSpan>{invoiceDetail.customerPO}</FixedWidthSpan></VerticalCenterLabel>
                    <VerticalCenterLabel>Payment Terms : <FixedWidthSpan>{invoiceDetail?.paymentTerm?.name}</FixedWidthSpan></VerticalCenterLabel>
                  </div>
                  <Divider className={invoiceStyles.divider} orientation="vertical" flexItem/>
                  <div>
                    <label>INVOICE DATE #: <span>{moment(invoiceDetail.issuedDate?.split('T')[0] || invoiceDetail.createdAt?.split('T')[0]).format('MMM. DD, YYYY')}</span></label>
                    <label>DUE DATE #: <span>{moment(invoiceDetail.dueDate?.split('T')[0]).format('MMM. DD, YYYY')}</span></label>
                  </div>
                </div>
              </div>
              <div className={invoiceStyles.totalContainer}>
                <div>
                  <small>Total</small>
                </div>
                <div className={invoiceStyles.totalEnd}>
                  <h1>{formatCurrency(invoiceDetail.total)}</h1>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className={invoiceTableStyle.itemsTable}>

        <div className={invoiceTableStyle.itemsTableHeader}>
          <Grid container>
            <Grid item xs={12} lg={6}>
              <span className={invoiceTableStyle.itemsTableHeaderText}>SERVICE / PRODUCT</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextCenter)}>QUANTITY</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextCenter)}>PRICE</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextCenter)}>UNIT</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextCenter)}>TAX</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextCenter)}>TAX AMOUNT</span>
            </Grid>
            <Grid item xs={12} lg={1}>
              <span className={classNames(invoiceTableStyle.itemsTableHeaderText, invoiceTableStyle.itemsTableHeaderTextRight)}>AMOUNT</span>
            </Grid>
          </Grid>
        </div>
        <div className={invoiceTableStyle.itemsTableBody}>
          {invoiceDetail?.items && invoiceDetail?.items.map((row: any, rowIndex: number) => (
            <Grid container key={rowIndex}>
              <Grid item container
                    className={row?.description ? invoiceTableStyle.itemsTableFirstRow : invoiceTableStyle.itemsTableOneRow}>
                <Grid item xs={12} lg={6}>
                  <span className={invoiceTableStyle.itemsTableBodyText}>{row?.item?.name}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>{row?.quantity}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>{formatCurrency(row.price)}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>{row?.isFixed ? 'Fixed' : 'Hourly'}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>{formatCurrency(row?.tax, 'N/A')}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>{formatCurrency(row?.taxAmount)}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextRight
                  )}>{formatCurrency(row.subTotal)}</span>
                </Grid>
              </Grid>
              {row?.description &&
                <Grid item xs={12} lg={8}
                      className={invoiceTableStyle.itemsTableSecondRow}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyDescription,
                  )}>{row?.description}</span>
                </Grid>
              }
            </Grid>
          ))}
        </div>

      </div>
      <div className={invoiceStyles.invoiceBottom}>
        <div className={invoiceStyles.invoiceBottomInner}>
          <div className={invoiceStyles.invoiceBottomSubTotal}>
            <div>
              <span>SUBTOTAL</span>
              <h3>${parseFloat(invoiceDetail.subTotal).toFixed(2)}</h3>
            </div>
            <div>
              <h3>+</h3>
            </div>
            <div>
              <span>TAX</span>
              <h3>${parseFloat(invoiceDetail.taxAmount).toFixed(2)}</h3>
            </div>
          </div>
          <div className={invoiceStyles.invoiceBottomTotal}>
            <div>
              <span>TOTAL</span>
              <h2>${parseFloat(invoiceDetail.total).toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <Divider className={invoiceStyles.marginBottom40Px}/>

        {
          jobData && (jobData.commentValues?.length > 0 || jobData.images?.length > 0) &&
          <>
            <BCTicketMessagesNotes invoiceData={jobData}
               selectedComments={selectedComments}
               setSelectedComments={setSelectedComments}
               selectedImages={selectedImages}
               setSelectedImages={setSelectedImages}
               isEditing={isEditing}
               isJob={true}
               isInvoiceMainView={false}
               isPadding={false}
               classes={classes.width100}
            />
          </>
        }
        <hr className={invoiceStyles.bgGray}/>
        {
          technicianData && (technicianData.commentValues?.length > 0 || technicianData.images?.length > 0) &&
          <>
            <BCTicketMessagesNotes invoiceData={technicianData}
               selectedComments={selectedComments}
               setSelectedComments={setSelectedComments}
               selectedImages={selectedImages}
               setSelectedImages={setSelectedImages}
               isEditing={isEditing}
               isJob={false}
               isInvoiceMainView={false}
               isPadding={false}
               classes={classes.width100}
            />
          </>
        }

      </div>
    </DataContainer>
  )
}

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  background-color: ${CONSTANTS.PRIMARY_WHITE};
  border: 1px solid ${CONSTANTS.INVOICE_BORDER};
`;

export const VerticalCenterLabel = styled.label`
  display: flex !important;
  align-items: center !important;
  justify-content: space-between;
`;

export const FixedWidthSpan = styled.span`
  display: inline-block !important;
  width: 100px !important;
`;


export default withStyles(styles)(BCInvoice);
