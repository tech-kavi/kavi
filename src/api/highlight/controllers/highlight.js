'use strict';



/**
 * highlight controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::highlight.highlight',{
    async find(ctx){
        const {user}=ctx.state;
        if(!user){
            return ctx.unauthorized('you should be logged in to bookmark');
        }
      const { pagination } = ctx.request.query;
      const page = parseInt(pagination?.page) || 1;
      const pageSize = parseInt(pagination?.pageSize) || 10;

    
      const data = await strapi.service('api::highlight.highlight').find(user.id,page,pageSize,ctx);
      
      
      ctx.body = data;
    },

    async findOne(ctx){
        const {user}=ctx.state;
        const articleId = ctx.params.id;
        if(!user){
            return ctx.unauthorized('you should be logged in to bookmark');
        }

        const highlights = await strapi.entityService.findMany(
            "api::highlight.highlight",
            {
                filters:{
                    user: user.id,
                    articleId:articleId,
                },
                limit:-1,
                sort:'answerId:asc',
            }
        );

        const groupedHighlights = highlights.reduce((acc, highlight)=>{
            const {answerId, type}=highlight;

            if(!acc[answerId]){
                acc[answerId]=[];
            }

            acc[answerId].push(highlight);
            return acc;
        },{});

        const mergeRanges = (ranges) => {
            if (!ranges.length) return [];
            
            // Sort ranges by starting position
            ranges.sort((a, b) => a.start - b.start);
        
            const merged = [];
        
            for (let i = 0; i < ranges.length; i++) {
                const current = ranges[i];
                const last = merged[merged.length - 1];
        
                if (last && current.start <= last.end) {
                    // Overlap detected: merge ranges
                    if (current.end <= last.end) {
                        // If the current range is completely inside the last range, do nothing
                        continue;
                    } else {
                        // If the current range overlaps but is not completely inside, extend the end
                        last.end = Math.max(last.end, current.end);
                        last.text = `${last.text} ${current.text}`;
                    }
                } else {
                    // No overlap, push the current range
                    merged.push({ ...current });
                }
            }
        
            return merged;
        };
         // Convert grouped highlights into an ordered array
         const mergedHighlights = Object.entries(groupedHighlights).map(([answerId, items]) => {
            const questions = mergeRanges(items.filter(item => item.type === "ques"));
            const answers = mergeRanges(items.filter(item => item.type === "answer"));

            //const mergedQuestions = questions.map(q=>q.text).join("...");
        
            return {
                answerId,
                highlights: [...questions, ...answers], // Ensure questions come first
            };
        });


        return ctx.send(mergedHighlights);
    },

    async create(ctx)
    {
        const {user} = ctx.state;

        if(!user){
            return ctx.unauthorized('you should be logged in to bookmark');
        }

        try {
            const { data } = ctx.request.body;

            const bodyString = JSON.stringify(ctx.request);
            let payloadSize=Buffer.byteLength(bodyString,'utf8');

            console.log(`Request payload size: ${(payloadSize / (1024 * 1024)).toFixed(2)} MB`);
    
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
    
                await strapi.entityService.create('api::highlight.highlight', {
                    data: {
                        user: user.id,
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
    
                await strapi.entityService.create('api::highlight.highlight', {
                    data: {
                        user: user.id,
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
    
            // Determine articleId to fetch highlights
            const articleId = selectedAnswerData?.articleId || selectedQuestionData?.articleId || null;
    
            const ArticleHighlights = await strapi.entityService.findMany('api::highlight.highlight', {
                filters: {
                    user: user.id,
                    articleId: articleId,
                },
                limit: -1,
            });
    
            return ctx.send({
                message: 'Highlights updated successfully',
                ArticleHighlights,
            });
        } catch (err) {
            return ctx.badRequest('Failed to Highlight',err);
        }
    },


    async update(ctx){
        const {user} = ctx.state;

        if(!user){
            return ctx.unauthorized('you should be logged in to bookmark');
        }

        const { data } = ctx.request.body;
        const articleId = ctx.request.params.id;
        const removeAnswerId = data?.answerId;
        const removeStart = data?.start;
        const removeEnd = data?.end;
        const typeOfText = data?.type;
    
        
        
    
        try {
          // Fetch all highlights for the article
          const highlights = await strapi.entityService.findMany('api::highlight.highlight', {
            filters: { articleId },
          });

        
    
          // Filter out highlights that match the conditions
          const filteredHighlights = highlights.filter(({ answerId, start, end, type }) => {
            console.log(typeof(answerId));
            return (answerId == removeAnswerId && start >= removeStart && end <= removeEnd && type == typeOfText);
          });

         
          
    
          // Get IDs of highlights to delete
          const idsToDelete = filteredHighlights.map(highlight => highlight.id);

           
    
          // Delete the filtered highlights
          if (idsToDelete.length > 0) {
            await strapi.entityService.deleteMany('api::highlight.highlight', {
              filters: { id: { $in: idsToDelete } },
            });
          }


          const ArticleHighlights = await strapi.entityService.findMany('api::highlight.highlight',{
            filters:{
                user: user.id,
                articleId:articleId,
            },
            limit:-1,
          });

          // Return the updated list of highlights for the article
          return ctx.send({
            message: 'Highlights updated successfully',
            ArticleHighlights,
          });
        } catch (error) {
          console.error('Error deleting highlights:', error);
          return ctx.badRequest('Failed to delete highlights');
        }

    }
});
