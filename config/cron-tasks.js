
// async function sendEmail(to, emailContent) {
//   console.log(process.env.GROUPID);
//     await strapi.plugins['email'].services.email.send({
//       to,
        // from: process.env.DEFAULT_FROM,
//       subject: 'New Articles for Your Watchlisted Companies',
//       html: emailContent,
//       asm: {
//         group_id: Number(process.env.GROUPID), // Replace with your Unsubscribe Group ID
      
//       },
//       trackingSettings: {
//         subscriptionTracking: {
//           enable: true,  // Keep this enabled for newsletters
//         },
//       },
     
//     });
//   }

// module.exports = {

   
   
//     myJob: {
//       task: async({ strapi }) => {
//         console.log("hello from cron");


//     // Function to get the start of a month in IST
//     const getISTStartOfMonth = (year, month) => {
//         const date = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // First day of the month at UTC
//         date.setHours(date.getHours() + 5); // Convert to IST
//         date.setMinutes(date.getMinutes() + 30);
//         return date;
//     };

//     const currentDate = new Date();
//     const startOfPreviousMonth = getISTStartOfMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);

    


//     // Fetching users whose plan is not expired and who have watchlists
//     const users = await strapi.entityService.findMany('plugin::users-permissions.user',{
//         filters: {
//           expiry: {
//             $gt: currentDate.toISOString(), // Plan expiry is in the future (not expired)
//           },
//           watchlists:{
//             $notNull:true,
//           },
//         },
//         populate:{
//             watchlists:{
//                 populate:{
//                     company:true,
//                 },
//                 filters:{
//                     publishedAt:{
//                         $notNull:true,
//                     }
//                 }
//             },
//         }
//       });

//       console.log(users);

//       for(let user of users){
//         const watchlistCompanies = user.watchlists.map(watchlist => watchlist.company.id);
//         console.log(watchlistCompanies);

//         //fetching articles added from last month
//         const articles = await strapi.entityService.findMany('api::article.article', {
//             filters: {
//                 primary_companies:{id:{$in:watchlistCompanies}},
//                 publishedAt: {
//                     $gte: startOfPreviousMonth.toISOString(),
//                     $notNull:true,//ensuring the article is published
//                 },
//             },
//             populate:{
//                 article:true,
//             }
//         });

//         console.log(user.first_name);
//         const articleList = articles.map(article => `<li><a href="${process.env.FRONTEND_URL}/transcript/${article.id}"> ${article.title} </a></li>`).join(' ');
//         const emailContent = `
//         <p>Hello ${user.first_name},</p>
//             <p>Here are the new articles published from last month to today for the companies you are watching:</p>
//             <ul>${articleList}</ul>
//          <p>If you no longer wish to receive these emails, you can <a href="<%asm_group_unsubscribe_raw_url%>">click here</a>.</p>    
//         `

//         console.log(emailContent);
//         await sendEmail(user.email, emailContent);
//       }





//     },

//     options: {
//         rule: "1 * * * * *",
//         tz: "Asia/Dhaka",
//       },
//     },

    
//   };