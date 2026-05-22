const url = 'https://script.google.com/macros/s/AKfycbx_WVXiSBEvS5ARGRNpwt4YvG_NMXsWXYPD2zjhOmgbFAw0vJ4ypDVfwcLI3MPxhxlGpw/exec';

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  body: JSON.stringify({
    to: 'test@yopmail.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
}).then(async res => {
  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text.substring(0, 500));
}).catch(err => {
  console.error('Fetch error:', err);
});
