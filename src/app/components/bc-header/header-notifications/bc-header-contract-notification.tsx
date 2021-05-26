import { ReactComponent as AcceptedContract } from 'assets/img/contract-accepted.svg';
import { ReactComponent as RejectedContract } from 'assets/img/contract-rejected.svg';
import { ReactComponent as InvitationContract } from 'assets/img/contract-invitation.svg';
import { ReactComponent as CancelledContract } from 'assets/img/contract-cancelled.svg';
import { ReactComponent as FinishedContract } from 'assets/img/contract-finished.svg';

import { MenuItem } from '@material-ui/core';
import { NotificationItem } from '../bc-header-notification';
import React from 'react';
import { fromNow } from 'helpers/format';
import { modalTypes } from '../../../../constants';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { NotificationTypeTypes } from 'reducers/notifications.types';


const renderImage = (notificationType:string) => {
  const images:any = {
    [NotificationTypeTypes.CONTRACT_ACCEPTED]: <AcceptedContract />,
    [NotificationTypeTypes.CONTRACT_INVITATION]: <InvitationContract />,
    [NotificationTypeTypes.CONTRACT_CANCELLED]: <CancelledContract />,
    [NotificationTypeTypes.CONTRACT_REJECTED]: <RejectedContract />,
    [NotificationTypeTypes.CONTRACT_FINISHED]: <FinishedContract />
  };
  return images[notificationType];
};

export default function ContractNotification({ message, metadata, createdAt, readStatus, _id, notificationType } :NotificationItem) {
  const dispatch = useDispatch();
  const openContractModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'removeFooter': false,
        'maxHeight': '450px',
        'height': '100%',
        'message': message,
        'contractId': metadata._id,
        'notificationType': notificationType,
        'notificationId': _id
      },
      'type': modalTypes.CONTRACT_VIEW_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const ContractMenuItem = styled(MenuItem)`
  svg {
      height: 2em;
      width: 2em;
  }`;

  return <ContractMenuItem
    className={readStatus.isRead
      ? ''
      : 'unread'}
    onClick={openContractModal}>

    { renderImage(notificationType) }

    <div className={'ticket-info'}>
      {message.title}
      <br />
      <strong>
        {message.body}
      </strong>
      <span>
        {fromNow(new Date(createdAt))}
      </span>
    </div>
  </ContractMenuItem>;
}

