import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import Ansible from '../ansible.js';

const userForKeyOperation = function userForKeyOperation(currentUser, forUser) {
  const canOverrideUser = Roles.userHasRole(currentUser, 'admin');

  if (forUser && !canOverrideUser) {
    throw new Meteor.Error(403, 'Only operators can fetch other users\' keys');
  }

  return forUser || currentUser;
};

Meteor.methods({
  fetchAPIKey(forUser = undefined) {
    check(this.userId, String);
    check(forUser, Match.Optional(String));

    const user = userForKeyOperation(this.userId, forUser);

    let key = Models.APIKeys.findOne({ user });
    if (!key) {
      // It would be cool to handle this with unique indexes, but we
      // need partial indexes to only match { deleted: false }, and I
      // don't want to assume a new enough version of MongoDB for
      // that.
      Models.Locks.withLock(`api_key:${user}`, () => {
        key = Models.APIKeys.findOne({ user });

        if (!key) {
          Ansible.log('Generating new API key for user', { user, requestedBy: this.userId });
          key = Models.APIKeys.findOne(
            Models.APIKeys.insert({
              user,
              key: Random.id(32),
            })
          );
        }
      });
    }

    return key.key;
  },

  rollAPIKey(forUser = undefined) {
    check(this.userId, String);
    check(forUser, Match.Optional(String));

    const user = userForKeyOperation(this.userId, forUser);
    Models.APIKeys.find({ user }).forEach((k) => {
      Ansible.log('Expiring API key', { id: k._id, user: k.user, requestedBy: this.userId });
      k.destroy();
    });

    return Meteor.call('fetchAPIKey', user);
  },
});