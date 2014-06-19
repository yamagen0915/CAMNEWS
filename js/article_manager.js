var ArticleManager = function (articles) {
	this.articles = articles;
};

(function () {
	
	ArticleManager.prototype.articles = null;

	ArticleManager.prototype.selected_articles = [
		[], [], [], []
	];

	ArticleManager.prototype.set_articles = function (articles) {
		this.articles = articles;
	};

	ArticleManager.prototype.selected_article = function (genre_id, article_id) {
		this.selected_articles[genre_id].push(this.articles[article_id]);
	};

	ArticleManager.prototype.deselect_by_index = function (genre_id, index) {
		this.selected_articles[genre_id].splice(index, 1);
	}

	ArticleManager.prototype.get_all_articles = function () {
		return this.articles;
	};

	ArticleManager.prototype.get_article = function (article_id) {
		return this.articles[article_id];
	};

	ArticleManager.prototype.get_all_selected_articles = function () {
		return this.selected_articles;
	};

	ArticleManager.prototype.get_articles_by_genre = function (genre_id) {
		return this.selected_articles[genre_id];
	};


})();
