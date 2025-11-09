import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import PilotForm from './PilotForm';

export default function PilotEdit() {
    return (
        <div className="pilot-edit">
            <AutoBreadcrumb />
            <PilotForm isEdit />
        </div>
    );
}

