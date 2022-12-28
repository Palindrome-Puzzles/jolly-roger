import Ansible from '../Ansible';
import Tags from '../lib/models/Tags';

export default function getOrCreateTagByName(huntId: string, name: string): {
  _id: string,
  hunt: string,
  name: string,
} {
  const existingTag = await Tags.findOneAsync({ hunt: huntId, name });
  if (existingTag) {
    return existingTag;
  }

  Ansible.log('Creating a new tag', { hunt: huntId, name });
  const newTagId = await Tags.insertAsync({ hunt: huntId, name });

  // When creating a `group:*` tag, also ensure a matching `meta-for:` tag exists.
  if (name.startsWith('group:')) {
    const groupName = name.slice('group:'.length);
    const metaTagName = `meta-for:${groupName}`;
    getOrCreateTagByName(huntId, metaTagName);
  }

  return {
    _id: newTagId,
    hunt: huntId,
    name,
  };
}
