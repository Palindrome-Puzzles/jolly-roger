import { _ } from 'meteor/underscore';
import React from 'react';
import { PuzzleType } from '../../lib/schemas/puzzle';
import { TagType } from '../../lib/schemas/tag';
import PuzzleList from './PuzzleList';
import { puzzleInterestingness } from './puzzle-sort-and-group';

function sortPuzzlesByRelevanceWithinPuzzleGroup(
  puzzles: PuzzleType[],
  sharedTag: TagType | undefined,
  indexedTags: Record<string, TagType>
) {
  let group: string;
  if (sharedTag && sharedTag.name.lastIndexOf('group:', 0) === 0) {
    group = sharedTag.name.slice('group:'.length);
  }
  const sortedPuzzles = puzzles.slice(0);
  sortedPuzzles.sort((a, b) => {
    const ia = puzzleInterestingness(a, indexedTags, group);
    const ib = puzzleInterestingness(b, indexedTags, group);
    if (ia !== ib) {
      return ia - ib;
    } else {
      // Sort puzzles by creation time otherwise.
      return +a.createdAt - +b.createdAt;
    }
  });
  return sortedPuzzles;
}

const RelatedPuzzleList = React.memo(({
  relatedPuzzles, allTags, layout, canUpdate, sharedTag, suppressedTagIds, segmentAnswers,
}: {
  relatedPuzzles: PuzzleType[];
  allTags: TagType[];
  layout: 'grid' | 'table';
  canUpdate: boolean;
  sharedTag: TagType | undefined;
  suppressedTagIds: string[];
  segmentAnswers?: boolean;
}) => {
  // Sort the puzzles within each tag group by interestingness.  For instance, metas
  // should probably be at the top of the group, then of the round puzzles, unsolved should
  // maybe sort above solved, and then perhaps by unlock order.
  const tagIndex = _.indexBy(allTags, '_id');
  const sortedPuzzles = sortPuzzlesByRelevanceWithinPuzzleGroup(
    relatedPuzzles,
    sharedTag,
    tagIndex
  );
  return (
    <PuzzleList
      puzzles={sortedPuzzles}
      allTags={allTags}
      layout={layout}
      canUpdate={canUpdate}
      suppressTags={suppressedTagIds}
      segmentAnswers={segmentAnswers}
    />
  );
});

export default RelatedPuzzleList;
export { RelatedPuzzleList, sortPuzzlesByRelevanceWithinPuzzleGroup };
