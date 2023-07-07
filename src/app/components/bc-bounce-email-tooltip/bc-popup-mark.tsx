import React, { useState } from 'react';
import ExclamationMark from './bc-ExclamationMark';
import Popup from './bc-popup';

const PopupMark: React.FC = () => {
  const [isPopupVisible, setPopupVisible] = useState<boolean>(false);

  const styles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
  };

  const handleMouseHover = (): void => {
    setPopupVisible(true);
  };

  const handleMouseLeave = (): void => {
    setPopupVisible(false);
  };

  return (
    <div style={styles}>
      <ExclamationMark
        mouseEnter={handleMouseHover}
        mouseLeave={handleMouseLeave}
      />
      {isPopupVisible && (
        <Popup mouseEnter={handleMouseHover} mouseLeave={handleMouseLeave} />
      )}
    </div>
  );
};

export default PopupMark;

