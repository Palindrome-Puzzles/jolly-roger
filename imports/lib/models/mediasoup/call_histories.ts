import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { huntsMatchingCurrentUser } from '../../../model-helpers';
import CallHistorySchema, { CallHistoryType } from '../../schemas/mediasoup/call_history';
import { FindOptions } from '../base';

const CallHistories = new Mongo.Collection<CallHistoryType>('jr_mediasoup_call_histories');
CallHistories.attachSchema(CallHistorySchema);
if (Meteor.isServer) {
  Meteor.publish('mongo.mediasoup_call_histories', function (
    q: Mongo.Selector<CallHistoryType> = {},
    opts: FindOptions = {}
  ) {
    check(q, Object);
    check(opts, {
      fields: Match.Maybe(Object),
      sort: Match.Maybe(Object),
      skip: Match.Maybe(Number),
      limit: Match.Maybe(Number),
    });

    if (!this.userId) {
      return [];
    }

    return CallHistories.find(huntsMatchingCurrentUser(this.userId, q), opts);
  });
}

export default CallHistories;