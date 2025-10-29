import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneForm from './DroneForm';

export default function DroneCreate() {
    return (
        <div className="drone-create">
            <AutoBreadcrumb />

            <DroneForm />
        </div>
    );
}
