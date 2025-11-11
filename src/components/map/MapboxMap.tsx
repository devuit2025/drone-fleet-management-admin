import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import type { FeatureCollection, Polygon } from 'geojson';

interface MapboxMapProps {
    className?: string;
    style?: CSSProperties;
    features?: FeatureCollection<Polygon> | null;
    onFeaturesChange?: (features: FeatureCollection<Polygon>) => void;
    disabledZones?: FeatureCollection<Polygon> | null;
    readOnly?: boolean;
}
const baseClassName = 'relative h-72 w-full overflow-hidden rounded-md border bg-muted';
const paragraphStyle: CSSProperties = {
    fontSize: 13,
    margin: '0 0 10px',
};

export function MapboxMap({
    className,
    style,
    features = null,
    onFeaturesChange,
    disabledZones = null,
    readOnly = false,
}: MapboxMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const drawRef = useRef<any>(null);
    const [roundedArea, setRoundedArea] = useState<number | null>(null);

    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    useEffect(() => {
      if (!containerRef.current) return;
      if (!token) return;
      if (mapRef.current) return;
      mapboxgl.accessToken = token;
  
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current as HTMLElement,
        style: 'mapbox://styles/mapbox/standard-satellite',
        center: [-91.874, 42.76],
        zoom: 12
      });
  
      if (!readOnly) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
        //   defaultMode: 'draw_polygon'
        });
        mapRef.current.addControl(draw);
        drawRef.current = draw;

        function updateArea() {
          const data = draw.getAll() as FeatureCollection<Polygon>;
          console.log('data', data);
          if (data.features.length > 0) {
            const area = turf.area(data);
            setRoundedArea(Math.round(area * 100) / 100);
          } else {
            setRoundedArea(0);
          }
          if (onFeaturesChange) onFeaturesChange(data);
        }

        mapRef.current.on('draw.create', updateArea);
        mapRef.current.on('draw.delete', updateArea);
        mapRef.current.on('draw.update', updateArea);
      }

      // Add disabled zones source/layer if provided
      mapRef.current.on('load', () => {
        if (disabledZones) {
          if (!mapRef.current!.getSource('no-fly-zones')) {
            mapRef.current!.addSource('no-fly-zones', {
              type: 'geojson',
              data: disabledZones as any,
            });
            mapRef.current!.addLayer({
              id: 'no-fly-zones-fill',
              type: 'fill',
              source: 'no-fly-zones',
              paint: {
                'fill-color': '#ef4444',
                'fill-opacity': 0.35,
              },
            });
            mapRef.current!.addLayer({
              id: 'no-fly-zones-outline',
              type: 'line',
              source: 'no-fly-zones',
              paint: {
                'line-color': '#b91c1c',
                'line-width': 2,
              },
            });
          }
        }
      });
    }, []);

    // Hydrate the draw layer with incoming features from parent
    useEffect(() => {
      const draw = drawRef.current;
      if (!draw) return;
      try {
        if (readOnly) return;
        draw.deleteAll();
        if (features && features.features && features.features.length > 0) {
          draw.add(features as any);
        }
      } catch (_) {
        // ignore invalid payloads
      }
    }, [features]);

    // Update disabled zones data when prop changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const src = map.getSource('no-fly-zones') as mapboxgl.GeoJSONSource | undefined;
      if (src && disabledZones) {
        src.setData(disabledZones as any);
      }
    }, [disabledZones]);

    const combinedClassName = [baseClassName, className].filter(Boolean).join(' ');

    if (!token) {
        return (
            <div className={combinedClassName} style={style}>
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    Thiếu cấu hình Mapbox token. Thêm biến môi trường <code>VITE_MAPBOX_TOKEN</code> để hiển thị bản đồ.
                </div>
            </div>
        );
    }

    if (!mapboxgl.supported()) {
        return (
            <div className={combinedClassName} style={style}>
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    Trình duyệt hiện tại không hỗ trợ Mapbox GL.
                </div>
            </div>
        );
    }

    return (
        <div className={combinedClassName} style={style}>
            <div ref={containerRef} id="map" style={{ height: '100%', width: '100%' }} />
            <div
                className="calculation-box"
                style={{
                    height: 100,
                    width: 150,
                    position: 'absolute',
                    bottom: 40,
                    left: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: 15,
                    textAlign: 'center',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
            >
                <p style={paragraphStyle}>Click the map to draw a polygon.</p>
                <div id="calculated-area">
                    {roundedArea !== null && (
                        <>
                            <p style={paragraphStyle}>
                                <strong>{roundedArea}</strong>
                            </p>
                            <p style={paragraphStyle}>square meters</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
