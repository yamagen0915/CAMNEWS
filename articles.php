<?php

error_reporting(0);

require_once("./libs/simplepie_1.3.1.mini.php");
require_once("./libs/simple_html_dom.php");

$rss = new SimplePie();
$rss->set_feed_url(array(
	"http://adgang.jp/",
	"http://markezine.jp/",
	"http://www3.nhk.or.jp/rss/news/cat0.xml",
	"http://d.hatena.ne.jp/y_sequi/20140608/1402197896",
	"http://www.findstar.co.jp/output/index.rss",
	"http://www.advertimes.com/",
	"http://feeds.japan.cnet.com/rss/cnet/all.rdf",
	"http://www.itmedia.co.jp/news/subtop/bursts/index.html",
	"http://gamebiz.jp/",
	"http://jp.techcrunch.com/",
	"http://feeds.feedburner.com/SdJapan/",
	"http://wired.jp/",
	"http://kabumatome.doorblog.jp/",
  "http://www.exchangewire.jp/",
));
$rss->enable_order_by_date(true);
$rss->init();

$articles = array();
foreach ($rss->get_items() as $article) {
	
	if (check_written_yesterday($article)) 
		break;

	// サムネイル用の画像のurlを取得する。
	$html 	 = str_get_html($article->get_content());
	$img 		 = $html->find("img", 0);
	$img_src = ($img != null) ? $img->src : "";

	// HTML用の特殊文字から普通の文字に変換
	$tmp_description = mb_convert_encoding($article->get_content(false), 'UTF-8', 'HTML-ENTITIES');
	// 全角文字を半角に変換
	$tmp_description = mb_convert_kana($tmp_description, "a", "UTF-8");
	// HTMLタグを除去し文章のみを抽出する
	$tmp_description = strip_tags($tmp_description);
	// 文字数を制限する
	$tmp_description = mb_substr($tmp_description, 0, 400,"UTF-8");
	// AdGangのフィードに含まれるよくわからない文字列を除去
	$tmp_description = preg_replace("/^Case:([a-zA-Z]*\s)*/", "", $tmp_description);
	// 先頭の全角スペースを除去
	$description		 = preg_replace("/^　/", "", $tmp_description);

	$articles[] = array(
		"title" 				=> mb_convert_kana($article->get_title(), "a", "UTF-8"),
		"link"					=> $article->get_link(),
		"description"		=> $description,
		"img_src"				=> $img_src,
		"date"					=> $article->get_date("Y/m/j"),
		"source_site"   => $article->get_feed()->get_title(),
	);

}

echo json_encode($articles);

function check_written_yesterday ($article) {
	$date_format = "Y/m/j";
	$post_at 		 = strtotime($article->get_date($date_format));
	$today 			 = strtotime(date($date_format)) - 24 * 60 * 60 -1;

	return $post_at <= $today;
}

?>
