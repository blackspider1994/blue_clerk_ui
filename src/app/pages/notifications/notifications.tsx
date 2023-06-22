import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import React, { useEffect, useState } from 'react';
import { fromNow } from 'helpers/format';
import styled from 'styled-components';
import styles from './notification.styles';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, withStyles } from '@material-ui/core';
import AlertDialogSlide from 'app/components/bc-dialog/bc-dialog';
import { loadNotificationsActions } from 'actions/notifications/notifications.action';
import { Notification } from 'reducers/notifications.types';
import { getNotificationMethods, getNotificationValues } from './notification-dict';
import { updateNotification } from 'api/notifications.api';

const NoticationPageContainer = styled.div`
    flex: 1 1 100%;
    width: 100%;
    display: flex;
    overflow-x: hidden;
    padding: 30px;
    box-sizing: border-box;
    svg {
        cursor: pointer;
    }
    .actions {
      display: flex;
    }
    td {
      white-space: pre-wrap;
    }
    tr.unread {
        background: #f1f1f1;
        td {
          font-weight: 800;
          f
        }
    }
`;


function NotificationPage() {
  const dispatch = useDispatch();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const { notifications, total, loading } = useSelector((state: any) => state.notifications);
  const [searchText, setSearchText] = useState('');


  const handleClick = (notificationType: string, original: Notification) => {
    const clickHandler = getNotificationMethods(dispatch, notificationType, original);
    clickHandler();
  };


  useEffect(() => {
    if (!loading) {
      dispatch(loadNotificationsActions.fetch({
        pageSize: currentPageSize,
        currentPage: currentPageIndex, search: searchText
      }));
    }
  }, [currentPageIndex, currentPageSize, searchText]);

  const columns: any = [

    {
      'Cell'({ 'row': { original } }: { row: { original: Notification } }) {
        const { typeText } = getNotificationValues(original.notificationType, original);
        return (
          <div className={'type'}>
            {typeText}
          </div>
        );
      },
      'Header': 'Notification Type',
      'id': 'notificationType',
      'sortable': true,
      'width': 70
    },
    {
      'Cell'({ 'row': { original } }: { row: { original: Notification } }) {
        const { notificationType } = original;
        const { details } = getNotificationValues(notificationType, original);
        return (
          <div >
            {details}
          </div>
        );
      },

      'accessor': 'notificationType',
      'Header': 'Details',
      'id': 'id',
      'sortable': true

    },
    {
      'Cell'({ 'row': { original } }: { row: { original: Notification } }) {
        const { readStatus } = original;
        const date = new Date(readStatus.readAt);
        return (
          <div>
            {readStatus.isRead
              ? `Viewed by ${readStatus.readBy.profile.displayName} ${fromNow(date)}`
              : 'Unread'}
          </div>
        );
      },
      'accessor': 'readStatus.readAt',
      'Header': 'Status',
      'id': 'status',
      'sortable': true

    },
    {
      Cell({ 'row': { original } }: { row: { original: Notification } }) {
        return (
          <div className={'actions'}>
            <Button
              onClick={() => handleClick(original.notificationType, original)}
              size={'small'}
              style={{ 'marginRight': '20px' }}
              variant={'outlined'}>
              {'View'}
            </Button>
            <AlertDialogSlide
              buttonText={'Dismiss'}
              color={'secondary'}
              confirmMethod={async () => {
                await updateNotification({
                  id: original._id,
                  isDismissed: true
                });
                dispatch(loadNotificationsActions.fetch({
                  pageSize: currentPageSize,
                  currentPage: 0, search: searchText
                }));
                setCurrentPageIndex(0);
              }}
              confirmText={'Dismiss'}
              size={'small'}
              variant={'outlined'}>
              <span style={{ fontSize: 20, fontWeight: 500 }}>
                {'Are you sure you want to dismiss this notification?'}
              </span>
            </AlertDialogSlide>
          </div>
        );
      },
      'Header': 'Options',
      'id': 'action-options',
      'sortable': false,
      'width': 20
    }
  ];

  return (
    <NoticationPageContainer>
      <Grid
        alignItems={'flex-start'}
        container
        justify={'center'}>
        <Grid
          item
          lg={8}
          md={12}
          sm={12}
          xs={12}>
          <BCTableContainer
            cellSize
            columns={columns}
            hover
            initialMsg={'No notificatons'}
            isLoading={loading}
            manualPagination
            total={total}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndexFunction={(num: number, apiCall: Boolean = false) => {
              if (apiCall) {
                setCurrentPageIndex(num)
              }
            }}
            currentPageSize={currentPageSize}
            setCurrentPageSizeFunction={(num: number) => {
              setCurrentPageSize(num);
            }}
            setKeywordFunction={(query: string) => {
              setCurrentPageIndex(0);
              setSearchText(query);
            }}
            search
            searchPlaceholder={'Search Notifications'}
            tableData={notifications}
          />
        </Grid>
      </Grid>
    </NoticationPageContainer>);
}

export default withStyles(styles, { 'withTheme': true })(NotificationPage);
