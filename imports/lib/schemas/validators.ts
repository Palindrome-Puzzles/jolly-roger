import { SchemaDefinition } from 'simpl-schema';

const ValidUrl: SchemaDefinition['custom'] = function () {
  // Tests if a URL is valid by attempting to construct a URL object from it.
  if (!this.isSet) return undefined;
  try {
    void (new URL(this.value));
  } catch (err) {
    return 'invalidUrl';
  }
  return undefined;
};

// eslint-disable-next-line import/prefer-default-export
export { ValidUrl };