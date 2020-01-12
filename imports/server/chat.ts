import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import ChatMessages from '../lib/models/chats';
import Hunts from '../lib/models/hunts';
import Profiles from '../lib/models/profiles';
import Puzzles from '../lib/models/puzzles';
import { postSlackMessage } from './slack';

Meteor.methods({
  sendChatMessage(puzzleId: unknown, message: unknown) {
    check(this.userId, String);
    check(puzzleId, String);
    check(message, String);

    const puzzle = Puzzles.findOne(puzzleId);
    if (!puzzle) {
      throw new Meteor.Error(404, 'Unknown puzzle');
    }

    ChatMessages.insert({
      puzzle: puzzleId,
      hunt: puzzle.hunt,
      text: message,
      sender: this.userId,
      timestamp: new Date(),
    });

    this.unblock();

    const hunt = Hunts.findOne(puzzle.hunt)!;

    if (hunt.firehoseSlackChannel) {
      const profile = Profiles.findOne(this.userId);
      let username = null;
      if (profile && profile.slackHandle) {
        username = profile.slackHandle;
      } else if (profile && profile.displayName) {
        username = profile.displayName;
      } else {
        username = this.userId;
      }

      const url = Meteor.absoluteUrl(`hunts/${puzzle.hunt}/puzzles/${puzzleId}`);
      let title = puzzle.title;
      if (title.length > 25) {
        title = `${title.substring(0, 24)}…`;
      }

      const slackMessage = message.replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;');
      const slackText = `[<${url}|${title}>] ${slackMessage}`;

      postSlackMessage(slackText, hunt.firehoseSlackChannel, username);
    }
  },
});
