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
    markers?: Array<{ id?: string | number; lon: number; lat: number; label?: string; altitude?: string; color?: string }>;
    onDrawCreate?: (feature: Polygon) => void;
    onDrawUpdate?: (id: string | number, feature: Polygon) => void;
    onDrawDelete?: (id: string | number) => void;
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
    markers = [],
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
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
        center: [106.6927, 10.7769], // Quận 1, TP.HCM
        zoom: 14
      });
  
      if (!readOnly) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            trash: true,
            polygon: true,
          },
        });
        mapRef.current.addControl(draw);
        drawRef.current = draw;

        function updateArea() {
          const data = draw.getAll() as FeatureCollection<Polygon>;
          if (data.features.length > 0) {
            const area = turf.area(data);
            setRoundedArea(Math.round(area * 100) / 100);
          } else {
            setRoundedArea(0);
          }
          if (onFeaturesChange) onFeaturesChange(data);
        }

        mapRef.current.on('draw.create', (e: any) => {
          // Xóa tất cả feature cũ, chỉ giữ lại feature mới vừa tạo
          const allFeatures = draw.getAll();
          const newFeatureId = e.features[0].id;
          const newFeature = e.features[0];
          allFeatures.features.forEach((feature: any) => {
            if (feature.id !== newFeatureId) {
              draw.delete(feature.id);
            }
          });
          // Gọi callback nếu có
          if (onDrawCreate && newFeature.geometry && newFeature.geometry.type === 'Polygon') {
            onDrawCreate(newFeature.geometry as Polygon);
          }
          updateArea();
        });
        mapRef.current.on('draw.delete', (e: any) => {
          // Lấy id từ feature bị xóa
          if (e.features && e.features.length > 0) {
            const deletedFeature = e.features[0];
            const featureId = deletedFeature.id;
            // Gọi callback nếu có
            if (onDrawDelete && featureId) {
              onDrawDelete(featureId);
            }
          }
          updateArea();
        });
        mapRef.current.on('draw.update', (e: any) => {
          // Lấy id và geometry từ feature được update
          if (e.features && e.features.length > 0) {
            const updatedFeature = e.features[0];
            const featureId = updatedFeature.id;
            // Gọi callback nếu có
            if (onDrawUpdate && featureId && updatedFeature.geometry && updatedFeature.geometry.type === 'Polygon') {
              onDrawUpdate(featureId, updatedFeature.geometry as Polygon);
            }
          }
          updateArea();
        });
      }

      mapRef.current.on('load', () => {
        mapRef.current!.addSource('readonly-polygons', {
          type: 'geojson',
          data: features ?? { type: 'FeatureCollection', features: [] },
        });
        mapRef.current!.addLayer({
          id: 'readonly-polygons-fill',
          type: 'fill',
          source: 'readonly-polygons',
          paint: {
            'fill-color': [
              'coalesce',
              ['get', 'color'],
              '#0ea5e9',
            ],
            'fill-opacity': 0.25,
          },
        });
        mapRef.current!.addLayer({
          id: 'readonly-polygons-outline',
          type: 'line',
          source: 'readonly-polygons',
          paint: {
            'line-color': [
              'coalesce',
              ['get', 'color'],
              '#0284c7',
            ],
            'line-width': 2,
          },
        });
        mapRef.current!.addLayer({
          id: 'readonly-polygons-label',
          type: 'symbol',
          source: 'readonly-polygons',
          layout: {
            'text-field': ['coalesce', ['get', 'name'], ''],
            'text-size': 12,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-anchor': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });
        mapRef.current!.addSource('readonly-markers', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapRef.current!.addLayer({
          id: 'readonly-markers-circle',
          type: 'circle',
          source: 'readonly-markers',
          paint: {
            'circle-radius': 5,
            'circle-color': ['coalesce', ['get', 'color'], '#1d4ed8'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#eff6ff',
          },
        });
        mapRef.current!.addLayer({
          id: 'readonly-markers-label',
          type: 'symbol',
          source: 'readonly-markers',
          layout: {
            'text-field': [
              'format',
              ['coalesce', ['get', 'label'], ''],
              '\n',
              ['coalesce', ['get', 'altitude'], ''],
            ],
            'text-size': 11,
            'text-offset': [0, 1],
            'text-anchor': 'top',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          },
          paint: {
            'text-color': ['coalesce', ['get', 'color'], '#0f172a'],
          },
        });

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
            mapRef.current!.addLayer({
              id: 'no-fly-zones-label',
              type: 'symbol',
              source: 'no-fly-zones',
              layout: {
                'text-field': ['coalesce', ['get', 'name'], ''],
                'text-size': 12,
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-anchor': 'center',
                'text-allow-overlap': false,
                'text-ignore-placement': false,
              },
              paint: {
                'text-color': '#0f172a',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2,
              },
            });
          }
        }
      });
    }, []);

    // Hydrate the draw layer or readonly source with incoming features
    useEffect(() => {
      if (readOnly) {
        const map = mapRef.current;
        if (!map) return;
        const src = map.getSource('readonly-polygons') as mapboxgl.GeoJSONSource | undefined;
        if (src) {
          src.setData(features ?? { type: 'FeatureCollection', features: [] });
        }
        return;
      }

      const draw = drawRef.current;
      if (!draw) return;
      try {
        draw.deleteAll();
        if (features && features.features && features.features.length > 0) {
          draw.add(features as any);
        }
      } catch (_) {
        // ignore invalid payloads
      }
    }, [features, readOnly]);

    // Update disabled zones data when prop changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      if (!disabledZones) return;
      
      const updateDisabledZones = () => {
        try {
          let src = map.getSource('no-fly-zones') as mapboxgl.GeoJSONSource | undefined;
          if (!src) {
            // Tạo source nếu chưa có
            map.addSource('no-fly-zones', {
              type: 'geojson',
              data: disabledZones as any,
            });
            src = map.getSource('no-fly-zones') as mapboxgl.GeoJSONSource;
            
            // Tạo layers nếu chưa có
            if (!map.getLayer('no-fly-zones-fill')) {
              map.addLayer({
                id: 'no-fly-zones-fill',
                type: 'fill',
                source: 'no-fly-zones',
                paint: {
                  'fill-color': '#ef4444',
                  'fill-opacity': 0.35,
                },
              });
            }
            if (!map.getLayer('no-fly-zones-outline')) {
              map.addLayer({
                id: 'no-fly-zones-outline',
                type: 'line',
                source: 'no-fly-zones',
                paint: {
                  'line-color': '#b91c1c',
                  'line-width': 2,
                },
              });
            }
            if (!map.getLayer('no-fly-zones-label')) {
              map.addLayer({
                id: 'no-fly-zones-label',
                type: 'symbol',
                source: 'no-fly-zones',
                layout: {
                  'text-field': ['coalesce', ['get', 'name'], ''],
                  'text-size': 12,
                  'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                  'text-anchor': 'center',
                  'text-allow-overlap': false,
                  'text-ignore-placement': false,
                },
                paint: {
                  'text-color': '#0f172a',
                  'text-halo-color': '#ffffff',
                  'text-halo-width': 2,
                },
              });
            }
          } else {
            src.setData(disabledZones as any);
          }
        } catch (error) {
          console.warn('Failed to update disabled zones:', error);
        }
      };

      // Kiểm tra map đã load xong chưa
      if (!map.loaded()) {
        // Đợi map load xong
        const handler = () => updateDisabledZones();
        map.once('load', handler);
        return () => {
          map.off('load', handler);
        };
      } else {
        updateDisabledZones();
      }
    }, [disabledZones]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const src = map.getSource('readonly-markers') as mapboxgl.GeoJSONSource | undefined;
      if (!src) return;
      if (!markers || markers.length === 0) {
        src.setData({ type: 'FeatureCollection', features: [] });
        return;
      }
      src.setData({
        type: 'FeatureCollection',
        features: markers.map((marker, index) => ({
          type: 'Feature',
          id: marker.id ?? `marker-${index}`,
          geometry: {
            type: 'Point',
            coordinates: [marker.lon, marker.lat],
          },
          properties: {
            label: marker.label ?? '',
            altitude: marker.altitude ?? '',
            color: marker.color ?? '#1d4ed8',
          },
        })),
      });
    }, [markers]);

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
