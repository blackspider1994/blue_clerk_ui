import React from "react";
import styles from "./bc-division-warning-modal.style";
import { useDispatch } from "react-redux";
import { setModalDataAction, closeModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Typography, Box, Fab } from "@material-ui/core";

interface Props {
  classes: any;
  action?: any;
}

function BCDivisionWarningModal({classes, action}: Props):JSX.Element {
  const dispatch = useDispatch();
  
  const closeModal = () => {
    setTimeout(() => {
      dispatch(
        setModalDataAction({
          data: {},
          type: "",
        })
      );
    }, 200);
    dispatch(closeModalAction());
  }

  const onConfirm = () => {
    closeModal();
    action();
  }

  return (
    <DialogContent classes={{ root: classes.dialogContent }}>
      <Typography className={classes.description}>
        Activate Multiple Locations
      </Typography>
      <p>Please note that when you add new locations, ensure that all new jobs are assigned to the correct location. Your first location added will automatically be designated as the Main location, and all jobs will now be assigned to the first work type and location. Please be aware that there may be additional charges when activating additional locations.</p>
      <Box className={classes.buttons}>
        <Fab
          classes={{
            root: classes.fabRoot,
          }}
          className={"serviceTicketBtn"}
          onClick={() => closeModal()}
          variant={"extended"}
        >
          {"Cancel"}
        </Fab>
        <Fab
          classes={{
            root: classes.fabRoot,
          }}
          color={"primary"}
          type={"submit"}
          variant={"extended"}
          onClick={onConfirm}
        >
          {"Okay"}
        </Fab>
      </Box>
    </DialogContent>
  )
}

export default withStyles(styles, { withTheme: true })(BCDivisionWarningModal);
