export const environment = {
  production: false,
  api: {
    base: '/api',
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      forgotPassword: '/auth/forgot-password',
      profile: '/auth/profile',
    },
    cats: {
      breeds: '/cats/breeds',
      breedsSearch: '/cats/breeds/search',
      breedById: (id: string) => `/cats/breeds/${id}`,
      breedImages: (id: string) => `/cats/breeds/${id}/images`,
      breedsTable: '/cats/breeds-table',
  }
  },
};
