import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import Documents from "../../lib/models/Documents";
import MeteorUsers from "../../lib/models/MeteorUsers";
import Puzzles from "../../lib/models/Puzzles";
import addPuzzleDocument from "../../methods/addPuzzleDocument";
import defineMethod from "./defineMethod";

defineMethod(addPuzzleDocument, {
  validate(arg) {
    check(arg, {
      puzzleId: String,
      roomId: String, // currently we only support tldraw rooms
    });
    return arg;
  },

  async run({ puzzleId, roomId }) {
    check(this.userId, String);

    const user = (await MeteorUsers.findOneAsync(this.userId))!;
    const puzzle = await Puzzles.findOneAsync(puzzleId);
    if (!puzzle || !user.hunts?.includes(puzzle.hunt)) {
      throw new Meteor.Error(404, "Unknown puzzle");
    }

    await Documents.insertAsync({
      hunt: puzzle.hunt,
      puzzle: puzzleId,
      provider: "tldraw",
      value: {
        type: "whiteboard",
        id: roomId,
      }
    })
  },
});
