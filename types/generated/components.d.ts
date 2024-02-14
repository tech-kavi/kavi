import type { Schema, Attribute } from '@strapi/strapi';

export interface ArticletagsLocalTags extends Schema.Component {
  collectionName: 'components_articletags_local_tags';
  info: {
    displayName: 'localTags';
  };
  attributes: {
    tag: Attribute.String & Attribute.Unique;
  };
}

export interface BriefBriefs extends Schema.Component {
  collectionName: 'components_brief_briefs';
  info: {
    displayName: 'Briefs';
  };
  attributes: {
    point: Attribute.Text;
  };
}

export interface CompanyRelatedCompanies extends Schema.Component {
  collectionName: 'components_company_related_companies';
  info: {
    displayName: 'related_companies';
  };
  attributes: {
    company: Attribute.Relation<
      'company.related-companies',
      'oneToMany',
      'api::company.company'
    >;
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
      'articletags.local-tags': ArticletagsLocalTags;
      'brief.briefs': BriefBriefs;
      'company.related-companies': CompanyRelatedCompanies;
      'question-answer.ques': QuestionAnswerQues;
      'table-of-content.index': TableOfContentIndex;
    }
  }
}
