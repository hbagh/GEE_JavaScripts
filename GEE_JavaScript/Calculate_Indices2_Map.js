var urban = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");
    
var tehran = urban.filter(ee.Filter.eq('ADM1_NAME', 'Tehran'))
var geometry = tehran.geometry()
// zoom to layer
Map.centerObject(geometry)


var s2 = ee.ImageCollection("COPERNICUS/S2");
var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry))

var composite = filtered.median().clip(geometry)

var rgbVis = {min: 0.0, max: 3000, bands: ['B4', 'B3', 'B2']};
Map.addLayer(composite, rgbVis, 'Tehran Composite')  


// Write a function that computes NDVI for an image and adds it as a band
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('ndvi');
  return image.addBands(ndvi);
}

// Map the function over the collection
// The map() function applies a given function to each element 
// in a collection (like an ImageCollection or FeatureCollection).
var withNdvi = filtered.map(addNDVI);
print(withNdvi)

var composite = withNdvi.median()
print(composite)

var ndviComposite = composite.select('ndvi').clip(geometry)
print(ndviComposite)

var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'];

var ndviVis = {min:0, max:0.5, palette: palette }
Map.addLayer(ndviComposite, ndviVis, 'ndvi')