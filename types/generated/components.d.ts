import type { Schema, Attribute } from '@strapi/strapi';

export interface ArticlesRelatedArticles extends Schema.Component {
  collectionName: 'components_articles_related_articles';
  info: {
    displayName: 'related_articles';
  };
  attributes: {
    articles: Attribute.Relation<
      'articles.related-articles',
      'oneToMany',
      'api::article.article'
    >;
  };
}

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
    description: '';
  };
  attributes: {
    point: Attribute.RichText & Attribute.Required;
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

export interface OpenDetailsOpenDetails extends Schema.Component {
  collectionName: 'components_open_details_open_details';
  info: {
    displayName: 'Open-details';
  };
  attributes: {
    article: Attribute.Relation<
      'open-details.open-details',
      'oneToOne',
      'api::article.article'
    >;
    time: Attribute.DateTime;
  };
}

export interface QuestionAnswerQues extends Schema.Component {
  collectionName: 'components_question_answer_ques';
  info: {
    displayName: 'Ques';
    description: '';
  };
  attributes: {
    question: Attribute.RichText & Attribute.Required;
    answer: Attribute.RichText & Attribute.Required;
  };
}

export interface TableOfContentIndex extends Schema.Component {
  collectionName: 'components_table_of_content_indices';
  info: {
    displayName: 'Index';
    description: '';
  };
  attributes: {
    tablePoint: Attribute.RichText & Attribute.Required;
    ques: Attribute.Component<'question-answer.ques', true> &
      Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'articles.related-articles': ArticlesRelatedArticles;
      'articletags.local-tags': ArticletagsLocalTags;
      'brief.briefs': BriefBriefs;
      'company.related-companies': CompanyRelatedCompanies;
      'open-details.open-details': OpenDetailsOpenDetails;
      'question-answer.ques': QuestionAnswerQues;
      'table-of-content.index': TableOfContentIndex;
    }
  }
}
