import { FormGenerator } from '@/components/form/FormGenerator';
import * as z from 'zod';

// ---------- Zod Schema ----------
export const droneModelSchema = z.object({
    name: z
        .string()
        .min(3, 'Model name must be at least 3 characters')
        .max(50, 'Model name cannot exceed 50 characters'),
    brand_id: z.string().min(1, 'Brand is required').describe('Reference to drone brand ID'),
    category_id: z
        .string()
        .min(1, 'Category is required')
        .describe('Reference to drone category ID'),
    weight: z
        .number({
            required_error: 'Weight is required',
            invalid_type_error: 'Weight must be a number',
        })
        .positive('Weight must be positive'),
    max_payload: z.number().min(0, 'Payload must be at least 0 kg'),
    battery_capacity: z.number().min(1, 'Battery capacity must be at least 1 mAh'),
    max_speed: z.number().min(1, 'Speed must be at least 1 km/h'),
    flight_time: z.number().min(1, 'Flight time must be at least 1 minute'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

// ---------- Default Values ----------
export const defaultDroneModelValues: z.infer<typeof droneModelSchema> = {
    name: '',
    brand_id: '',
    category_id: '',
    weight: 0,
    max_payload: 0,
    battery_capacity: 0,
    max_speed: 0,
    flight_time: 0,
    description: '',
};

// ---------- Field Definitions ----------
export const droneModelFields = [
    {
        name: 'name',
        label: 'Drone Model Name',
        placeholder: 'Enter model name',
        description: 'Unique name for the drone model.',
        maxLength: 50,
    },
    {
        name: 'brand_id',
        label: 'Brand',
        placeholder: 'Select or enter brand ID',
        description: 'Linked to drone brand table.',
    },
    {
        name: 'category_id',
        label: 'Category',
        placeholder: 'Select or enter category ID',
        description: 'Defines the drone’s purpose (e.g., mapping, agriculture).',
    },
    {
        name: 'weight',
        label: 'Weight (kg)',
        placeholder: 'Enter weight',
    },
    {
        name: 'max_payload',
        label: 'Max Payload (kg)',
        placeholder: 'Enter payload capacity',
    },
    {
        name: 'battery_capacity',
        label: 'Battery Capacity (mAh)',
        placeholder: 'Enter battery capacity',
    },
    {
        name: 'max_speed',
        label: 'Max Speed (km/h)',
        placeholder: 'Enter max speed',
    },
    {
        name: 'flight_time',
        label: 'Flight Time (minutes)',
        placeholder: 'Enter maximum flight time',
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter additional details or notes',
        description: 'Optional description about the drone model.',
        maxLength: 500,
    },
];

export default function DroneForm() {
    return (
        <FormGenerator
            schema={droneModelSchema}
            fields={droneModelFields}
            defaultValues={defaultDroneModelValues}
            onSubmit={values => {
                toast.success(`Drone model "${values.name}" saved successfully!`);
                console.log(values);
            }}
            title="Add Drone Model"
            description="Fill out the technical details of the drone model."
        />
    );
}
