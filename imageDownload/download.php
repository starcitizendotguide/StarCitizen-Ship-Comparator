<?php


$rawData = json_decode(file_get_contents(__DIR__ . '/../parser/raw.json'), true);

foreach($rawData as $value) {
    file_put_contents(__DIR__ . '/../assets/images/' . $value['name'] . '.jpg', file_get_contents('https://robertsspaceindustries.com' . $value['media'][0]['images']['avatar']));
}
