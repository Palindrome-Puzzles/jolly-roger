import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import Ansible from '../../Ansible';
import Announcements from '../../lib/models/Announcements';
import MeteorUsers from '../../lib/models/MeteorUsers';
import PendingAnnouncements from '../../lib/models/PendingAnnouncements';
import { userMayAddAnnouncementToHunt } from '../../lib/permission_stubs';
import postAnnouncement from '../../methods/postAnnouncement';

postAnnouncement.define({
  validate(arg) {
    check(arg, {
      huntId: String,
      message: String,
    });

    return arg;
  },

  run({ huntId, message }) {
    check(this.userId, String);

    if (!userMayAddAnnouncementToHunt(this.userId, huntId)) {
      throw new Meteor.Error(401, `User ${this.userId} may not create announcements for hunt ${huntId}`);
    }

    Ansible.log('Creating an announcement', { user: this.userId, hunt: huntId, message });
    const id = await Announcements.insertAsync({
      hunt: huntId,
      message,
    });

    MeteorUsers.find({ hunts: huntId }).forEach((user) => {
      await PendingAnnouncements.insertAsync({
        hunt: huntId,
        announcement: id,
        user: user._id,
      });
    });
  },
});
