import TypedMethod from "./TypedMethod";

export default new TypedMethod<{ puzzleId: string, roomId: string }, void>(
  "Puzzles.methods.addDocument",
);
