import {Grid, Typography, withStyles} from "@material-ui/core";
import React from "react";
import styles from './bc-set-display-name-modal.styles';
import BCInput from "../../components/bc-input/bc-input";
import {CSButton} from "../../../helpers/custom";
import {useFormik} from "formik";
import {useDispatch, useSelector} from "react-redux";
import {
  getVendorDetailAction,
  loadingSingleVender,
  setVendorDisplayName
} from "../../../actions/vendor/vendor.action";
import {
  closeModalAction,
  setModalDataAction
} from "../../../actions/bc-modal/bc-modal.action";

function BCSetDisplayNameModal({classes, props}: any): JSX.Element {

  const {contractorId, displayName} = props;

  const dispatch = useDispatch();
  const {
    vendorObj,
    response,
    loading = true
  } = useSelector((state: any) => state.vendors);

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const {
    values: FormikValues,
    handleChange: formikChange,
    handleSubmit: FormikSubmit,
    isSubmitting,
  } = useFormik({
    initialValues: {
      displayName: displayName || '',
    },
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true);
      await dispatch(setVendorDisplayName({
        contractorId,
        displayName: values.displayName
      }, () => {
        closeModal();
        dispatch(loadingSingleVender());
        dispatch(getVendorDetailAction(vendorObj._id));
      }));
      setSubmitting(false);
    },
    validate: (values) => {

    }
  });

  return <>
    <form onSubmit={FormikSubmit}>
      <Grid container direction="column" alignItems="center"
            className={classes.mainContainer}>
        <Grid>
          <Typography variant={'body1'} className={classes.displayNameInfo}>
            Vendor display name is only for internal use.
          </Typography>
          <Grid className={classes.displayNameContainer}>
            <BCInput
              value={FormikValues?.displayName}
              handleChange={formikChange}
              name={'displayName'}
            />
          </Grid>
        </Grid>
        <CSButton
          aria-label={'display-name'}
          disabled={isSubmitting || !FormikValues?.displayName}
          variant="contained"
          color="primary"
          size="small"
          type={'submit'}>
          {'Update'}
        </CSButton>
      </Grid>
    </form>
  </>
}

export default withStyles(
  styles,
  {'withTheme': true}
)(BCSetDisplayNameModal);
