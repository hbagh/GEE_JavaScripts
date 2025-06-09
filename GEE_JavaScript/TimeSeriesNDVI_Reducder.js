var s2 = ee.ImageCollection("COPERNICUS/S2");

var geometry = ee.Geometry.Polygon([[
  [52.282146016638684,36.47239210045091],
  [52.3157916465215,36.47239210045091],
  [52.3157916465215,36.488403128097644],
  [52.282146016638684,36.488403128097644],
  [52.282146016638684,36.47239210045091]
  ]]);
  
Map.addLayer(geometry, {color: 'red'}, 'Farm')
Map.centerObject(geometry)

var rgbVis = {min: 0.0, max: 3000, bands: ['B4', 'B3', 'B2']};

var filtered = s2
  .filter(ee.Filter.date('2017-01-01', '2018-01-01'))
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.bounds(geometry))

// Write a function for Cloud masking
function maskS2clouds(image) {
  var qa = image.select('QA60')
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0))
  return image.updateMask(mask)//.divide(10000)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

var filtered = filtered.map(maskS2clouds)

// Write a function that computes NDVI for an image and adds it as a band
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('ndvi');
  return image.addBands(ndvi);
}

// Map the function over the collection
var withNdvi = filtered.map(addNDVI);

// Reduce operations aggregate data by combining multiple values into a single result.
// Common Reduce Operations:
  // reduce() - General purpose reducer
  // mean(), median(), min(), max(), sum() - Statistical reducers
  // reduceRegions() - Reduces image values in specified regions
  // reduceToImage() - Reduces values to produce a new image
  
// Display a time-series chart
var chart = ui.Chart.image.series({
  imageCollection: withNdvi.select('ndvi'),
  region: geometry,
  reducer: ee.Reducer.mean(),
  scale: 20
}).setOptions({
      lineWidth: 1,
      title: 'NDVI Time Series',
      interpolateNulls: true,
      vAxis: {title: 'NDVI'},
      hAxis: {title: '', format: 'YYYY-MMM'}
    })
print(chart);