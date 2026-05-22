const axios = require('axios');

const url = 'https://script.google.com/macros/s/AKfycbx_WVXiSBEvS5ARGRNpwt4YvG_NMXsWXYPD2zjhOmgbFAw0vJ4ypDVfwcLI3MPxhxlGpw/exec';

axios.post(url, {
  to: 'test@yopmail.com',
  subject: 'Test',
  html: '<h1>Test</h1>'
}).then(res => {
  console.log('Success:', res.status);
}).catch(err => {
  console.error('Error:', err.response ? err.response.status : err.message);
  if (err.response) {
    console.log('Body:', err.response.data.substring(0, 500));
  }
});
