'use strict';

/**
 * shared-highlight controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shared-highlight.shared-highlight',{
    async create(ctx){
        const user = ctx.state.user;
        if(!user){
            return ctx.badRequest('Please login.');
        }

        
        try{
            const {data} = ctx.request.body;
            const articleId = data?.articleId;
            const recipients = data?.recipient?.connect || [];

            if (!articleId) {
                return ctx.badRequest('Article ID is required.');
            }

            if (!Array.isArray(recipients) || recipients.length === 0) {
                return ctx.badRequest('At least one recipient is required.');
            }

             //  Delete existing shared highlights for each recipient
                for (const recipient of recipients) {
                    await strapi.entityService.deleteMany('api::shared-highlight.shared-highlight', {
                        where: {
                            sender: user.id,
                            recipient: recipient,
                            articleId: articleId,
                        },
                    });
                }
           
            //  Fetch highlights of the current user for the given articleId
            const sharedHighlights = await strapi.entityService.findMany('api::highlight.highlight', {
                filters: {
                user: user.id,
                articleId: articleId
                },
                limit:-1,
            });

            console.log(sharedHighlights);

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
                    articleId:articleId
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
                    recipient: user.id,
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
