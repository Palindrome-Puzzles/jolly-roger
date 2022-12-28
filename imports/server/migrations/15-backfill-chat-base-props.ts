import ChatMessages from '../../lib/models/ChatMessages';
import Puzzles from '../../lib/models/Puzzles';
import { PuzzleType } from '../../lib/schemas/Puzzle';
import Migrations from './Migrations';
import dropIndex from './dropIndex';

Migrations.add({
  version: 15,
  name: 'Backfill props from the base schema on chat messages',
  async up() {
    const hunts: Record<string, string> = {};
    Puzzles.find().forEach((p: PuzzleType) => { hunts[p._id] = p.hunt; });

    ChatMessages.findAllowingDeleted(<any>{
      $or: [
        { deleted: null },
        { createdAt: null },
        { createdBy: null },
        { puzzle: null },
        { hunt: null },
      ],
    }).forEach((m) => {
      await ChatMessages.updateAsync(m._id, {
        $set: {
          deleted: m.deleted === undefined ? false : m.deleted,
          puzzle: m.puzzle === undefined ? (<any>m).puzzleId : m.puzzle,
          hunt: m.hunt === undefined ? hunts[m.puzzle] : m.hunt,
          createdAt: m.createdAt === undefined ? m.timestamp : m.createdAt,
          createdBy: m.createdBy === undefined ? m.sender : m.createdBy,
        },
        $unset: {
          puzzleId: 1,
        },
      }, <any>{
        validate: false,
        getAutoValues: false,
      });
    });

    await dropIndex(ChatMessages, 'puzzleId_1_timestamp_-1');
    await ChatMessages.createIndexAsync({ deleted: 1, puzzle: 1 });
  },
});
