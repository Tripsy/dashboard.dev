import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormValuesUsersType } from '@/app/(dashboard)/dashboard/users/users.definition';
import {
	FormComponentEmail,
	FormComponentName,
	FormComponentPassword,
	FormComponentRadio,
	FormComponentSelect,
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source';
import {
	LanguageEnum,
	UserOperatorTypeEnum,
	UserRoleEnum,
} from '@/entities/user.model';
import {
	capitalizeFirstLetter,
	formatEnumLabel,
} from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

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
	actionName,
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<FormValuesUsersType>) {
	const translationsKeys = useMemo(
		() =>
			[
				'users.form_manage.label_name',
				'users.form_manage.label_email',
				'users.form_manage.label_password_on_create',
				'users.form_manage.label_password_on_update',
				'users.form_manage.label_password_confirm',
				'users.form_manage.label_language',
				'users.form_manage.label_role',
				'users.form_manage.label_operator_type',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

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
			<FormComponentName
				labelText={translations['users.form_manage.label_name']}
				id={elementIds.name}
				fieldValue={formValues.name ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>

			<FormComponentEmail
				labelText={translations['users.form_manage.label_email']}
				id={elementIds.email}
				fieldValue={formValues.email ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email', e.target.value)}
				error={errors.email}
			/>

			<FormComponentPassword
				labelText={
					actionName === 'create'
						? translations[
								'users.form_manage.label_password_on_create'
							]
						: translations[
								'users.form_manage.label_password_on_update'
							]
				}
				id={elementIds.password}
				fieldName="password"
				fieldValue={formValues.password ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('password', e.target.value)}
				error={errors.password}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>

			<FormComponentPassword
				labelText={
					translations['users.form_manage.label_password_confirm']
				}
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

			<FormComponentSelect
				labelText={translations['users.form_manage.label_language']}
				id={elementIds.language}
				fieldName="language"
				fieldValue={formValues.language}
				options={languages}
				disabled={pending}
				onChange={(e) => handleChange('language', e.target.value)}
				error={errors.language}
			/>

			<FormComponentRadio
				labelText={translations['users.form_manage.label_role']}
				id={elementIds.role}
				fieldName="role"
				fieldValue={formValues.role}
				options={roles}
				disabled={pending}
				onChange={(e) => handleChange('role', e.target.value)}
				error={errors.role}
			/>

			{formValues.role === UserRoleEnum.OPERATOR && (
				<FormComponentSelect
					labelText={
						translations['users.form_manage.label_operator_type']
					}
					id={elementIds.operatorType}
					fieldName="operator_type"
					fieldValue={formValues.operator_type ?? ''}
					options={operatorTypes}
					disabled={pending}
					onChange={(e) =>
						handleChange('operator_type', e.target.value)
					}
					error={errors.operator_type}
				/>
			)}
		</>
	);
}
