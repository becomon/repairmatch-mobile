// Public surface of the auth feature.
export { AuthProvider, useAuth, useUser, AccountCreatedError } from './AuthProvider';
export { BrandMark } from './BrandMark';
export { HOME_BY_ROLE, RoleGate } from './RoleGate';
export { RolePicker } from './RolePicker';
export { SignOutDialog } from './SignOutDialog';
export { useSignOut } from './useSignOut';
export { validateEmail, validateName, validatePassword } from './validation';
