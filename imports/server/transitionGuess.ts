import type { Mongo } from 'meteor/mongo';
import { contentFromMessage } from '../lib/models/ChatMessages';
import Guesses from '../lib/models/Guesses';
import type { GuessType } from '../lib/models/Guesses';
import Puzzles from '../lib/models/Puzzles';
import GlobalHooks from './GlobalHooks';
import sendChatMessageInternalV2 from './sendChatMessageInternalV2';

export default async function transitionGuess(
  guess: GuessType,
  newState: GuessType['state'],
  additionalNotes?: string,
) {
  if (newState === guess.state) return;

  const update: Mongo.Modifier<GuessType> = {
    $set: {
      state: newState,
      additionalNotes,
    },
  };
  if (!additionalNotes) {
    update.$unset = {
      additionalNotes: 1,
    };
  }
  await Guesses.updateAsync(guess._id, update);

  let stateDescription;
  switch (newState) {
    case 'intermediate':
      stateDescription = 'as a correct intermediate answer';
      break;
    default:
      stateDescription = `as ${newState}`;
      break;
  }
  const message = `Guess \`${guess.guess}\` was marked ${stateDescription}${additionalNotes ? `: ${additionalNotes}` : ''}`;
  const content = contentFromMessage(message);
  await sendChatMessageInternalV2({ puzzleId: guess.puzzle, content, sender: undefined });

  if (newState === 'correct') {
    // Mark this puzzle as solved.
    await Puzzles.updateAsync({
      _id: guess.puzzle,
    }, {
      $addToSet: {
        answers: guess.guess,
      },
    });
    await GlobalHooks.runPuzzleSolvedHooks(guess.puzzle, guess.guess);
  } else if (guess.state === 'correct') {
    // Transitioning from correct -> something else: un-mark that puzzle as solved.
    await Puzzles.updateAsync({
      _id: guess.puzzle,
    }, {
      $pull: {
        answers: guess.guess,
      },
    });
    await GlobalHooks.runPuzzleNoLongerSolvedHooks(guess.puzzle, guess.guess);
  }
}
