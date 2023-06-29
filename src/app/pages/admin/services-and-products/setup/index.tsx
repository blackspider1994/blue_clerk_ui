import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { useTheme, withStyles } from '@material-ui/core';
import BCTabs from '../../../../components/bc-tab/bc-tab';
import Setup from '../setup/setup';
import JobCosting from '../job-costing/job-costing';
import styles from '../services-and-products-list.styles';
import '../../../../../scss/popup.scss';
function AdminServicesAndProductsSetupPage({ classes }: any) {
  const theme = useTheme();
  const location = useLocation<any>();
  const history = useHistory();
  const isDiscount = location.pathname.includes('discounts');
  const [curTab, setCurTab] = useState(isDiscount ? 1 : 0);
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
    { label: 'Tiers', Component: Setup },
    { label: 'Job costing', Component: JobCosting },
  ];
  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
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
  );
}
export default withStyles(styles, { withTheme: true })(
  AdminServicesAndProductsSetupPage
);
