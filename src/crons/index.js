import cron from 'node-cron';
import * as authModel from '../models/models.auth.js';

export const deletingUnusedOtps = cron.schedule('*/5 * * * *', async () => {
    try {
        const unusedOtps = await authModel.deleteUnusedOtps();
        console.log(`Unused OTPs cleaned up: ${unusedOtps.rowCount}`);
        return;
    } catch (error) {
        console.error('Error deleting unused OTPs:', error);   
    }
  }, {
  scheduled: true,
  timezone: 'Africa/Lagos' // run every 5 minutes
});

export const sendEmailsToNewUsers = cron.schedule('0 2 * * *', async () => {
    try {
        const newUsers = await authModel.newlySignedUpBlogUsers();
        console.log(`Newly signed up users: ${newUsers.length}`);
        // send email logic here in a for loop
        return;
    } catch (error) {
        console.error('Error sending emails to new users:', error);   
    }
  }, {
  scheduled: true,
  timezone: 'Africa/Lagos' // runs daily at 2am
});


