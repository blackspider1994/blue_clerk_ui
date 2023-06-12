import React from "react";
import styles from "./bc-division-confirm-modal.style";
import { useDispatch } from "react-redux";
import { setModalDataAction, closeModalAction } from "actions/bc-modal/bc-modal.action";
import { withStyles, DialogContent, Typography, Box, Fab } from "@material-ui/core";

interface Props {
  classes: any;
  action?: any;
  message?: any;
}

function BCDivisionConfirmModal({classes, action, message}: Props):JSX.Element {
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
        {message}
      </Typography>
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

export default withStyles(styles, { withTheme: true })(BCDivisionConfirmModal);
