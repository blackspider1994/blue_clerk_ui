import BCTabs from '../../../components/bc-tab/bc-tab';
import InvoicingListListing from './invoices-list-listing/invoices-list-listing';
import InvoicingDraftListing from './invoices-list-listing/invoices-draft-listing';
import SwipeableViews from 'react-swipeable-views';
import styles from './invoices-list.styles';
import { useHistory } from 'react-router-dom';
import { Fab, useTheme, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { CSButton } from "../../../../helpers/custom";
import { useDispatch, useSelector } from 'react-redux';
import { getInvoicingList } from "../../../../actions/invoicing/invoicing.action";
import TableFilterService from "../../../../utils/table-filter";

const getFilteredList = (state: any) => {
  const sortedInvoices = TableFilterService.filterByDateDesc(state?.invoiceList.data);
  return sortedInvoices.filter((invoice: any) => invoice?.isDraft);
};

function InvoiceList({ classes }: any) {
  const dispatch = useDispatch();
  const [curTab, setCurTab] = useState(0);
  const theme = useTheme();
  const history = useHistory();
  const invoiceList = useSelector(getFilteredList);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const openCreateInvoicePage = () => {
    history.push('/main/invoicing/create-invoice');
/*    history.push({
      'pathname': `/main/invoicing/edit/0`,
/!*      'state': {
        'customerId': invoiceDetail.customer?._id,
        'customerName': invoiceDetail.customer?.profile?.displayName,
        'invoiceId': invoiceDetail?._id,
        'jobType': invoiceDetail.job?.type?._id,
        'invoiceDetail': invoiceDetail
      }*!/
    });*/
  };

  useEffect(() => {
    dispatch(getInvoicingList());
  }, []);

  return (
    <div className={classes.pageMainContainer}>
      <div className={classes.pageContainer}>
        <div className={classes.pageContent}>
        <BCTabs
            curTab={curTab}
            indicatorColor={'primary'}
            onChangeTab={handleTabChange}
            chip={true}
            tabsData={[
              {
                'label': 'Invoices',
                'value': 0
              },
              {
                'label': 'Drafts',
                'value': 1,
                'chip': true,
                'chipValue': invoiceList?.length || 0
              }
            ]}
          />
          <div className={classes.addButtonArea}>
          <CSButton
            aria-label={'new-ticket'}
            color={'primary'}
            onClick={() => openCreateInvoicePage()}
            variant={'contained'}>
            {'Custom Invoice'}
          </CSButton>
          </div>
          <SwipeableViews
            axis={
              theme.direction === 'rtl'
                ? 'x-reverse'
                : 'x'}
            index={curTab}>
            <InvoicingListListing hidden={curTab !== 0} id={"0"} />
            <InvoicingDraftListing hidden={curTab !== 1} id={"1"} />
          </SwipeableViews>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles, { 'withTheme': true })(InvoiceList);
