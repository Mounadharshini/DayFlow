export function getAvatarUrl(user) {
  if (user && (user.role === 'Admin' || user.employeeId === 'EMP-ADMIN' || user.email === 'admin@elyvia.com')) {
    return `https://ui-avatars.com/api/?name=HR+Admin&background=9c6137&color=fff4c2&bold=true&size=128`;
  }
  if (user && user.profilePicture && typeof user.profilePicture === 'string' && user.profilePicture.trim()) {
    const pic = user.profilePicture.trim();
    if (pic.startsWith('http') || pic.startsWith('data:image/') || pic.startsWith('blob:')) {
      return pic;
    }
  }
  const name = user?.name || user?.email?.split('@')[0] || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=b37a4c&color=fff4c2&bold=true&size=128`;
}
