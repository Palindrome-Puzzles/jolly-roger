import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

interface CelebrationProps {
  url: string;
  title: string;
  answer: string;
  playAudio: boolean;
  onClose: () => void;
}

class Celebration extends React.Component<CelebrationProps> {
  private timer?: number;

  static propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    playAudio: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.timer = window.setTimeout(() => { this.onClose(); }, 7000);
  }

  componentWillUnmount() {
    window.clearTimeout(this.timer);
  }

  onClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  maybeClose = (e: React.MouseEvent) => {
    // Dismiss the celebration if you click on the overlay div (outside the content)
    if (e.target === e.currentTarget) {
      this.onClose();
    }
  };

  render() {
    return (
      <div className="celebration-overlay" onClick={this.maybeClose}>
        <div className="celebration">
          <button type="button" className="close" onClick={this.onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
          {this.props.playAudio ? <audio src="/audio/applause.mp3" autoPlay /> : null}
          <h1>
            We solved
            {' '}
            <Link to={this.props.url}>{this.props.title}</Link>
            !
          </h1>
          <h2>
            Answer:
            {' '}
            <span className="answer">{this.props.answer}</span>
          </h2>
        </div>
      </div>
    );
  }
}

export default Celebration;
