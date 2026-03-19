'use strict';

/**
 * shared-highlight controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shared-highlight.shared-highlight',{
    // async create(ctx){
    //     const user = ctx.state.user;
    //     if(!user){
    //         return ctx.badRequest('Please login.');
    //     }

        
        
    //     try{
    //         const {data} = ctx.request.body;
    //         const articleId = data?.articleId;
    //         const recipients = data?.recipient?.connect || [];



    //         if (!articleId) {
    //             return ctx.badRequest('Article ID is required.');
    //         }

    //         //fetch all users of same organisation
    //        // console.log(user);
    //         const sameOrgUsers = await strapi.entityService.findMany('plugin::users-permissions.user',{
    //             filters:{
    //                 orgID:user.orgID,
    //             },
    //             fields: ['id', 'email'],
    //         });

            
            

    //         if (!Array.isArray(recipients) || recipients.length === 0) {
    //             return ctx.badRequest('At least one recipient is required.');
    //         }
    //         else{
    //             const sameOrgUserIds = sameOrgUsers.map(user => user.id);

    //             const allRecipientsAreInSameOrg = recipients.every(recipient => sameOrgUserIds.includes(recipient));

    //             if(!allRecipientsAreInSameOrg)
    //             {
    //                 return ctx.badRequest("One or more recipients are not part of your organization.");
    //             }

    //         }

    //          // Step 1: Find shared highlights matching sender, articleId, and recipient list
    //         const highlightsToDelete = await strapi.entityService.findMany('api::shared-highlight.shared-highlight', {
    //             filters: {
    //             sender: { id: user.id },
    //             articleId,
    //             recipient: { id: { $in: recipients } },
    //             },
    //             fields: ['id'],
    //             limit: -1,
    //         });
           
    //         //  Fetch highlights of the current user for the given articleId
    //         const sharedHighlights = await strapi.entityService.findMany('api::highlight.highlight', {
    //             filters: {
    //             user: user.id,
    //             articleId: articleId
    //             },
    //             limit:-1,
    //         });

    //         if (!sharedHighlights || sharedHighlights.length === 0) {
    //             return ctx.badRequest("No highlights to share for this transcript.");
    //         }

    //         // Step 2: Extract highlight IDs
    //         const highlightIds = highlightsToDelete.map(h => h.id);

    //         // Step 3: Delete only the fetched highlights
    //         if (highlightIds.length > 0) {
    //             await strapi.db.query('api::shared-highlight.shared-highlight').deleteMany({
    //             where: { id: { $in: highlightIds } },
    //             });
    //         }

    //          //  Share each highlight with each recipient
    //     for (const recipient of recipients) {
    //         for (const highlight of sharedHighlights) {
    //             await strapi.entityService.create('api::shared-highlight.shared-highlight', {
    //                 data: {
    //                     articleId: highlight.articleId,
    //                     sender: user.id,
    //                     recipient: recipient,
    //                     answerId: highlight.answerId,
    //                     start: highlight.start,
    //                     end: highlight.end,
    //                     text: highlight.text,
    //                     type: highlight.type,
    //                     publishedAt: new Date(),
    //                 },
    //             });
    //         }
    //     }
    //         return ctx.send({
    //             message: 'Highlights shared successfully',
    //             sharedHighlights,
    //         });

    //     }
    //     catch(error)
    //     {
    //         return ctx.badRequest('Failed to share the highlights. Please try again later.');
    //     }


    // },

async create(ctx){
        const user = ctx.state.user;
        if(!user){
            return ctx.badRequest('Please login.');
        }

        //console.log(user);
        
        try{
            const {data} = ctx.request.body;
            const articleId = data?.articleId;
            const recipients = data?.recipient?.connect || [];



            if (!articleId) {
                return ctx.badRequest('Article ID is required.');
            }

            //fetch all users of same organisation
           // console.log(user);
            const sameOrgUsers = await strapi.entityService.findMany('plugin::users-permissions.user',{
                filters:{
                    orgID:user.orgID,
                },
                fields: ['id', 'email','first_name'],
            });

            const userMap = {};
            sameOrgUsers.forEach(u => {
            userMap[u.id] = u;
            });

           // console.log(userMap);

            
            const senderName = user.first_name || user.email;

            if (!Array.isArray(recipients) || recipients.length === 0) {
                return ctx.badRequest('At least one recipient is required.');
            }
            else{
                const sameOrgUserIds = sameOrgUsers.map(user => user.id);

                const allRecipientsAreInSameOrg = recipients.every(recipient => sameOrgUserIds.includes(recipient));

                if(!allRecipientsAreInSameOrg)
                {
                    return ctx.badRequest("One or more recipients are not part of your organization.");
                }

            }

             // Step 1: Find shared highlights matching sender, articleId, and recipient list
            const highlightsToDelete = await strapi.entityService.findMany('api::shared-highlight.shared-highlight', {
                filters: {
                sender: { id: user.id },
                articleId,
                recipient: { id: { $in: recipients } },
                },
                fields: ['id'],
                limit: -1,
            });
           
            //  Fetch highlights of the current user for the given articleId
            const sharedHighlights = await strapi.entityService.findMany('api::highlight.highlight', {
                filters: {
                user: user.id,
                articleId: articleId
                },
                limit:-1,
            });

            if (!sharedHighlights || sharedHighlights.length === 0) {
                return ctx.badRequest("No highlights to share for this transcript.");
            }

            // Step 2: Extract highlight IDs
            const highlightIds = highlightsToDelete.map(h => h.id);

            // Step 3: Delete only the fetched highlights
            if (highlightIds.length > 0) {
                await strapi.db.query('api::shared-highlight.shared-highlight').deleteMany({
                where: { id: { $in: highlightIds } },
                });
            }

             //  Share each highlight with each recipient
        for (const recipient of recipients) {
            for (const highlight of sharedHighlights) {
                await strapi.entityService.create('api::shared-highlight.shared-highlight', {
                    data: {
                        articleId: highlight.articleId,
                        sender: user.id,
                        recipient: recipient,
                        answerId: highlight.answerId,
                        start: highlight.start,
                        end: highlight.end,
                        text: highlight.text,
                        type: highlight.type,
                        publishedAt: new Date(),
                    },
                });
            }
        }

        const firstHighlight = sharedHighlights[0];

        const previewText = firstHighlight.text
        ?.split(/\s+/)
        .slice(0, 10)
        .join(' ') + '...';

        const transcriptId = articleId;

        const highlightLink = `${process.env.FRONTEND_URL}/highlights2?highlight_type=shared&shared_id=${articleId}`;
        const transcriptLink = `${process.env.FRONTEND_URL}/transcript/${articleId}`;

        // const article = await strapi.entityService.findOne(
        //     'api::article.article',
        //     articleId,
        //     { fields: ['title'] }
        //     );

            //console.log(article);
            //const articleTitle = article?.title || 'Transcript';

            // const recipientEmails = sameOrgUsers
            // .filter(u => recipients.includes(u.id))
            // .map(u => u.email);


        for (const recipientId of recipients) {

            const recipientUser = userMap[recipientId];
            const firstName = recipientUser.first_name || 'there';

            try {
                await strapi.plugins['email'].services.email.send({
                to: recipientUser.email,
                from: `KAVI <${process.env.DEFAULT_FROM}>`,
                subject: `[KAVI Library] New Highlight Shared`,
                text: `
            Hi ${firstName},

            ${senderName} shared a highlight from Transcript ${transcriptLink}:

            "${previewText}"

            View the full text here:
            ${highlightLink}

            Regards,
            KAVI Team
                `,
                html: `

                 <table width="100%" cellpadding="0" cellspacing="0" border="0" >
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border:1px solid #e0e0e0; border-collapse:collapse;">
          <tr>
            <td style="padding:30px 20px; font-family:Arial, Helvetica, sans-serif; color:#333333; font-size:14px; line-height:1.6;">
              <p>Hi <strong>${firstName}</strong>,</p>
              <p><strong>${senderName}</strong> shared a highlight from <a href="${transcriptLink}" style="color:#2a5bd7;">
            Transcript
            </a>:</p>

              <blockquote style="border-left:4px solid #ccc; padding-left:10px; margin:15px 0; color:#333;">
            ${previewText}
            </blockquote>

             <p>
            <a href="${highlightLink}" style="color:#2a5bd7;">
            View the full text here
            </a>
            </p>

             <p>Regards,<br><strong>KAVI Team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
                `,
                mail_settings: {
                    bypass_list_management: { enable: true },
                },
                });

            } catch (err) {
                strapi.log.error('Email send failed:', err);
            }
        }




            return ctx.send({
                message: 'Highlights shared successfully',
                sharedHighlights,
            });

        }
        catch(error)
        {
            return ctx.badRequest('Failed to share the highlights. Please try again later.');
        }


    },


    async findOne(ctx){
        const {user}=ctx.state;
        const articleId = ctx.params.id;
        if(!user){
            return ctx.unauthorized('Please login to get highlight');
        }

        const sharedHighlights = await strapi.entityService.findMany(
            "api::shared-highlight.shared-highlight",
            {
                filters:{
                    recipient: user.id,
                    articleId:articleId,
                    sender: {
                        $notNull: true,  // Only include entries where sender is defined
                      },
                },
                populate:['sender'],
                limit:-1,
                sort:'answerId:asc',
            }
        );

        // Throw error if no highlights found
        if (!sharedHighlights || sharedHighlights.length === 0) {
            return ctx.badRequest("No shared highlights found for this article and recipient.");
        }

        //console.log(sharedHighlights);

        //console.log(sharedHighlights);

        const groupedHighlights = sharedHighlights.reduce((acc, highlight) => {
            const { answerId, sender } = highlight;
        
            const key = `${sender?.id || sender}_${answerId}`;
        
            if (!acc[key]) {
                acc[key] = {
                    sender,
                    answerId,
                    highlights: [],
                };
            }
        
            acc[key].highlights.push(highlight); //  Properly push into 'highlights' array
            return acc;
        }, {});
        
          

        const mergeRanges = (ranges) => {
            if (!ranges.length) return [];
            ranges.sort((a, b) => a.start - b.start);

            const merged = [];
            for (const current of ranges) {

                const cleaned={...current};
                delete cleaned.sender;

                const last = merged[merged.length - 1];
                if (last && cleaned.start <= last.end) {
                    last.end = Math.max(last.end, cleaned.end);
                    last.text = `${last.text} ${cleaned.text}`;
                } else {
                    merged.push({ ...cleaned });
                }
            }
            return merged;
        };


         // Convert grouped highlights into an ordered array according to sender
         const mergedHighlights = Object.values(groupedHighlights).map((group) => {
            const { sender, answerId, highlights } = group;
        
            const questions = mergeRanges(highlights.filter(item => item.type === "ques"));
            const answers = mergeRanges(highlights.filter(item => item.type === "answer"));
        
            return {
                sender,
                answerId,
                highlights: [...questions, ...answers],
            };
        });


        return ctx.send(mergedHighlights);
    },


    async delete(ctx){
        try {
            // Get the user from the context
            const { user } = ctx.state;
      
            // Unauthorized response if the user is not logged in
            if (!user) {
              return ctx.unauthorized('Please login to delete shared highlights.');
            }
      
            // Get the articleId from the request params
            const articleId = ctx.params.id;

            if (!articleId) {
                return ctx.badRequest('Article ID is required.');
            }
      
            // Log to confirm parameters
            // console.log('Article ID:', articleId);
            // console.log('User ID:', user.id);

            const sharedHighlightsToDelete = await strapi.entityService.findMany('api::shared-highlight.shared-highlight',{
                filters:{
                    recipient: { id: user.id },
                    articleId:articleId,
                },
                limit:-1,
              });

              if (!sharedHighlightsToDelete || sharedHighlightsToDelete.length === 0) {
                return ctx.badRequest("No shared highlights found for this article and recipient.");
            }
      
              const highlightIds = sharedHighlightsToDelete.map((highlight) => highlight.id);

              // Throw error if no highlights found
        

              // Step 2: Delete highlights using IDs
              if (highlightIds.length > 0) {
                await strapi.db.query('api::shared-highlight.shared-highlight').deleteMany({
                  where: { id: { $in: highlightIds } },
                });
              }
      
            // Return success message with deleted count
            return ctx.send({
              message: 'Shared highlights deleted successfully.',
              deletedCount: highlightIds.length , // Return count of deleted records
            });
          } catch (err) {
            console.error('Error deleting shared highlights:', err);
      
            // Handle any errors
            return ctx.internalServerError('An error occurred while deleting shared highlights.');
          }
        },


        async update(ctx)
        {
        const {user} = ctx.state;

        if(!user){
            return ctx.unauthorized('Please login.');
        }

        try {
            const { data } = ctx.request.body;

            const bodyString = JSON.stringify(ctx.request);
            // let payloadSize=Buffer.byteLength(bodyString,'utf8');

            // console.log(`Request payload size: ${(payloadSize / (1024 * 1024)).toFixed(2)} MB`);

            var articleID = data?.selectedAnswerData?.articleId;
            if(!articleID)
            {
                articleID = data?.selectedQuestionData?.articleId;
            }

            

            //get all the users whom the current user have shared highlights of current article
            const existingSharedHighlights = await strapi.entityService.findMany(
                "api::shared-highlight.shared-highlight",
                {
                    filters:{
                        sender: user.id,
                        articleId:articleID
                    },
                    populate:['recipient'],
                    limit:-1,
                    sort:'answerId:asc',
                }
            );
    
            // Throw error if no highlights found
            if (!existingSharedHighlights || existingSharedHighlights.length === 0) {
                return ctx.send(
                    {message: "No shared highlights found.",
                    sharedHighlights: []}
                );
            }

            const recipientIds = [
                ...new Set(existingSharedHighlights.map((highlight) => highlight.recipient?.id)),
              ].filter(Boolean); // Remove any undefined/nulls just in case

            console.log(recipientIds);

    
            // Initialize variables
            const selectedAnswerData = data?.selectedAnswerData || null;
            const selectedQuestionData = data?.selectedQuestionData || null;
    
            // Process selectedAnswerData if it exists
            if (selectedAnswerData && Object.keys(selectedAnswerData).length > 0) {
                const {
                    articleId: AnswerarticleId,
                    answerId: AnsweranswerId,
                    start: Answerstart,
                    end: Answerend,
                    text: Answertext,
                    type: Answertype
                } = selectedAnswerData;
                

                for (const recipientId of recipientIds) {
                await strapi.entityService.create('api::shared-highlight.shared-highlight', {
                    data: {
                        sender: user.id,
                        recipient:recipientId,
                        articleId: AnswerarticleId,
                        answerId: AnsweranswerId,
                        start: Answerstart,
                        end: Answerend,
                        text: Answertext,
                        type: Answertype,
                        publishedAt: new Date()
                    }
                });

                }
            }
    
            // Process selectedQuestionData if it exists
            if (selectedQuestionData && Object.keys(selectedQuestionData).length > 0) {
                const {
                    articleId: QuestionarticleId,
                    answerId: QuestionanswerId,
                    start: Questionstart,
                    end: Questionend,
                    text: Questiontext,
                    type: Questiontype
                } = selectedQuestionData;
                

                for (const recipientId of recipientIds) {
                await strapi.entityService.create('api::shared-highlight.shared-highlight', {
                    data: {
                        sender: user.id,
                        recipient:recipientId,
                        articleId: QuestionarticleId,
                        answerId: QuestionanswerId,
                        start: Questionstart,
                        end: Questionend,
                        text: Questiontext,
                        type: Questiontype,
                        publishedAt: new Date()
                    }
                });
                }
            }
    
    
            return ctx.send({
                message: 'Shared highlights updated successfully.',
            });
        } catch (err) {
            return ctx.badRequest('Failed to update shared highlights.',err);
        }
    },

    async find(ctx){
        const {user}=ctx.state;
        if(!user){
            return ctx.unauthorized('Please login to get shared highlight transcripts.');
        }
      const { pagination } = ctx.request.query;
      const page = parseInt(pagination?.page) || 1;
      const pageSize = parseInt(pagination?.pageSize) || 10;

    
      const data = await strapi.service('api::shared-highlight.shared-highlight').find(user.id,page,pageSize,ctx);
      
      
      ctx.body = data;
    }
});
