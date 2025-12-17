import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import LicenseForm from './LicenseForm';

export default function LicenseCreate() {
    return (
        <div className="license-create">
            <AutoBreadcrumb />
            <LicenseForm />
        </div>
    );
}


