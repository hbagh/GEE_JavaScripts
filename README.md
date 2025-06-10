# GEE_JavaScripts
This repository contains practical tutorial scripts for various geospatial analysis tasks using Google Earth Engine's JavaScript API. 

### Tutorial: 
📌 Script: [Calculate_Indices1.js](https://github.com/hbagh/GEE_JavaScripts/blob/main/GEE_JavaScript/GEE_JavaScript/Calculate_Indices1.js)

🔹 Description:

* Filters Sentinel-2 imagery (cloud cover <30%, 2019 data).

* Computes three key remote sensing indices: NDVI, MNDWI, SAVI 

* Visualizes results using custom color palettes.


📌 Script: [Calculate_Indices2_Map.js](https://github.com/hbagh/GEE_JavaScripts/blob/main/GEE_JavaScript/Calculate_Indices2_Map.js)

🔹 Description:

This script calculates the NDVI index using Sentinel-2 imagery, applying batch processing `(.map)` to iterate the function over the image collection 


📌 Script: [TimeSeriesNDVI_Reducder.js](https://github.com/hbagh/GEE_JavaScripts/blob/main/GEE_JavaScript/TimeSeriesNDVI_Reducder.js)

🔹 Description:

This script analyzes NDVI time series for a specific agricultural area using Sentinel-2 data, implementing spatial reduction  `(ee.Reducer)` to plot mean vegetation health trends.


📌 Script: [CloudMasking_Sentinel2.js](https://github.com/hbagh/GEE_JavaScripts/blob/main/GEE_JavaScript/CloudMasking_Sentinel2.js)

🔹 Description:

This script demonstrates cloud masking for Sentinel-2 imagery using the QA60 band's bitmask system to filter out opaque and cirrus clouds while preserving visible spectral bands.


📌 Script: [SupervisedClassification.js](https://github.com/hbagh/GEE_JavaScripts/blob/main/GEE_JavaScript/SupervisedClassification.js)

🔹 Description:

This script performs a Random Forest classification (50 trees) on Sentinel-2 imagery to map four land cover classes (built-up, bareland, water, vegetation). The workflow includes: (1) cloud-filtered composite generation, (2) balanced training data sampling (250 points/class), (3) dataset splitting (60% training / 40% validation), and (4) accuracy assessment via confusion matrix. 