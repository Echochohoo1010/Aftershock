# Geographic Data for Netherlands Network Visualization

## Files

### netherlands-cities.json
- **Description**: Top 50 cities in the Netherlands with population data
- **Source**: https://www.citypopulation.de/en/netherlands/cities/
- **Format**: JSON array of city objects
- **Fields**:
  - `name`: City name
  - `lat`: Latitude (decimal degrees)
  - `lng`: Longitude (decimal degrees)
  - `population`: Population count
  - `type`: Classification (`urban_core` >200k, `town` 50k-200k, `rural` <50k)

### netherlands-map.json
- **Description**: Simplified Netherlands boundary and neighboring countries
- **Source**: Simplified TopoJSON for development (for production, use Natural Earth Data)
- **Format**: TopoJSON
- **Contents**:
  - `netherlands`: Netherlands boundary polygon
  - `neighbors`: Belgium and Germany boundaries
  - `bbox`: Bounding box [minLng, minLat, maxLng, maxLat]

## For Production Use

To get higher quality map data:

1. Visit https://www.naturalearthdata.com/
2. Download "Admin 0 - Countries" at 1:10m resolution
3. Extract Netherlands, Belgium, and Germany polygons
4. Use mapshaper.org to simplify:
   ```
   mapshaper input.json -simplify 10% -o output.json format=topojson
   ```

## Data License

- City data: Public domain (citypopulation.de)
- Map data: Public domain (Natural Earth Data)
