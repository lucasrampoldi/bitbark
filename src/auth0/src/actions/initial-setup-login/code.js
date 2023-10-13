exports.onExecutePostLogin  = async (event,api) => {
  const axios = require("axios");
  await axios.post(`${event.secrets.BACKEND_DOMAIN}/api/initial-setup/projects/default`,
  {
    subject: event.user.identities[0].provider + '|' + event.user.identities[0].user_id
  },{
    headers: {
        'content-type': 'application/json',
        'Authorization': `${event.secrets.API_KEY}`
    }
});

};