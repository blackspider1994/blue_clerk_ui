import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chip, createStyles, Divider, Grid, withStyles } from "@material-ui/core";
import styles from "./bc-invoice.styles";
import { makeStyles, Theme } from "@material-ui/core/styles";
import * as CONSTANTS from "../../../constants";
import styled from "styled-components";
import { getCustomerDetailAction } from "../../../actions/customer/customer.action";
import moment from "moment";

import classNames from "classnames";
import { getContacts } from "../../../api/contacts.api";
import {getAllSalesTaxAPI} from "../../../api/tax.api";

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
      flex: 1,
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
  const composeAddress = () => {
    let address = '';
    if (invoiceDetail?.customer?.contact?.phone)  address+= invoiceDetail?.customer?.contact?.phone + '\n';
    if (invoiceDetail?.customer?.info?.email)  address+= invoiceDetail?.customer?.info?.email + '\n';
    if (invoiceDetail?.customer?.contact?.street)  address+= invoiceDetail?.customer?.contact?.street + '\n';
    if (invoiceDetail?.customer?.contact?.city)  address+= invoiceDetail?.customer?.contact?.city + ',';
    if (invoiceDetail?.customer?.contact?.state)  address+= invoiceDetail?.customer?.contact?.state;
    if (invoiceDetail?.customer?.contact?.zipCode)  address+= invoiceDetail?.customer?.contact?.zipCode ;
    return address;
  }

  const composeContactDetail = () => {
    let contactDetail = '';
    if (invoiceDetail?.customerContactId?.name)  contactDetail+= invoiceDetail?.customerContactId?.name + '\n';
    if (invoiceDetail?.customerContactId?.phone)  contactDetail+= invoiceDetail?.customerContactId?.phone + '\n';
    if (invoiceDetail?.customerContactId?.email)  contactDetail+= invoiceDetail?.customerContactId?.email + '\n';
    return contactDetail;
  }

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

  return (
    <DataContainer>
      <div className={invoiceStyles.invoiceTop}>
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
                      <span>{invoiceDetail?.company?.address?.street}</span>
                      <span>{invoiceDetail?.company?.address?.city}, {invoiceDetail?.company?.address?.state} {invoiceDetail?.company?.address?.zipCode}</span>
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
                    <small>SERVICE ADDRESS</small>
                    {(serviceAddressSite || serviceAddressLocation) && (
                      <>
                        <h4 style={{fontWeight: 400}}>{serviceAddressSite ? serviceAddressSite[0].toUpperCase() : serviceAddressLocation[0].toUpperCase()}</h4>
                        <span>{serviceAddressSite ? serviceAddressSite.slice(1).join(', ') : serviceAddressLocation.slice(1).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails}>
                  <div className={invoiceStyles.companyInfo}>
                    <small>CONTACT DETAILS</small>
                    {invoiceDetail?.customerContactId && composeContactDetail().split('\n').map((detail,index)=>(
                      <span key={index} style={{color: '#000000'}}>{detail}</span>
                    ))}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={invoiceStyles.companyDetails}>
                  <div className={invoiceStyles.companyInfo}>
                    <small>TECHNICIAN NOTES</small>
                    {invoiceDetail?.job?.track?.length && invoiceDetail.job.track.filter((detail:{note?: string}) => detail.note).map((detail:{note?: string},index:number)=>(
                      <span key={index} style={{color: '#000000'}}>{`${detail.note}`}</span>
                    ))}
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={invoiceStyles.invoiceDetails}>
              <div className={invoiceStyles.companyDetails} style={{flex: 0.5, alignItems: 'center'}}>
                <div className={invoiceStyles.companyInfo}>
                  <small>VENDOR NUMBER</small>
                  <h4>{invoiceDetail.vendorId}</h4>
                </div>
                {!invoiceDetail.isDraft &&
                <div className={invoiceStyles.companyInfo} style={{textAlign: 'right'}}>
                  {invoiceDetail.paid
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
                    <label>INVOICE #: <span style={{display: 'inline-block', width: 100}}>{invoiceDetail.invoiceId}</span></label>
                    <label>CUSTOMER P.O. : <span style={{display: 'inline-block', width: 100}}>{invoiceDetail.customerPO}</span></label>
                    <label>Payment Terms : <span style={{display: 'inline-block', width: 100}}>{invoiceDetail?.paymentTerm?.name}</span></label>
                  </div>
                  <Divider className={invoiceStyles.divider} orientation="vertical" flexItem />
                  <div>
                    <label>INVOICE DATE #: <span>{moment(invoiceDetail.createdAt).format('MMM. DD, YYYY')}</span></label>
                    <label>DUE DATE #: <span>{moment(invoiceDetail.dueDate).format('MMM. DD, YYYY')}</span></label>
                  </div>
                </div>
              </div>
              <div className={invoiceStyles.totalContainer}>
                <div>
                  <small>Total</small>
                </div>
                <div className={invoiceStyles.totalEnd}>
                  <h1>${invoiceDetail.total}</h1>
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
          {invoiceDetail?.items && invoiceDetail?.items.map((row: any) => (
            <Grid container>
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
                  )}>${parseFloat(row?.price).toFixed(2)}</span>
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
                  )}>{row?.tax > 0 ? parseFloat(row?.tax).toFixed(2) : 'N/A'}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextCenter
                  )}>${parseFloat(row?.taxAmount).toFixed(2)}</span>
                </Grid>
                <Grid item xs={12} lg={1}>
                  <span className={classNames(
                    invoiceTableStyle.itemsTableBodyText,
                    invoiceTableStyle.itemsTableHeaderTextRight
                  )}>${parseFloat(row?.subTotal).toFixed(2)}</span>
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
        <Divider/>
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


export default withStyles(styles)(BCInvoice);
