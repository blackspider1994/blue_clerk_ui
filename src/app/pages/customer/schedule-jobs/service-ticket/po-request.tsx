import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import InfoIcon from '@material-ui/icons/Info';
import {
    getServiceTicketDetail
} from 'api/service-tickets.api';
import { modalTypes } from '../../../../../constants';
import { formatDate } from 'helpers/format';
import styles from '../../customer.styles';
import { Checkbox, FormControlLabel, withStyles, Grid } from "@material-ui/core";
import React, { useEffect, useState, useRef } from 'react';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { setCurrentPageIndex, setCurrentPageSize, setKeyword } from 'actions/po-request/po-request.action';
import { getCustomers } from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import { clearJobSiteStore, getJobSites, loadingJobSites } from 'actions/job-site/job-site.action';
import { getAllJobTypesAPI } from 'api/job.api';
import "../../../../../scss/popup.scss";
import EditIcon from '@material-ui/icons/Edit';
import {
    CSButtonSmall,
    CSIconButton,
    useCustomStyles
} from "../../../../../helpers/custom";
import { error, warning } from "../../../../../actions/snackbar/snackbar.action";
import BCDateRangePicker, { Range }
    from "../../../../components/bc-date-range-picker/bc-date-range-picker";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';
import { getAllPORequestsAPI } from 'api/po-requests.api';

function PORequired({ classes, hidden }: any) {
    const dispatch = useDispatch();
    const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

    const customers = useSelector(({ customers }: any) => customers.data);
    const [showAllTickets, toggleShowAllTickets] = useState(false);
    const [selectionRange, setSelectionRange] = useState<Range | null>(null);
    const loadCount = useRef<number>(0);
    const customStyles = useCustomStyles();
    const { isLoading = true, po_request, refresh = true, total, prevCursor, nextCursor, currentPageIndex, currentPageSize, keyword } = useSelector(({ PORequest }: any) => ({
        isLoading: PORequest.isLoading,
        refresh: PORequest.refresh,
        po_request: PORequest.po_request,
        prevCursor: PORequest.prevCursor,
        nextCursor: PORequest.nextCursor,
        total: PORequest.total,
        currentPageIndex: PORequest.currentPageIndex,
        currentPageSize: PORequest.currentPageSize,
        keyword: PORequest.keyword,
    }));
    const filteredTickets = po_request.filter((ticket: any) => {
        let cond = true
        return cond;
    });

    const openEditTicketModal = (ticket: any) => {
        const reqObj = {
            customerId: ticket.customer?._id,
            locationId: ticket.jobLocation
        }
        if (reqObj.locationId !== undefined && reqObj.locationId !== null) {
            dispatch(loadingJobSites());
            dispatch(getJobSites(reqObj));
        } else {
            dispatch(clearJobSiteStore());
        }
        dispatch(getAllJobTypesAPI());
        ticket.updateFlag = true;
        dispatch(setModalDataAction({
            'data': {
                'modalTitle': 'Edit PO Request',
                'removeFooter': false,
                'ticketData': ticket,
                'className': 'serviceTicketTitle',
                'maxHeight': '900px',
            },
            'type': modalTypes.EDIT_TICKET_MODAL
        }));
        setTimeout(() => {
            dispatch(openModalAction());
        }, 200);
    };

    function Toolbar() {
        useEffect(() => {
            if (loadCount.current !== 0) {
                dispatch(getAllPORequestsAPI(currentPageSize, currentPageIndex, showAllTickets, keyword, selectionRange, currentDivision.params));
                dispatch(setCurrentPageIndex(0));
            }
        }, [showAllTickets]);

        useEffect(() => {
            if (loadCount.current !== 0) {
                dispatch(getAllPORequestsAPI(currentPageSize, currentPageIndex, showAllTickets, keyword, selectionRange, currentDivision.params));
                dispatch(setCurrentPageIndex(0));
            }
        }, [selectionRange]);
        return <>
            <FormControlLabel
                classes={{ root: classes.noMarginRight }}
                control={
                    <Checkbox
                        checked={showAllTickets}
                        onChange={() => {
                            dispatch(setCurrentPageIndex(0))
                            toggleShowAllTickets(!showAllTickets)
                        }}
                        name="checkedB"
                        color="primary"
                    />
                }
                label="Display All Tickets"
            />
            <BCDateRangePicker
                range={selectionRange}
                onChange={(range: Range | null) => {
                    dispatch(setCurrentPageIndex(0))
                    setSelectionRange(range);
                }}
                showClearButton={true}
                title={'Filter by Due Date...'}
            />
        </>
    }

    const openDetailTicketModal = async (ticket: any) => {
        const { serviceTicket, status, message } = await getServiceTicketDetail(ticket._id);
        if (status === 1) {
            dispatch(setModalDataAction({
                'data': {
                    'modalTitle': 'PO Request Details',
                    'removeFooter': false,
                    'job': serviceTicket,
                    'className': 'serviceTicketTitle',
                },
                'type': modalTypes.VIEW_SERVICE_TICKET_MODAL
            }));
            setTimeout(() => {
                dispatch(openModalAction());
            }, 200);
        } else {
            dispatch(error(message));
        }
    };

    const columns: any = [
        {
            'Header': 'Ticket ID',
            'accessor': 'ticketId',
            'className': 'font-bold',
            'sortable': true
        },
        {
            'Header': 'Due Date',
            'accessor': 'dueDate',
            'className': 'font-bold',
            'sortable': true,
            'Cell'({ row }: any) {
                let formattedDate = row.original.dueDate ? formatDate(row.original.dueDate) : '-';
                return (
                    <div>
                        {formattedDate}
                    </div>
                )
            }
        },
        {
            'Header': 'Customer',
            'accessor': 'customer.profile.displayName',
            'className': 'font-bold',
            'sortable': true
        },
        {
            'Cell'({ row }: any) {
                return <div className={'flex items-center'}>
                    <CSIconButton
                        //variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => openDetailTicketModal(row.original)}
                    >
                        <InfoIcon className={customStyles.iconBtn} />
                    </CSIconButton>
                    {row.original && row.original.status !== 1
                        ? <CSIconButton
                            //variant="contained"
                            color="primary"
                            size="small"
                            aria-label={'edit-ticket'}
                            onClick={(e) => {
                                e.stopPropagation();
                                openEditTicketModal(row.original);
                            }}
                        >
                            <EditIcon className={customStyles.iconBtn} />
                        </CSIconButton>
                        : null
                    }
                    {
                        !row.original.jobCreated && row.original.status !== 2 && row.original.customer?._id
                            ? <CSButtonSmall
                                variant="outlined"
                                color="primary"
                                size="small"
                                aria-label={'edit-ticket'}
                                onClick={() => sendPORequestEmail(row.original)}
                            >
                                Send PO Request
                            </CSButtonSmall>
                            : null
                    }
                </div>;
            },
            'Header': 'Actions',
            'id': 'action-create-job',
            'sortable': false,
            'width': 60
        },
    ];

    useEffect(() => {
        if (refresh) {
            dispatch(getAllPORequestsAPI(undefined, undefined, showAllTickets, keyword, selectionRange, currentDivision.params));
            dispatch(setCurrentPageIndex(0));
            dispatch(setCurrentPageSize(10));
        }
        setTimeout(() => {
            loadCount.current++;
        }, 1000);
    }, [refresh]);

    useEffect(() => {
        dispatch(getAllPORequestsAPI(undefined, undefined, undefined, undefined, undefined, currentDivision.params));
        if (customers.length == 0) {
            dispatch(getCustomers());
        }
        dispatch(getAllJobTypesAPI());
        dispatch(setKeyword(''));
        dispatch(setCurrentPageIndex(0));
        dispatch(setCurrentPageSize(10));
    }, [currentDivision.params])

    const handleRowClick = (event: any, row: any) => {
    };

    const sendPORequestEmail = (ticket: any) => {
        dispatch(setModalDataAction({
            'data': {
                'po_request_id': ticket._id,
                'modalTitle': `Send this ${ticket.ticketId}`,
                'removeFooter': false,
            },
            'type': modalTypes.EMAIL_PO_REQUEST_MODAL
        }));
        setTimeout(() => {
            dispatch(openModalAction());
        }, 200);
    }

    return (
        <BCTableContainer
            columns={columns}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            search
            searchPlaceholder={'Search PO Requests...'}
            tableData={filteredTickets}
            toolbarPositionLeft={true}
            toolbar={Toolbar()}
            manualPagination
            total={total}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndexFunction={(num: number, apiCall: boolean) => {
                dispatch(setCurrentPageIndex(num))
                if (apiCall) {
                    dispatch(getAllPORequestsAPI(currentPageSize, num, showAllTickets, keyword, selectionRange, currentDivision.params))
                }
            }}
            currentPageSize={currentPageSize}
            setCurrentPageSizeFunction={(num: number) => dispatch(setCurrentPageSize(num))}
            setKeywordFunction={(query: string) => {
                dispatch(setKeyword(query));
                dispatch(setCurrentPageIndex(0))
                dispatch(getAllPORequestsAPI(currentPageSize, 0, showAllTickets, query, selectionRange, currentDivision.params));
            }}
        />
    );
}

export default withStyles(
    styles,
    { 'withTheme': true }
)(PORequired);
