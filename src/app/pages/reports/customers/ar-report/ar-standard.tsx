import React, {useEffect, useState} from 'react';
import {useDispatch} from "react-redux";
import {Typography, withStyles} from '@material-ui/core';

import styles, {SummaryContainer} from './styles';
import BCCircularLoader
  from "app/components/bc-circular-loader/bc-circular-loader";
import {generateAccountReceivableReport} from 'api/reports.api';
import {error} from 'actions/snackbar/snackbar.action';
import BCDateTimePicker
  from "../../../../components/bc-date-time-picker/bc-date-time-picker";
import BCItemsFilter
  from "../../../../components/bc-items-filter/bc-items-filter";
import {
  abbreviateNumber,
  formatCurrency,
  formatDateYMD
} from "../../../../../helpers/format";
import {GRAY3, PRIMARY_BLUE} from "../../../../../constants";
import ApexChart from 'react-apexcharts';

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

const chartColors = ['#349785', PRIMARY_BLUE, PRIMARY_BLUE, PRIMARY_BLUE, '#F50057']

const ARStandardReport = ({classes}: RevenueStandardProps) => {
  const dispatch = useDispatch();
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
          title: report[key].label,
          value: formatCurrency(report[key].totalUnpaid)
        });
        tempChart.push(report[key].totalUnpaid);
        tempLabels.push(report[key].label.toUpperCase());
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
    } = await generateAccountReceivableReport(1, formatDateYMD(asOfDate));
    if (status === 1) {
      setReport(report);
    } else {
      dispatch(error(message));
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getReportData();
  }, [asOfDate]);

  useEffect(() => {
    if (report) formatReport();
  }, [report, reportType])

  // console.log(chartData)

  return (
    <div style={{padding: '20px 20px 0 20px'}}>
      {isLoading ?
        <BCCircularLoader heightValue={'20vh'}/>
        :
        <>
          <div className={classes.toolbar}>
            <Typography style={{alignSelf: 'center'}}>As Of</Typography>
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
            <BCItemsFilter
              single
              items={INITIAL_ITEMS}
              selected={[reportType]}
              onApply={(values) => setReportType(values[0])}
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
              height={350}
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
