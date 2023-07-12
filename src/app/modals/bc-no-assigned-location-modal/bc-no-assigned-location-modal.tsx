import React from "react";
import styles from "./bc-no-assigned-location-modal.styles";
import { withStyles, DialogContent, Typography, Box, Fab } from "@material-ui/core";

interface Props {
  classes: any;
}

function BCNoAssignedLocationModal({classes}: Props):JSX.Element {
  return (
    <DialogContent classes={{ root: classes.dialogContent }}>
      <Typography className={classes.description}>
        You are not assigned to any location.
      </Typography>
      <p>You are not assigned any locations or work types. Please contact your company admin</p>
    </DialogContent>
  )
}

export default withStyles(styles, { withTheme: true })(BCNoAssignedLocationModal);
