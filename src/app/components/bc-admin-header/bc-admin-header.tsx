import React, { useEffect, useState } from "react";
import { Button, ClickAwayListener, Grid, Grow, Paper, Popper, Select, useMediaQuery, useTheme } from "@material-ui/core";
import { withStyles, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import styles from "./bc-admin-header.style";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LogoSvg from "../../../assets/img/header-logo.svg";
import { Link, useHistory, useLocation } from "react-router-dom";
import classNames from "classnames";
import ContactSupportIcon from "@material-ui/icons/ContactSupport";
import Badge from "@material-ui/core/Badge";
import { computeUnreadNotifications } from "../bc-header/util";
import NotificationsIcon from "@material-ui/icons/Notifications";
import HeaderNotifications, { NotificationItem } from "../bc-header/bc-header-notification";
import * as CONSTANTS from "../../../constants";
import classnames from "classnames";
import SearchIcon from '@material-ui/icons/Search';
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Fab from "@material-ui/core/Fab";
import InputBase from '@material-ui/core/InputBase';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import LocationOn from '@material-ui/icons/LocationOn';
import { useDispatch, useSelector } from "react-redux";
import { CompanyProfileStateType } from "actions/user/user.types";
import { callSelectDivisionModal, setCurrentDivision, setDivisionParams, setIsDivisionFeatureActivated } from "actions/filter-division/filter-division.action";
import { ICurrentDivision, IDivision, ISelectedDivision } from "actions/filter-division/fiter-division.types";
import { modalTypes } from '../../../constants';
import { getDivision, refreshDivision } from "actions/division/division.action";
import { openModalAction, setModalDataAction } from "actions/bc-modal/bc-modal.action";
import { setFlagUnsignedVendors } from "actions/vendor/vendor.action";
import filterByPermissions from './filterByPermissions';
import { Can } from 'app/config/Can';

interface Props {
  classes: any;
  drawerToggle?(): void;
  drawerOpen: boolean;
  notifications: any;
  initialLoad: () => void;
  showNotificationDetails: (state?:boolean) => void;
  openModalHandler: (type:any, data:any, itemId:any, metadata?:any) => void;
  jobRequests: any;
  user: any;
}

const useStyles = makeStyles(theme => ({
  fab: {
    zIndex: 1101,
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    minHeight: 'unset',
    backgroundColor: CONSTANTS.ADMIN_SIDEBAR_TOGGLE_BG
  },
}));

const useHeaderStyles = makeStyles(theme => {
  return ({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      width: `calc(100% - ${theme.spacing(10) + 1}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      zIndex: theme.zIndex.drawer + 1,
      marginLeft: CONSTANTS.ADMIN_SIDEBAR_WIDTH,
      width: `calc(100% - ${CONSTANTS.ADMIN_SIDEBAR_WIDTH}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    }
  });
});

const useSearchStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius+5,
      border: '1px solid #E0E0E0',
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        minWidth: '200px',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 0, 0 , 1),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropIcon: {
      padding: theme.spacing(0, 0, 0 , 1),
      height: '100%',
      position: 'absolute',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
      paddingRight: `calc(1em + ${theme.spacing(2)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '15ch',
      },
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
  }),
);

export type NAVDATA = { 
  key?: string; 
  label: string;
  link: string;
  flag?: string;
}

function BCAdminHeader({
  classes,
  drawerToggle,
  drawerOpen,
  notifications:
  notificationsFromRedux,
  initialLoad,
  showNotificationDetails,
  openModalHandler,
  jobRequests,
  user,
}: Props): JSX.Element {
  const fabStyles = useStyles();
  const headerStyles = useHeaderStyles();
  const searchStyles = useSearchStyles();

  const { notifications, loading, notificationOpen, totalUnread } = notificationsFromRedux;
  const location = useLocation();
  const pathName = location.pathname;
  const urlParams = pathName?.split('/').slice(-2);
  const [ companyLocation,workType ] = urlParams || [];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationEl, setNotificationEl] = React.useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const profileState: CompanyProfileStateType = useSelector((state: any) => state.profile);
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedDivision, setSelectedDivision] = useState<number>(0);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);
  const divisions = useSelector((state: any) => state.divisions);
  const divisionList = divisions.data as IDivision[];
  const vendors = useSelector((state: any) => state.vendors);
  const auth = useSelector((state: any) => state.auth);
  const permissions = useSelector((state: any) => state.permissions.rolesAndPermissions);

  useEffect(() => {
    initialLoad()
    if (user?._id && divisions.refresh) {
      dispatch(setFlagUnsignedVendors({assignedVendorsIncluded: true}));
      dispatch(getDivision(user?._id));
    }
  }, []);

  useEffect(() => {
    if (divisionList.length && divisions.refresh) {
      dispatch(refreshDivision(false));
      let selectedDivision = divisionList.findIndex((res: any) => {
        return res.workTypeId == workType && res.locationId == companyLocation
      });

      if (selectedDivision > -1) {
        if (selectedDivision) {
          setSelectedDivision(selectedDivision);
          if (divisionList[selectedDivision]) {
            dispatch(setCurrentDivision(divisionList[selectedDivision]));
            dispatch(setDivisionParams({
              companyLocation: JSON.stringify([divisionList[selectedDivision].locationId]),
              workType: JSON.stringify([divisionList[selectedDivision].workTypeId]),
            }));
          }
          
        }
      }else if(user?.currentLocation){
        let divisionIdx = divisionList?.findIndex((res) => {
          return res.key == user.currentLocation.key
        })
        if (divisionIdx < 0) divisionIdx = 0;

        let userDivision = divisionList[divisionIdx]
        dispatch(setCurrentDivision(userDivision));
        dispatch(setDivisionParams({
          companyLocation: JSON.stringify(userDivision?.name != "All" ? [userDivision?.locationId] : userDivision?.locationId),
          workType: JSON.stringify(userDivision?.name != "All" ? [userDivision?.workTypeId] : userDivision?.workTypeId)
        }));
        setSelectedDivision(divisionIdx)
      }else{
        setSelectedDivision(0);
        if (divisionList[0]) {
          dispatch(setCurrentDivision(divisionList[0]));
          dispatch(setDivisionParams({
            companyLocation: JSON.stringify(divisionList[0].name != "All" ? [divisionList[0].locationId] : divisionList[0].locationId),
            workType: JSON.stringify(divisionList[0].name != "All" ? [divisionList[0].workTypeId] : divisionList[0].workTypeId)
          }));
        }
      }

        //Call Select Division Modal
        if (user && currentDivision.openSelectDivisionModal && divisionList.length > 1) {
          dispatch(callSelectDivisionModal(false));
          dispatch(setModalDataAction({
            'data': {
              'user': user
            },
            'type': modalTypes.SELECT_DIVISION_MODAL
          }));
          setTimeout(() => {
            dispatch(openModalAction());
          }, 200);
        }
    }

    if (!divisionList.length && !divisions.loading) {
      history.push({
        pathname: `/main/no-locations-assigned`,
        state: {}
      })
    }
  }, [divisionList]);

  useEffect(() => {
    if (currentDivision.data){
      if(currentDivision.data?.key != divisionList?.[selectedDivision]?.key) {
        let divisionIdx = divisionList?.findIndex((res) => {
          return res.key == currentDivision.data?.key
        })
        setSelectedDivision(divisionIdx || 0)
      }

      //Set the division to local storage and the division is automatically set.
      let userStorage = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({...userStorage, currentLocation: currentDivision.data}));   
    }
  }, [currentDivision.data])

  const notificationPopover = notificationOpen ? 'notification-popper' : undefined;

  const popperId = profileOpen
    ? 'profile-popper'
    : undefined;

  const [contentGrid, setContentGrid] = useState<any>({
    'lg': 12,
    'md': 12,
    'sm': 12
  });

  const handleClose = () => {
    setProfileOpen(false);
    showNotificationDetails(false)
    setAnchorEl(null);
  };

  const showMenu = (event: any) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  const NAV_DATA: NAVDATA[] = [
    {
      'key': 'dashboard',
      'label': 'Dashboard',
      'link': '/main/dashboard'
    },
    {
      'key': 'customers',
      'label': 'Customers',
      'link': '/main/customers'
    },
    {
      'key': 'invoicing',
      'label': 'Invoicing',
      'link': '/main/invoicing'
    },
    // {
    //   'label': 'Tags',
    //   'link': '/main/tags/purchasedtag'
    // },
    {
      'key': 'payroll',
      'label': 'Payroll',
      'link':  currentDivision.isDivisionFeatureActivated && currentDivision.urlParams ? `/main/payroll/${currentDivision.urlParams}` : `/main/payroll`
    },
    /*
     * {
     *   'label': 'Inventory',
     *   'link': '/main/inventory'
     * },
     * {
     *   'label': 'Employees',
     *   'link': '/main/employees/group'
     * },
     */
    {
      'key': 'reports',
      'label': 'Reports',
      'link': '/main/reports'
    },
    {
      'key': 'admin',
      'label': ' Admin',
      'link': '/main/admin',
      'flag':  currentDivision.isDivisionFeatureActivated && vendors.unsignedVendorsFlag 
    }
  ];

  const filteredNavData = filterByPermissions(auth.user, permissions, NAV_DATA);

  const handleLocationChange = (params: any) => {
    const selectedDivision = divisionList[params.target.value];

    const confirmAction = ()=> {
      setSelectedDivision(params.target.value);
      dispatch(setCurrentDivision(selectedDivision));
      dispatch(setDivisionParams({
        companyLocation: JSON.stringify(selectedDivision.name != "All" ? [selectedDivision.locationId] : selectedDivision.locationId),
        workType: JSON.stringify(selectedDivision.name != "All" ? [selectedDivision.workTypeId] : selectedDivision.workTypeId)
      }));
      history.push({
        pathname: `/main/dashboard`,
        state: {}
      });
    }

    dispatch(setModalDataAction({
      'data': {
        message: `Now Viewing: ${selectedDivision.name}`,
        action: confirmAction
      },
      'type': CONSTANTS.modalTypes.DIVISION_CONFIRM_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }


  return (
    <>
      <AppBar
        position="fixed" color={'inherit'}
        className={classnames(
          classes.bcHeader,
          {
            [headerStyles.appBarShift]: drawerOpen,
            [headerStyles.appBar]: !drawerOpen,
          })
        }>
        <div className={classes.toolbarToggleButton}>
          <Fab size="small" onClick={drawerToggle} className={fabStyles.fab}>
            {drawerOpen ? <ChevronLeftIcon style={{ fontSize: 20, color: CONSTANTS.SECONDARY_GREY }}/> : <ChevronRightIcon style={{ fontSize: 20, color: CONSTANTS.SECONDARY_GREY }} />}
          </Fab>
        </div>

        <div className="bcNavMenu">
          <Link
            onClick={handleClose}
            className={classes.bcAdminHeaderLogo}
            to={'/main/dashboard'}>
            <img
              alt={'logo'}
              src={LogoSvg}
            />
          </Link>

          <Toolbar className={classes.bcHeaderToolBar}>
            <ul className={classes.bcAdminHeaderNav}>
              {filteredNavData.map((item, idx) => {
                return (
                  <li
                    className={classNames({
                      [classes.bcAdminHeaderNavItem]: true,
                      [classes.bcAdminHeaderNavItemActive]: pathName.indexOf(item.link) === 0
                    })}
                    key={idx}
                    tabIndex={0}>
                    <Link to={item.link} onClick={handleClose}>
                      {item.flag && (
                        <span className={classes.flagWarning}>!</span>  
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Toolbar>

          <div className="bcAdminHeaderPopup">
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={showMenu}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={isMenuOpen}
              onClose={closeMenu}
            >
              {filteredNavData.map((item, idx) => {
                return (
                  <MenuItem key={idx} onClick={closeMenu} className={classNames({
                    [classes.bcAdminHeaderNavItem]: true,
                    [classes.bcAdminHeaderPopupItem]: true,
                    [classes.bcAdminHeaderPopupItemActive]: pathName.indexOf(item.link) === 0
                  })}>
                    <Link to={item.link} onClick={handleClose}>
                      {item.label}
                    </Link>
                  </MenuItem>
                );
              })}
            </Menu>
          </div>

        </div>

        <div className={classes.bcAdminHeaderTools} >
          {
            divisionList.length > 0 && (
              <div className={classes.bcDropdownLocation}>
                <div className={classes.bcDropdownLocationIcon}>
                  <LocationOn fontSize={'small'} color={'action'}/>
                </div>
                <Select
                  id="select-location"
                  disableUnderline={true}
                  value={selectedDivision}
                  onChange={handleLocationChange}
                >
                  {
                    divisionList?.map((res: any,index: number) => {
                      return (
                        <MenuItem value={index} key={index} style={{fontSize: 14}}> 
                          <div className={classes.divisionList}>
                            {res.name}
                          </div>
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
            )
          }
          <div className={searchStyles.search}>
            <div className={searchStyles.searchIcon}>
              <SearchIcon color={'action'}/>
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: searchStyles.inputRoot,
                input: searchStyles.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
            <div className={searchStyles.dropIcon}>
              <ArrowDropDownIcon color={'action'}/>
            </div>
          </div>
          <Button
            className={classes.bcAdminHeaderToolsButton}
            href={'https://help.blueclerk.com/docs/'}
            target={'_blank'}>
            <ContactSupportIcon color={'action'} />
          </Button>
          <Button
            aria-describedby={notificationPopover}
            buttonRef={(node: any) => {
              setNotificationEl(node);
            }}
            className={classes.bcAdminHeaderToolsButton}
            color={'default'}
            href={''}
            onClick={() => showNotificationDetails()}
            target={'_blank'}>
            <Badge
              badgeContent={totalUnread}
              color={'secondary'}
              invisible={totalUnread === 0}>
              <NotificationsIcon
                color={totalUnread === 0 ? 'action' : 'primary'}
              />
            </Badge>
          </Button>

          <Popper
            anchorEl={notificationEl}
            className={classNames({
              [classes.bcAdminPopperClose]: !notificationOpen,
              [classes.bcAdminPopperResponsive]: true,
              [classes.bcAdminPopperNav]: true
            })}
            modifiers={{
              flip: {
                enabled: false,
              },
            }}
            disablePortal
            id={notificationPopover}
            open={notificationOpen}
            placement={'bottom'}
            transition>
            {({ TransitionProps, placement }) =>
              <Grow
                {...TransitionProps}
                style={{ 'transformOrigin': '0 0 0' }}>
                <>
                {/* <ClickAwayListener onClickAway={handleClose}> */}
                  <Paper className={classes.bcAdminDropdown}>
                    <HeaderNotifications
                      close={handleClose}
                      items={notifications}
                      loading={loading}
                      openModalHandler={openModalHandler}
                      jobRequests={jobRequests}
                    />
                  </Paper>
                {/* </ClickAwayListener> */}
                </>
              </Grow>
            }
          </Popper>
        </div>

      </AppBar>
    </>
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCAdminHeader);
