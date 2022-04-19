<?php
$origin = $_SERVER['HTTP_ORIGIN'];
$allowed_domains = ['https://fictiongrapher.vercel.app/'];
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');

if (in_array($origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');

($myfile = fopen('lastfilename.txt', 'r')) or die('Unable to open file!');
echo fread($myfile, filesize('lastfilename.txt'));
fclose($myfile);
?>
