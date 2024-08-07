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
  
  
      console.log("in lifecycle");
      console.log(updatedUser.role);
      console.log(data);
  
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
  
        console.log("members",memberUsers);
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
  