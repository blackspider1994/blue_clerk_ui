import React, { useEffect, useState } from "react";
import { ListItem, makeStyles, Menu, MenuItem, useMediaQuery, useTheme } from "@material-ui/core";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import styles from "./bc-admin-sidebar.style";
import { useHistory, useLocation } from "react-router-dom";
import classnames from "classnames";
import Drawer from "@material-ui/core/Drawer";
import AvatarImg from "../../../assets/img/user_avatar.png";
import { connect, useDispatch, useSelector } from "react-redux";
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import styled from "styled-components";
import * as CONSTANTS from '../../../constants';
import ListIcon from '@material-ui/icons/List';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import WatchLaterOutlinedIcon from '@material-ui/icons/WatchLaterOutlined';
import MapIcon from '@material-ui/icons/Map';
import DescriptionIcon from '@material-ui/icons/Description';
import { getCompanyProfileAction } from "../../../actions/user/user.action";
import { showNotificationPopup } from "actions/notifications/notifications.action";
import SearchIcon from '@material-ui/icons/Search';
import { logoutAction, resetStore } from "../../../actions/auth/auth.action";
import { removeUserFromLocalStorage } from "../../../utils/local-storage.service";
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ReceiptIcon from '@material-ui/icons/Receipt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import StyleIcon from "@material-ui/icons/Style";

import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import BrandingWatermarkIcon from '@material-ui/icons/BrandingWatermark';
import BusinessIcon from '@material-ui/icons/Business';
import SubtitlesIcon from '@material-ui/icons/Subtitles';
import BuildIcon from '@material-ui/icons/Build';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import SettingsIcon from '@material-ui/icons/Settings';
import WorkIcon from '@material-ui/icons/Work';
import GroupIcon from '@material-ui/icons/Group';
import ReportIcon from '@material-ui/icons/Report';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import StorefrontIcon from '@material-ui/icons/Storefront';
import PaymentIcon from '@material-ui/icons/Payment';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import LockIcon from '@material-ui/icons/Lock';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import ContactsIcon from '@material-ui/icons/Contacts';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import BackupIcon from '@material-ui/icons/Backup';
import HistoryIcon from '@material-ui/icons/History';
import { CompanyProfileStateType } from "../../../actions/user/user.types";
import NoCompanyLogo from "../../../assets/img/avatars/NoCompanyLogo.png";


interface BCSidebarProps {
  token: string;
  user: any;
  classes: any;
  open: boolean;
}

function a11yProps(index: any) {
  return {
    'id': `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  };
}

const tabStyles = makeStyles(theme => ({
  'root': {
    'flexGrow': 1,
    'width': '100%',
    'textTransform': 'capitalize'
  },
  'link': {
    'textTransform': 'none'
  }
}));

const useAvatarStyles = makeStyles((theme: Theme) =>
  createStyles({
    small: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      transition: 'all 0.3s 0s ease-in-out',
    },
    large: {
      width: theme.spacing(5),
      height: theme.spacing(5),
      transition: 'all 0.3s 0s ease-in-out',
    },
    companyLogo: {
      height: '50px!important',
    }
  }),
);

const useSidebarStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      height: '100vh',
      zIndex: 1099,
      width: CONSTANTS.ADMIN_SIDEBAR_WIDTH,
    },
    drawerOpen: {
      width: CONSTANTS.ADMIN_SIDEBAR_WIDTH,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(10) + 1,
    },
  }),
);

function BCAdminSidebar({ token, user, classes, open }: BCSidebarProps) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const pathName = location.pathname;
  const nestedRouteKey = localStorage.getItem('nestedRouteKey');
  const LINK_DATA = [
    {
      'label': 'Customer List',
      'icon': <ListIcon/>,
      'link': '/main/customers'
    },
    {
      'label': 'New Customer',
      'icon': <PersonAddIcon/>,
      'link': '/main/customers/new-customer'
    },
    {
      'label': 'Schedule/Jobs',
      'icon': <WatchLaterOutlinedIcon/>,
      'link': '/main/customers/schedule'
    },
    {
      'label': 'Map View',
      'icon': <MapIcon/>,
      'link': '/main/customers/ticket-map-view'
    },
    {
      'label': 'Job Reports',
      'icon': <DescriptionIcon/>,
      'link': '/main/customers/job-reports'
    },
    {
      'label': 'Payroll List',
      'icon': <PaymentIcon/>,
      'link': '/main/payroll'
    },
    {
      'label': 'Past Payments',
      'icon': <HistoryIcon/>,
      'link': '/main/payroll/pastpayment'
    },
    {
      'label': 'Reports',
      'icon': <DescriptionIcon/>,
      'link': '/main/payroll/reports'
    },
    /*
     * {
     *   'label': "Todo's",
     *   'link': '/main/invoicing/todos'
     * },
     */
    {
      'label': 'Invoices',
      'icon': <AccountBalanceWalletIcon/>,
      'link': '/main/invoicing/invoices-list'
    },
    {
      'label': 'Purchase Order',
      'icon': <ReceiptIcon/>,
      'link': '/main/invoicing/purchase-order'
    },
    {
      'label': 'Estimates',
      'icon': <LocalAtmIcon/>,
      'link': '/main/invoicing/estimates'
    },
    {
      'label': 'Billing',
      'icon': <MonetizationOnIcon/>,
      'link': '/main/admin/billing'
    },
    {
      'label': 'Brands',
      'icon': <BrandingWatermarkIcon/>,
      'link': '/main/admin/brands'
    },
    {
      'label': 'Company Profile',
      'icon': <BusinessIcon/>,
      'link': '/main/admin/company-profile'
    },
    {
      'label': 'Employees',
      'icon': <SubtitlesIcon/>,
      'link': '/main/admin/employees'
    },
    {
      'label': 'Equipment Type',
      'icon': <BuildIcon/>,
      'link': '/main/admin/equipment-type'
    },
    {
      'label': 'Groups',
      'icon': <GroupIcon/>,
      'link': '/main/admin/groups'
    },
    {
      'label': 'Invoicing',
      'icon': <LibraryBooksIcon/>,
      'link': '/main/admin/invoicing'
    },
    {
      'label': 'Job Types',
      'icon': <WorkIcon/>,
      'link': '/main/admin/job-types'
    },
    {
      'label': 'Report Number',
      'icon': <ReportIcon/>,
      'link': '/main/admin/report-number'
    },
    {
      'label': 'Roles/Permissions',
      'icon': <AssignmentIndIcon/>,
      'link': '/main/admin/roles-permissions'
    },
    {
      'label': 'Vendors',
      'icon': <StorefrontIcon/>,
      'link': '/main/admin/vendors'
    },
    {
      'label': 'Payroll',
      'icon': <PaymentIcon/>,
      'link': '/main/admin/payroll'
    },
    {
      'label': 'Integrations',
      'icon': <SettingsApplicationsIcon/>,
      'link': '/main/admin/integrations'
    },
    {
      'label': 'Groups',
      'icon': <GroupIcon/>,
      'link': '/main/employees/group'
    },
    {
      'label': 'Technicians',
      'icon': <DirectionsBikeIcon/>,
      'link': '/main/employees/technician'
    },
    {
      'label': 'Managers',
      'icon': <ContactsIcon/>,
      'link': '/main/employees/managers'
    },
    {
      'label': 'Office Admin',
      'icon': <SupervisedUserCircleIcon/>,
      'link': '/main/employees/office-admin'
    },
    {
      'label': 'Company Inventory',
      'icon': <BackupIcon/>,
      'link': '/main/inventory'
    },
    {
      'label': 'Purchased Tag',
      'icon': <StyleIcon/>,
      'link': '/main/tags/purchasedtag'
    },
    {
      'label': 'Buy Blue Tag',
      'icon': <LocalOfferIcon/>,
      'link': '/main/tags/bluetag'
    },
    {
      'label': 'Profile',
      'icon': <ListIcon/>,
      'link': '/main/user/view-profile'
    },
    {
      'label': 'Change Password',
      'icon': <LockIcon/>,
      'link': '/main/user/change-password'
    },
    {
      'label': 'Email Preferences',
      'icon': <MailOutlineIcon/>,
      'link': '/main/user/email-preference'
    }
  ];

  const theme = useTheme();
  const avatarStyles = useAvatarStyles();
  const sidebarStyles = useSidebarStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const profileState: CompanyProfileStateType = useSelector((state: any) => state.profile);

  const withSidebar = !['/main/dashboard', '/main/notifications'].includes(pathName);

  const imageUrl = user?.profile?.imageUrl === '' || user?.profile?.imageUrl === null
    ? AvatarImg
    : user?.profile?.imageUrl;

  useEffect(() => {
  }, [location, isMobile]);

  useEffect(() => {
    if (user?.company) dispatch(getCompanyProfileAction(user?.company as string));
  }, [user]);

  const onClickLink = (strLink: string): void => {
    dispatch(showNotificationPopup(false));
    history.push(strLink);
  };

  const handleClickProfileMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = (): void => {
    handleClose();
    history.push('/main/user/view-profile');
  };

  const handleClickLogout = (): void => {
    handleClose();
    dispatch(logoutAction());
    dispatch(resetStore());
    removeUserFromLocalStorage();
    history.push('/');
  };

  return (
    <Drawer
      variant="permanent"
      className={classnames(sidebarStyles.drawer, sidebarStyles.drawerOpen, {
        [sidebarStyles.drawerClose]: !open,
      })}
      classes={{
        paper: classnames(classes.bcSideBar, sidebarStyles.drawerOpen, {
          [sidebarStyles.drawerClose]: !open,
        }),
      }}
    >
      <div className={classes.bcSidebarBody}>
        <div className={classnames({
          [classes.bcSideBarCompanyLogo]: true,
          [avatarStyles.companyLogo]: !open
        })}>
          <img src={profileState?.logoUrl === '' ?  NoCompanyLogo : profileState.logoUrl}/>
        </div>

        <ul>
          {LINK_DATA.map((item: any, idx: number) => {
            let mainPath = pathName.split("/main/")[1]; // eslint-disable-line
            if (mainPath) {
              mainPath = mainPath.split("/")[0]; // eslint-disable-line
            } else {
              mainPath = 'dashboard';
            }
            return item.link.startsWith(`/main/${mainPath}`)
              ? <li key={idx}>
                <Tooltip
                  arrow
                  title={item.label}
                  disableHoverListener={open}
                >
                  <StyledListItem
                    button
                    onClick={() => onClickLink(item.link)}
                    selected={
                      pathName === item.link ||
                      pathName === `${item.link}/${nestedRouteKey}`
                    }>
                    {item.icon && item.icon}
                    <span className='menuLabel'>{item.label}</span>
                  </StyledListItem>
                </Tooltip>
              </li>
              : null;
          })}
        </ul>

      </div>
      <div className={classes.bcSidebarFooter}>
        <ul>
          <li>
            <StyledFooterItem
              button
              onClick={handleClickProfileMenu}>
              <Avatar
                className={open ? avatarStyles.large : avatarStyles.small}
                alt={user && user.profile && user.profile.displayName}
                src={imageUrl}
              />
              <strong className='menuLabel'>{user && user.profile && user.profile.displayName}</strong>
              <ArrowDropUpIcon style={{ color: CONSTANTS.PRIMARY_GRAY }}/>
            </StyledFooterItem>
            <Menu
              PaperProps={{
                style: {
                  width: CONSTANTS.ADMIN_SIDEBAR_WIDTH - 30
                }
              }}
              id="sidebar-profile-menu"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              transformOrigin={{ vertical: "bottom", horizontal: "center" }}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseProfileMenu}
            >
              <MenuItem onClick={handleViewProfile}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                View Profile
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </li>
        </ul>

      </div>

    </Drawer>
  )
}

const StyledListItem = styled(ListItem)`
  font-size: 16px;
  line-height: 20px;
  height: 40px;
  color: #000;
  border-radius: 7px;
  & > .menuLabel {
    padding-left: 35px;
  };
  &.Mui-selected {
    color: #fff;
    background-color: ${CONSTANTS.SECONDARY_DARK_GREY};
  };
`;

const StyledFooterItem = styled(ListItem)`
  font-size: 14px;
  line-height: 20px;
  color: #000;
  border-radius: 7px;
  & > .menuLabel {
    padding-left: 35px;
  };
`;


const mapStateToProps = (state: {
  auth: {
    token: string;
    user: any;
  };
}) => ({
  'token': state.auth.token,
  'user': state.auth.user
});

export default withStyles(
  styles,
  { 'withTheme': true }
)(connect(mapStateToProps)(BCAdminSidebar));
