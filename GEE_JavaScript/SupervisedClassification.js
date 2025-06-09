// Load and display the Tehran region.

var urban = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
var tehran = urban.filter(ee.Filter.eq('ADM1_NAME', 'Tehran'));
var geometry = tehran.geometry();
Map.centerObject(geometry);
Map.addLayer(tehran, {color: 'red'}, 'Tehran');

// Load Sentinel-2 image collection and create a median composite.
var s2 = ee.ImageCollection("COPERNICUS/S2")
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry));

var composite = s2.median().clip(geometry);

// Display the composite.
var rgbVis = {min: 0.0, max: 3000, bands: ['B4', 'B3', 'B2']};
Map.addLayer(composite, rgbVis, 'Image');


// Add landcover property to each class
builtup = builtup.map(function(f) { return f.set('landcover', 0); });
bareland = bareland.map(function(f) { return f.set('landcover', 1); });
water = water.map(function(f) { return f.set('landcover', 2); });
vegetation = vegetation.map(function(f) { return f.set('landcover', 3); });

// Function to sample points from polygons
function samplePoints(fc, numPoints) {
  // First, calculate how many points per feature we need
  var count = fc.size();
  var pointsPerFeature = ee.Number(numPoints).divide(count).round();
  
  // Sample the points
  return fc.map(function(feature) {
    // Sample points within each feature
    var points = ee.FeatureCollection.randomPoints({
      region: feature.geometry(),
      points: pointsPerFeature,
      seed: 0
    });
    // Add the landcover property to each point
    return points.map(function(point) {
      return point.set('landcover', feature.get('landcover'));
    });
  }).flatten();
}

// Sample 250 points for each class
var builtupPoints = samplePoints(builtup, 250);
var barelandPoints = samplePoints(bareland, 250);
var waterPoints = samplePoints(water, 250);
var vegetationPoints = samplePoints(vegetation, 250);

// Combine all points
var gcp = builtupPoints
  .merge(barelandPoints)
  .merge(waterPoints)
  .merge(vegetationPoints);
print('Balanced samples', gcp);

// Display the GCPs
// We use the style() function to style the GCPs
var palette = ee.List(['gray','brown','blue','green'])
var landcover = ee.List([0, 1, 2, 3])

var gcpsStyled = ee.FeatureCollection(
  landcover.map(function(lc){
    var color = palette.get(landcover.indexOf(lc));
    var markerStyle = { color: 'white', pointShape: 'diamond', 
      pointSize: 4, width: 1, fillColor: color}
    return gcp.filter(ee.Filter.eq('landcover', lc))
                .map(function(point){
                  return point.set('style', markerStyle)
                })
      })).flatten();
      
Map.addLayer(gcpsStyled.style({styleProperty:"style"}), {}, 'GCPs')


// Add a random column and split the GCPs into training and validation set
var gcp = gcp.randomColumn()

// This being a simpler classification, we take 60% points
// for validation. Normal recommended ratio is
// 70% training, 30% validation
var trainingGcp = gcp.filter(ee.Filter.lt('random', 0.6));
var validationGcp = gcp.filter(ee.Filter.gte('random', 0.6));

// Overlay the point on the image to get training data.
var training = composite.sampleRegions({
  collection: trainingGcp,
  properties: ['landcover'],
  scale: 10,
  tileScale: 16
});

//************************************************************************** 
// Train a classifier
//**************************************************************************  

// Train a classifier.
var classifier = ee.Classifier.smileRandomForest(50)
.train({
  features: training,  
  classProperty: 'landcover',
  inputProperties: composite.bandNames()
});

// Classify the image.
var classified = composite.classify(classifier);

Map.addLayer(classified, 
            {min: 0, max: 3, palette: ['gray', 'brown', 'blue', 'green']}, '2019');

//************************************************************************** 
// Accuracy Assessment
//************************************************************************** 

// Use classification map to assess accuracy using the validation fraction
// of the overall training set created above.
var test = classified.sampleRegions({
  collection: validationGcp,
  properties: ['landcover'],
  tileScale: 16,
  scale: 10,
});
print(test)

var testConfusionMatrix = test.errorMatrix('landcover', 'classification')
// Printing of confusion matrix may time out. Alternatively, you can export it as CSV
print('Confusion Matrix', testConfusionMatrix);
print('Test Accuracy', testConfusionMatrix.accuracy());