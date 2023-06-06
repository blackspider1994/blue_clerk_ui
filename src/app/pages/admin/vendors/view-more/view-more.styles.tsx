import { Theme } from '@material-ui/core/styles';
import { swipe_wrapper, dataContainer, fabRoot, pageContainer, pageContent, pageMainContainer, topActionBar } from 'app/pages/main/main.styles';
import {
  LIGHT_GREY,
  MENU_TEXT_COLOR,
  PRIMARY_GREEN
} from "../../../../../constants";
export default (theme: Theme): any => ({
  ...fabRoot,
  ...pageContent,
  ...pageMainContainer,
  ...pageContainer,
  ...topActionBar,
  ...dataContainer,
  ...swipe_wrapper,

  tableCellWrap: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    minWidth: 250,
  },
  switchContainer: {
    border: `1px solid ${LIGHT_GREY}`,
    borderRadius: 20,
    marginRight: 10,
    paddingRight: 10,
  },
  displayNameContainer: {
    marginLeft: 10,
    width: '27rem'
  },
  switchLabelInActive: {
    color: MENU_TEXT_COLOR,
  },
  switchLabelActive: {
    color: PRIMARY_GREEN,
  },
  displayNameInput: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});
