$(function () {

  /*
   *  genre_id
   *    0 : 業界ニュース
   *    1 : スマホニュース
   *    2 : 広告ニュース
   *    3 : エンタメニュース
   *    それぞれのkeyの番号がが各ジャンルに対応している。
   */
  var manager = new ArticleManager();

  $(document).ready(function() {

    init_dialog();

    $.get('./episode.php', function(response) {
      var json = JSON.parse(response);
      $('#episode-number').html(json.episode_number);
    });

    var user_name = localStorage.getItem('user-name') || '名前を登録する';
    $('#user-name').html(user_name);

    $.get('./articles.php', function (response) {
      $('.loader').remove();
      var articles = JSON.parse(response);
      manager.set_articles(articles);
      append_articles(articles);
    });

  });

  $(document).on('change', '.article-selector', function () {
    var genre_id    = $(this).find('option:selected').index() - 1;
    var article_id  = $(this).parents('.article-item').index();

    manager.select(genre_id, article_id);

    var article_item_html = micro_templating(
      'selected_article_item_template',
      {
        title: manager.get_article(article_id).title,
        link:  manager.get_article(article_id).link,
      }
    );

    $('.selected-articles').eq(genre_id).append(article_item_html);

  });

  $(document).on('click', '.delete-btn', function() {

    var genre_id       = $(this).parents('.selected-item').index();
    var selected_index = $(this).parents('.selected-title').index();

    console.log('index : ' + selected_index);
    console.log('genre : ' + genre_id);

    // 記事の登録を解除し、表示の更新を行う
    manager.deselect(genre_id, selected_index);
    $(this).parents('.selected-title').remove();

  });

  $(document).on('click', '.finish-btn', function() {

    var selected_articles = manager.get_selected_articles();

    var mail_body = micro_templating(
      'mail_format_template',
      {
        user_name: localStorage.getItem('user-name'),
        episode_number : $('#episode-number').html(),
        articles: selected_articles
      }
    );

    $('#mail-format-dialog').html(mail_body);

    $('#mail-format-dialog').dialog({
      minWidth:      $(window).width()*0.6,
      autoOpen:      true,
      draggable:     false,
      resizable:     false,
      title:         '【CAmobileNEWS】'+ new Date().toSubjectDateFormat(),
      closeOnEscape: false,
      modal:         true,
      open: function(event, ui){
        $('.ui-dialog-titlebar-close').hide();
      }
    });
  });

  $(document).on('click', '#ask-name-ok', function() {

    var user_name = $('#user-name-input').val();

    if (!user_name && !localStorage.getItem('user-name')) {
      alert('名前を入力してください。');
      return ;
    }

    if (!user_name) user_name = localStorage.getItem('user-name');

    localStorage.setItem('user-name', user_name);
    $('#user-name').html(user_name);
    $('#ask-name-dialog').dialog('close');

  });

  $(document).on('click', '#edit-episode-ok', function(){
    var episode_number = $('#episode-number-input').val();
    // 変更がなければ何もしない
    if ($('#episode-number').html() == episode_number) {
      $('#edit-episode-dialog').dialog('close');
      return;
    }

    $.get(
      './episode.php',
      { episode_number : episode_number },
      function (response) {
        $('#episode-number').html(episode_number);
        $('#edit-episode-dialog').dialog('close');
      });
  });

  $(document).on('click', '.ui-widget-overlay', function(){
    if (is_dialog_shown('#mail-format-dialog')) $('#mail-format-dialog').dialog('close');
    if (is_dialog_shown('#edit-episode-dialog')) $('#edit-episode-dialog').dialog('close');
  });

  $(document).on('click', '.icon-user', function() {
    var user_name = $('#user-name').html();
    $('#user-name-input').val(user_name);
    $('#ask-name-dialog').dialog('open');
  });

  $(document).on('click', '#edit-episode', function(){
    var episode_number = $('#episode-number').html();
    $('#episode-number-input').val(episode_number);
    $('#edit-episode-dialog').dialog('open');
  });

  // 記事を追加していく
  //
  function append_articles (article_obj) {
    var pre_date = null;
    for (var i=0; i<article_obj.length; i++) {
      var article = article_obj[i];

      article.category = date_category(pre_date, article.date);
      pre_date = article.date;

      var html = micro_templating('articles_template', article);
      $('#articles').append(html);
    }
  };

  // 表示すべきカテゴリを返す
  //
  function date_category (pre_date, current_date) {
    if (pre_date == null)         return 'Today';
    if (pre_date != current_date) return 'Yesterday';
    return null;
  };

  // ダイアログが表示中かを判定する
  //
  function is_dialog_shown (name) {
    return $(name).css('display') != 'none';
  };

  function check_ad_article (article) {

    if (article == null)             return false;
    if (article.title == null)       return false;
    if (article.description == null) return false;

    var is_ad_article = false;

    is_ad_article = article.title.indexOf('広告') >= 0 || is_ad_article;
    is_ad_article = article.description.indexOf('広告') >= 0 || is_ad_article;

    return is_ad_article;
  };

  function init_dialog () {
    $('#ask-name-dialog').dialog({
      minWidth: 400,
      autoOpen: false,
      draggable: false,
      resizable: false,
      title: 'ようこそ',
      closeOnEscape: false,
      modal: true,
      show: 'clip',
      hide: 'clip',
      open:function(event, ui){ $('.ui-dialog-titlebar-close').hide();}
    });
    $('#edit-episode-dialog').dialog({
      minWidth: 400,
      autoOpen: false,
      draggable: false,
      resizable: false,
      title: 'EPISODE',
      closeOnEscape: true,
      modal: true,
      show: 'clip',
      hide: 'clip',
      open:function(event, ui){ $('.ui-dialog-titlebar-close').hide();}
    });
  };

  Date.prototype.toMailDateFormat = function () {
    var year  = this.getFullYear();
    var month = this.getMonth() + 1;
    var day   = this.getDate();

    // ゼロ埋めする。
    month = ('0' + month).slice(-2);
    day   = ('0' + day).slice(-2);

    return year+'/'+month+'/'+day;
  };

  Date.prototype.toSubjectDateFormat = function () {
    var year  = (''+this.getFullYear()).slice(-2);
    var month = this.getMonth() + 1;
    var day   = this.getDate();

    month = ('0' + month).slice(-2);
    day   = ('0' + day).slice(-2);

    return year+month+day;

  };
})


