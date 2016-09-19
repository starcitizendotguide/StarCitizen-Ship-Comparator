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
  "name": "M50 Interceptor",
  "focus": "Racing / Interception",
  "manufacturer": {
    "name": "Origin Jumpworks GmbH",
    "code": "ORIG"
  },
  "dimension": {
    "length": 11,
    "beam": 10,
    "height": 3
  },
  "mass": { "null_cargo": 12000 },
  "structure": [
    {
      "name": "Engine",
      "value": [
        {
          "model": "HM 4.2",
          "size": 0,
          "rating": 2,
          "multiplier": 2
        }
      ]
    },
    {
      "name": "Thrusters",
      "value": [
        {
          "model": "Scalpel Precision B",
          "size": 0,
          "rating": 1,
          "multiplier": 8
        }
      ]
    },
    {
      "name": "Shield",
      "value": [
        {
          "model": "AllStop FR",
          "size": 2,
          "maxSize": 2,
          "multiplier": 1
        }
      ]
    },
    {
      "name": "Factory power plant",
      "value": [
        {
          "model": "Starheart II",
          "size": 1,
          "maxSize": 2,
          "multiplier": 2
        }
      ]
    },
    {
      "name": "Miscellaneous",
      "value": [
        {
          "name": "Cargo capacity",
          "value": 0
        },
        {
          "name": "Max crew",
          "value": 1
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
 
