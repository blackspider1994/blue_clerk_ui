import React, { useState } from 'react';

import styled from 'styled-components';
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import SubHeader from '../../../Components/SubHeader';
import ToolBarSearchInput from '../../../Components/ToolBarSearchInput';
import PeopleSidebar from '../Components/PeopleSidebar';
import SearchInput from '../Components/SearchInput';
import BCTabs from '../../../Components/BCTabs';
import BCTable from '../../../Components/BCTable';

const GroupPage = (): JSX.Element => {
  const [curTab, setCurTab] = useState(0);
  const [searchStr, setSearchStr] = useState('');

  const [headCells, setHeadCells] = useState([
    {
      id: 'group_name',
      label: 'Group Name',
      sortable: true,
      width: '30%',
    },
    {
      id: 'Email',
      label: 'Email',
      sortable: true,
      width: '70%',
    },
  ]);
  const table_data = [
    {
      group_name: 'Name asdfasd1',
      Email: 'Email isdfk',
    },
    {
      group_name: 'Name asdfasd1',
      Email: 'Email wefs',
    },
    {
      group_name: 'Name asdfasd2',
      Email: 'Email 463asd',
    },
    {
      group_name: 'Name asdfasd1',
      Email: 'Email isd24fk',
    },
    {
      group_name: 'Name dfasdf',
      Email: 'Email fbhsdfg',
    },
    {
      group_name: 'Name 34fgsfg',
      Email: 'Email dfbxdfg',
    },
    {
      group_name: 'Name asdfw2353',
      Email: 'Email dfasdf',
    },
  ];

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const searchTable = (str: string): void => {
    console.log('searchTable');
  };

  return (
    <>
      <SubHeader title="People">
        <ToolBarSearchInput style={{ marginLeft: 'auto', width: '321px' }} />
        <EmployeeButton variant="contained">New Employee</EmployeeButton>
      </SubHeader>
      <MainContainer>
        <PeopleSidebar />
        <PageContainer>
          <BCTabs
            curTab={curTab}
            onChangeTab={handleTabChange}
            indicatorColor="primary"
            tabsData={[
              { value: 0, label: 'GROUP LIST' },
              { value: 1, label: 'RECENT ACTIVITIES' },
            ]}
          />
          <SwipeableViews index={curTab}>
            <DataContainer id="0" hidden={curTab !== 0}>
              <Grid container>
                <Grid item xs={6}>
                  <SearchInput
                    style={{ marginBottom: '11px' }}
                    searchStr={searchStr}
                    setSearchStr={setSearchStr}
                    onSearch={(str: string) => searchTable(str)}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid item xs={12}>
                  <BCTable tableData={table_data} headCells={headCells} pagination={true} />
                </Grid>
              </Grid>
            </DataContainer>
            <DataContainer id="1" hidden={curTab !== 1}>
              <Grid container>
                <Grid item xs={12}>
                  <BCTable tableData={table_data} headCells={headCells} pagination={true} />
                </Grid>
              </Grid>
            </DataContainer>
          </SwipeableViews>
        </PageContainer>
      </MainContainer>
    </>
  );
};

const EmployeeButton = styled(Button)`
  margin-left: 25px;
  border-radius: 2px;
  width: 192px;
  height: 38px;
  background-color: #c4c4c4;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #000;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-top: 12px;
`;

export default GroupPage;
