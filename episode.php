<?php

$filename = "episode.json";

if (isset($_GET["episode_number"])) {
	$episode = read_episode_file ($filename);

	$today = new DateTime();
	$episode["update_at"] 		 = $today->format("Y-m-d");
	$episode["episode_number"] = $_GET["episode_number"];
	write_episode_file($filename, json_encode($episode));
	exit;
}

$episode = read_episode_file ($filename);

$today 					= new DateTime();
$last_update_at = new DateTime($episode["update_at"]);
$past_day_num 	= past_day($today, $last_update_at);

$episode["update_at"] = $today->format("Y-m-d");

for ($past=1; $past<=$past_day_num; $past++) {
	// 土日は飛ばす
	$past_day  = $today->modify("-".$past." day");
	$past_week = intval($past_day->format("w"));
	if (is_holiday($past_week)) continue;

	$episode["episode_number"]++;
}

$json = json_encode($episode);
write_episode_file($filename, $json);

echo $json;


function read_episode_file ($filename) {
	$handle		= fopen($filename, "r");
	$episode 	= (array) json_decode(fread($handle, filesize($filename)));
	fclose($handle);
	return $episode;
} 

function write_episode_file ($filename, $json) {
	$handle = fopen($filename, "w");
	fwrite($handle, $json);
	fclose($handle);
}

function past_day ($today, $last_update_at) {
	$past_day = $today->diff($last_update_at);
	$diff_day = $past_day->format("%d");
	return intval($diff_day);
}

function is_holiday ($week) {
	return $week == 0 || $week == 6;
}
?>
