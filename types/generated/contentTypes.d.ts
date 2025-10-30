import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiArticleArticle extends Schema.CollectionType {
  collectionName: 'articles';
  info: {
    description: '';
    displayName: 'Article';
    pluralName: 'articles';
    singularName: 'article';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'import-export-entries': {
      idField: 'article_id';
    };
  };
  attributes: {
    article_id: Attribute.UID & Attribute.Private;
    bookmarks: Attribute.Relation<
      'api::article.article',
      'oneToMany',
      'api::bookmark.bookmark'
    >;
    brief: Attribute.Component<'brief.briefs', true>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    disliked_articles: Attribute.Relation<
      'api::article.article',
      'oneToMany',
      'api::disliked-article.disliked-article'
    >;
    est_read: Attribute.Integer & Attribute.Required;
    expert_type: Attribute.Enumeration<
      [
        'Competitor',
        'Customer',
        'Industry Expert',
        'Former',
        'Partner',
        'Reference'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Industry Expert'>;
    industry: Attribute.Relation<
      'api::article.article',
      'manyToOne',
      'api::industry.industry'
    >;
    like_details: Attribute.Relation<
      'api::article.article',
      'oneToMany',
      'api::liked-article.liked-article'
    >;
    primary_companies: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::company.company'
    >;
    published_date: Attribute.Date;
    publishedAt: Attribute.DateTime;
    secondary_companies: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::company.company'
    >;
    sub_industries: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::sub-industry.sub-industry'
    >;
    table_with_content: Attribute.Component<'table-of-content.index', true>;
    tags: Attribute.Relation<
      'api::article.article',
      'manyToMany',
      'api::tag.tag'
    >;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBookmarkBookmark extends Schema.CollectionType {
  collectionName: 'bookmarks';
  info: {
    description: '';
    displayName: 'Bookmark';
    pluralName: 'bookmarks';
    singularName: 'bookmark';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article: Attribute.Relation<
      'api::bookmark.bookmark',
      'manyToOne',
      'api::article.article'
    >;
    bookmarked_by: Attribute.Relation<
      'api::bookmark.bookmark',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::bookmark.bookmark',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::bookmark.bookmark',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCompanyCompany extends Schema.CollectionType {
  collectionName: 'companies';
  info: {
    description: '';
    displayName: 'Company';
    pluralName: 'companies';
    singularName: 'company';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'import-export-entries': {
      idField: 'name';
    };
  };
  attributes: {
    articles: Attribute.Relation<
      'api::company.company',
      'manyToMany',
      'api::article.article'
    >;
    company_id: Attribute.UID;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    industries: Attribute.Relation<
      'api::company.company',
      'manyToMany',
      'api::industry.industry'
    >;
    ipo: Attribute.Enumeration<['IPO', 'DRHP']>;
    logo: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    meta: Attribute.Text;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    ownership_type: Attribute.Enumeration<['Public', 'Private']> &
      Attribute.Required;
    publishedAt: Attribute.DateTime;
    secondary_articles: Attribute.Relation<
      'api::company.company',
      'manyToMany',
      'api::article.article'
    >;
    sub_industries: Attribute.Relation<
      'api::company.company',
      'manyToMany',
      'api::sub-industry.sub-industry'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    watchlists: Attribute.Relation<
      'api::company.company',
      'oneToMany',
      'api::watchlist.watchlist'
    >;
  };
}

export interface ApiDislikedArticleDislikedArticle
  extends Schema.CollectionType {
  collectionName: 'disliked_articles';
  info: {
    description: '';
    displayName: 'DislikedArticle';
    pluralName: 'disliked-articles';
    singularName: 'disliked-article';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article: Attribute.Relation<
      'api::disliked-article.disliked-article',
      'manyToOne',
      'api::article.article'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::disliked-article.disliked-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    dislike_time: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::disliked-article.disliked-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::disliked-article.disliked-article',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiHighlightHighlight extends Schema.CollectionType {
  collectionName: 'highlights';
  info: {
    description: '';
    displayName: 'Highlight';
    pluralName: 'highlights';
    singularName: 'highlight';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    answerId: Attribute.BigInteger;
    articleId: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::highlight.highlight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    end: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    start: Attribute.Integer;
    text: Attribute.Text;
    type: Attribute.Enumeration<['ques', 'answer']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::highlight.highlight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::highlight.highlight',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiIndustryIndustry extends Schema.CollectionType {
  collectionName: 'industries';
  info: {
    description: '';
    displayName: 'Industry';
    pluralName: 'industries';
    singularName: 'industry';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'import-export-entries': {
      idField: 'name';
    };
  };
  attributes: {
    articles: Attribute.Relation<
      'api::industry.industry',
      'oneToMany',
      'api::article.article'
    >;
    companies: Attribute.Relation<
      'api::industry.industry',
      'manyToMany',
      'api::company.company'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::industry.industry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    industry_id: Attribute.UID;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    publishedAt: Attribute.DateTime;
    sub_industries: Attribute.Relation<
      'api::industry.industry',
      'manyToMany',
      'api::sub-industry.sub-industry'
    >;
    top_companies: Attribute.Relation<
      'api::industry.industry',
      'oneToMany',
      'api::company.company'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::industry.industry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLikedArticleLikedArticle extends Schema.CollectionType {
  collectionName: 'liked_articles';
  info: {
    displayName: 'LikedArticle';
    pluralName: 'liked-articles';
    singularName: 'liked-article';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article: Attribute.Relation<
      'api::liked-article.liked-article',
      'manyToOne',
      'api::article.article'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::liked-article.liked-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    like_time: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::liked-article.liked-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::liked-article.liked-article',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiLoggedInLoggedIn extends Schema.CollectionType {
  collectionName: 'logged_ins';
  info: {
    displayName: 'loggedIn';
    pluralName: 'logged-ins';
    singularName: 'logged-in';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::logged-in.logged-in',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::logged-in.logged-in',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::logged-in.logged-in',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiReadArticleReadArticle extends Schema.CollectionType {
  collectionName: 'read_articles';
  info: {
    description: '';
    displayName: 'ReadArticle';
    pluralName: 'read-articles';
    singularName: 'read-article';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article: Attribute.Relation<
      'api::read-article.read-article',
      'oneToOne',
      'api::article.article'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::read-article.read-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    read_time: Attribute.DateTime;
    scroll: Attribute.Integer;
    time_spent: Attribute.BigInteger & Attribute.DefaultTo<'0'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::read-article.read-article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::read-article.read-article',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiSharedHighlightSharedHighlight
  extends Schema.CollectionType {
  collectionName: 'shared_highlights';
  info: {
    description: '';
    displayName: 'SharedHighlight';
    pluralName: 'shared-highlights';
    singularName: 'shared-highlight';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    answerId: Attribute.BigInteger;
    articleId: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shared-highlight.shared-highlight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    end: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    recipient: Attribute.Relation<
      'api::shared-highlight.shared-highlight',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    sender: Attribute.Relation<
      'api::shared-highlight.shared-highlight',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    start: Attribute.Integer;
    text: Attribute.Text;
    type: Attribute.Enumeration<['ques', 'answer']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shared-highlight.shared-highlight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSubIndustrySubIndustry extends Schema.CollectionType {
  collectionName: 'sub_industries';
  info: {
    description: '';
    displayName: 'SubIndustry';
    pluralName: 'sub-industries';
    singularName: 'sub-industry';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'import-export-entries': {
      idField: 'name';
    };
  };
  attributes: {
    articles: Attribute.Relation<
      'api::sub-industry.sub-industry',
      'manyToMany',
      'api::article.article'
    >;
    companies: Attribute.Relation<
      'api::sub-industry.sub-industry',
      'manyToMany',
      'api::company.company'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::sub-industry.sub-industry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    industries: Attribute.Relation<
      'api::sub-industry.sub-industry',
      'manyToMany',
      'api::industry.industry'
    >;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::sub-industry.sub-industry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    displayName: 'Tag';
    pluralName: 'tags';
    singularName: 'tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    articles: Attribute.Relation<
      'api::tag.tag',
      'manyToMany',
      'api::article.article'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    tag_id: Attribute.UID;
    tag_name: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiWatchlistWatchlist extends Schema.CollectionType {
  collectionName: 'watchlists';
  info: {
    description: '';
    displayName: 'Watchlist';
    pluralName: 'watchlists';
    singularName: 'watchlist';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    company: Attribute.Relation<
      'api::watchlist.watchlist',
      'manyToOne',
      'api::company.company'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::watchlist.watchlist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::watchlist.watchlist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    watchlisted_by: Attribute.Relation<
      'api::watchlist.watchlist',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginPasswordlessToken extends Schema.CollectionType {
  collectionName: 'tokens';
  info: {
    displayName: 'Token';
    name: 'token';
    pluralName: 'tokens';
    singularName: 'token';
  };
  options: {
    draftAndPublish: false;
    increments: false;
    timestamps: true;
  };
  attributes: {
    body: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique;
    context: Attribute.JSON & Attribute.Private;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::passwordless.token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email & Attribute.Required & Attribute.Private;
    is_active: Attribute.Boolean & Attribute.DefaultTo<true>;
    login_date: Attribute.DateTime;
    stays_valid: Attribute.Boolean &
      Attribute.Configurable &
      Attribute.DefaultTo<false>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::passwordless.token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    articlesOpenedToday: Attribute.Component<'open-details.open-details', true>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    bookmarks: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::bookmark.bookmark'
    >;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currentToken: Attribute.Text & Attribute.Private;
    DailyLimit: Attribute.Integer & Attribute.DefaultTo<30>;
    disliked_articles: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::disliked-article.disliked-article'
    >;
    dob: Attribute.Date;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    expiry: Attribute.DateTime;
    first_name: Attribute.String;
    highlights: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::highlight.highlight'
    >;
    last_login: Attribute.DateTime;
    last_name: Attribute.String;
    liked_articles: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::liked-article.liked-article'
    >;
    linkedinurl: Attribute.String & Attribute.Private;
    logged_in: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::logged-in.logged-in'
    >;
    OpensToday: Attribute.Integer;
    orgID: Attribute.BigInteger & Attribute.Required;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    slotFilled: Attribute.Integer;
    slots: Attribute.Integer;
    token: Attribute.String & Attribute.Private;
    TotalLimit: Attribute.Integer & Attribute.DefaultTo<100>;
    Type: Attribute.Enumeration<['Trial', 'Subscriber']> &
      Attribute.Required &
      Attribute.DefaultTo<'Subscriber'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    watchlists: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::watchlist.watchlist'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::article.article': ApiArticleArticle;
      'api::bookmark.bookmark': ApiBookmarkBookmark;
      'api::company.company': ApiCompanyCompany;
      'api::disliked-article.disliked-article': ApiDislikedArticleDislikedArticle;
      'api::highlight.highlight': ApiHighlightHighlight;
      'api::industry.industry': ApiIndustryIndustry;
      'api::liked-article.liked-article': ApiLikedArticleLikedArticle;
      'api::logged-in.logged-in': ApiLoggedInLoggedIn;
      'api::read-article.read-article': ApiReadArticleReadArticle;
      'api::shared-highlight.shared-highlight': ApiSharedHighlightSharedHighlight;
      'api::sub-industry.sub-industry': ApiSubIndustrySubIndustry;
      'api::tag.tag': ApiTagTag;
      'api::watchlist.watchlist': ApiWatchlistWatchlist;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::passwordless.token': PluginPasswordlessToken;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
