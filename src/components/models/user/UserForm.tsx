'use client';

import { FormGenerator } from '@/components/form/FormGenerator';
import { toast } from 'sonner';
import { z } from 'zod';

// ---------- Zod Schema ----------
const userFormSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters.')
        .max(32, 'First name must be at most 32 characters.'),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters.')
        .max(32, 'Last name must be at most 32 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(64, 'Password must be at most 64 characters.'),
    bio: z.string().max(200, 'Bio must be at most 200 characters.').optional(),
});

// ---------- User Form ----------
export function UserForm() {
    return (
        <FormGenerator
            schema={userFormSchema}
            defaultValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                bio: '',
            }}
            fields={[
                {
                    name: 'firstName',
                    label: 'First Name',
                    placeholder: 'John',
                },
                {
                    name: 'lastName',
                    label: 'Last Name',
                    placeholder: 'Doe',
                },
                {
                    name: 'email',
                    label: 'Email Address',
                    placeholder: 'john.doe@example.com',
                },
                {
                    name: 'password',
                    label: 'Password',
                    placeholder: '********',
                },
                {
                    name: 'bio',
                    label: 'Bio (optional)',
                    type: 'textarea',
                    maxLength: 200,
                    description:
                        'Tell us a little about yourself. This will appear on your profile.',
                    placeholder: 'I’m a front-end developer who loves React and design systems.',
                },
            ]}
            title="User Profile"
            description="Create or update a user profile with basic information."
            onSubmit={values => {
                toast('User submitted!', {
                    description: JSON.stringify(values, null, 2),
                });
            }}
        />
    );
}
