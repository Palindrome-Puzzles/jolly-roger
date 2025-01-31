import { faEraser } from "@fortawesome/free-solid-svg-icons/faEraser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useRef, useState } from "react";
import {
  Accordion,
  Badge,
  ButtonToolbar,
  FormLabel,
  InputGroup,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import type { FormControlProps } from "react-bootstrap/FormControl";
import FormControl from "react-bootstrap/FormControl";
import FormGroup from "react-bootstrap/FormGroup";
import { Link, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { indexedById } from "../../lib/listUtils";
import type { PuzzleType } from "../../lib/models/Puzzles";
import Puzzles from "../../lib/models/Puzzles";
import type { TagType } from "../../lib/models/Tags";
import Tags from "../../lib/models/Tags";
import puzzlesForPuzzleList from "../../lib/publications/puzzlesForPuzzleList";
import { computeSolvedness } from "../../lib/solvedness";
import { useBreadcrumb } from "../hooks/breadcrumb";
import useTypedSubscribe from "../hooks/useTypedSubscribe";
import { mediaBreakpointDown } from "./styling/responsive";
import { useTracker } from "meteor/react-meteor-data";
import RelativeTime from "./RelativeTime";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  @media (width < 360px) {
    width: 100%;
  }
`;

const SearchFormGroup = styled(FormGroup)`
  grid-column: -3;
  ${mediaBreakpointDown(
    "sm",
    css`
      grid-column: 1 / -1;
    `,
  )}
`;

const PuzzleListToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em;
`;

const TagPuzzle = React.memo(
  ({ puzzle, allTags }: { puzzle: PuzzleType; allTags: TagType[] }) => {
    const solvedness = computeSolvedness(puzzle);
    const tagIndex = indexedById(allTags);
    const puzzleTags = puzzle.tags.map((tagId) => {
      return tagIndex.get(tagId).name;
    });

    const noteRelativeTime = useTracker(() => {
      return (
        <RelativeTime
          date={puzzle.noteUpdateTs}
          minimumUnit="minute"
          maxElements={2}
        />
      );
    }, [puzzle.noteUpdateTs]);
    const note = puzzle.noteContent ?? null;

    return (
      <Accordion
        defaultActiveKey={
          puzzle.noteUpdateTs ? `puzzle-accordion-${puzzle._id}` : null
        }
      >
        <Accordion.Item eventKey={`puzzle-accordion-${puzzle._id}`}>
          <Accordion.Header>
            {solvedness === "solved" ? (
              <Badge pill bg="success">
                Solved
              </Badge>
            ) : null}
            <Link to={`../puzzles/${puzzle._id}`}>{puzzle.title}</Link>
            <span>
              {puzzle.noteUpdateTs ? (
                <>: Last updated {noteRelativeTime}</>
              ) : (
                <em>: No notes recorded</em>
              )}
            </span>
          </Accordion.Header>
          <Accordion.Body>
            {note ? (
              <Table striped variant="secondary" responsive hover bordered>
                <tr>
                  <td>Flavor text</td>
                  <td>{note.flavor ? note.flavor : null}</td>
                </tr>
                <tr>
                  <td>Who should people contact?</td>
                  <td>{note.contactPerson ? note.contactPerson : null}</td>
                </tr>
                <tr>
                  <td>What&apos;s going on?</td>
                  <td>{note.summary ? note.summary : null}</td>
                </tr>
                <tr>
                  <td>Theories</td>
                  <td>{note.theories ? note.theories : null}</td>
                </tr>
                <tr>
                  <td>Any other solving location?</td>
                  <td>
                    {note.externalLinkUrl ? (
                      <Link to={note.externalLinkUrl}>
                        {note.externalLinkText ?? note.externalLinkUrl}
                      </Link>
                    ) : null}
                  </td>
                </tr>
                <tr>
                  <td>Tags</td>
                  <td>{puzzleTags ? puzzleTags.join(", ") : null}</td>
                </tr>
              </Table>
            ) : (
              "No notes"
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  },
);

const PuzzlesForTagList = React.memo(
  ({ puzzles, allTags }: { puzzles: PuzzleType[]; allTags: TagType[] }) => {
    return (
      <div>
        {puzzles.map((puzzle) => {
          return (
            <TagPuzzle key={puzzle._id} puzzle={puzzle} allTags={allTags} />
          );
        })}
      </div>
    );
  },
);

const NotesPage = () => {
  const huntId = useParams<{ huntId: string }>().huntId!;
  const puzzlesLoading = useTypedSubscribe(puzzlesForPuzzleList, {
    huntId,
    includeDeleted: true,
  });

  const loading = puzzlesLoading();

  const [showSolved, setShowSolved] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");

  useBreadcrumb({ title: "Notes", path: `/hunts/${huntId}/tags` });

  const allPuzzles = useTracker(
    () =>
      Puzzles.find(
        { hunt: huntId },
        { sort: { noteUpdateTs: 1, updatedTimestamp: 1 } },
      ).fetch(),
    [huntId],
  );

  const setShowSolvedString = useCallback(
    (value: string) => {
      setShowSolved(value === "show");
    },
    [setShowSolved],
  );

  const allTags = useTracker(
    () => Tags.find({ hunt: huntId }).fetch(),
    [huntId],
  );

  const compileMatcher = useCallback(
    (searchKeys: string[]): ((p: PuzzleType) => boolean) => {
      const tagNames: Record<string, string> = {};
      allTags.forEach((t) => {
        tagNames[t._id] = t.name.toLowerCase();
      });
      const lowerSearchKeys = searchKeys.map((key) => key.toLowerCase());
      return function (puzzle) {
        const titleWords = puzzle.title.toLowerCase().split(" ");
        return lowerSearchKeys.every((key) => {
          // Every key should match at least one of the following:
          // * prefix of word in title
          // * substring of any answer
          // * substring of any tag
          if (titleWords.some((word) => word.startsWith(key))) {
            return true;
          }

          if (
            puzzle.answers.some((answer) => {
              return answer.toLowerCase().includes(key);
            })
          ) {
            return true;
          }

          const tagMatch = puzzle.tags.some((tagId) => {
            const tagName = tagNames[tagId];
            return tagName?.includes(key);
          });

          if (tagMatch) {
            return true;
          }

          return false;
        });
      };
    },
    [allTags],
  );

  const puzzlesMatchingSearchString = useCallback(
    (puzzles: PuzzleType[]): PuzzleType[] => {
      const searchKeys = searchString.split(" ");
      if (searchKeys.length === 1 && searchKeys[0] === "") {
        // No search query, so no need to do fancy search computation
        return puzzles;
      } else {
        const searchKeysWithEmptyKeysRemoved = searchKeys.filter((key) => {
          return key.length > 0;
        });
        const isInteresting = compileMatcher(searchKeysWithEmptyKeysRemoved);
        return puzzles.filter(isInteresting);
      }
    },
    [searchString, compileMatcher],
  );

  const matchingSearch = puzzlesMatchingSearchString(allPuzzles);

  const searchBarRef = useRef<HTMLInputElement>(null);

  const onSearchStringChange: NonNullable<FormControlProps["onChange"]> =
    useCallback(
      (e) => {
        setSearchString(e.currentTarget.value);
      },
      [setSearchString],
    );

  const clearSearch = useCallback(() => {
    setSearchString("");
  }, [setSearchString]);

  const renderList = useCallback(
    (showPuzzles: PuzzleType[]) => {
      return <PuzzlesForTagList puzzles={showPuzzles} allTags={allTags} />;
    },
    [allTags],
  );

  const puzzlesMatchingSolvedFilter = useCallback(
    (puzzles: PuzzleType[]): PuzzleType[] => {
      if (showSolved) {
        return puzzles;
      } else {
        return puzzles.filter((puzzle) => {
          // Items with no expected answer are always shown, since they're
          // generally pinned administrivia.
          const solvedness = computeSolvedness(puzzle);
          return solvedness !== "solved";
        });
      }
    },
    [showSolved],
  );

  const matchingSearchAndSolved = puzzlesMatchingSolvedFilter(matchingSearch);

  const filterMessage = `Showing ${matchingSearchAndSolved.length} of ${allPuzzles.length} items`;

  return loading ? (
    <span>loading...</span>
  ) : (
    <Container>
      <h1>Notes</h1>
      <FormGroup>
        <FormLabel>Puzzles</FormLabel>
        <ButtonToolbar>
          <StyledToggleButtonGroup
            type="radio"
            name="show-solved"
            defaultValue="show"
            value={showSolved ? "show" : "hide"}
            onChange={setShowSolvedString}
          >
            <ToggleButton
              id="solved-hide-button"
              variant="outline-info"
              value="hide"
            >
              ⚪️ Unsolved
            </ToggleButton>
            <ToggleButton
              id="solved-show-button"
              variant="outline-info"
              value="show"
            >
              🌏 All
            </ToggleButton>
          </StyledToggleButtonGroup>
        </ButtonToolbar>
      </FormGroup>
      <SearchFormGroup>
        <InputGroup>
          <FormControl
            id="jr-puzzle-search"
            as="input"
            type="text"
            ref={searchBarRef}
            placeholder="Filter by title, answer, or tag"
            value={searchString}
            onChange={onSearchStringChange}
          />
          <Button variant="secondary" onClick={clearSearch}>
            <FontAwesomeIcon icon={faEraser} />
          </Button>
        </InputGroup>
      </SearchFormGroup>
      <PuzzleListToolbar>
        <div />
        <div>{filterMessage}</div>
      </PuzzleListToolbar>
      {!loading && renderList(matchingSearchAndSolved)}
    </Container>
  );
};

export default NotesPage;
