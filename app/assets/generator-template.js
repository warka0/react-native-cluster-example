// Use this generator on json-generator.com
[
  '{{repeat(50, 150)}}',
  {
    type: "Feature",
    properties: {
      _id: '{{objectId()}}',
      index: '{{index()}}',
      featureclass: function () {
        var category = ["A","B","C","D","E"];
        return category[Math.floor(Math.random() * category.length) + 0  ];
      }
    },
    geometry: {
      type: "Point",
      coordinates: [
        '{{floating(5.366135 , 5.419521 )}}',
        '{{floating(43.312778 , 43.268796 )}}'
      ]
    }
  }
]
