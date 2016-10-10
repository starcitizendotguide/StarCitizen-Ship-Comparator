<?php

/**
* THIS SCRIPT SUCKS. I DEVELOPED IT BECAUSE
* I NEEDED A SIMPLE SCRIPT TO PARSE DATA FROME _ONE_ WEBSITE
* IT HAS ONLY BEED DEVELOPED TO SERVE AS PARSER FOR THE _RSI_ WEBSITE.
*
* The code is not meeting my normal standards at all, nor does error handling
* exist.
*
*
* Once my services is running smoothly I will develope a way better and
* easier expandable script.
*
* Enjoy.
*/

// load all links to all ship pages
// I've to do is this way, because CIG is only loading
// a couple of ships at the first time, and you actually
// have to scroll before you get the rest. No clue how
// to solve this with PHP.
$shipPage = file_get_contents('website.txt');
$ships = []; // Array to store all links to all ships

// Load a DOMDocument
$dom = new DOMDocument();
libxml_use_internal_errors(true);
$dom->loadHTML($shipPage);

$links = $dom->getElementsByTagName('a');

for ($i = 0; $i < $links->length; $i++) {

    $item = $links->item($i);
    if($item->getAttribute('class') == 'filet') {
        $ships[] = 'https://robertsspaceindustries.com' . $item->getAttribute('href');
    }

}

// Set to null to prevent confusion
$dom = null;

// Settings
$startDelimiter = 'RSI.ShipStatsApp.app = new RSI.ShipStatsApp.StatsAppView(';
$endDelimiter = '$(window).load(function() {';

// PARSED DATA
$rawData = [];

$shipList = [];

// Parse Ship Date
$x = 1;
$shipCount = count($ships);
foreach($ships as $ship) {

    echo 'Parsing ship ' .  $x . ' of ' . $shipCount . PHP_EOL;
    $doc = new DOMDocument();
    $doc->loadHTML(file_get_contents($ship));


    $content = $doc->textContent;
    $value = substr($content, strpos($content, $startDelimiter) + strlen($startDelimiter));
    $value = substr($value, 0, strpos($value, $endDelimiter) - 20);

    $value = preg_replace( "/\r|\n/", "", $value);

    // let JS convert it
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);

    curl_setopt_array($curl, [
        CURLOPT_URL             => 'http://127.0.0.1:8001/transform',
        CURLOPT_HEADER          => false,
        CURLOPT_HTTPHEADER      => array('Content-Type: application/x-www-form-urlencoded'),
        CURLOPT_POSTFIELDS      => http_build_query(array('data' => $value)),
        CURLOPT_RETURNTRANSFER  => true
    ]);

    $value = curl_exec($curl);
    curl_close($curl);

    if(json_decode($value, true) === false) {
        echo 'ERROR: ' . $ship . PHP_EOL;
    }

    // ships
    $parsedShips = json_decode($value, true)['data'];
    foreach($parsedShips as $dataSet) {
        if (!(array_key_exists($dataSet['name'], $shipList))) {
            $shipList[$dataSet['name']] = true;
            $rawData[] = $dataSet;
        }
    }

    $x++;
}

file_put_contents('raw.json', json_encode($rawData));

/**
* HERE IS THE DATA CONVERTER
*
*
*/

function countIn($data, $field, $check) {
    $x = 0;
    foreach($data as $key) {
        if($key[$field] == $check){
            $x++;
        }
    }
    return $x;
}

function findIn($data, $field, $check) {
    foreach($data as $key) {
        if($key[$field] == $check){
            return $key;
        }
    }
    return null;
}

function getIndex($data, $field, $check) {
    for($i = 0; $i < count($data); $i++) {
        $value = $data[$i];

        if(array_key_exists($field, $value) && $value[$field] == $check) {
            return $i;
        }
    }

    return -1;
}

$data = array();
foreach($rawData as $value) {

    echo 'Processing the ' . $value['name'] . PHP_EOL;

    // Thrusters & Engine
    $thrusters = [];
    $engines = [];
    foreach($value['propulsion'] as $component) {

        // Thrusters
        if($component['type'] == 'M') {
            $key = $component['component']['name'];
            $index = getIndex($thrusters, 'model', $key);

            if(!($index === -1)) {
                $thrusters[$index]['multiplier']++;
            } else {
                $thrusters[] = [
                    'model'     => $key,
                    'size'      => intval($component['component']['size']),
                    'rating'    => intval($component['rating']),
                    'multiplier'=> 1
                ];
            }
        }

        // Engine
        else if($component['type'] == 'E') {
            $key = $component['component']['name'];
            $index = getIndex($engines, 'model', $key);

            if(!($index === -1)) {
                $engines[$index]['multiplier']++;
            } else {
                $engines[] = [
                    'model'     => $key,
                    'size'      => intval($component['component']['size']),
                    'rating'    => intval($component['rating']),
                    'multiplier'=> 1
                ];
            }
        }

    }

    // Shield & Factory Power Plant & Additional
    $shields = [];
    $factoryPowerPlants = [];
    $additionals = [];

    foreach($value['modular'] as $component) {

        // Shields
        if($component['component']['type'] == 'shieldgenerator') {
            $key = trim($component['component']['name']);
            $index = getIndex($shields, 'model', $key);

            if(!($index === -1)) {
                $shields[$index]['multiplier']++;
            } else {
                $shields[] = [
                    'model'     => $key,
                    'size'      => intval($component['component']['size']),
                    'maxSize'  => intval($component['max_size']),
                    'multiplier'=> 1
                ];
            }
        }

        // Powerplants
        else if($component['component']['type'] == 'powerplant') {
            $key = trim($component['component']['name']);
            $index = getIndex($factoryPowerPlants, 'model', $key);

            if(!($index === -1)) {
                $factoryPowerPlants[$index]['multiplier']++;
            } else {
                $factoryPowerPlants[] = [
                    'model'     => $key,
                    'size'      => intval($component['component']['size']),
                    'maxSize'   => intval($component['max_size']),
                    'multiplier'=> 1
                ];
            }
        } else {
            $additionals[] = [
                'name'  => trim($component['component']['name']),
                'value' => null
            ];
        }

    }

    // Ordnance
    $ordnance = [];

    /**
    * [
    *   [
    *       'name'  => 'Class 1',
    *       'value' => [
    *           [
    *               'name'  => 'CF-117 Badger',
    *               'value' => [
    *                   'max_size' => 1,
    *                   'quantity' => 1,
    *                   'size'     => 2,
    *                   'multiplier' => 2,
    *               ]
    *           ]
    *        ]
    *   ]
    * ]
    */

    foreach($value['ordnance'] as $component) {

        $key = 'Class ' . trim($component['class']);
        $index = -1;

        // find the index
        for($i = 0; $i < count($ordnance); $i++) {
            if($ordnance[$i]['name'] == $key) {
                $index = $i;
                break;
            }
        }

        if(!($index === -1)) {

            // Contains the current weapon
            $weaponIndex = -1;
            for($i = 0; $i < count($ordnance[$index]['value']); $i++) {
                if(array_key_exists('component', $component) && !($component['component'] === null) && array_key_exists('name', $component['component'])) {
                    if($ordnance[$index]['value'][$i]['model'] == $component['component']['name']) {
                        $weaponIndex = $i;
                        break;
                    }
                } else {
                    if($ordnance[$index]['value'][$i]['model'] == $component['name']) {
                        $weaponIndex = $i;
                        break;
                    }
                }
            }

            // The Class & The Weapon already exists, update multiplier
            if(!($weaponIndex == -1)) {

                $ordnance[$index]['value'][$i]['multiplier']++;

            } else {

                //If a valid component in the component section exists...
                if(array_key_exists('component', $component) && !($component['component'] === null) && array_key_exists('name', $component['component'])) {
                    $ordnance[$index]['value'][] = [
                        'model'  => $component['component']['name'],
                        'maxSize'   => intval($component['max_size']),
                        'quantity'  => intval($component['quantity']),
                        'size'      => intval($component['component']['size']),
                        'multiplier'=> 1,
                    ];
                }
                //If no name in the component exists
                else if(!($component['component'] === null) && array_key_exists('name', $component['component']))  {
                    $ordnance[$index]['value'][] = [
                        'model'  => $component['name'],
                        'maxSize'   => intval($component['max_size']),
                        'quantity'  => intval($component['quantity']),
                        'size'      => intval($component['component']['size']),
                        'multiplier'=> 1,
                    ];
                }
                //If the component is null
                else {
                    $ordnance[$index]['value'][] = [
                        'model'  => $component['name'],
                        'maxSize'   => intval($component['max_size']),
                        'quantity'  => intval($component['quantity']),
                        'size'      => 0, // TODO The current date set contains in this case no size...
                        'multiplier'=> 1,
                    ];
                }

            }

        } else {

            //If a valid component in the component section exists...
            if(array_key_exists('component', $component) && !($component['component'] === null) && array_key_exists('name', $component['component'])) {

                $ordnance[] = [
                    'name'  => $key,
                    'value' => [
                        [
                            'model'  => $component['component']['name'],
                            'maxSize'   => intval($component['max_size']),
                            'quantity'  => intval($component['quantity']),
                            'size'      => intval($component['component']['size']),
                            'multiplier'=> 1,
                        ]
                    ]
                ];
            }
            //If no name in the component exists
            else if(!($component['component'] === null) && array_key_exists('name', $component['component']))  {
                $ordnance[] = [
                    'name'  => $key,
                    'value' => [
                        [
                            'model'  => $component['name'],
                            'maxSize'   => intval($component['max_size']),
                            'quantity'  => intval($component['quantity']),
                            'size'      => intval($component['component']['size']),
                            'multiplier'=> 1,
                        ]
                    ]
                ];
            }
            //If the component is null
            else {
                $ordnance[] = [
                    'name'  => $key,
                    'value' => [
                        [
                            'model'  => $component['name'],
                            'maxSize'   => intval($component['max_size']),
                            'quantity'  => intval($component['quantity']),
                            'size'      => 0, // TODO The current date set contains in this case no size...
                            'multiplier'=> 1,
                        ]
                    ]
                ];
            }

        }

    }

    // Put everything together
    $entry = array(
        'name'          => trim($value['name']),
        'focus'         => trim($value['focus']),
        'manufacturer'  => [
            'name'  => trim($value['manufacturer']['name']),
            'code'  => trim($value['manufacturer']['code'])
        ],
        'dimension'     => [
            'length'=> floatval($value['length']),
            'beam'  => floatval($value['beam']),
            'height'=> floatval($value['height'])
        ],
        'mass'          => [
            'null_cargo' => floatval($value['mass'])
        ],
        'structure'     => [
            [
                'name'          => 'Engine',
                'value'         => $engines,
            ],
            [
                'name'          => 'Thrusters',
                'value'         => $thrusters,
            ],
            [
                'name'          => 'Shield',
                'value'         => $shields,
            ],
            [
                'name'          => 'Factory power plant',
                'value'         => $factoryPowerPlants,
            ],
            [
                'name'          => 'Ordnance',
                'value'         => $ordnance,
            ],
            [
                'name'          => 'Miscellaneous',
                'value'         => [
                    [
                        'name'          => 'Cargo capacity',
                        'value'         => intval($value['cargocapacity'])
                    ],
                    [
                        'name'          => 'Max crew',
                        'value'         => intval($value['maxcrew'])
                    ],
                    [
                        'name'          => 'Additional',
                        'value'         => $additionals
                    ]
                ]
            ]
        ]
    );

    $data[] = [
        'name'  => $entry['name'],
        'value' => json_encode($entry)
    ];

}

file_put_contents('result.json', json_encode($data));
