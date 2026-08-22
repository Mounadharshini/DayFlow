export function getAvatarUrl(user) {
  if (user && user.profilePicture && typeof user.profilePicture === 'string' && user.profilePicture.trim().startsWith('http')) {
    return user.profilePicture;
  }
  const name = user?.name || user?.email?.split('@')[0] || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=b37a4c&color=fff4c2&bold=true&size=128`;
}
