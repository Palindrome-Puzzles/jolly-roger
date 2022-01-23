import { useSubscribe, useTracker } from 'meteor/react-meteor-data';
import React from 'react';
import MeteorUsers from '../../lib/models/meteor_users';
import { useBreadcrumb } from '../hooks/breadcrumb';
import ProfileList from './ProfileList';

const AllProfileListPage = () => {
  useBreadcrumb({ title: 'Users', path: '/users' });
  const profilesLoading = useSubscribe('profiles');
  const loading = profilesLoading();

  const users = useTracker(() => {
    return loading ? [] : MeteorUsers.find({}, { sort: { 'profile.displayName': 1 } }).fetch();
  }, [loading]);

  if (loading) {
    return <div>loading...</div>;
  }
  return <ProfileList users={users} />;
};

export default AllProfileListPage;
