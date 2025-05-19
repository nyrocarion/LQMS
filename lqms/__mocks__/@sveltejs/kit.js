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
  }
};