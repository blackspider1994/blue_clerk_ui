import {ReactComponent as IconCalendar} from "../../../assets/img/icons/map/icon-calendar.svg";
import {DatePicker} from "@material-ui/pickers";
import Button from "@material-ui/core/Button";
import {ReactComponent as IconFunnel} from "../../../assets/img/icons/map/icon-funnel.svg";
import React, {useEffect, useState} from "react";
import {ClickAwayListener, withStyles} from "@material-ui/core";
import styles from "./bc-map-filter.styles";
import {makeStyles} from "@material-ui/core/styles";
import BCMapFilter from "./bc-map-filter";
import BCMapFilterRoute from "./bc-map-filter-route";
import BCMapFilterTech from "./bc-map-filter-tech"

const useStyles = makeStyles(theme => ({
  funnel: {
    minHeight: 'unset',
    height: theme.spacing(5),
    minWidth: theme.spacing(5),
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    height: '40px',
    marginRight: '4px',
    borderRadius: '8px',
    border: '1px solid #E0E0E0',
  },
}));


function BCMapFilterHead({
  theme,
  startDate = null,
  placeholder = '',
  disableDate = false,
  onChangeDate,
  filter,
  shouldResetDate = false,
  filterType,
  customers,
  contacts,
  dispatchGetContacts,
  employees,
  vendors,
  jobTypes,
  showTechFilter,
}: any): JSX.Element {
  const mapStyles = useStyles();
  const [dateValue, setDateValue] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setDateValue(startDate)
  }, [startDate])

  const handleButtonClickMinusDay = () => {
    const previousDay = dateValue ? new Date(dateValue.getTime() - 24 * 60 * 60 * 1000) : new Date();;
    dateChangeHandler(previousDay);
  };

  const handleButtonClickPlusDay = () => {
    const nextDay =  dateValue ? new Date(dateValue.getTime() + 24 * 60 * 60 * 1000) : new Date();
    dateChangeHandler(nextDay);
  };


  const dateChangeHandler = (date: Date) => {
    onChangeDate(date);
    setDateValue(date);
  };

  const handleFilter =  (f: any) => {
    setShowFilterModal(false);
    if (f) {
      filter[1](f);
    }
  };

  const resetFilter = async () => {
    setShowFilterModal(false);
    if (shouldResetDate) onChangeDate(null);
    if (filterType === 'route'){
      filter[1]({
        'technician': null,
        'jobType': [],
      });
    } else {
      filter[1]({
        'customerNames': null,
        'jobId': '',
        'contact': null,
        'jobStatus': [-1],
        'isHomeOccupied': false,
        'filterAMJobs': false,
        'filterPMJobs': false,
        'filterAllDayJobs': false,
      });
    }
  }

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  const isFiltered = () => {
    let isSet = false;
    for (let value of Object.values(filter[0])) {
      if (Array.isArray(value)) {
        if (value.length > 0 && value[0] !== -1) {
          isSet = true;
          break;
        }
      } else {
        if (value) {
          isSet = true;
          break;
        }
      }
    }
    return isSet;
  }

  return (
    <div className="filterHeadContainer">
      <div className="filter_wrapper">
        <Button className={mapStyles.funnel} onClick={toggleFilterModal}>
          <IconFunnel fill={isFiltered() ? theme.palette.primary.main : '#D0D3DC'}/>
        </Button>
        {
          showFilterModal
            ? <ClickAwayListener onClickAway={toggleFilterModal} mouseEvent={'onMouseUp'}>
              <div className={'dropdown_wrapper dropdown_wrapper_filter elevation-5'}>
                {filterType === 'route' ?
                  <BCMapFilterRoute
                    callback={handleFilter}
                    currentFilter={filter[0]}
                    resetFilter={resetFilter}
                    filterType={filterType}
                    employees={employees}
                    vendors={vendors}
                    jobTypes={jobTypes}
                  />
                  :
                  <BCMapFilter
                    callback={handleFilter}
                    currentFilter={filter[0]}
                    resetFilter={resetFilter}
                    filterType={filterType}
                    customers={customers}
                    contacts={contacts}
                    dispatchGetContacts={dispatchGetContacts}
                  />
                }
              </div>
            </ClickAwayListener>
            : null
        }
      </div>
      {showTechFilter && (
        <div style={{minWidth: 200, paddingRight: 10}}>
          <BCMapFilterTech />
        </div>
      )}
      <span className={"datepicker_wrapper"} >
        <button
          className="prev_btn"
          disabled={disableDate}
          onClick={() => handleButtonClickMinusDay()}
        >
          <i className="material-icons">keyboard_arrow_left</i>
        </button>

        <IconCalendar className="calendar_icon" onClick={() => setIsCalendarOpen(true)} />
        <DatePicker
          autoOk
          disabled={disableDate}
          disablePast={false}
          format={"MMM d, yyyy"}
          id={`datepicker-${"scheduleDate"}`}
          inputProps={{
            name: "scheduleDate",
            placeholder,
          }}
          inputVariant={"outlined"}
          name={"scheduleDate"}
          onChange={(e: any) => dateChangeHandler(e)}
          required={false}
          value={dateValue}
          variant={"inline"}
          open={isCalendarOpen}
          onOpen={() => setIsCalendarOpen(true)}
          onClose={() => setIsCalendarOpen(false)}
        />
        <button
          className="next_btn"
          disabled={disableDate}
          onClick={() => handleButtonClickPlusDay()}
        >
          <i className="material-icons" >keyboard_arrow_right</i>
        </button>
      </span>
    </div>
  )
}

export default withStyles(
  styles,
  {'withTheme': true},
)(BCMapFilterHead);
