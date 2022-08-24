import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../../constants";
import {GRAY2, GRAY3, PRIMARY_BLUE} from "../../../../constants";
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
  },
  popper: {
    '& li[aria-disabled="true"]': {
      paddingTop: 0,
      paddingBottom: 0,
    }
  },
  gridWrapper: {
    position: 'relative',
    padding: '20px 50px 0 50px',
    margin: 0,
  },
  innerGrid: {
    padding: '16px 0',
  },
  mapWrapper: {
    height: 200,
  },
  collapseAllButton: {
    position: 'absolute',
    right: 40,
  },
  collapseAllButtonLabel: {
    fontSize: 8,
    color: PRIMARY_BLUE,
  },
  collapseButton: {
    margin: -15,
    // position: 'absolute',
    // right: 55,
    // top: 5
  },
  summaryCaption: {
    textTransform: 'uppercase',
    fontSize: 10,
    color: GRAY3,
  },
  summaryText: {
    fontSize: 14,
    marginTop: 10,
    color: GRAY2,
  },
  summaryTextBig: {
    fontSize: 16,
    marginTop: 9,
    color: PRIMARY_BLUE,
  },
  glassImageWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  },
  glassImage: {
    marginLeft: 10,
    width: 25,
    marginTop: 10,
  },
  frameColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 40,
    border: '1px solid black',
    marginTop: 10,
  },

  chatContainer: {
    height: 412,
    padding: '25px 100px',
    overflow: 'scroll',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      width: 7,
    },
    '&::-webkit-scrollbar-track': {
      background: '#fff',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#EAECF3',
    },
    '@media(max-width: 767px)': {
      'padding': '25px 25px',
    }
  },
  chatItemContainer: {
    marginBottom: 10,
  },
  currentUserChat: {
    display: 'flex',
    flexDirection : 'row-reverse',
    '& div.textbox': {
      flex: 9,
      display: 'flex',
      justifyContent: 'flex-start',
      flexDirection: 'row-reverse'
    },
    '& div.textbox-content': {
      maxWidth: 640,
      color: 'white',
      borderRadius: 5,
      backgroundColor: '#00AAFF',
      padding: '10px 20px',
      fontSize: 14,
      wordBreak:'break-word'
    },
    '& div.arrow': {
      width: 0,
      height: 0,
      position: 'relative',
      top: 7,
      borderTop: '7px solid transparent',
      borderBottom: '7px solid transparent',
      borderLeft: '7px solid #00AAFF',
    },
    '& div.avatar': {
      marginLeft: 10,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start'
    },
    '& div.avatar img': {
      width: 24,
      borderRadius: '50%',
    },
  },
  otherUserChat: {
    display: 'flex',
    flexDirection : 'row',
    '& div.textbox': {
      flex: 9,
      display: 'flex',
      justifyContent: 'flex-start',
    },
    '& div.textbox-content': {
      maxWidth: 640,
      color: '#4f4f4f',
      borderRadius: 5,
      backgroundColor: '#E5F7FF',
      padding: '10px 20px',
      fontSize: 14,
      wordBreak:'break-word'
    },
    '& div.arrow': {
      width: 0,
      height: 0,
      position: 'relative',
      top: 7,
      borderTop: '7px solid transparent',
      borderBottom: '7px solid transparent',
      borderRight: '7px solid #E5F7FF',
    },
    '& div.avatar': {
      marginRight: 10,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    },
    '& div.avatar img': {
      width: 24,
      borderRadius: '50%',
    },
  },
  timeStamp: {
    color: '#BDBDBD',
    fontSize: 10,
  },
  readStatus: {
    color: '#BDBDBD',
    fontSize: 10,
  },
  bottomItemContainer: {
    marginTop: 5,
  },
  imagesContainer: {
    borderTop: '1px solid #D0D3DC',
    display: 'flex',
    position:'absolute',
    bottom:100,
    width:'100%',
    overflow:'auto',
    backgroundColor:'white'
  },
  imageContainer: {
    display:'flex',
    alignItems:'center',
    height: 120,
    marginRight: 20,
  },
  imageNameContainer: {
    whiteSpace: 'nowrap',
    width: 100,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  imageFile: {
    height: 100,
    borderRadius: 5,
    marginRight: 5
  },
  chatInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButton: {
    flex: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    height: 40,
    '& svg': {
      cursor: 'pointer',
    },
    marginBottom:15
  },
  inputContainer: {
    flex: 10,
    margin:'15px 0px',
  },
  textInput: {
    flex: 10,
    padding:15,
    border:'1px solid #EAECF3',
    borderRadius:10,
    height:76
  },
  sendButton: {
    flex: 2,
    display: 'flex',
    justifyContent: 'flex-start',
    height: 40,
    '& svg': {
      cursor: 'pointer',
    },
    marginBottom:15,
    marginLeft:5
  },
});
