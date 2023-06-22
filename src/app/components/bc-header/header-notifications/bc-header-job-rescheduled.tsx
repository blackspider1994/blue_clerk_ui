import React from 'react';
import ReplayIcon from '@material-ui/icons/Replay';
import { MenuItem } from '@material-ui/core';
import { NotificationItemWithHandler } from '../bc-header-notification';
import { fromNow, shortenStringWithElipsis } from 'helpers/format';

export default function JobRescheduledNotication(item :NotificationItemWithHandler) {
  const { metadata, message, createdAt, readStatus, openModalHandler, ...props } = item;

  const openDetailTicketModal = async () => {
    const data = {
      'jobId': item?.metadata?._id
    };
    openModalHandler('JobRescheduled', data, item?._id)
  };
  const filteredHistory: {note: string}[] = item.metadata ? item.metadata.track.filter((history:any)=>history.action.includes('rescheduling')) : []
  const rescheduleNote: string = filteredHistory?.length ? filteredHistory[filteredHistory.length-1].note: '-'
  return <MenuItem
    className={readStatus.isRead
      ? ''
      : 'unread'}
    onClick={openDetailTicketModal}>

    <ReplayIcon color={'primary'} />
    <div className={'ticket-info'}>
      {message?.title}
      {' - '}
      <strong>
        {metadata?.jobId}
      </strong>
      <span className='note'>
        {`Note: ${shortenStringWithElipsis(rescheduleNote || '', 24)}`}
      </span>
      <span>
        {fromNow(new Date(createdAt))}
      </span>
    </div>
  </MenuItem>;
}


