import moment from 'moment';

export const formatDate = (date: Date) => moment(date).format('MM/DD/YYYY');

export const formatTime = (time: Date) => moment(time).format('hh:mm a')
