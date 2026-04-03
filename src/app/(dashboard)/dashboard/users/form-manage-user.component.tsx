import { useEffect, useRef, useState } from 'react';
import {
	FormComponentEmail,
	FormComponentName,
	FormComponentPassword,
	FormComponentRadio,
	FormComponentSelect,
} from '@/components/form/form-element.component';
import type { FormComponentType } from '@/config/data-source.config';
import {
	capitalizeFirstLetter,
	formatEnumLabel,
} from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	LanguageEnum,
	type UserFormValuesType,
	UserOperatorTypeEnum,
	UserRoleEnum,
} from '@/models/user.model';

const roles = Object.values(UserRoleEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const languages = Object.values(LanguageEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const operatorTypes = Object.values(UserOperatorTypeEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

export function FormManageUser({
	formValues,
	errors,
	handleChange,
	pending,
}: FormComponentType<UserFormValuesType>) {
	const [showPassword, setShowPassword] = useState(false);

	const prevRoleRef = useRef(formValues.role);

	// Clear operator_type when a role changes away from OPERATOR
	useEffect(() => {
		const prevRole = prevRoleRef.current;
		const currentRole = formValues.role;

		if (
			prevRole === UserRoleEnum.OPERATOR &&
			currentRole !== UserRoleEnum.OPERATOR &&
			formValues.operator_type
		) {
			handleChange('operator_type', null);
		}

		prevRoleRef.current = currentRole;
	}, [formValues.role, formValues.operator_type, handleChange]);

	const elementIds = useElementIds([
		'name',
		'email',
		'password',
		'passwordConfirm',
		'language',
		'role',
		'operatorType',
	]);

	return (
		<>
			<FormComponentName<UserFormValuesType>
				labelText="Name"
				id={elementIds.name}
				fieldValue={formValues.name ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>

			<FormComponentEmail<UserFormValuesType>
				labelText="Email"
				id={elementIds.email}
				fieldValue={formValues.email ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email', e.target.value)}
				error={errors.email}
			/>

			<FormComponentPassword<UserFormValuesType>
				labelText="Password"
				id={elementIds.password}
				fieldName="password"
				fieldValue={formValues.password ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('password', e.target.value)}
				error={errors.password}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>

			<FormComponentPassword<UserFormValuesType>
				labelText="Confirm Password"
				id={elementIds.passwordConfirm}
				fieldName="password_confirm"
				fieldValue={formValues.password_confirm ?? ''}
				placeholderText="Password confirmation"
				disabled={pending}
				onChange={(e) =>
					handleChange('password_confirm', e.target.value)
				}
				error={errors.password_confirm}
				showPassword={showPassword}
			/>

			<FormComponentSelect<UserFormValuesType>
				labelText="Language"
				id={elementIds.language}
				fieldName="language"
				fieldValue={formValues.language}
				disabled={pending}
				options={languages}
				onValueChange={(value) => handleChange('language', value)}
				error={errors.language}
			/>

			<FormComponentRadio<UserFormValuesType>
				labelText="Role"
				id={elementIds.role}
				fieldName="role"
				fieldValue={formValues.role}
				options={roles}
				disabled={pending}
				onValueChange={(value) => handleChange('role', value)}
				error={errors.role}
			/>

			{formValues.role === UserRoleEnum.OPERATOR && (
				<FormComponentSelect<UserFormValuesType>
					labelText="Operator Type"
					id={elementIds.operatorType}
					fieldName="operator_type"
					fieldValue={formValues.operator_type ?? ''}
					options={operatorTypes}
					disabled={pending}
					onValueChange={(value) =>
						handleChange('operator_type', value)
					}
					error={errors.operator_type}
				/>
			)}
		</>
	);
}
