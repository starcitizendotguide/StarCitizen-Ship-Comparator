## Data Set

Here you find all data-sets in JSON format that will be fed into an Algolia database. - The syntax of the JSON strucutre is the following:
```json
[
   {
      "name":"<Ship Name>",
      "value":"<Ship Data (JSON String)>"
   },
   [..]
]
```

All ships are stored in a JSON array, the array consists of objects with a "name" and "value" field. The name field contains the name of
the ship, and the value field contains another JSON string containing all information about the ship. I've choosen this way, because Algolia
is not able to handle JSON constructions with a higher depth than 2 (? - it's not enough for this project).

### Ship Value JSON Structure

This is an example value JSON string. - This is subject to change, but I will try to stick this format as much as possible.

```json
{

  "name": "Javelin-class Destroyer",
  "focus": "Capital Ship",
  "manufacturer": {
    "name": "Aegis Dynamics",
    "code": "AEGS"
  },
  "dimension": {
    "length": 345,
    "beam": 148,
    "height": 65
  },
  "mass": { "null_cargo": 0 },
  "structure": [
    {
      "name": "Engine",
      "value": [
        {
          "model": "Coming Soon",
          "size": 0,
          "rating": 7,
          "multiplier": 16
        }
      ]
    },
    {
      "name": "Thrusters",
      "value": [ ]
    },
    {
      "name": "Shield",
      "value": [
        {
          "model": "Coming Soon",
          "size": 0,
          "maxSize": 0,
          "multiplier": 1
        }
      ]
    },
    {
      "name": "Factory power plant",
      "value": [
        {
          "model": "Coming Soon",
          "size": 0,
          "maxSize": 8,
          "multiplier": 2
        }
      ]
    },
    {
      "name": "Ordnance",
      "value": [
        {
          "name": "Class 6",
          "value": [
            {
              "name": "Coming Soon",
              "value": {
                "maxSize": 5,
                "quantity": 1,
                "size": 0,
                "multiplier": 13
              }
            }
          ]
        },
        {
          "name": "Class 7",
          "value": [
            {
              "name": "Manned Turret",
              "value": {
                "maxSize": 7,
                "quantity": 1,
                "size": 0,
                "multiplier": 2
              }
            }
          ]
        },
        {
          "name": "Class 9",
          "value": [
            {
              "name": "Anti-Capital Torpedo Launcher",
              "value": {
                "maxSize": 0,
                "quantity": 1,
                "size": 0,
                "multiplier": 2
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Miscellaneous",
      "value": [
        {
          "name": "Cargo capacity",
          "value": 5400
        },
        {
          "name": "Max crew",
          "value": 0
        },
        {
          "name": "Additional",
          "value": [ ]
        }
      ]
    }
  ]
}
```
