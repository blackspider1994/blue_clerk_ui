import React, { useEffect, useState } from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import styles from 'app/pages/reports/customers/revenue-reports/revenue.styles';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import BCMenuButton from 'app/components/bc-menu-more';
import { withStyles } from '@material-ui/core';
import { exportCustomersToExcel } from 'api/customer.api';


const INITIAL_ITEMS = [
    { id: 0, title: 'Export to Excel' },
]

/**
 * Page to download entities as excel file
 * @param param0 
 * @returns 
 */
const DataPage = ({ classes }: any) => {

    const [isLoading, setIsLoading] = useState(false);

    const handleMenuButtonClick = (event: any, id: number) => {
        event.stopPropagation();
        switch (id) {
            case 0:
                setIsLoading(true);
                exportCustomersToExcel().then(({ data, fileName }: { data: Blob, fileName: string }) => {
                    const h = 0;
                    const href = window.URL.createObjectURL(data);

                    const anchorElement = document.createElement('a');

                    anchorElement.href = href;
                    anchorElement.download = fileName;

                    document.body.appendChild(anchorElement);
                    anchorElement.click();

                    document.body.removeChild(anchorElement);
                    window.URL.revokeObjectURL(href);
                    setIsLoading(false);
                }).catch((error: any) => {
                    setIsLoading(false);
                });
                break;
        }
    }

    return (
        <div style={{ padding: 20 }}>
            {isLoading ? (
                <BCCircularLoader heightValue={'20vh'} />
            ) : (
                <>
                    <div className={classes.label}>Data</div>
                    <div className={classes.reportType}>
                        <div className={classes.reportName}>
                            Customers
                        </div>
                        <BCMenuButton
                            icon={MoreHorizIcon}
                            items={INITIAL_ITEMS}
                            handleClick={handleMenuButtonClick}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

export default withStyles(
    styles,
    { 'withTheme': true }
)(DataPage);
