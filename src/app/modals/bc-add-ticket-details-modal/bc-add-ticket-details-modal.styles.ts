import {Theme} from "@material-ui/core/styles";

export default (theme: Theme): any => ({
  relative: {
    position: 'relative',
  },
  addJobTypeButton: {
    width: '100%',
    border: '1px dashed #BDBDBD',
    borderRadius: 8,
    textTransform: 'none',
  },
  removeJobTypeButton: {
    position: 'absolute',
    right: 16,
    top: 28,
  },
  noteContainer: {
    'paddingLeft': '1.5rem',
  },
  lastContent: {
    marginTop: -10,
    marginBottom: 35,
    padding: '10px 16px',
  },
  innerRow: {
    paddingTop: 15,
    paddingRight: 30,
  },
  lastRow: {
    marginBottom: '35px !important',
  },
  actionsList: {
    margin: '4px 0 4px 4px',
    padding: 0,
  },
  taskList: {
    padding: '5px 50px',
  },
  task: {
    padding: '0 0 5px 0 !important',
    // borderBottom: '0.5px solid #E0E0E0',
  },
  editButtonPadding: {
    paddingTop: 20,
  },
  editButton: {
    color: '#828282',
  },
  editButtonText: {
    textTransform: 'none',
  },
  markCompleteContainer: {
    flex: 1,
    textAlign: 'left'
  },
  actionsContainer: {
    flex: 2,
  },
  tableContainer: {
    'maxHeight': '30rem',
    padding : '0 !important',
  },
  popper: {
    '& li[aria-disabled="true"]': {
      '& li[aria-disabled="true"]': {
        paddingTop: 0,
        paddingBottom: 0,
      }
    }
  },
  innerMessageContent: {
    padding: '1rem 0rem',
    width: '100%',
  },
  messageContent: {
    // padding: '0 2rem',
    display: 'flex',
    justifyContent: 'start',
    width: '100%',
  },
  messageContentPadding: {
    padding: '0 1rem',
  },
  main: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  p: {
    fontSize: '14px',
    color: '#828282',
    lineHeight: '16px',
    fontWeight: 400,
  },


  invoiceCheckBoxText: {
    display: 'flex',
  },
  instructions: {
    fontSize: '12px',
    lineHeight: '14px',
  },
  instructions__details: {
    fontSize: '16px',
    lineHeight: '18px',
    textAlign: 'justify',
  },
  imgDiv: {
    height: '150px',
    width: '150px',
    marginLeft: '30px',
    border: '1px solid #828282',
    padding: '10px',
    borderRadius: '8px',
  },
  photos: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
  },

  imageHeight: {
    width: '100%',
    height: '100%'
  },
//   custom style for checkbox
  customcheck: {
    padding: '9px 9px 9px 0px',
  },
  customModalContent: {
    backgroundColor: '#FFF',
    padding: "15px !important",
    margin: "0",
  },
  customHouseDetailsContent: {
    backgroundColor: '#FFF',
    paddingTop: "15px !important",
    paddingLeft: "15px !important",
    margin: "0",
  },
  customModalDataContainer: {
    padding: "0 40px",
  },
  invoiceMessageText: {
    width: '43%',
  },
  invoiceMessageImage: {
    width: '55%',
  },
  customModelPreview: {
    padding: '35px 75px !important',
  },
  horizontalLine: {
    borderColor: '#d0d3dc54',
  },
  width100: {
    width: '100%',
  },
  padding: {
    padding: '14px',
  },
  paddingLeft: {
    paddingLeft: '32px',
  },
  marginTop12: {
    marginTop: '14px',
  },
  note: {
    textAlign: 'justify',
  },
  houseOccupied:{
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '32px',
    fontSize: '14px',
  },
  houseOccupiedText:{
    marginTop: '10px',
    fontSize: '14px',
  }
});
