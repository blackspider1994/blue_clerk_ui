import React, { useEffect } from 'react';
import {
  ListItem,
  Menu,
  MenuItem,
  makeStyles,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import styles from './bc-admin-sidebar.style';
import { useHistory, useLocation } from 'react-router-dom';
import classnames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import AvatarImg from '../../../assets/img/user_avatar.png';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import * as CONSTANTS from '../../../constants';
import ListIcon from '@material-ui/icons/List';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import MapIcon from '@material-ui/icons/Map';
import DescriptionIcon from '@material-ui/icons/Description';
import { removeUserFromLocalStorage } from '../../../utils/local-storage.service';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Badge from '@material-ui/core/Badge';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import groupBy from 'lodash.groupby';

import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ReceiptIcon from '@material-ui/icons/Receipt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import StyleIcon from '@material-ui/icons/Style';

import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import BrandingWatermarkIcon from '@material-ui/icons/BrandingWatermark';
import BusinessIcon from '@material-ui/icons/Business';
import SubtitlesIcon from '@material-ui/icons/Subtitles';
import BuildIcon from '@material-ui/icons/Build';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
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
import TicketIcon from '@material-ui/icons/ConfirmationNumber';
import RequestIcon from '@material-ui/icons/Alarm';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import ContactsIcon from '@material-ui/icons/Contacts';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import BackupIcon from '@material-ui/icons/Backup';
import HistoryIcon from '@material-ui/icons/History';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import { CompanyProfileStateType } from '../../../actions/user/user.types';
import NoCompanyLogo from '../../../assets/img/avatars/NoCompanyLogo.png';
import { ReactComponent as CollectIcon } from 'assets/img/icons/sidebar/reports/collect.svg';
import { ReactComponent as AmountIcon } from 'assets/img/icons/sidebar/reports/amount.svg';
import { ReactComponent as PayrollIcon } from 'assets/img/icons/sidebar/reports/payroll.svg';
import { useSelector } from 'react-redux';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import filterSidebarLinksByPermission from './filterSidebarLinksByPermission';

interface BCSidebarProps {
  user: any;
  classes: any;
  open: boolean;
  profileState: CompanyProfileStateType;
  numberOfJobRequest: number;
  showNotificationDetails: (state?: boolean) => void;
  getCompanyProfile: (companyId: string) => void;
  logoutAndReset: () => void;
}

const useAvatarStyles = makeStyles((theme: Theme) =>
  createStyles({
    'small': {
      'width': theme.spacing(4),
      'height': theme.spacing(4),
      'transition': 'all 0.3s 0s ease-in-out'
    },
    'large': {
      'width': theme.spacing(5),
      'height': theme.spacing(5),
      'transition': 'all 0.3s 0s ease-in-out'
    },
    'companyLogo': {
      'height': '50px!important'
    }
  }));

const useSidebarStyles = makeStyles((theme: Theme) =>
  createStyles({
    'drawer': {
      'height': '100vh',
      'zIndex': 1099,
      'width': CONSTANTS.ADMIN_SIDEBAR_WIDTH
    },
    'drawerOpen': {
      'width': CONSTANTS.ADMIN_SIDEBAR_WIDTH,
      'transition': theme.transitions.create('width', {
        'easing': theme.transitions.easing.sharp,
        'duration': theme.transitions.duration.enteringScreen
      })
    },
    'drawerClose': {
      'transition': theme.transitions.create('width', {
        'easing': theme.transitions.easing.sharp,
        'duration': theme.transitions.duration.leavingScreen
      }),
      'overflowX': 'hidden',
      'width': theme.spacing(10) + 1
    },
    'accordion': {
      'position': 'initial',
      'backgroundColor': 'transparent',
      'boxShadow': 'none'
    },
    'accordionSummary': {
      'flexDirection': 'row-reverse'
    },
    'accordionDetails': {
      'padding': 0,
      '& > ul': {
        'listStyle': 'none',
        'margin': '0',
        'padding': '0',
        'width': '100%',
        '& > li': {
          'margin': '5px 0',
          'position': 'relative',
          'padding': '0 10px'
        }
      }
    },
    'subCategory': {
      'padding': '0px 10px !important'
    },
    'subCategoryClose': {
      'padding': '0px 0px !important'
    },
    'groupLabel': {
      'font-size': '16px',
      'line-height': '20px',
      'color': '#000',
      'border-radius': '7px',
      'padding-left': '28px'
    },
    'groupLabelClose': {
      'font-size': '16px',
      'line-height': '20px',
      'color': '#000',
      'border-radius': '7px',
      'padding-left': '0px !important'
    },
    'minimumMargin': {
      'minHeight': '20px !important',
      'margin-top': '0 !important',
      'margin-bottom': '0 !important'
    },
    'expandIcon': {
      'padding': '0 12px'
    }
  }));

const activeJobRequest = process.env.REACT_APP_JOB_REQUEST_ACTIVE;

function BCAdminSidebar({
  user,
  classes,
  open,
  profileState,
  numberOfJobRequest,
  showNotificationDetails,
  getCompanyProfile,
  logoutAndReset
}: BCSidebarProps) {
  const history = useHistory();
  const location = useLocation();
  const pathName = location.pathname;
  const nestedRouteKey = localStorage.getItem('nestedRouteKey');
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);
  const vendors = useSelector((state: any) => state.vendors);
  const auth = useSelector((state: any) => state.auth);

  const getLinkByDivision = (path: string) => {
    return currentDivision.urlParams ? `${path}/${currentDivision.urlParams}` : path;
  };

  const LINK_DATA = [
    {
      'label': 'Customer List',
      'icon': <ListIcon />,
      'link': '/main/customers'
    },
    {
      'label': 'New Customer',
      'icon': <PersonAddIcon />,
      'link': '/main/customers/new-customer'
    },
    {
      'label': 'Schedule',
      'parent': true,
      'link': '/main/customers/schedule'
    },
    {
      'key': 'jobs',
      'label': 'Jobs',
      'icon': <WorkIcon />,
      'link': getLinkByDivision('/main/customers/schedule/jobs'),
      'group': 'Schedule'
    },
    {
      'key': 'tickets',
      'label': 'Tickets',
      'icon': <TicketIcon />,
      'link': getLinkByDivision('/main/customers/schedule/tickets'),
      'group': 'Schedule'
    },
    {
      'key': 'jobs-requests',
      'label': 'Job Requests',
      'icon': <Badge badgeContent={numberOfJobRequest} color={'secondary'}><RequestIcon /></Badge>,
      'link': '/main/customers/schedule/job-requests',
      'group': 'Schedule'
    },
    {
      'key': 'calendar',
      'label': 'Calendar',
      'icon': <CalendarIcon />,
      'link': getLinkByDivision('/main/customers/calendar')
    },
    {
      'key': 'map',
      'label': 'Map View',
      'icon': <MapIcon />,
      'link': getLinkByDivision('/main/customers/ticket-map-view')
    },
    {
      'label': 'Job Reports',
      'icon': <DescriptionIcon />,
      'link': getLinkByDivision('/main/customers/job-reports')
    },
    {
      'label': 'Payroll List',
      'icon': <PaymentIcon />,
      'link': getLinkByDivision('/main/payroll')
    },
    {
      'label': 'Past Payments',
      'icon': <HistoryIcon />,
      'link': getLinkByDivision('/main/payroll/pastpayment')
    },
    {
      'label': 'Reports',
      'icon': <DescriptionIcon />,
      'link': getLinkByDivision('/main/payroll/reports')
    },
    /*
     * {
     *   'label': "Todo's",
     *   'link': '/main/invoicing/todos'
     * },
     */
    {
      'label': 'Invoices',
      'icon': <AccountBalanceWalletIcon />,
      'link': getLinkByDivision('/main/invoicing/invoices-list')
    },
    {
      'label': 'Purchase Order',
      'icon': <ReceiptIcon />,
      'link': '/main/invoicing/purchase-order'
    },
    {
      'label': 'Estimates',
      'icon': <LocalAtmIcon />,
      'link': '/main/invoicing/estimates'
    },
    {
      'key': 'billing',
      'label': 'Billing',
      'icon': <MonetizationOnIcon />,
      'link': '/main/admin/billing'
    },
    {
      'label': 'Brands',
      'icon': <BrandingWatermarkIcon />,
      'link': '/main/admin/brands'
    },
    {
      'key': 'company',
      'label': 'Company Profile',
      'icon': <BusinessIcon />,
      'link': '/main/admin/company-profile'
    },
    {
      'key': 'employees',
      'label': 'Employees',
      'icon': <SubtitlesIcon />,
      'link': '/main/admin/employees'
    },
    {
      'label': 'Equipment Type',
      'icon': <BuildIcon />,
      'link': '/main/admin/equipment-type'
    },
    {
      'label': 'Groups',
      'icon': <GroupIcon />,
      'link': '/main/admin/groups'
    },
    {
      'label': 'Services & Products',
      'icon': <WorkIcon />,
      'link': '/main/admin/services-and-products'
    },
    {
      'label': 'Invoicing',
      'icon': <LibraryBooksIcon />,
      'link': '/main/admin/invoicing'
    },
    /*
     * {
     *   'label': 'Job Types',
     *   'icon': <WorkIcon/>,
     *   'link': '/main/admin/job-types'
     * },
     */
    {
      'label': 'Report Number',
      'icon': <ReportIcon />,
      'link': '/main/admin/report-number'
    },
    {
      'label': 'Roles/Permissions',
      'icon': <AssignmentIndIcon />,
      'link': '/main/admin/roles-permissions'
    },
    {
      'label': 'Vendors',
      'icon': <StorefrontIcon />,
      'link': '/main/admin/vendors',
      'flag': currentDivision.isDivisionFeatureActivated && vendors.unsignedVendorsFlag
    },
    // {
    //   'label': 'Payroll',
    //   'icon': <PaymentIcon />,
    //   'link': '/main/admin/payroll'
    // },
    {
      'label': 'Integrations',
      'icon': <SettingsApplicationsIcon />,
      'link': '/main/admin/integrations'
    },
    {
      'label': 'Data',
      'icon': <DescriptionIcon />,
      'link': '/main/admin/data'
    },
    {
      'label': 'Groups',
      'icon': <GroupIcon />,
      'link': '/main/employees/group'
    },
    {
      'label': 'Technicians',
      'icon': <DirectionsBikeIcon />,
      'link': '/main/employees/technician'
    },
    {
      'label': 'Managers',
      'icon': <ContactsIcon />,
      'link': '/main/employees/managers'
    },
    {
      'label': 'Office Admin',
      'icon': <SupervisedUserCircleIcon />,
      'link': '/main/employees/office-admin'
    },
    {
      'label': 'Company Inventory',
      'icon': <BackupIcon />,
      'link': '/main/inventory'
    },
    {
      'label': 'Purchased Tag',
      'icon': <StyleIcon />,
      'link': '/main/tags/purchasedtag'
    },
    {
      'label': 'Buy Blue Tag',
      'icon': <LocalOfferIcon />,
      'link': '/main/tags/bluetag'
    },
    {
      'label': 'Profile',
      'icon': <ListIcon />,
      'link': '/main/user/view-profile'
    },
    {
      'label': 'Change Password',
      'icon': <LockIcon />,
      'link': '/main/user/change-password'
    },
    {
      'label': 'Email Preferences',
      'icon': <MailOutlineIcon />,
      'link': '/main/user/email-preference'
    },
    {
      'label': 'Revenue',
      'icon': <CollectIcon />,
      'link': getLinkByDivision('/main/reports/revenue'),
      'group': 'Customers'
    },
    {
      'label': 'A/R',
      'icon': <AmountIcon />,
      'link': getLinkByDivision('/main/reports/ar'),
      'group': 'Customers'
    },
    {
      'label': 'Payroll',
      'icon': <PayrollIcon />,
      'link': '/main/reports/payroll',
      'group': 'Vendors'
    }
  ];

  const theme = useTheme();
  const avatarStyles = useAvatarStyles();
  const sidebarStyles = useSidebarStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const filteredLinkData = filterSidebarLinksByPermission(auth.user, LINK_DATA);

  const withSidebar = !['/main/dashboard', '/main/notifications'].includes(pathName);
  const subGroupBar = (item : any) => {
    return pathName.split('/main/')[1] &&
    Object.values(groupBy(filteredLinkData.filter((childitem: any) => childitem.link.startsWith(item.link) && childitem.parent != true), 'group'))
      .map((group: any, groupIdx: number) =>
        <Accordion key={groupIdx} defaultExpanded className={sidebarStyles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={sidebarStyles.accordionSummary}
            classes={{
              'root': sidebarStyles.minimumMargin,
              'expanded': sidebarStyles.minimumMargin,
              'expandIcon': sidebarStyles.expandIcon
            }}>
            <span className={classnames({
              [sidebarStyles.groupLabel]: true,
              [sidebarStyles.groupLabelClose]: !open
            })}>{open && group[0].group}</span>
          </AccordionSummary>
          <AccordionDetails className={sidebarStyles.accordionDetails}>
            <ul className={classnames({
              [sidebarStyles.subCategory]: true,
              [sidebarStyles.subCategoryClose]: !open
            })}>
              {group.map((subitem: any, idx: number) => {
                return (
                  <li key={idx}>
                    <Tooltip
                      arrow
                      title={subitem.label}
                      disableHoverListener={open}>
                      <StyledListItem
                        button
                        onClick={() => onClickLink(subitem.link)}
                        selected={
                          pathName === subitem.link ||
                          pathName === `${subitem.link}/${nestedRouteKey}`
                        }>
                        {subitem.icon && subitem.icon}
                        {open && <span className={'menuLabel sub-menu'}>{subitem.label}</span>}
                      </StyledListItem>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </AccordionDetails>
        </Accordion>);
  };
  const imageUrl = user?.profile?.imageUrl === '' || user?.profile?.imageUrl === null
    ? AvatarImg
    : user?.profile?.imageUrl;

  useEffect(() => {
  }, [location, isMobile]);

  useEffect(() => {
    if (user?.company) {
      getCompanyProfile(user?.company as string);
    }
  }, [user]);

  const onClickLink = (strLink: string): void => {
    showNotificationDetails(false);
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
    logoutAndReset();
    removeUserFromLocalStorage();
    history.push('/');
  };

  return (
    <Drawer
      variant={'permanent'}
      className={classnames(sidebarStyles.drawer, sidebarStyles.drawerOpen, {
        [sidebarStyles.drawerClose]: !open
      })}
      classes={{
        'paper': classnames(classes.bcSideBar, sidebarStyles.drawerOpen, {
          [sidebarStyles.drawerClose]: !open
        })
      }}>
      <div className={classes.bcSidebarBody}>
        <div className={classnames({
          [classes.bcSideBarCompanyLogo]: true,
          [avatarStyles.companyLogo]: !open
        })}>
          <img
            src={profileState?.logoUrl === '' ? NoCompanyLogo : profileState.logoUrl}
          />
        </div>

        <ul>
          {filteredLinkData.map((item: any, idx: number) => {
            let mainPath = pathName.split("/main/")[1]; // eslint-disable-line
            if (mainPath) {
              mainPath = mainPath.split("/")[0]; // eslint-disable-line
            } else {
              mainPath = 'dashboard';
            }

            return item.link.startsWith(`/main/${mainPath}`) && mainPath !== 'reports' && item.group == undefined && item.parent == undefined
              ? <li key={idx}>
                <Tooltip
                  arrow
                  title={item.label}
                  disableHoverListener={open}>
                  <StyledListItem
                    button
                    onClick={() => onClickLink(item.link)}
                    selected={
                      pathName === item.link ||
                      pathName === `${item.link}/${nestedRouteKey}`
                    }>
                    {item.flag &&
                      <span className={classes.flagWarning}>{'!'}</span>
                    }

                    {item.icon && item.icon}
                    <span className={'menuLabel'}>
                      {item.label}</span>
                  </StyledListItem>
                </Tooltip>
              </li>
              : item.link.startsWith(`/main/${mainPath}`) && item.parent == true ? subGroupBar(item) : null;
          })}
        </ul>

        {/* Grouped sidebar link for reports*/}
        {
          pathName.split('/main/')[1] && pathName.split('/main/')[1].startsWith('reports/') &&
          Object.values(groupBy(filteredLinkData.filter((item: any) => item.link.startsWith('/main/reports/')), 'group'))
            .map((group: any, groupIdx: number) =>
              <Accordion key={groupIdx} defaultExpanded
                className={sidebarStyles.accordion}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={sidebarStyles.accordionSummary}
                  classes={{
                    'root': sidebarStyles.minimumMargin,
                    'expanded': sidebarStyles.minimumMargin,
                    'expandIcon': sidebarStyles.expandIcon
                  }}>
                  {open && group[0].group}
                </AccordionSummary>
                <AccordionDetails className={sidebarStyles.accordionDetails}>
                  <ul>
                    {group.map((item: any, idx: number) => {
                      return (
                        <li key={idx}>
                          <Tooltip
                            arrow
                            title={item.label}
                            disableHoverListener={open}>
                            <StyledListItem
                              button
                              onClick={() => onClickLink(item.link)}
                              selected={
                                pathName === item.link ||
                                pathName === `${item.link}/${nestedRouteKey}`
                              }>
                              {item.icon && item.icon}
                              {open &&
                                <span className={'menuLabel'}>{item.label}</span>}
                            </StyledListItem>
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionDetails>
              </Accordion>)
        }

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
              <strong
                className={'menuLabel'}>{user && user.profile && user.profile.displayName}</strong>
              <ArrowDropUpIcon style={{ 'color': CONSTANTS.PRIMARY_GRAY }} />
            </StyledFooterItem>
            <Menu
              PaperProps={{
                'style': {
                  'width': CONSTANTS.ADMIN_SIDEBAR_WIDTH - 30
                }
              }}
              id={'sidebar-profile-menu'}
              anchorEl={anchorEl}
              anchorOrigin={{ 'vertical': 'top',
                'horizontal': 'center' }}
              transformOrigin={{ 'vertical': 'bottom',
                'horizontal': 'center' }}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseProfileMenu}>
              <MenuItem onClick={handleViewProfile}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize={'small'} />
                </ListItemIcon>
                {'View Profile\r'}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize={'small'} />
                </ListItemIcon>
                {'Logout\r'}
              </MenuItem>
            </Menu>
          </li>
        </ul>

      </div>

    </Drawer>
  );
}

const StyledListItem = styled(ListItem)`
  font-size: 16px;
  line-height: 20px;
  height: 40px;
  color: #000;
  border-radius: 7px;

  & > .menuLabel {
    padding-left: 30px;
    white-space: nowrap;
  }
;

  &.Mui-selected {
    color: #fff;
    background-color: ${CONSTANTS.SECONDARY_DARK_GREY};
  }
;
`;

const StyledFooterItem = styled(ListItem)`
  font-size: 14px;
  line-height: 20px;
  color: #000;
  border-radius: 7px;

  & > .menuLabel {
    padding-left: 35px;
  }
;
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCAdminSidebar);
