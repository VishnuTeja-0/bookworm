import {useState, useEffect, useMemo} from 'react';

enum FormFieldNames {
    NAME = 'name',
    URL = 'url',
    DESCRIPTION = 'description',
    CATEGORY = 'category'
}

export function useForm<T extends Record<string, any>>(initialValues: T){
    const [formValues, setFormValues] = useState<T>(initialValues);
    const [isEdited, setIsEdited] = useState<boolean>(false);
    const [initialFormValues, setInitialFormValues] = useState<T>(initialValues);
        
    const handleFieldChange = (fieldName: keyof T, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldName] : value,
        }));
    };

    // updates isEdited flag when field values change
    useEffect(() => {
        const stringInitialFormValues = JSON.stringify(initialFormValues);
        const stringFormValues = JSON.stringify(formValues);
        const hasChanged = stringFormValues !== stringInitialFormValues;
        setIsEdited(hasChanged);
    }, [formValues, initialFormValues])

    const resetForm = () => {
        setFormValues(initialFormValues);
        setIsEdited(false);
    }

    const setFormData = (newData: T) => {
        setFormValues(newData);
        setInitialFormValues(newData);
        setIsEdited(false);
    }

    return {formValues, isEdited, handleFieldChange, resetForm, setFormData, FormFieldNames};
}