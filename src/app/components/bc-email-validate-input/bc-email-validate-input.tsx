import { FormDataModel } from '../../models/form-data';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CloseIcon from '@material-ui/icons/Close';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import validator from 'validator';


interface BCEmailValidateInputProps {
  id?: string;
  label?: string;
  size: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
  inputData: FormDataModel;
  onChange: Function;
  disabled?: boolean;
  referenceEmail? : string;
  infoText? : string;
  required? : boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoContainer: {
      width: 311,
      padding: 14,
      paddingTop: 20,
      paddingRight: 25,
      fontSize: 13,
      color: '#4F4F4F',
    },
    closeIcon: {
      cursor: 'pointer',
      position: 'absolute',
      right: 5,
      top: 5,
      fontSize: 20,
    },
    popper: {
      zIndex: 1,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
      '&[x-placement*="top"] $arrow': {
        bottom: 0,
        left: 0,
        marginBottom: '-0.9em',
        width: '3em',
        height: '1em',
        '&::before': {
          borderWidth: '1em 1em 0 1em',
          borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
        },
      },
    },
    arrow: {
      position: 'absolute',
      fontSize: 10,
      width: '3em',
      height: '3em',
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      },
    },
  }),
);

function BCEmailValidateInput({
  id = 'email',
  label = 'Email',
  variant = 'outlined',
  size = 'small',
  inputData,
  disabled = false,
  required = true,
  onChange,
  referenceEmail = '',
  infoText = '',
}: BCEmailValidateInputProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [arrowRef, setArrowRef] = React.useState<null | HTMLElement>(null);
  
  const handleChangeEmail = (e: any) => {
    const emailData = {
      'errorMsg': '',
      'validate': true,
      'value': e.target.value
    };

    if (e.target.value.length === 0 && required) {
      emailData.validate = false;
      emailData.errorMsg = 'This field is required';
    } else if (emailData.value === referenceEmail) {
      emailData.validate = false;
      emailData.errorMsg = 'This email cannot be the same as primary email';
    } else if (validator.isEmail(emailData.value) || (emailData.value.length === 0 && !required)) {
      emailData.validate = true;
      emailData.errorMsg = '';
    } else {
      emailData.validate = false;
      emailData.errorMsg = 'This field must be a valid email address';
    }

    onChange({
      ...emailData
    });
  };

  const handleClickShowInfo = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleMouseDownInfo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const open = Boolean(anchorEl);
  const popperId = open ? 'transitions-popper' : undefined;

  return (
    <TextField
      error={!inputData.validate}
      fullWidth
      disabled={disabled}
      helperText={inputData.errorMsg}
      id={id}
      label={label}
      onChange={handleChangeEmail}
      size={size}
      type={'email'}
      value={inputData.value}
      variant={variant}
      InputProps={{
        endAdornment: infoText ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="recovery email info"
              onClick={handleClickShowInfo}
              onMouseDown={handleMouseDownInfo}
            >
              <InfoOutlinedIcon />
              <Popper
                id={popperId}
                open={open}
                anchorEl={anchorEl}
                transition
                placement="top-end"
                className={classes.popper}
                modifiers={{
                  flip: {
                    enabled: false,
                  },
                  preventOverflow: {
                    enabled: false,
                    boundariesElement: 'scrollParent',
                  },
                  arrow: {
                    enabled: true,
                    element: arrowRef,
                  },
                }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <>
                      <span className={classes.arrow} ref={setArrowRef} /> 
                      <Paper className={classes.infoContainer}>
                        <CloseIcon className={classes.closeIcon}/>
                        {infoText}
                      </Paper>
                    </>
                  </Fade>
                )}
              </Popper>
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}

export default BCEmailValidateInput;
