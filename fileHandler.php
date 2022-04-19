<?php
$origin = $_SERVER['HTTP_ORIGIN'];
$allowed_domains = ['https://fictiongrapher.vercel.app/'];

if (in_array($origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');

$t = time();
$filename = date('Y_M_d_H-i-s', $t) . '.json';
$content = $_POST['content'];

($myfile = fopen('./backup/' . $filename, 'w')) or die('Unable to open file!');
$txt = $content;
fwrite($myfile, $txt);
fclose($myfile);

($myfile = fopen('./lastfilename.txt', 'w')) or die('Unable to open file!');
$txt = $filename;
fwrite($myfile, $txt);
fclose($myfile);

?>
