import { _ } from 'meteor/underscore';
import React from 'react';
import PropTypes from 'prop-types';
import { jQuery } from 'meteor/jquery';
import { withTracker } from 'meteor/react-meteor-data';
import ReactSelect2 from './ReactSelect2.jsx';

const TagEditor = React.createClass({
  // TODO: this should support autocomplete to reduce human error.
  // Probably not going to land this week.
  propTypes: {
    puzzleId: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    allTags: PropTypes.arrayOf(PropTypes.shape(Schemas.Tags.asReactPropTypes())).isRequired,
  },

  componentDidMount() {
    // Focus the input when mounted - the user just clicked on the button-link.
    const input = this.selectNode;
    jQuery(input).select2('open')
      .on('select2:close', this.onBlur)
      .on('select2:select', () => {
        this.props.onSubmit(jQuery(input).val());
      });
  },

  onBlur() {
    // Treat blur as "no I didn't mean to do that".  We may have to change this
    // once we have autocomplete .
    this.props.onCancel();
  },

  render() {
    return (
      <span>
        <ReactSelect2
          selectRef={(node) => { this.selectNode = node; }}
          style={{ minWidth: '100px' }}
          data={[''].concat(_.pluck(this.props.allTags, 'name'))}
          options={{ tags: true }}
        />
      </span>
    );
  },
});

const TagEditorContainer = withTracker(({ puzzleId }) => {
  const puzzle = Models.Puzzles.findOne(puzzleId);
  return { allTags: Models.Tags.find({ hunt: puzzle.hunt }).fetch() };
})(TagEditor);

TagEditorContainer.propTypes = {
  puzzleId: PropTypes.string,
};

export default TagEditorContainer;