import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import DroneModelForm from './DroneModelForm';

export default function DroneModelEdit() {
    return (
        <div className="drone-model-edit">
            <AutoBreadcrumb />
            <DroneModelForm isEdit />
        </div>
    );
}
