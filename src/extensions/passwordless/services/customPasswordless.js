// @ts-nocheck

const _=require('lodash');
const uuid = require('uuid');

module.exports = {
    async sendLoginLink(token) {
      const settings = await strapi.plugin('passwordless').service('passwordless').settings();
      const user = await strapi.plugin('passwordless').service('passwordless').fetchUser({ email: token.email });
        

      //console.log("from custom domain");
      const text = await this.template(settings.message_text, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
      });

     
  
      const html = await this.template(settings.message_html, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
      });
  
      const subject = await this.template(settings.object, {
        URL: settings.confirmationUrl,
        CODE: token.body,
        USER: user,
      });
  
      const sendData = {
        to: token.email,
        from:
          settings.from_email && settings.from_name
            ? `${settings.from_name} <${settings.from_email}>`
            : undefined,
        replyTo: settings.response_email,
        subject,
        text,
        html,
        mail_settings:{
          bypass_list_management:{enable:true},
        },
        headers: {
          
          'Message-ID': `<${uuid.v4()}@joinkavi.com>`, 
          'In-Reply-To': `<${uuid.v4()}@joinkavi.com>`,  
          'References':  `<${uuid.v4()}@joinkavi.com>`,  

        }
      };

      // console.log(uuid.v4());
  
      // Send an email to the user.
      // console.log(sendData);
      return await strapi.plugin('email').service('email').send(sendData);
    },
    template(layout, data) {
        const compiledObject = _.template(layout);
        return compiledObject(data);
      }
  
    // Other methods from the passwordless service can be copied here if needed
  };
  