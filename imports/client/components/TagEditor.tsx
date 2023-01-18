import { useTracker } from 'meteor/react-meteor-data';
import React, { Suspense, useCallback } from 'react';
import styled from 'styled-components';
import Tags from '../../lib/models/Tags';
import type { PuzzleType } from '../../lib/schemas/Puzzle';
import Loading from './Loading';

// Casting away the React.lazy because otherwise we lose access to the generic parameter
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const Creatable = React.lazy(() => import('react-select/creatable')) as typeof import('react-select/creatable').default;

const TagEditorSpan = styled.span`
  display: inline;
  min-width: 200px;
  flex-basis: 100%;
  margin: 2px 0;
`;

const TagEditor = ({
  puzzle, onSubmit, onCancel,
}: {
  puzzle: PuzzleType;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) => {
  const allTags = useTracker(() => {
    return Tags.find({ hunt: puzzle.hunt }).fetch();
  }, [puzzle.hunt]);

  const onBlur = useCallback(() => {
    // Treat blur as "no I didn't mean to do that".  We may have to change this
    // once we have autocomplete .
    onCancel();
  }, [onCancel]);

  const options = allTags
    .map((t) => t.name)
    .filter(Boolean)
    .map((t) => {
      return { value: t, label: t };
    });

  return (
    <Suspense fallback={<Loading inline />}>
      <TagEditorSpan>
        <Creatable
          options={options}
          autoFocus
          openMenuOnFocus
          onChange={(v) => v && onSubmit(v.value)}
          onBlur={onBlur}
        />
      </TagEditorSpan>
    </Suspense>
  );
};

export default TagEditor;
