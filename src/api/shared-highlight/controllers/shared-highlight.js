'use strict';

/**
 * shared-highlight controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shared-highlight.shared-highlight', {
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

    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.badRequest('Please login.');
        }

        //console.log(user);

        try {
            const { data } = ctx.request.body;
            const articleId = data?.articleId;
            const recipients = data?.recipient?.connect || [];



            if (!articleId) {
                return ctx.badRequest('Article ID is required.');
            }

            //fetch all users of same organisation
            // console.log(user);
            const sameOrgUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
                filters: {
                    orgID: user.orgID,
                },
                fields: ['id', 'email', 'first_name'],
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
            else {
                const sameOrgUserIds = sameOrgUsers.map(user => user.id);

                const allRecipientsAreInSameOrg = recipients.every(recipient => sameOrgUserIds.includes(recipient));

                if (!allRecipientsAreInSameOrg) {
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
                    articleId: articleId,
                    publishedAt:{
                        $notNull:true,
                    }
                },
                limit: -1,
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

            // const firstHighlight = sharedHighlights[0];

            // const previewText = firstHighlight.text
            //     ?.split(/\s+/)
            //     .slice(0, 20)
            //     .join(' ') + '...';

            const sortedHighlights = [...sharedHighlights].sort((a, b) => {
            // 1. Sort by answerId
            if (a.answerId !== b.answerId) {
                return a.answerId - b.answerId;
            }

            // 2. Sort by type (ques first, then answer)
            const typeOrder = { ques: 1, answer: 2 };
            if (a.type !== b.type) {
                return typeOrder[a.type] - typeOrder[b.type];
            }

            // 3. Sort by start
            return (a.start || 0) - (b.start || 0);
            });

            const previewText = sortedHighlights
            .slice(0, 5) // max 5 highlights
            .map(h => {
                const words = h.text?.split(/\s+/) || [];
                const trimmed = words.slice(0, 50).join(' ');
                const suffix = words.length > 50 ? '...' : '';

                return `<li style="margin-bottom:10px;">${trimmed}${suffix}</li>`;
            })
            .join('');

            const previewHTML = `
            <ul style="padding-left:18px; margin:0;">
                ${previewText}
            </ul>
            `;

            const transcriptId = articleId;

            const highlightLink = `${process.env.FRONTEND_URL}/highlights?highlight_type=Shared&shared_id=${articleId}`;
            const transcriptLink = `${process.env.FRONTEND_URL}/transcript/${articleId}`;

            const article = await strapi.entityService.findOne(
                'api::article.article',
                articleId,
                { 
                    fields: ['title','published_date'],
                    populate:{
                        primary_companies:{
                            fields:['name']
                        }
                    }
                 }
            );

           // console.log(article);
            const articleTitle = article?.title || 'Transcript';
            const primary_company = article?.primary_companies[0]?.name|| 'Company';
            const published_date = article?.published_date;

            const formattedDate = new Date(published_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
            });

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
                                subject: `[KAVI Library] New Highlight Shared on ${primary_company}'s Transcript`,
                                text: `
                            Hi ${firstName},

                            ${senderName} shared a highlight .
                            
                                `,
                                html: `

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border:1px solid #e0e0e0; border-collapse:collapse;">
                            <tr>
                            <td style="padding:30px 20px; font-family:Arial, Helvetica, sans-serif; color:#333333; font-size:16px; line-height:1.6; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
                                
                                <!-- Greeting -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-bottom:15px; font-size:16px; line-height:1.6;">
                                    Hi <strong>${firstName}</strong>,
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom:20px; font-size:16px; line-height:1.6;">
                                    <strong>${senderName}</strong> shared the following highlight(s) from a transcript on 
                                    <strong>${primary_company}</strong>.
                                    </td>
                                </tr>

                                              <!-- Title + Date -->
                                <tr>
                                    <td style="padding-bottom:20px; font-size:16px; color:#555; line-height:1.6;">
                                    <a href="${transcriptLink}" style="color:#313D74; text-decoration:none; font-weight:bold; font-size:16px;">
                                        ${articleTitle}
                                    </a><br/>
                                    <span style="font-size:14px;">Published on ${formattedDate}</span>
                                    </td>
                                </tr>
                                </table>

                                <!-- Grey preview box -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; border-radius:6px;">
                                <tr>
                                    <td style="padding:15px; color:#333; font-size:16px; line-height:1.6;">
                                    ${previewHTML}
                                    </td>
                                </tr>
                                </table>

                                <!-- Spacer -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-top:25px; text-align:center;">
                                    <a href="${highlightLink}" 
                                        style="background-color:#313D74; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; font-weight:bold;font-size:16px; line-height:1.2;">
                                        View All Highlight(s)
                                    </a>
                                    </td>
                                </tr>
                                </table>

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
        catch (error) {
            return ctx.badRequest('Failed to share the highlights. Please try again later.');
        }


    },


    async findOne(ctx) {
        const { user } = ctx.state;
        const articleId = ctx.params.id;
        if (!user) {
            return ctx.unauthorized('Please login to get highlight');
        }

        const sharedHighlights = await strapi.entityService.findMany(
            "api::shared-highlight.shared-highlight",
            {
                filters: {
                    recipient: user.id,
                    articleId: articleId,
                    sender: {
                        $notNull: true,  // Only include entries where sender is defined
                    },
                },
                populate: ['sender'],
                limit: -1,
                sort: 'answerId:asc',
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

                const cleaned = { ...current };
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


    async delete(ctx) {
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

            const sharedHighlightsToDelete = await strapi.entityService.findMany('api::shared-highlight.shared-highlight', {
                filters: {
                    recipient: { id: user.id },
                    articleId: articleId,
                },
                limit: -1,
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
                deletedCount: highlightIds.length, // Return count of deleted records
            });
        } catch (err) {
            console.error('Error deleting shared highlights:', err);

            // Handle any errors
            return ctx.internalServerError('An error occurred while deleting shared highlights.');
        }
    },


    async update(ctx) {
        const { user } = ctx.state;

        if (!user) {
            return ctx.unauthorized('Please login.');
        }

        try {
            const { data } = ctx.request.body;

            const bodyString = JSON.stringify(ctx.request);
            // let payloadSize=Buffer.byteLength(bodyString,'utf8');

            // console.log(`Request payload size: ${(payloadSize / (1024 * 1024)).toFixed(2)} MB`);

            var articleID = data?.selectedAnswerData?.articleId;
            if (!articleID) {
                articleID = data?.selectedQuestionData?.articleId;
            }



            //get all the users whom the current user have shared highlights of current article
            const existingSharedHighlights = await strapi.entityService.findMany(
                "api::shared-highlight.shared-highlight",
                {
                    filters: {
                        sender: user.id,
                        articleId: articleID
                    },
                    populate: ['recipient'],
                    limit: -1,
                    sort: 'answerId:asc',
                }
            );

            // Throw error if no highlights found
            if (!existingSharedHighlights || existingSharedHighlights.length === 0) {
                return ctx.send(
                    {
                        message: "No shared highlights found.",
                        sharedHighlights: []
                    }
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
                            recipient: recipientId,
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
                            recipient: recipientId,
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
            return ctx.badRequest('Failed to update shared highlights.', err);
        }
    },

    async find(ctx) {
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('Please login to get shared highlight transcripts.');
        }
        const { pagination } = ctx.request.query;
        const page = parseInt(pagination?.page) || 1;
        const pageSize = parseInt(pagination?.pageSize) || 10;


        const data = await strapi.service('api::shared-highlight.shared-highlight').find(user.id, page, pageSize, ctx);


        ctx.body = data;
    }
});
