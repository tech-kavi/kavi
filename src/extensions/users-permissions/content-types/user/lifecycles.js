// @ts-nocheck

// ./extensions/users-permissions/content-types/user/lifecycles.js

module.exports = {

  

    async afterUpdate(event) {
      
      const { result, params } = event;
      
      // Destructure the updated data and the previous data
      const { data } = params;
      // const updatedUser = result;
      const updatedUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: result.id },
        populate: ['role'],
      });
  
  
      // console.log("in lifecycle");
      // console.log(data);
      // console.log(updatedUser.role);
      // console.log(updatedUser);
      // console.log(data);

      if (data.password) { // Check if the password field was updated
        // console.log("in password change email function");
        try {
          // console.log(updatedUser.email);
          // Send the email to the user
          await strapi.plugins['email'].services.email.send({
            to: updatedUser.email,
            from: `KAVI <${process.env.DEFAULT_FROM}>`,
            subject: '[KAVI] Your password has been changed',
            text: 'Your password has been successfully changed. If you did not request this change, please contact support.',
            html:`<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Change Notification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Avenir:wght@300;400;600&display=swap');
    
    body {
      font-family: 'Avenir', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      text-align: center;
    }

    .logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .content {
      color: #333333;
      text-align: left;
    }

    .content h1 {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
    }

    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 10px 0;
    }

    .content a {
      color: #313D74;
      text-decoration: underline;
    }

    .footer {
      font-size: 14px;
      color: #333333;
      margin-top: 30px;
      text-align: left;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="logo">
      <img src="https://dazzling-butterfly-f3a6f1abbb.media.strapiapp.com/Reset_and_amp_Forgot_password_icon_1d17469a0c.png" width="120px"/>
    </div>
    <div class="content">
      <h1>Your password has changed</h1>
      <p>Hello ${updatedUser.first_name},</p>
      <p>We wanted to inform you that your password has been recently changed.</p>
      <p>You can now <a href=${process.env.FRONTEND_URL}>login</a> with your new password.</p>
      <p>If you did not make this change, please contact our support team at <a href="mailto:support@joinkavi.com">support@joinkavi.com</a>.</p>
    </div>
    <div class="footer">
      <p>Regards,</p>
      <p>KAVI Team</p>
    </div>
  </div>
</body>

</html>
`
          });
        } catch (err) {
          strapi.log.error('Failed to send password change notification email:', err);
        }
      }
  
      // Check if the user has the "authenticated" role and the expiry field is updated
      if (updatedUser.role && updatedUser.role.type === 'admin' && data.expiry) {
        const orgID = updatedUser.orgID;
        
  
        console.log("user is authenticated");
        // Find all "member" users with the same orgId
        const memberUsers = await strapi.query('plugin::users-permissions.user').findMany({
          where: {
            orgID,
            role: {
              type: 'authenticated'
            }
          }
        });
  
        // console.log("members",memberUsers);
        // Update the expiry field for each "member" user
        await Promise.all(
          memberUsers.map(async (member) => {
            await strapi.query('plugin::users-permissions.user').update({
              where: { id: member.id },
              data: { expiry: data.expiry },
            });
          })
        );
      }
    },
  };
  