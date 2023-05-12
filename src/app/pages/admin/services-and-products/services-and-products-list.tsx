import BCTabs from '../../../components/bc-tab/bc-tab';
import BCBackButton from 'app/components/bc-back-button/bc-back-button';
import ServicesAndProducts from './services-and-products/services-and-products';
import Discounts from './discounts/discounts';
import Setup from './setup/setup';
import SwipeableViews from 'react-swipeable-views';
import styles from './services-and-products-list.styles';
import { useDispatch } from 'react-redux';
import { useTheme, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getCustomers } from 'actions/customer/customer.action';
import { getAllJobTypesAPI } from 'api/job.api';
import '../../../../scss/popup.scss';
import { useLocation, useHistory } from 'react-router-dom';

function AdminServicesAndProductsPage({ classes }: any) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const location = useLocation<any>();
  const history = useHistory();
  const isDiscount = location.pathname.includes('discounts');

  const [curTab, setCurTab] = useState(isDiscount ? 1 : 0);

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getAllJobTypesAPI());
  }, []);

  const handleTabChange = (newValue: number) => {
    history.replace({
      ...history.location,
      pathname:
        newValue === 1
          ? '/main/admin/services-and-products/services/discounts'
          : '/main/admin/services-and-products/services/services-and-products',
    });

    setCurTab(newValue);
    localStorage.setItem(
      'nestedRouteKey',
      newValue === 1 ? 'services/discounts' : 'services/services-and-products'
    );
  };
  const views = [
    { label: 'Services & Products', Component: ServicesAndProducts },
    { label: 'Discounts', Component: Discounts },
    { label: 'Setup', Component: Setup },
  ];

  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
          <span className={classes.backButton}>
            <BCBackButton link={'/main/admin/services-and-products'} />
          </span>
          <BCTabs
            curTab={curTab}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            tabsData={views.map(({ label }, i) => ({
              label,
              value: i,
            }))}
          />
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={curTab}
            disabled
          >
            {views.map(({ Component }, i) => (
              <div key={i} className={classes.dataContainer} id={String(i)}>
                <Component />
              </div>
            ))}
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(
  AdminServicesAndProductsPage
);

