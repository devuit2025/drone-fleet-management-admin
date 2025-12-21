import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneModelForm from './DroneModelForm';

export default function DroneModelCreate() {
    return (
        <div className="drone-model-create">
            <AutoBreadcrumb />
            <DroneModelForm />
        </div>
    );
}
