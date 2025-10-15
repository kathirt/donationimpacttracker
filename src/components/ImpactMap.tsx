import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as atlas from 'azure-maps-control';
import './ImpactMap.css';

export const ImpactMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<atlas.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  // Sample coordinates for impact locations
  const impactLocations = useMemo(() => [
    { name: 'Kenya Rural School', position: [37.9062, -0.0236], type: 'education', impact: 450 },
    { name: 'Ghana Library Project', position: [-1.0232, 7.9465], type: 'education', impact: 320 },
    { name: 'India Nutrition Program', position: [77.1025, 28.7041], type: 'nutrition', impact: 1200 },
    { name: 'Philippines School Supplies', position: [121.7740, 12.8797], type: 'education', impact: 680 },
    { name: 'Brazil Literacy Campaign', position: [-47.8825, -15.7942], type: 'education', impact: 290 },
    { name: 'Tanzania Water & Education', position: [34.8888, -6.3690], type: 'education', impact: 520 },
    { name: 'Mexico Rural Schools', position: [-102.5528, 23.6345], type: 'education', impact: 380 },
    { name: 'Cambodia Book Distribution', position: [104.9160, 11.5564], type: 'education', impact: 420 }
  ], []);

  const addDataToMap = useCallback((mapInstance: atlas.Map) => {
    // Create data source
    const dataSource = new atlas.source.DataSource();
    mapInstance.sources.add(dataSource);

    // Add impact location points
    impactLocations.forEach(location => {
      const point = new atlas.data.Feature(new atlas.data.Point(location.position), {
        name: location.name,
        type: location.type,
        impact: location.impact,
        description: `${location.impact} beneficiaries reached`
      });
      dataSource.add(point);
    });

    // Add bubble layer for impact visualization
    const bubbleLayer = new atlas.layer.BubbleLayer(dataSource, undefined, {
      radius: [
        'interpolate',
        ['linear'],
        ['get', 'impact'],
        100, 5,
        1500, 30
      ],
      color: [
        'case',
        ['==', ['get', 'type'], 'education'], '#4ecdc4',
        ['==', ['get', 'type'], 'nutrition'], '#ff6b6b',
        '#45b7d1'
      ],
      strokeColor: '#ffffff',
      strokeWidth: 2,
      opacity: 0.8
    });

    mapInstance.layers.add(bubbleLayer);

    // Add popup on click
    const popup = new atlas.Popup();
    mapInstance.events.add('click', bubbleLayer, (e: any) => {
      if (e.shapes && e.shapes.length > 0) {
        const properties = e.shapes[0].getProperties();
        popup.setOptions({
          content: `
            <div style="padding: 10px;">
              <h3>${properties.name}</h3>
              <p><strong>Type:</strong> ${properties.type}</p>
              <p><strong>Impact:</strong> ${properties.impact} beneficiaries</p>
              <p>${properties.description}</p>
            </div>
          `,
          position: e.shapes[0].getCoordinates()
        });
        popup.open(mapInstance);
      }
    });
  }, [impactLocations]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Azure Map with environment variable
    const azureMapsClientId = process.env.REACT_APP_AZURE_MAPS_CLIENT_ID;
    
    if (!azureMapsClientId) {
      console.warn('Azure Maps Client ID not configured. Map functionality may be limited.');
    }

    const mapInstance = new atlas.Map(mapContainerRef.current, {
      center: [0, 20],
      zoom: 2,
      style: 'road',
      authOptions: azureMapsClientId ? {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: azureMapsClientId
      } : {
        authType: atlas.AuthenticationType.anonymous,
        clientId: 'demo-client-id',
        getToken: function (resolve, reject) {
          // For demo purposes only - in production this should call a backend service
          console.warn('Using demo authentication. Configure REACT_APP_AZURE_MAPS_CLIENT_ID for production.');
          resolve('demo-token');
        }
      }
    });

    mapInstance.events.add('ready', () => {
      setMap(mapInstance);
      setMapLoaded(true);
      addDataToMap(mapInstance);
    });

    return () => {
      if (mapInstance) {
        mapInstance.dispose();
      }
    };
  }, [addDataToMap]);

  if (!mapLoaded) {
    return (
      <div className="impact-map-loading">
        <div className="loading-spinner"></div>
        <p>Loading Impact Map...</p>
      </div>
    );
  }

  return (
    <div className="impact-map">
      <div className="map-header">
        <h1>Global Impact Map</h1>
        <p>Visualize donation impact across the globe</p>
        
        <div className="map-controls">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-selector"
          >
            <option value="all">All Impact Types</option>
            <option value="education">Education Programs</option>
            <option value="nutrition">Nutrition Programs</option>
            <option value="healthcare">Healthcare Initiatives</option>
          </select>
        </div>
      </div>
      
      <div className="map-container">
        <div ref={mapContainerRef} className="azure-map" style={{ height: '500px', width: '100%' }}>
          {/* Azure Map will be rendered here */}
        </div>
        
        <div className="map-overlay">
          <div className="impact-summary">
            <h3>Global Impact Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{impactLocations.length}</span>
                <span className="stat-label">Active Locations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{impactLocations.reduce((sum, loc) => sum + loc.impact, 0).toLocaleString()}</span>
                <span className="stat-label">Total Beneficiaries</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">89</span>
                <span className="stat-label">Countries Reached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="map-legend">
        <h3>Impact Categories</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4ecdc4' }}></div>
            <span>Education Programs</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
            <span>Nutrition Programs</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#45b7d1' }}></div>
            <span>Healthcare Initiatives</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#96ceb4' }}></div>
            <span>Infrastructure Projects</span>
          </div>
        </div>
        
        <div className="map-instructions">
          <p><strong>Interactive Features:</strong></p>
          <ul>
            <li>Click on bubble markers to see detailed impact information</li>
            <li>Bubble size represents the number of beneficiaries</li>
            <li>Use the dropdown to filter by impact type</li>
            <li>Zoom and pan to explore different regions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};