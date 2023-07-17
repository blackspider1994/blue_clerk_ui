import {
    Button,
    Checkbox,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Grid,
    TextField,
    Typography,
    withStyles
} from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import {
    closeModalAction,
    setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import styled from 'styled-components';
import styles from './bc-email-modal.styles';
import { useDispatch, useSelector } from 'react-redux';
import * as CONSTANTS from '../../../constants';
import { useFormik } from 'formik';
import BCCircularLoader from '../../components/bc-circular-loader/bc-circular-loader';
import { error } from 'actions/snackbar/snackbar.action';
import * as yup from 'yup';
import BCSent from "../../components/bc-sent";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { generatePORequestEmailTemplate, sendPORequestEmail } from 'api/po-requests.api';

const validationSchema = yup.object().shape({
    to: yup.string().email('Please insert a valid email').required('Please add recipient'),
    cc: yup.string().email('Please insert a valid email').nullable(),
});

function EmailPORequestModal({ classes, po_request }: any) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState({subject: '', message: '', })
    const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);
    const { user } = useSelector((state: any) => state.auth);
    const closeModal = () => {
        dispatch(closeModalAction());
        setTimeout(() => {
            dispatch(
                setModalDataAction({
                    data: {},
                    type: '',
                })
            );
        }, 200);
    };

    const getData = async () => {
        const params: any = {
            ticketId: po_request._id
        };
        try {
            const { status, message, emailTemplate: data } = await generatePORequestEmailTemplate(params);
            if (status === 0) {
                dispatch(error(message));
                closeModal();
            } else {
                setEmailTemplate(data);
                form.validateForm()
            }
        } catch (e) {
            dispatch(error(e.message));
            closeModal();
        } finally {
            setLoading(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        getData();
    }, []);

    const form = useFormik({
        enableReinitialize: true,
        initialValues: {
            ...emailTemplate,
            from: user?.auth?.email,
            to: po_request.customer.info.email,
            cc: '',
            sendToMe: false,
            withPDF: true
        },
        validationSchema,
        onSubmit: async (values: any, { setSubmitting }: any) => {
            const params = {
                ticketId: po_request._id,
                recipients: JSON.stringify([values.to]),
                subject: values.subject,
                message: values.message,
                copyToMyself: values.sendToMe,
                withPDF: values.withPDF,
                workType: currentDivision.data?.workTypeId ? JSON.stringify([currentDivision.data?.workTypeId]) : null,
                companyLocation: currentDivision.data?.locationId ? JSON.stringify([currentDivision.data?.locationId]) : null,
            }
            try {
                setLoading(true);
                const { status, message } = await sendPORequestEmail(params);
                if (status === 1) {
                    setSubmitting(false);
                    setSent(true);
                } else {
                    dispatch(error(message));
                }
            } catch (e) {
                dispatch(error(e.message));
                closeModal();
            } finally {
                setLoading(false);
            }
        },
    });

    const {
        errors: FormikErrors,
        values: FormikValues,
        handleChange: formikChange,
        handleSubmit: FormikSubmit,
    } = form;

    return (
        <DataContainer>
            <hr
                style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }}
            />

            <form onSubmit={FormikSubmit}>
                <DialogContent classes={{ root: classes.dialogContent }}>
                    {loading ? (
                        <BCCircularLoader heightValue={'20vh'} />
                    ) : sent ? (
                        <BCSent title={'Purchase Order Request was sent successfully'} showLine={false} />
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
                                        <TextField
                                            // autoComplete={'off'}
                                            className={classes.fullWidth}
                                            id={'to'}
                                            name={'to'}
                                            onChange={(e: any) => formikChange(e)}
                                            value={FormikValues.to}
                                            variant={'outlined'}
                                            placeholder="Enter email"
                                            error={Boolean(FormikErrors.to)}
                                            helperText={FormikErrors.to}
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
                                        <Typography variant={'button'}>CC</Typography>
                                    </Grid>
                                    <Grid item xs={10}>
                                        <TextField
                                            // autoComplete={'off'}
                                            className={classes.fullWidth}
                                            id={'cc'}
                                            name={'cc'}
                                            onChange={(e: any) => formikChange(e)}
                                            value={FormikValues.cc}
                                            variant={'outlined'}
                                            placeholder="Enter email"
                                            error={Boolean(FormikErrors.cc)}
                                            helperText={FormikErrors.cc}
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
                                                    checked={FormikValues.withPDF}
                                                    onChange={formikChange}
                                                    name="withPDF"
                                                    classes={{ root: classes.checkboxInput }}
                                                />
                                            }
                                            label={`Add PDF as attachment`}
                                        />
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
                                <Button
                                    disabled={form.isSubmitting}
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
                        </Grid>
                        <Grid item>
                            {!loading && !sent ? (
                                <>
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
  .MuiInputBase-root {
    fieldset {
      border-radius: 8px;
      border 1px solid #E0E0E0;
    }
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

export default withStyles(styles, { withTheme: true })(EmailPORequestModal);
