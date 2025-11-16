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
    onDrawCreate?: (feature: Polygon) => void;
    onDrawUpdate?: (id: string | number, feature: Polygon) => void;
    onDrawDelete?: (id: string | number) => void;
}

function MapboxPolygonEditorImpl({
    value,
    onChange,
    disabledZones = null,
    readOnly = false,
    className,
    style,
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
}: MapboxPolygonEditorProps) {
    return (
        <MapboxMap
            className={className}
            style={style}
            features={value}
            onFeaturesChange={onChange}
            disabledZones={disabledZones}
            readOnly={readOnly}
            onDrawCreate={onDrawCreate}
            onDrawUpdate={onDrawUpdate}
            onDrawDelete={onDrawDelete}
        />
    );
}

export const MapboxPolygonEditor = memo(MapboxPolygonEditorImpl);
