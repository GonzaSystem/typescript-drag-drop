import { Validatable } from '../models/validation';

export function validate(input: Validatable[]): boolean {
    for (const prop of input) {
        if (prop.required) {
            if (prop.value.toString().trim().length === 0) { return false; }
        }

        if (prop.minLength && typeof prop.value === 'string') {
            if (prop.value.toString().trim().length < prop.minLength) { return false; }
        }

        if (prop.maxLength && typeof prop.value === 'string') {
            if (prop.value.toString().trim().length < prop.maxLength) { return false; }
        }

        if (prop.min != null && typeof prop.value === 'number') {
            if (prop.value < prop.min) { return false; }
        }

        if (prop.max != null && typeof prop.value === 'number') {
            if (prop.value > prop.max) { return false; }
        }
    }

    return true;
}