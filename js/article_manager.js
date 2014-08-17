var ArticleManager = function (articles) {
  this.articles = articles;
};

(function () {

  ArticleManager.prototype.INDUSTRY      = 0;
  ArticleManager.prototype.SMART_PHONE   = 1;
  ArticleManager.prototype.ADVERTISEMENT = 2;
  ArticleManager.prototype.ENTERTAMENT   = 3;

  ArticleManager.prototype.articles = null;

  ArticleManager.prototype.selected_articles = [
    [], [], [], []
  ];

  ArticleManager.prototype.set_articles         = function (articles) {
    this.articles = articles;
  };

  ArticleManager.prototype.get_all_artcles      = function () {
    return this.articles;
  };

  ArticleManager.prototype.get_article          = function (article_id) {
    return this.articles[article_id];
  };

  ArticleManager.prototype.select               = function (genre_id, article_id) {
    this.selected_articles[genre_id].push(this.articles[article_id]);
  };

  ArticleManager.prototype.deselect             = function (genre_id, index) {
    this.selected_articles[genre_id].splice(index, 1);
  };

  ArticleManager.prototype.get_selected_articles = function (genre_id, index) {
    if (genre_id && index) return this.selected_articles[genre_id][index];
    if (genre_id)          return this.selected_articles[genre_id];

    return this.selected_articles;
  };

})();
