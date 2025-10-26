import { useForm, Field as FormField } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from '@/components/ui/input-group';

// ---------- Form Field Schema Type ----------
type FormFieldSchema = {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    type?: 'text' | 'textarea'; // can expand to select, checkbox, etc
    maxLength?: number;
    minLength?: number;
};

// ---------- Generic Form Generator ----------
interface FormGeneratorProps<T extends z.ZodTypeAny> {
    schema: T;
    fields: FormFieldSchema[];
    defaultValues: z.infer<T>;
    onSubmit: (values: z.infer<T>) => void;
    title?: string;
    description?: string;
}

export function FormGenerator<T extends z.ZodTypeAny>({
    schema,
    fields,
    defaultValues,
    onSubmit,
    title,
    description,
}: FormGeneratorProps<T>) {
    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: schema,
        },
        onSubmit: async ({ value }) => onSubmit(value),
    });

    return (
        <Card className="w-full ">
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <form
                    id="dynamic-form"
                    onSubmit={e => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        {fields.map(f => (
                            <form.Field
                                key={f.name}
                                name={f.name}
                                children={(field: FormField<any>) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{f.label}</FieldLabel>
                                            {f.type === 'textarea' ? (
                                                <InputGroup>
                                                    <InputGroupTextarea
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={e =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        placeholder={f.placeholder}
                                                        rows={6}
                                                        className="min-h-24 resize-none"
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {f.maxLength && (
                                                        <InputGroupAddon align="block-end">
                                                            <InputGroupText className="tabular-nums">
                                                                {field.state.value.length}/
                                                                {f.maxLength} characters
                                                            </InputGroupText>
                                                        </InputGroupAddon>
                                                    )}
                                                </InputGroup>
                                            ) : (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={e =>
                                                        field.handleChange(e.target.value)
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder={f.placeholder}
                                                    autoComplete="off"
                                                />
                                            )}
                                            {f.description && (
                                                <FieldDescription>{f.description}</FieldDescription>
                                            )}
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        ))}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <Button type="submit" form="dynamic-form">
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
