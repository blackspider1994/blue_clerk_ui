import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { withStyles } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import styles from './styles';
import BCMenuButton from 'app/components/bc-menu-more'
import BCMenuToolbarButton from 'app/components/bc-menu-toolbar-button';
import BCCircularLoader from "app/components/bc-circular-loader/bc-circular-loader";
import { modalTypes } from "../../../../../constants";
import {
  openModalAction,
  setModalDataAction
} from "actions/bc-modal/bc-modal.action";
import { generateIncomeReport, getMemorizedReports } from 'api/reports.api';
import { error as SnackBarError, info } from 'actions/snackbar/snackbar.action';
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface RevenueMemorizedProps {
  classes: any;
}

const INITIAL_ITEMS = [
  {id: 0, title:'Run Report'},
  {id: 1, title:'Edit'},
  {id: 2, title:'Delete'},
]
const MORE_ITEMS = [
  {id: 0, title:'Show Reports List'},
  {id: 1, title:'Export to PDF'},
  {id: 2, title:'Send Report'},
]

const RevenueMemorizedReport = ({ classes }: RevenueMemorizedProps) => {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const history = useHistory();
  const location:any = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [memorizedReportData, setMemorizedReportData] = useState<any[]>([])

  useEffect(() => {
    // if(location.state && location.state.tab === 1){
    //   getMemorizedReportsData();
    // }
    // window.history.replaceState({}, document.title);
  }, [location]);

  useEffect(() => {
    // getMemorizedReportsData();
  }, [])

  const getMemorizedReportsData = async () => {
    try {
      setIsLoading(true);
      const result = await getMemorizedReports(currentDivision.params);
      if(result.status === 1) {
        setMemorizedReportData(result.memorizedReports)
      } else {
        dispatch(SnackBarError(`Something went wrong`))
      }
      setIsLoading(false);
    } catch (error) {
      dispatch(SnackBarError(`Something went wrong`))
      setIsLoading(false);
    }
  }

  const calculateStartAndEndDate = (periodOption:string) => {
    const resultObj: any = {};
    switch (periodOption) {
      case 'recent':
        resultObj['startDate'] = moment().day(0).toDate();
        resultObj['endDate'] = moment().toDate();
        break;
      case 'lastWeek':
        resultObj['startDate'] = moment().subtract(1, 'week').day(0).toDate();
        resultObj['endDate'] = moment().subtract(1, 'week').day(6).toDate();
        break;
      case 'lastWeekToDate':
        resultObj['startDate'] = moment().day(0).subtract(1, 'week').toDate();
        resultObj['endDate'] = moment().toDate();
        break;
      case 'lastMonth':
        resultObj['startDate'] = moment().subtract(1, 'month').date(1).toDate();
        resultObj['endDate'] = moment().subtract(1, 'month').endOf('month').toDate();
        break;
      case 'lastMonthToDate':
        resultObj['startDate'] = moment().subtract(1, 'month').date(1).toDate();
        resultObj['endDate'] = moment().toDate();
        break;
      case 'thisQuarter':
        if([0,1,2].includes(moment().month())){
          resultObj['startDate'] = moment().month(0).date(1).toDate();
          resultObj['endDate'] = moment().month(2).endOf('month').toDate();
        } else if([3,4,5].includes(moment().month())){
          resultObj['startDate'] = moment().month(3).date(1).toDate();
          resultObj['endDate'] = moment().month(5).endOf('month').toDate();
        } else if([6,7,8].includes(moment().month())){
          resultObj['startDate'] = moment().month(6).date(1).toDate();
          resultObj['endDate'] = moment().month(8).endOf('month').toDate();
        } else if([9,10,11].includes(moment().month())){
          resultObj['startDate'] = moment().month(9).date(1).toDate();
          resultObj['endDate'] = moment().month(11).endOf('month').toDate();
        };
        break;
      case 'thisQuarterToDate':
        if([0,1,2].includes(moment().month())){
          resultObj['startDate'] = moment().month(0).date(1);
          resultObj['endDate'] = moment().toDate();
        } else if([3,4,5].includes(moment().month())){
          resultObj['startDate'] = moment().month(3).date(1);
          resultObj['endDate'] = moment().toDate();
        } else if([6,7,8].includes(moment().month())){
          resultObj['startDate'] = moment().month(6).date(1);
          resultObj['endDate'] = moment().toDate();
        } else if([9,10,11].includes(moment().month())){
          resultObj['startDate'] = moment().month(9).date(1);
          resultObj['endDate'] = moment().toDate();
        };
        break;
      case 'lastYear':
        resultObj['startDate'] = moment().subtract(1, 'year').month(0).date(1).toDate();
        resultObj['endDate'] = moment().subtract(1, 'year').month(11).endOf('month').toDate();
        break;
      case 'lastYearToDate':
        resultObj['startDate'] = moment().subtract(1, 'year').month(0).date(1).toDate();
        resultObj['endDate'] = moment().toDate();
        break;
      case 'thisYear':
        resultObj['startDate'] = moment().month(0).date(1).toDate();
        resultObj['endDate'] = moment().month(11).endOf('month').toDate();
        break;
      case 'thisYearToDate':
        resultObj['startDate'] = moment().month(0).date(1).toDate();
        resultObj['endDate'] = moment().toDate();
        break;
      default:
        break;
    }
    return resultObj;
  }

  const runReport = async (params:any) => {
    const paramObject:any = {};
    paramObject.reportType = params.reportType;
    paramObject.reportData = params.reportData;
    paramObject.reportSource = params.reportSource;
    if(params.customerIds?.length){
      paramObject.customerIds = JSON.stringify(params.customerIds);
    }
    if(params?.periodOption){
      const { startDate:start, endDate:end } = calculateStartAndEndDate(params.periodOption)
      let startDate:any = new Date(start)
      const startOffset = startDate.getTimezoneOffset() * 60000;
      startDate = new Date(startDate.getTime() - startOffset);
      let endDate:any = new Date(end)
      const endOffset = endDate.getTimezoneOffset() * 60000;
      endDate = new Date(endDate.getTime() - endOffset);
      paramObject.startDate = startDate.toISOString().slice(0,10);
      paramObject.endDate = endDate.toISOString().slice(0,10);
    } else if(params?.startDate && params?.endDate){
      let startDate:any = new Date(params.startDate)
      const startOffset = startDate.getTimezoneOffset() * 60000;
      startDate = new Date(startDate.getTime() - startOffset);
      let endDate:any = new Date(params.endDate)
      const endOffset = endDate.getTimezoneOffset() * 60000;
      endDate = new Date(endDate.getTime() - endOffset);
      paramObject.startDate = startDate.toISOString().slice(0,10);
      paramObject.endDate = endDate.toISOString().slice(0,10);
    }
    try {
      setIsLoading(true);
      const result = await generateIncomeReport(paramObject);
      if(result.status === 1) {
        setReportData(result);
      } else {
        dispatch(SnackBarError(`Something went wrong`));
      }
      setIsLoading(false);
    } catch (error) {
      dispatch(SnackBarError(`Something went wrong`));
      setIsLoading(false);
    }
    history.replace({state:undefined});
  }

  const handleMenuButtonClick = (event: any, id: number, item: any) => {
    event.stopPropagation();
    const paramObject = {...item};
    switch (id) {
      case 0:
        runReport(paramObject);
        break;
      case 1:
        dispatch(
          setModalDataAction({
            'data': {
              'modalTitle': 'Edit Memorize Report',
              'removeFooter': false,
              'paramObject': paramObject,
            },
            'type': modalTypes.MEMORIZE_REPORT_MODAL,
          })
        );
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;
      case 2:
        dispatch(info('This feature is still under development'));
        break;
      default:
        dispatch(info('This feature is still under development'));
    }
  }

  const handleMenuToolbarListClick = (event: any, id: number) => {
    event.stopPropagation();
    switch (id) {
      case 0:
        setReportData(null);
        break;
      case 1:
        dispatch(info('This feature is still under development'));
        break;
      case 2:
        dispatch(info('This feature is still under development'));
        break;
      default:
        dispatch(info('This feature is still under development'));
    }
  }

  return (
    <div style={{padding: 20}}>
      {isLoading ? (
        <BCCircularLoader heightValue={'20vh'}/>
      ) : reportData ? (
        <div>
          <div className={classes.menuToolbarContainer}>
            <BCMenuToolbarButton
              buttonText='More Actions'
              items={MORE_ITEMS}
              handleClick={handleMenuToolbarListClick}
              />
          </div>
        </div>
      ) : !memorizedReportData.length ? (
        <div>No data</div>
      ) : (
        <>
          <div className={classes.label}>REPORT TYPE</div>
          {memorizedReportData.map((item: any, idx: number) => (
            <div className={classes.reportType} key={idx}>
              <div className={classes.reportName}>
                {item.name}
              </div>
              <BCMenuButton
                icon={MoreHorizIcon}
                items={INITIAL_ITEMS}
                handleClick={(e, id) => handleMenuButtonClick(e, id, item)}
              />
            </div>
          ))}
        </>

      )}
    </div>
  )
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(RevenueMemorizedReport);
