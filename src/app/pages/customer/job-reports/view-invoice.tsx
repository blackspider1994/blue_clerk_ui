import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, createStyles, withStyles, Grid, Paper, Badge} from "@material-ui/core";
import styles from "../customer.styles";
import BCInvoice from "../../../components/bc-invoice/bc-invoice";
import IconButton from '@material-ui/core/IconButton';
import styled from "styled-components";
import * as CONSTANTS from "../../../../constants";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PrintIcon from '@material-ui/icons/GetApp';
import EmailIcon from '@material-ui/icons/Email';
import classNames from "classnames";
import {useHistory, useLocation, useParams} from "react-router-dom";
import { loadInvoiceDetail } from "../../../../actions/invoicing/invoicing.action";
import { getCompanyProfileAction } from "../../../../actions/user/user.action";
import BCCircularLoader from "../../../components/bc-circular-loader/bc-circular-loader";
import {CSChip} from "../../../../helpers/custom";
import { generateInvoicePdfAPI, updateInvoice } from "../../../../api/invoicing.api";
import {error} from "../../../../actions/snackbar/snackbar.action";
import EmailInvoiceButton from "../../invoicing/invoices-list/email.invoice";
import { modalTypes } from "../../../../constants";
import { setModalDataAction, openModalAction } from "actions/bc-modal/bc-modal.action";
import { ISelectedDivision } from "actions/filter-division/fiter-division.types";

const invoicePageStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    margin: {
      margin: theme.spacing(1),
    },
    white: {
      color: '#fff',
    },
    invoiceTop: {
      backgroundColor: CONSTANTS.PRIMARY_GRAY,
    },
    bgDark: {
      backgroundColor: '#D0D3DC',
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    draftChip: {
      background: 'repeating-linear-gradient(-55deg,#EAECF3,#EAECF3 10px,#F4F5F9 10px,#F4F5F9 20px)',
      color: 'black',
      fontWeight: 700,
      fontSize: 14,
      marginLeft: 20,
    },
    costingButton: {
      marginLeft: 10
    },
    buttonLabel: {
      textWrap: 'nowrap'
    }
  }),
);

function ViewInvoice({ classes, theme }: any) {
  const dispatch = useDispatch();
  const invoiceStyles = invoicePageStyles();
  let history = useHistory();
  const location = useLocation<any>();
  let { invoice } = useParams<any>();
  const { user } = useSelector(({ auth }: any) => auth);
  const { 'data': invoiceDetail, 'loading': loadingInvoiceDetail, 'error': invoiceDetailError } = useSelector(({ invoiceDetail }:any) => invoiceDetail);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);
  const [showJobCosting, setShowJobCosting] = useState(false);

  useEffect(() => {
    if (invoice) {
      dispatch(loadInvoiceDetail.fetch(invoice));
    }

    if (user) {
      dispatch(getCompanyProfileAction(user.company as string));
    }
  }, []);

  useEffect(() => {
    if (invoiceDetail && invoiceDetail.job) {
      const vendorWithCommisionTier = invoiceDetail.job?.tasks?.filter((res: any) => res.contractor.commissionTier);
      setShowJobCosting(vendorWithCommisionTier.length > 0);
    }
  }, [invoiceDetail]);

  if (loadingInvoiceDetail) {
    return <BCCircularLoader heightValue={'200px'} />;
  }

  const goToEdit = () => {
    if(invoiceDetail?.paid && invoiceDetail?.status === 'PAID') {
      dispatch(
        setModalDataAction({
          'data': {
            'data': {
              handleOnConfirm: () => {
                history.push({
                  'pathname': `/main/invoicing/edit/${invoice}`,
                  'state': {
                    'customerId': invoiceDetail.customer?._id,
                    'customerName': invoiceDetail.customer?.profile?.displayName,
                    'invoiceId': invoiceDetail?._id,
                    'jobType': invoiceDetail.job?.type?._id,
                    'invoiceDetail': invoiceDetail
                  }
                });
              }
            },
            'modalTitle': '',
            'removeFooter': false
          },
          type: modalTypes.CONFIRM_EDIT_PAID_INVOICE_MODAL,
        })
      );
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);
    } else {
      history.push({
        'pathname': `/main/invoicing/edit/${invoice}`,
        'state': {
          'customerId': invoiceDetail.customer?._id,
          'customerName': invoiceDetail.customer?.profile?.displayName,
          'invoiceId': invoiceDetail?._id,
          'jobType': invoiceDetail.job?.type?._id,
          'invoiceDetail': invoiceDetail
        }
      });
    }
  }

  const saveInvoice = () => {
    dispatch(setModalDataAction({
      data: {
        modalTitle: 'Status',
        progress: true,
        removeFooter: false,
        className: 'serviceTicketTitle',
      },
      type: modalTypes.RECORD_SYNC_STATUS_MODAL,
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);

    const params ={
      invoiceId: invoiceDetail._id,
      isDraft: false,
      charges: 0,
      items: JSON.stringify(invoiceDetail.items),
    }

    updateInvoice(params).then((response: any) => {
      if (response.status === 1) {
        const {status, quickbookInvoice} = response;
        dispatch(setModalDataAction({
          data: {
            modalTitle: 'Status',
            progress: false,
            keyword: 'Invoice',
            created: status === 1,
            synced: !!quickbookInvoice,
            closeAction: () => history.goBack(),
            removeFooter: false,
            className: 'serviceTicketTitle',
          },
          type: modalTypes.RECORD_SYNC_STATUS_MODAL,
        }));
      } else
        dispatch(error(response.message));
    }).catch((err: any) => {
      dispatch(error(err));
    });
  }

  // const listener = history.listen((loc, action) => {
  //   debugger;
  //   if (action === 'POP'){
  //     handleBackButtonClick();
  //     // listener();
  //   }
  // });

  const handleBackButtonClick = () => {
    if (location?.state?.keyword || location?.state?.currentPageSize  || location?.state?.currentPageIndex
      || location?.state?.lastNextCursor || location?.state?.lastPrevCursor || location?.state?.selectionRange
    ) {
      history.replace({
        'pathname': currentDivision.urlParams ? `/main/invoicing/invoices-list/${currentDivision.urlParams}` : `/main/invoicing/invoices-list`,
        'state': {
          'option': {
            search: location?.state?.keyword || '',
            pageSize: location?.state?.currentPageSize || 10,
            pageSizeIndex: location?.state?.currentPageIndex || 0,
            currentPageIndex: location?.state?.currentPageIndex || 0,
            lastNextCursor: location?.state?.lastNextCursor,
            lastPrevCursor: location?.state?.lastPrevCursor,
            selectionRange: location?.state?.selectionRange || null
          },
          'tab': location?.state?.tab || 0,
        }
      });
    } else {
      history.goBack();
    }
  }

  /*  const goToEditNew = () => {
      history.push({
        'pathname': `/main/invoicing/update-invoice/${invoice}`,
        'state': {
          'customerId': invoiceDetail.customer?._id,
          'customerName': invoiceDetail.customer?.profile?.displayName,
          'jobId': invoiceDetail?._id,
          'jobType': invoiceDetail.job?.type?._id,
          'invoiceDetail': invoiceDetail
        }
      });
    }*/

  const generatePDF = async() => {
    generateInvoicePdfAPI(invoiceDetail.customer?._id, invoice).then((response: any) => {
      const {status, message, invoiceUrl} = response;
      if (status === 1) {
        window.open(invoiceUrl)
      } else {
        dispatch(error(message));
      }
    }).catch(e => dispatch(error(e.message)))
  }
  const openEditJobCostingModal = () => {
    dispatch(
      setModalDataAction({
        data: {
          job: { ...invoiceDetail.job, charge: invoiceDetail.total, isInvoice: true },
          removeFooter: false,
          maxHeight: '100%',
          modalTitle: 'Job Costing'
        },
        type: modalTypes.EDIT_JOB_COSTING_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };



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


  const handleTicketClick = () => {
    dispatch(setModalDataAction({
      data: {
        removeFooter: false,
        maxHeight: '100%',
        modalTitle: 'Job Details',
        invoiceData: invoiceDetail,
        isEditing: false
      },
      type: modalTypes.TICKET_DETAILS_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  return (
    <MainContainer>
      <PageContainer>
        <PageHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="default"
              size="small"
              className={classNames(invoiceStyles.bgDark, invoiceStyles.white)}
              onClick={handleBackButtonClick}
            >
              <ArrowBackIcon/>
            </IconButton>
            {showJobCosting && 
              <div>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={openEditJobCostingModal}
                  classes={{ root: invoiceStyles.costingButton, label: invoiceStyles.buttonLabel }}
                >Job Costing
                </Button>
              </div>
            }
            {invoiceDetail?.isDraft ? (
              <CSChip
                label={'Draft'}
                className={invoiceStyles.draftChip}
              />
            ) : !invoiceDetail?.emailHistory?.length ? (
              <CSChip
                label={'Not Sent'}
                className={invoiceStyles.draftChip}
              />
            ) : (
              <CSChip
                label={'Sent'}
                className={invoiceStyles.draftChip}
              />
            )}
          </div>
          <div>
            {invoiceDetail && (
              <>
                {technicianData.commentValues.length > 0 || technicianData.images.length > 0 ? (
                  <Badge
                    badgeContent={1}
                    color="secondary"
                    overlap="rectangle"
                    anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      className={classNames(invoiceStyles.white)}
                      onClick={handleTicketClick}
                    >
                      Job Details
                    </Button>
                  </Badge>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classNames(invoiceStyles.margin, invoiceStyles.white)}
                    onClick={handleTicketClick}
                  >
                    Job Details
                  </Button>
                )}
              </>
            )}
            {invoiceDetail && <EmailInvoiceButton
              showLoader={false}
              Component={<Button
                variant="outlined"
                color="default"
                className={invoiceStyles.margin}
                startIcon={<EmailIcon/>}
              >
                Email
              </Button>}
              from="view-invoice"
              invoice={invoiceDetail}
            />
            }
            {
              invoiceDetail && <Button
              variant="outlined"
              color="default"
              className={invoiceStyles.margin}
              onClick={generatePDF}
              startIcon={<PrintIcon/>}
              >Export
              </Button>
            }
            {
              invoiceDetail && <Button
                variant="contained"
                color="primary"
                // disabled={invoiceDetail?.paid}
                className={classNames(invoiceStyles.margin, invoiceStyles.white)}
                onClick={goToEdit}
              >
                Edit
              </Button>
            }
            {invoiceDetail?.isDraft &&
            <Button
              variant="contained"
              color="primary"
              disabled={invoiceDetail.paid}
              className={classNames(invoiceStyles.margin, invoiceStyles.white)}
              onClick={saveInvoice}
            >
              Save as Invoice
            </Button>
            }
          </div>
        </PageHeader>
        { invoiceDetail && <BCInvoice invoiceDetail={invoiceDetail}/> }
      </PageContainer>
    </MainContainer>
  )
}


export const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1 1 100%;
  padding: 10px 0;
  width: 100%;
  margin: 0 auto;
  align-items: center;
`;

export default withStyles(styles, { 'withTheme': true })(ViewInvoice);
