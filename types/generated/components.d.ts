import type { Schema, Attribute } from '@strapi/strapi';

export interface BriefBriefs extends Schema.Component {
  collectionName: 'components_brief_briefs';
  info: {
    displayName: 'Briefs';
  };
  attributes: {
    point: Attribute.Text;
  };
}

export interface QuestionAnswerQues extends Schema.Component {
  collectionName: 'components_question_answer_ques';
  info: {
    displayName: 'Ques';
  };
  attributes: {
    question: Attribute.Text;
    answer: Attribute.Text;
  };
}

export interface TableOfContentIndex extends Schema.Component {
  collectionName: 'components_table_of_content_indices';
  info: {
    displayName: 'Index';
  };
  attributes: {
    tablePoint: Attribute.Text;
    ques: Attribute.Component<'question-answer.ques', true>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'brief.briefs': BriefBriefs;
      'question-answer.ques': QuestionAnswerQues;
      'table-of-content.index': TableOfContentIndex;
    }
  }
}
