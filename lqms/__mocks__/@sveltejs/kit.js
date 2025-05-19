// __mocks__/@sveltejs/kit.js
module.exports = {
  redirect: (status, location) => {
    const err = new Error(`Redirect to ${location}`);
    err.status = status;
    throw err;
  },
  error: (status, message) => {
    const err = new Error(message);
    err.status = status;
    throw err;
  },
  fail: (status, body) => {
    const err = new Error(body?.error ?? 'Mocked fail');
    err.status = status;
    throw err;
  },
  json: (body, init = {}) => ({
    ...init,
    body,
  }),
};