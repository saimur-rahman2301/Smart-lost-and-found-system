export const authStore = {
    getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
    getToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },
    clearAuth: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    isAuthenticated: () => !!localStorage.getItem('accessToken'),
    isAdmin: () => {
        const user = authStore.getUser();
        return user && user.role === 'ADMIN';
    }
};
