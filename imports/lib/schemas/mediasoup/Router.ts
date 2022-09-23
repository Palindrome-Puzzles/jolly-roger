import * as t from 'io-ts';
import { BaseCodec, BaseOverrides } from '../Base';
import { Id } from '../regexes';
import { Overrides, buildSchema, inheritSchema } from '../typedSchemas';

const RouterFields = t.type({
  hunt: t.string,
  call: t.string,
  createdServer: t.string,
  routerId: t.string, // mediasoup identifier
  rtpCapabilities: t.string, // JSON-encoded
});

const RouterFieldsOverrides: Overrides<t.TypeOf<typeof RouterFields>> = {
  hunt: {
    regEx: Id,
    denyUpdate: true,
  },
  call: {
    regEx: Id,
    denyUpdate: true,
  },
  createdServer: {
    regEx: Id,
    denyUpdate: true,
  },
  routerId: {
    regEx: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    denyUpdate: true,
  },
  rtpCapabilities: {
    denyUpdate: true,
  },
};

const [RouterCodec, RouterOverrides] = inheritSchema(
  BaseCodec,
  RouterFields,
  BaseOverrides,
  RouterFieldsOverrides,
);

export { RouterCodec };
export type RouterType = t.TypeOf<typeof RouterCodec>;

export default buildSchema(RouterCodec, RouterOverrides);
