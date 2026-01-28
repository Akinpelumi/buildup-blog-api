import client from '../../config/email/index.js';

const sendEmail = async(email, subject, content) => {
  const msg = {
    To: email.trim().toLowerCase(),
    From: `${process.env.POSTMARK_SENDER_EMAIL}`,
    Subject: subject,
    HtmlBody: content,
    ReplyTo: process.env.POSTMARK_REPLY_TO,
  };
  try {
    if (process.env.NODE_ENV !== 'test') {
      await client.sendEmail(msg);
      console.log(`Email sent to ${email}`);
    }
    return;
  } catch (error) {
    console.log(`Error sending mail :: ${error}`);
  }
};

export default sendEmail;