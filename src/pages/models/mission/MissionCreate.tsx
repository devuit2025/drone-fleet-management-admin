import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import MissionForm from './MissionForm';

export default function MissionCreate() {
    return (
        <div className="mission-create">
            <AutoBreadcrumb />
            <MissionForm />
        </div>
    );
}

