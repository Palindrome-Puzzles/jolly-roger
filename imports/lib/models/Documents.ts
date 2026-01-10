import { z } from "zod";
import { foreignKey } from "./customTypes";
import type { ModelType } from "./Model";
import SoftDeletedModel from "./SoftDeletedModel";
import withCommon from "./withCommon";
import { GoogleDocumentValueSchema } from "./GoogleDocSchema";

// 1. Add "whiteboard" to the list of allowed document types
export const DOCUMENT_TYPES = ["spreadsheet", "document", "drawing", "whiteboard"];

// 2. Define the schema for the tldraw value
// We mainly just need the 'id' (the room ID) to construct the URL.
const TldrawDocumentValueSchema = z.object({
  id: z.string().min(1),
  type: z.literal("whiteboard"),
  markedPrimaryTs: z.date().optional(),
});

const DocumentSchema = withCommon(
  z
    .object({
      hunt: foreignKey,
      puzzle: foreignKey,
    })
    .and(
      z.discriminatedUnion("provider", [
        z.object({
          provider: z.literal("google"),
          value: GoogleDocumentValueSchema,
        }),
        z.object({
          provider: z.literal("tldraw"),
          value: TldrawDocumentValueSchema,
        }),
      ]),
    ),
);

const Documents = new SoftDeletedModel("jr_documents", DocumentSchema);
Documents.addIndex({ deleted: 1, puzzle: 1 });
Documents.addIndex({ "value.id": 1 });
export type DocumentType = ModelType<typeof Documents>;

export default Documents;
