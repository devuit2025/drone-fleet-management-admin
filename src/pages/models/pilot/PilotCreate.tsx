import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import PilotForm from './PilotForm';

export default function PilotCreate() {
    return (
        <div className="pilot-create">
            <AutoBreadcrumb />
            <PilotForm />
        </div>
    );
}
