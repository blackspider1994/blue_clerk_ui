import styles from './bc-job-request-modal.styles';
import {
  Button,
  DialogActions,
  withStyles,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';
import styled from 'styled-components';
import '../../../scss/job-poup.scss';
import BCTabs2 from 'app/components/bc-tab2/bc-tab2';
import InfoIcon from '@material-ui/icons/Info';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import {
  closeModalAction,
  openModalAction,
  setModalDataAction
} from "../../../actions/bc-modal/bc-modal.action";
import { modalTypes } from "../../../constants";
import { getContacts } from "../../../api/contacts.api";
import { getJobRequestChat, postJobRequestChat } from 'api/chat.api';
import { error as SnackBarError } from 'actions/snackbar/snackbar.action';
import BCJobRequestWindow
  from "../../components/bc-job-request/window/bc-job-request-window";
import {getJobLocationsAction} from "../../../actions/job-location/job-location.action";
import BCJobRequestWindowHeader
  from "../../components/bc-job-request/window/bc-job-request-header"
import BCJobRequestRepairHeader
  from "../../components/bc-job-request/repair/bc-job-request-header";
import BCChat from "../../components/bc-job-request/chat/bc-chat";
import BCJobRequestMap
  from "../../components/bc-job-request/shared/bc-job-request-map";
import BcJobRequestRepair
  from "../../components/bc-job-request/repair/bc-job-request-repair";

const initialJobRequestState = {
  customer: {
    _id: '',
  },
  description: '',
  employeeType: false,
  equipment: {
    _id: '',
  },
  dueDate: '',
  scheduleDate: null,
  scheduledEndTime: null,
  scheduledStartTime: null,
  technician: {
    _id: '',
  },
  contractor: {
    _id: '',
  },
  ticket: {
    _id: '',
  },
  type: {
    _id: '',
  },
  jobLocation: {
    _id: '',
  },
  jobSite: {
    _id: '',
  },
  jobRescheduled: false,
};

function BCViewJobRequestModal({
                                       classes,
                                       jobRequest = initialJobRequestState,
                                     }: any): JSX.Element {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { contacts } = useSelector((state: any) => state.contacts);
  const customerContact =
    jobRequest.customerContact && contacts.find((contact: any) => contact.userId === jobRequest.customerContact._id)?.name;

  const [curTab, setCurTab] = useState(0);
  const [chatContent, setChatContent] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [changeRequest, setChangeRequest] = useState(false);

  useEffect(() => {
    const data: any = {
      type: 'Customer',
      referenceNumber: jobRequest.customer._id,
    };
    dispatch(getContacts(data));
    dispatch(getJobLocationsAction({customerId: jobRequest.customer?._id, isActive: true}));
  }, []);

  useEffect(() => {
    if (jobRequest?._id) {
      getChatContent(jobRequest._id);
    }
  }, [jobRequest])


  // TODO make sure canEdit
  // const canEdit = [0, 4, 6].indexOf(jobRequest.status) >= 0;

  const openRejectJobRequestModal = () => {
    dispatch(setModalDataAction({
      'data': {
        jobRequest: jobRequest,
        modalTitle: 'Request Rejection',
      },
      'type': modalTypes.REJECT_JOB_REQUEST_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const getChatContent = async (id: string) => {
    try {
      setIsChatLoading(true);
      const result = await getJobRequestChat(id);
      if (result.status === 1) {
        setChatContent(result.chats);
      } else {
        console.log(result.message);
        dispatch(SnackBarError(`Something went wrong when retreiving comments`));
      }
      setIsChatLoading(false);
    } catch (error) {
      console.log(error);
      dispatch(SnackBarError(`Something went wrong when retreiving comments`));
      setIsChatLoading(false);
    }
  }

  const createJob = () => {
    dispatch(setModalDataAction({
      'data': {
        'job': {
          'customer': {
            '_id': ''
          },
          'description': '',
          'employeeType': false,
          'equipment': {
            '_id': ''
          },
          'scheduleDate': null,
          'scheduledEndTime': null,
          'scheduledStartTime': null,
          'technician': {
            '_id': ''
          },
          ticket: {
            ...jobRequest,
            tasks: [],
            note: jobRequest.requests?.filter((request: any) => request.note).map((request: any) => request.note).join('\n\n'),
            images: jobRequest.requests?.map((request: any) => request.images || []).flat(1) || [],
          },
          'type': {
            '_id': ''
          },
          'jobFromRequest': true,
        },
        'modalTitle': 'Create Job',
        'removeFooter': false,
      },
      'type': modalTypes.EDIT_JOB_MODAL
    }));
  }

  const handleClose = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const renderJobRequestContent = () => (
    <div hidden={curTab !== 0}>
      <BCJobRequestMap
        jobRequest={jobRequest}
        customerContact={customerContact}
        isChanging={changeRequest}
        newLocation={jobRequest.jobLocation}
        newSite={jobRequest.jobSite}
      />
      {jobRequest.type === 1 ?
        <BcJobRequestRepair jobRequest={jobRequest} />
        :
        <BCJobRequestWindow jobRequest={jobRequest} />
      }

      {changeRequest ?
        <DialogActions>
          <Button
            onClick={() => setChangeRequest(false)}
            variant={'outlined'}
          >
            Cancel
          </Button>
          <Button
            color={'primary'}
            onClick={() => setChangeRequest(false)}
            variant={'contained'}
          >
            Save
          </Button>
        </DialogActions>
        :
        <DialogActions>
          {jobRequest.status === 0 && <>
            <Button
              onClick={openRejectJobRequestModal}
              variant={'contained'}
              classes={{
                root: classes.purpleButton
              }}
            >
              Reject Request
            </Button>
            <Button
              onClick={() => setChangeRequest(true)}
              variant={'outlined'}
              classes={{
                root: classes.grayButton,
                label: classes.darkButtonLabel
              }}
            >
              Change Request
            </Button>
          </>
          }
          <div style={{flex: 1}}/>
          <Button
            onClick={handleClose}
            variant={'outlined'}
          >
            Close
          </Button>
          {jobRequest.status === 0 &&
          <>
            <Button
              color={'primary'}
              onClick={createJob}
              variant={'contained'}
            >
              Create Job
            </Button>
          </>
          }
        </DialogActions>
      }
    </div>
  );

  const renderMessageTab = () => <BCChat
    jobRequestID={jobRequest._id}
    visible={curTab === 1}
    isChatLoading={isChatLoading}
    chatContent={chatContent}
    onSubmit={() => getChatContent(jobRequest._id)}
  />

  return (
    <DataContainer className={'new-modal-design'}>
      {jobRequest.type === 1 ?
        <BCJobRequestRepairHeader jobRequest={jobRequest} />
        :
        <BCJobRequestWindowHeader jobRequest={jobRequest} />
      }
      <BCTabs2
        curTab={curTab}
        indicatorColor={'primary'}
        onChangeTab={handleTabChange}
        tabsData={[
          {
            'label': 'DETAILS',
            'value': 0,
            'icon': InfoIcon,
          },
          {
            'label': 'COMMENTS',
            'value': 1,
            'icon': QuestionAnswerIcon,
            'badge': chatContent.length,
          },
        ]}
      />
      <div className={'modalDataContainer'} style={{maxHeight: '60vh'}}>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={curTab}
          disabled
          slideStyle={{overflow: 'hidden'}}
        >
          {renderJobRequestContent()}
          {renderMessageTab()}
        </SwipeableViews>
      </div>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  margin: auto 0;

  .modalContent {
    padding-top: 15px !important;
  }
  .modalContentBottom {
    padding-bottom: 15px !important;
  }

  .MuiTableCell-root {
    line-height: normal;
  }

  .MuiTableCell-sizeSmall {
    padding: 0px 16px;
  }

  .MuiButton-containedSecondary {
    margin-left: 15px !important;
  }

`;


export default withStyles(styles, { withTheme: true })(BCViewJobRequestModal);
