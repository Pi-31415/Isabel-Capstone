<?php
$origin = $_SERVER['HTTP_ORIGIN'];
$allowed_domains = ['https://fictiongrapher.vercel.app/'];
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');

if (isset($_FILES['file']['name'])) {
    /* Getting file name */
    $filename = $_FILES['file']['name'];

    /* Location */
    $location = './upload/' . $filename;
    $imageFileType = pathinfo($location, PATHINFO_EXTENSION);
    $imageFileType = strtolower($imageFileType);

    /* Valid extensions */
    $valid_extensions = ['jpg', 'jpeg', 'png'];

    $response = 0;
    /* Check file extension */
    if (in_array(strtolower($imageFileType), $valid_extensions)) {
        /* Upload file */
        if (move_uploaded_file($_FILES['file']['tmp_name'], $location)) {
            $response = $location;
        }
    }

    echo $response;
    exit();
}

echo 0;
