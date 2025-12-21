import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneForm from './DroneForm';

export default function DroneEdit() {
    return (
        <div className="drone-edit">
            <AutoBreadcrumb />
            <DroneForm isEdit />
        </div>
    );
}
