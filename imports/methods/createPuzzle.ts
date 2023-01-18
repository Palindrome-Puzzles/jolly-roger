import type { GdriveMimeTypesType } from '../lib/GdriveMimeTypes';
import TypedMethod from './TypedMethod';

export default new TypedMethod<{
  huntId: string,
  title: string,
  url?: string,
  tags: string[],
  expectedAnswerCount: number,
  docType: GdriveMimeTypesType,
}, string>(
  'Puzzles.methods.create'
);
