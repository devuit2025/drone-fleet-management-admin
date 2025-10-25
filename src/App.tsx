import './App.css';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

function App() {
    const routing = useRoutes(routes);

    return (
        <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>{routing}</Suspense>
        </DashboardLayout>
    );
}

export default App;
