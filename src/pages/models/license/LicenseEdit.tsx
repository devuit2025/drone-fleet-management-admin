import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import LicenseForm from './LicenseForm';

export default function LicenseEdit() {
    return (
        <div className="license-edit">
            <AutoBreadcrumb />
            <LicenseForm isEdit />
        </div>
    );
}
