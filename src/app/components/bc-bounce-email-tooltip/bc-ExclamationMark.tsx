import React from 'react';

interface ExclamationMarkProps {
  mouseEnter: () => void;
  mouseLeave: () => void;
}

const ExclamationMark: React.FC<ExclamationMarkProps> = ({
  mouseEnter,
  mouseLeave,
}) => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      width: '20px',
    },
    exclamation: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'red',
      width: '100%',
      display: 'block',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <span
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        style={styles.exclamation}
      >
        !
      </span>
    </div>
  );
};

export default ExclamationMark;

