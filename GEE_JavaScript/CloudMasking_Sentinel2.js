var image = ee.Image('COPERNICUS/S2/20190703T050701_20190703T052312_T43PGP')
var rgbVis = {
  min: 0.0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'],
};

Map.centerObject(image)
Map.addLayer(image, rgbVis, 'Full Image', false)


// Mask clouds in Sentinel-2 satellite imagery using 
// the QA60 quality assessment band.

// Write a function for Cloud masking
function maskS2clouds(image) {
  var qa = image.select('QA60')
  // The band 'QA60' contains bit flags indicating various quality issues
  // More details: https://spatialthoughts.com/2021/08/19/qa-bands-bitmasks-gee/
  // left-shift (<<) and right-shift (>>) operators
  // The QA60 band in Sentinel-2 contains a 16-bit integer where each bit represents
  // a different quality flag:
  // Bit Position: 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0
  //             │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
  // Flags:        [Unused]  CIRRUS CLOUD  [Other quality flags]
  
  // Bit 10 (11th position): Opaque clouds (1 = cloud present, 0 = no cloud)
  // Bit 11 (12th position): Cirrus clouds (1 = cirrus present, 0 = no cirrus)
  var cloudBitMask = 1 << 10;
  // Original: 0000000000000001 (1)
  // Shift 10: 0000010000000000 (1024)
  var cirrusBitMask = 1 << 11;
  
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0))
  return image.updateMask(mask)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

var maskedImage = ee.Image(maskS2clouds(image))
Map.addLayer(maskedImage, rgbVis, 'Masked Image')
