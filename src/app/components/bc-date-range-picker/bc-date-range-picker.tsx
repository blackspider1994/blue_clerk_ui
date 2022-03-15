import BCDateTimePicker from "../bc-date-time-picker/bc-date-time-picker";
import {ReactComponent as IconCalendar} from "../../../assets/img/icons/map/icon-calendar.svg";
import {formatShortDate} from "../../../helpers/format";
import {Button} from "@material-ui/core";
import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import {DateRangePicker} from "react-date-range";
import {CSButtonSmall} from "../../../helpers/custom";
import {PRIMARY_BLUE} from "../../../constants";
import Popper from "@material-ui/core/Popper";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import classNames from "classnames";

export interface Range {
  startDate: Date;
  endDate: Date;
}

interface Props {
  range: Range|null;
  disabled?: boolean;
  showClearButton?: boolean,
  onChange?: (range: Range | null) => void;
  title?: string;
  classes?: {
    button?:string;
  }
}

const useStyles = makeStyles((theme) => ({
  rangePickerButton: (props: any) => ({
    textTransform: 'none',
    borderRadius: 8,
    '& .MuiButton-startIcon': {
      marginTop: -4,
      padding: 0,
    },
    width: props.showClearButton ? 350 : 315,
    justifyContent: 'flex-start',
  }),
  rangePickerPopup: {
    zIndex: 1,
    //padding: 4,
    //borderRadius: 8,
    border: '1px solid #E0E0E0',
    boxShadow: '3px 3px 3px #E0E0E088',
    backgroundColor: 'white',
  },
  rangePickerWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  rangePicker: {
    borderBottom: '1px solid #E0E0E0',
  },
  buttonsWrapper: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  clearRangeButton: {
    position: 'absolute',
    right: '1rem',
    color: 'grey',
  }
}));

const DEFAULT_RANGE = {
  startDate: new Date(),
  endDate: new Date(),
}


function BCDateRangePicker({classes, range, disabled = false, showClearButton = false, onChange, title}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const defaultClasses = useStyles({showClearButton});
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState(range);
  const [tempSelectionRange, setTempSelectionRange] = useState(range ? range : {
    startDate: new Date(),
    endDate: new Date(),
  });

  useEffect(() => {
    setSelectionRange(range);
  }, [range]);

  const handleSelect = (date: any) => {
    setTempSelectionRange(date.range1 || date);
  }

  const openDateRangePicker = () => {
    if (selectionRange) {
      setTempSelectionRange(selectionRange);
    } else {
      setTempSelectionRange(DEFAULT_RANGE);
    }
    setShowDateRangePicker(true);
  }

  const closeDateRangePicker = () => {
    setShowDateRangePicker(false);
  }

  const saveDateRange = () => {
    setSelectionRange(tempSelectionRange);
    setShowDateRangePicker(false);
    if (onChange) onChange(tempSelectionRange);
  }

  const clearRange = (e: any) => {
    e.stopPropagation();
    if (selectionRange) {
      setSelectionRange(null);
      if (onChange) onChange(null);
    }
  }


  return (
    <>
      <div>
        <Button
          ref={buttonRef}
          variant={'outlined'}
          disabled={disabled}
          classes={{
            root: classNames(defaultClasses.rangePickerButton, classes?.button),
            endIcon: defaultClasses.clearRangeButton,
          }}
          startIcon={<IconCalendar style={{fontSize: 14}}/>}
          endIcon={showClearButton ? <HighlightOffIcon onClick={clearRange}/> : null}
          onClick={openDateRangePicker}
        >
          {selectionRange ?
            formatShortDate(selectionRange.startDate) + ' - ' + formatShortDate(selectionRange.endDate)
            : title ? title : 'Pick a range...'
          }
        </Button>
      </div>
      <Popper
        className={defaultClasses.rangePickerPopup}
        open={showDateRangePicker}
        anchorEl={buttonRef.current}
        role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Fade timeout={500}
                {...TransitionProps}
          >
            <Paper elevation={0}>
              <ClickAwayListener onClickAway={closeDateRangePicker}>
                <div className={defaultClasses.rangePickerWrapper}>
                  <DateRangePicker
                    ranges={[tempSelectionRange]}
                    onChange={handleSelect}
                    className={defaultClasses.rangePicker}
                    // moveRangeOnFirstSelection={true}
                    // retainEndDateOnFirstSelection={true}
                    months={2}
                    direction={'horizontal'}
                  />
                  <div className={defaultClasses.buttonsWrapper}>
                    <CSButtonSmall
                      style={{
                        color: PRIMARY_BLUE,
                        backgroundColor: 'white',
                        border: `1px solid ${PRIMARY_BLUE}`
                      }}
                      onClick={closeDateRangePicker}
                    >Cancel</CSButtonSmall>
                    <CSButtonSmall
                      onClick={saveDateRange}
                    >OK</CSButtonSmall>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}


export default BCDateRangePicker;