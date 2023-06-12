import { fabRoot } from 'app/pages/main/main.styles';
import {
  LABEL_GREY,
  LIGHT_GREY,
  PRIMARY_GREY,
  TEXT_GREY
} from "../../../constants";
import '../../../scss/variable.css';

export default (): any => ({
  ...fabRoot,
  'root': {
    "& .MuiInputBase-root.Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)"
    },
    width: '80%'
  },
  profilePane: {
    borderRadius: '14px',
    border: `1px solid ${PRIMARY_GREY}`,
    height: '25vh',
    padding: '10px',
    textAlign: 'center',
    width: '100%',
    background: 'white',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
  },
  avatarArea: {
    padding: 20,
    margin: '0 50px',
    backgroundColor: PRIMARY_GREY,
    borderRadius: '50%',
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    alignSelf: 'center',
    '&> img': {
      height: '16vh',
      aspectRatio: 1,
    }
  },
  namePane: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  labelText: {
    color: LABEL_GREY,
    fontWeight: 500,
    fontSize: 18,
    textAlign: 'left',
  },
  companyText: {
    color: TEXT_GREY,
    fontWeight: 700,
    fontSize: 30,
    textAlign: 'left',
  },
  locationPane: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    right: '1rem',
    top: '1rem'
  },
  fieldsPane: {
    borderRadius: '14px',
    border: `1px solid ${PRIMARY_GREY}`,
    width: '100%',
    background: 'white',
    position: 'relative',
    marginTop: '20px',
    //gridAutoRows: 'minmax(100px, auto)',
    padding: 20,
  },
  fieldsPaneContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  fieldPane: {
    display: 'flex',
    flexDirection: 'column',
  },
  filedLabel: {
    color: LABEL_GREY,
    fontWeight: 500,
    fontSize: 16,
    textAlign: 'left',
  },
  fieldText: {
    color: TEXT_GREY,
    fontWeight: 400,
    fontSize: 16,
    textAlign: 'left',
  },
  editProfileIcon: {
    color: LABEL_GREY,
    fontSize: 20,
    backgroundColor: PRIMARY_GREY,
    border: `1px solid ${LABEL_GREY}`,
    borderRadius: 4,
    padding: 2,
  },
  billingAddress: {
    padding: "33px",
    border: "1px solid #D0D3DC",
    borderRadius: "8px",
    marginTop: "55px"
  },
  billingAddressUpdate: {
    border: "1px solid #D0D3DC !important",
    width: "200px",
    height: "38px",
    borderRadius: "8px",
    textTransform: "capitalize"
  }
});
