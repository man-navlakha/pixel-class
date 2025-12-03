import React from 'react';

// Actually, reusing the ProfileScreen component directly might be tricky if it relies on useLocalSearchParams for 'username'.
// Let's create a wrapper that fetches the current user's username and then renders the ProfileScreen with that username param mocked or passed.

// However, ProfileScreen reads `const { username } = useLocalSearchParams();`.
// If we mount it here, `username` will be undefined.
// We need to refactor ProfileScreen to accept a prop `username` optionally, or handle the case where it's missing by fetching 'me'.
// ProfileScreen ALREADY handles `const targetUser = username || me.username;`.
// So if we mount ProfileScreen here and `username` param is undefined, it should fetch 'me' and work!

// But wait, ProfileScreen is a default export.
// Let's try importing it.

import ProfileContent from '../profile/[username]';

export default function MyProfileTab() {
    return <ProfileContent />;
}
