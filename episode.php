<?php

// エラーを非表示にする
ini_set( 'display_errors', 1 );

$filename = 'episode.json';

// パラメータにepisode_numberが含まれていたデータを更新して終了
if (isset($_GET["episode_number"])) {
  $episode = read_episode_file($filename);

  $today = new DateTime();
  $episode['update_at']      = $today->format('Y-m-d');
  $episode['episode_number'] = $_GET['episode_number'];

  write_episode_file($filename, json_encode($episode));
  echo json_encode(array('status' => 'Success'));
  exit;
}

// エピソード情報の取得
$episode_info = read_episode_file ($filename);

$past_day        = new DateTime();
$last_updated_at = new DateTime($episode_info['updated_at'], new DateTimeZone('Asia/Tokyo'));
$past_day_num    = past_day_count($past_day, $last_updated_at);

$episode_info["updated_at"] = date('Y-m-d');

for ($past=0; $past<$past_day_num; $past++) {

  if ($past != 0) $past_day->modify("-1 day");

  $day_of_week = intval($past_day->format('w'));
  if (is_holiday($day_of_week)) continue;

  $episode_info["episode_number"]++;
}

$json = json_encode($episode_info);
write_episode_file($filename, $json);

echo $json;

function read_episode_file ($filename) {
  $handle   = fopen($filename, "r");
  $episode  = (array) json_decode(fread($handle, filesize($filename)));
  fclose($handle);
  return $episode;
}

function write_episode_file ($filename, $json) {
  $handle = fopen($filename, "w");
  fwrite($handle, $json);
  fclose($handle);
}

function past_day_count ($today, $last_updated_at) {
  $past_day = $today->diff($last_updated_at);
  $diff_day = $past_day->format("%d");
  return intval($diff_day);
}

function is_holiday ($week) {
  return $week == 0 || $week == 6;
}
?>
