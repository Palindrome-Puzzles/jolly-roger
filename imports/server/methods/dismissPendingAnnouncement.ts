import { check } from 'meteor/check';
import PendingAnnouncements from '../../lib/models/PendingAnnouncements';
import dismissPendingAnnouncement from '../../methods/dismissPendingAnnouncement';

dismissPendingAnnouncement.define({
  validate(arg) {
    check(arg, { pendingAnnouncementId: String });

    return arg;
  },

  run({ pendingAnnouncementId }) {
    check(this.userId, String);

    await PendingAnnouncements.removeAsync({
      _id: pendingAnnouncementId,
      user: this.userId,
    });
  },
});
