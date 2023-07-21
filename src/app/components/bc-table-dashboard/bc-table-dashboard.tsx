import React from 'react';
import styles from './bc-table-dashboard.style';
import { Button, Grid, withStyles } from '@material-ui/core';
import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import { CSButton } from '../../../helpers/custom';
import AddCircleSharpIcon from '@material-ui/icons/AddCircleSharp';
import { Can } from 'app/config/Can';

interface Props {
  classes: any;
  text: string;
  textButton: string;
  click?: any;
  columns: any;
  isLoading: boolean;
  tableData: any;
  onRowClick?: any;
}
function BCTableDashboard(props: Props) {
  const {
    classes,
    text,
    textButton,
    click,
    columns,
    isLoading,
    tableData,
    onRowClick
  } = props;

  return (
    <Grid
      container
      direction={'column'}
      className={`${classes.tableContainer} elevation-1`}>

      <Grid item xs={12}>
        <div className={classes.header}>
          <div>
            <h3 className={classes.headerText}>{text}</h3>
          </div>
          <Can I={'add'} a={'Vendor'}>
            <div>
              <CSButton onClick={click}>
                <AddCircleSharpIcon style={{ 'color': '#fff' }}/> {textButton}
              </CSButton>
            </div>
          </Can>
        </div>
      </Grid>

      <Grid item className={classes.tableList} xs={12}>
        <BCTableContainer
          noHeader={true}
          className={classes.table}
          columns={columns}
          noPadding={true}
          isLoading={isLoading}
          tableData={tableData}
          pagination={false}
          pageSize={tableData.length}
          isDefault={true}
          initialMsg={'No Vendors yet'}
          stickyHeader={true}
          onRowClick={(ev: any, row: any) => onRowClick(row)}
        />
      </Grid>
    </Grid>
  );
}

export default withStyles(styles, { 'withTheme': true })(BCTableDashboard);
