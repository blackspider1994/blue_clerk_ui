import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, Typography, withStyles} from '@material-ui/core';

import styles, {SummaryContainer} from './styles';
import BCCircularLoader
  from "app/components/bc-circular-loader/bc-circular-loader";
import {
  generateAccountReceivablePdfReport,
  generateAccountReceivableReport
} from 'api/reports.api';
import {error, info} from 'actions/snackbar/snackbar.action';
import BCDateTimePicker
  from "../../../../components/bc-date-time-picker/bc-date-time-picker";
import BCItemsFilter
  from "../../../../components/bc-items-filter/bc-items-filter";
import {
  abbreviateNumber,
  formatCurrency,
  formatDateYMD
} from "../../../../../helpers/format";
import {GRAY3, modalTypes, PRIMARY_BLUE} from "../../../../../constants";
import ApexChart from 'react-apexcharts';
import BCMenuToolbarButton from "../../../../components/bc-menu-toolbar-button";
import {
  openModalAction,
  setModalDataAction
} from "../../../../../actions/bc-modal/bc-modal.action";
import {useHistory, useParams} from "react-router-dom";
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';

interface RevenueStandardProps {
  classes: any;
}

interface ReportData {
  title: string;
  value: string;
}

const INITIAL_ITEMS = [
  {id: '0', value: 'Aging'},
  {id: '1', value: 'Past Due'},
];

const MORE_ITEMS = [
  {id: 0, title:'Customize'},
  {id: 1, title:'Export to PDF'},
  {id: 2, title:'Send Report'},
]

const chartColors = ['#349785', PRIMARY_BLUE, PRIMARY_BLUE, PRIMARY_BLUE, '#F50057']

const ARStandardReport = ({classes}: RevenueStandardProps) => {
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState('0');
  const [report, setReport] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [xLabels, setXLabels] = useState<string[]>([]);
  const [asOfDate, setAsOfDate] = useState(new Date());

  const chartOptions = {
    chart: {
      height: 350,
      type: 'bar' as 'bar',
      zoom: {
        enabled: true,
        type: 'x' as 'x',
      },
      toolbar: {
        show: false,
        tools: {
          download: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
        },
      },

    },

    legend: {
      horizontalAlign: 'left' as 'left',
      itemMargin: {
        horizontal: 15,
      },
      customLegendItems: reportType === '0' ? ['Current', '1 - 90 Days Past Due', '91 and Over'] : ['Past Due'],
      markers: {
        fillColors: reportType === '0' ? ['#349785', PRIMARY_BLUE, '#F50057'] : [PRIMARY_BLUE],
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        distributed: true,
        columnWidth: '40%',
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },

    colors: reportType === '0' ? chartColors : [PRIMARY_BLUE],

    dataLabels: {
      enabled: true,
      formatter: (val: any) => formatCurrency(val),
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: reportType === '0' ? chartColors : [PRIMARY_BLUE],
      }
    },

    grid: {
      position: 'back' as 'back',
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      }
    },

    xaxis: {
      // type: 'category' as 'category',
      position: 'bottom',
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
        offsetY: -20,
      },
      // tickAmount: 3,
      tickPlacement: 'between',
      style: {
        color: GRAY3,
        textTransform: 'uppercase',
      },
      labels: {
        show: true,
        style: {
          colors: GRAY3,
        }
      },
      tooltip: {
        enabled: true,
      }
    },

    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: true,
        formatter: (val: any) => `$${abbreviateNumber(val, 2)}`,
      },
      style: {
        colors: [GRAY3],
      }
    },

    tooltip: {
      enabled: true,
      intersect: false,
    }
  }

  const formatReport = () => {
    const temp: ReportData[] = [];
    const tempChart: any[] = [];
    const tempLabels: string[] = [];
    temp.push({
      title: 'total unpaid',
      value: formatCurrency(report.totalUnpaid - (reportType === '0' ? 0 : report.globalAgingBuckets.agingCurrent.totalUnpaid)),
    });

    Object.keys(report.globalAgingBuckets).forEach((key, index) => {
      if (reportType === '0' || index > 0) {
        temp.push({
          title: report[key].label.substr(0, 11),
          value: formatCurrency(report[key].totalUnpaid)
        });
        tempChart.push(report[key].totalUnpaid);
        tempLabels.push(report[key].label.substr(0, 11).toUpperCase());
      }
    });
    setReportData(temp);
    setChartData([{name: 'Unpaid', data: tempChart}]);
    setXLabels(tempLabels);
  }

  const getReportData = async () => {
    setIsLoading(true);
    const {
      status,
      report,
      message
    } = await generateAccountReceivableReport(1, formatDateYMD(asOfDate),undefined,currentDivision.params);
    if (status === 1) {
      setReport(report);
    } else {
      dispatch(error(message));
    }
    setIsLoading(false);
  }

  const generatePdfReport = async() => {
    try {
      setIsLoading(true);
      const {
        status,
        reportUrl,
        message
      } = await generateAccountReceivablePdfReport(1, formatDateYMD(asOfDate),undefined,currentDivision.params);
      if (status === 1) {
        window.open(reportUrl)
      } else {
        dispatch(error(message));
      }
    } catch (e) {
      dispatch(error(e.message));
    } finally {
      setIsLoading(false);
    }
  }

  const handleMenuToolbarListClick = (event: any, id: number) => {
    event.stopPropagation();
    switch (id) {
      case 0:
        dispatch(
          setModalDataAction({
            'data': {
              'modalTitle': 'Customized A/R Report',
              'removeFooter': false
            },
            'type': modalTypes.CUSTOMIZE_AR_REPORT_MODAL,
          })
        );
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;
      case 1:
        generatePdfReport();
        break;
      case 2:
        dispatch(
          setModalDataAction({
            'data': {
              modalTitle: 'Send this Report',
              removeFooter: false,
              reportName: 'ar',
              reportData: {
                reportData: 1,
                asOf: formatDateYMD(asOfDate),
              }
            },
            'type': modalTypes.EMAIL_REPORT_MODAL,
          })
        );
        setTimeout(() => {
          dispatch(openModalAction());
        }, 200);
        break;
      default:
        dispatch(info('This feature is still under development'));
    }
  };

  const generateCustomReport = () => {
    history.push({
      pathname: '/main/reports/ar',
      state: {type: 'custom', asOf: asOfDate, customers: []}
    });
  }

  useEffect(() => {
    getReportData();
  }, [asOfDate]);

  useEffect(() => {
    if (report) formatReport();
  }, [report, reportType])

  return (
    <div style={{padding: '20px 20px 0 20px', height: '85vh'}}>
      {isLoading ?
        <BCCircularLoader heightValue={'20vh'}/>
        :
        <>
          <div className={classes.toolbar}>
            <Typography style={{alignSelf: 'center', marginRight: 5}}>As of</Typography>
            <div style={{width: 300}}>
              <BCDateTimePicker
                // label="As Of"
                className={'due_date'}
                handleChange={(date: Date) => {if (date && !isNaN(date.getTime())) setAsOfDate(date)}}
                name={'dueDate'}
                id={'asOf'}
                placeholder={'Date'}
                value={asOfDate}
              />
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <BCItemsFilter
              single
              items={INITIAL_ITEMS}
              selected={[reportType]}
              onApply={(values) => setReportType(values[0])}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button
              color="primary"
              variant="outlined"
              onClick={generateCustomReport}
            >Generate Report</Button>

            <div className={classes.menuToolbarContainer} />
            <BCMenuToolbarButton
              buttonText='More Actions'
              items={MORE_ITEMS}
              handleClick={handleMenuToolbarListClick}
            />
          </div>

          <SummaryContainer>
            {reportData.map((data, index) => <div key={data.title}>
                <p
                  className={index === 0 ? classes.valueBig : classes.value}>{data.value}</p>
                <p className={classes.label}>{data.title}</p>
              </div>
            )}
          </SummaryContainer>
          <div id="chart">
            <ApexChart
              options={{...chartOptions, xaxis: {...chartOptions.xaxis, categories: xLabels}}}
              series={chartData}
              type="bar"
              height={370}
            />
          </div>
        </>
      }
    </div>
  )
}

export default withStyles(
  styles,
  {'withTheme': true}
)(ARStandardReport);
