require( "babel-register" )( {
    "sourceMaps": "both",
    "plugins": [
      "transform-runtime",
      "transform-object-rest-spread"
    ],
    "presets": [
      "react",
      [
        "env",
        {
          "targets": {
            "node": "4"
          }
        }
      ]
    ],
    "env": {
      "production": {
        "plugins": [
          "source-map-support"
        ],
        "ignore": [
          "**/__tests__/**"
        ]
      }
    }
  });

require( "./bin" );
