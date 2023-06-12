import { fabRoot, pageContent, pageMainContainer, pageContainer, } from 'app/pages/main/main.styles';
export default (): any => ({
  ...fabRoot,
  ...pageContent,
  ...pageMainContainer,
  ...pageContainer,
  "addButtonArea": {
    transform: "translateY(100%)"
  }
});
