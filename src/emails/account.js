const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: "huzonforml@gmail.com",
        subject: "Thanks for joining in",
        text: `Welcome to the app, ${name}.`,
    });
};
const sendCancelEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: "huzonforml@gmail.com",
        subject: "Goodbye",
        text: `Goodbye from the app, ${name}.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail,
};