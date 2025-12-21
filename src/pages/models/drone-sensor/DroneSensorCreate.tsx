import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneSensorForm from './DroneSensorForm';

export default function DroneSensorCreate() {
    return (
        <div className="drone-sensor-create">
            <AutoBreadcrumb />
            <DroneSensorForm />
        </div>
    );
}
