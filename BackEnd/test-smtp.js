const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'yambayjosue@gmail.com',
    pass: 'sbfz mxum wctc oyxh' // Using spaces as provided
  }
});

transporter.verify()
  .then(() => {
    console.log('✅ SMTP con espacios funcionó');
  })
  .catch(err => {
    console.error('❌ Falló con espacios:', err.message);
    
    console.log('Probando sin espacios...');
    const transporter2 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'yambayjosue@gmail.com',
        pass: 'sbfzmxumwctcoyxh' // Sin espacios
      }
    });
    
    transporter2.verify()
      .then(() => console.log('✅ SMTP SIN espacios funcionó'))
      .catch(err => console.error('❌ Falló también sin espacios:', err.message));
  });
