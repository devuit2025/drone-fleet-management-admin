import { memo } from 'react';
import type { CSSProperties } from 'react';
import type { FeatureCollection, Polygon } from 'geojson';
import { MapboxMap } from './MapboxMap';

export interface MapboxPolygonEditorProps {
    value: FeatureCollection<Polygon> | null;
    onChange: (value: FeatureCollection<Polygon>) => void;
    disabledZones?: FeatureCollection<Polygon> | null;
    readOnly?: boolean;
    className?: string;
    style?: CSSProperties;
}

function MapboxPolygonEditorImpl({
    value,
    onChange,
    disabledZones = null,
    readOnly = false,
    className,
    style,
}: MapboxPolygonEditorProps) {
    return (
        <MapboxMap
            className={className}
            style={style}
            features={value}
            onFeaturesChange={onChange}
            disabledZones={disabledZones}
            readOnly={readOnly}
        />
    );
}

export const MapboxPolygonEditor = memo(MapboxPolygonEditorImpl);
