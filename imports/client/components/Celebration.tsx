import React, { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface CelebrationProps {
  url: string;
  title: string;
  answer: string;
  playAudio: boolean;
  onClose: () => void;
}

const Celebration = (props: CelebrationProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onClose = useCallback(() => {
    if (props.onClose) {
      props.onClose();
    }
  }, [props.onClose]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    // Dismiss the celebration on esc
    if (e.keyCode === 27) {
      onClose();
    }
  }, [onClose]);

  const maybeClose = useCallback((e: React.MouseEvent) => {
    // Dismiss the celebration if you click on the overlay div (outside the content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Automatically dismiss self after 7 seconds
  useEffect(() => {
    const timer = window.setTimeout(() => { onClose(); }, 7000);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // Allow pressing escape key to close the overlay
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    // Steal focus to the close button on display
    const closeButton = closeButtonRef.current;
    if (closeButton) {
      closeButton.focus();
    }
  });

  return (
    <div className="celebration-overlay" onClick={maybeClose}>
      <div className="celebration">
        <button type="button" className="close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <span aria-hidden="true">×</span>
        </button>
        {props.playAudio ? <audio src="/audio/applause.mp3" autoPlay /> : null}
        <h1>
          We solved
          {' '}
          <Link to={props.url}>{props.title}</Link>
          !
        </h1>
        <h2>
          Answer:
          {' '}
          <span className="answer">{props.answer}</span>
        </h2>
      </div>
    </div>
  );
};

export default Celebration;
