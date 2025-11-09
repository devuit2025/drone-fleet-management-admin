import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import MissionForm from './MissionForm';

export default function MissionEdit() {
    return (
        <div className="mission-edit">
            <AutoBreadcrumb />
            <MissionForm isEdit />
        </div>
    );
}

