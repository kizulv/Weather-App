export const APP_ROUTES = {
  home: "/",
  login: "/login",
  weather: "/weather",
  defaults: {
    authenticated: "/weather",
  },
  api: {
    authLogin: "/api/auth/login",
  },
} as const
