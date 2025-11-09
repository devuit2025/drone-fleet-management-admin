import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneSensorForm from './DroneSensorForm';

export default function DroneSensorEdit() {
    return (
        <div className="drone-sensor-edit">
            <AutoBreadcrumb />
            <DroneSensorForm isEdit />
        </div>
    );
}

