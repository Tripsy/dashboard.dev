'use client';

import type React from 'react';
import { Icons } from '@/components/icon.component';

type NoticeTypeProps = {
	title?: string;
	message?: string;
	children?: React.ReactNode;
};

type NoticeProps = {
	type: 'success' | 'error' | 'warning' | 'info' | 'loading';
} & NoticeTypeProps;

export function Notice({
	type = 'info',
	title,
	message,
	children,
}: NoticeProps) {
	switch (type) {
		case 'success':
			return (
				<NoticeSuccess title={title} message={message}>
					{children}
				</NoticeSuccess>
			);
		case 'error':
			return (
				<NoticeError title={title} message={message}>
					{children}
				</NoticeError>
			);
		case 'warning':
			return (
				<NoticeWarning title={title} message={message}>
					{children}
				</NoticeWarning>
			);
		case 'info':
			return (
				<NoticeInfo title={title} message={message}>
					{children}
				</NoticeInfo>
			);
		case 'loading':
			return (
				<NoticeLoading title={title} message={message}>
					{children}
				</NoticeLoading>
			);
	}
}

function NoticeSuccess({ title, message, children }: NoticeTypeProps) {
	return (
		<div className="shadow-lg rounded-t-lg rounded-b-none m-8">
			<div className="alert alert-success text-white font-bold rounded-t-lg rounded-b-none">
				{title ?? 'Success'}
			</div>
			<div className="alert alert-soft alert-success rounded-none">
				<div>
					<span>
						<Icons.Status.Success /> {message}
					</span>
					{children}
				</div>
			</div>
		</div>
	);
}

function NoticeError({ title, message, children }: NoticeTypeProps) {
	return (
		<div className="shadow-lg rounded-t-lg rounded-b-none m-8">
			<div className="alert alert-error text-white font-bold rounded-t-lg rounded-b-none">
				{title ?? 'Error'}
			</div>
			<div className="alert alert-soft alert-error rounded-none">
				<div>
					<span>
						<Icons.Status.Error />{' '}
						{message ?? 'Something went wrong!'}
					</span>
					{children}
				</div>
			</div>
		</div>
	);
}

function NoticeWarning({ title, message, children }: NoticeTypeProps) {
	return (
		<div className="shadow-lg rounded-t-lg rounded-b-none m-8">
			<div className="alert alert-warning text-white font-bold rounded-t-lg rounded-b-none">
				{title ?? 'Warning'}
			</div>
			<div className="alert alert-soft alert-warning rounded-none">
				<div>
					<span>
						<Icons.Status.Warning /> {message}
					</span>
					{children}
				</div>
			</div>
		</div>
	);
}

function NoticeInfo({ title, message, children }: NoticeTypeProps) {
	return (
		<div className="shadow-lg rounded-t-lg rounded-b-none m-8">
			<div className="alert alert-info text-white font-bold rounded-t-lg rounded-b-none">
				{title ?? 'Info'}
			</div>
			<div className="alert alert-soft alert-info rounded-none">
				<div>
					<span>
						<Icons.Info /> {message}
					</span>
					{children}
				</div>
			</div>
		</div>
	);
}

function NoticeLoading({ title, message, children }: NoticeTypeProps) {
	return (
		<div className="shadow-lg rounded-t-lg rounded-b-none m-8">
			<div className="alert alert-info text-white font-bold rounded-t-lg rounded-b-none">
				{title ?? 'Info'}
			</div>
			<div className="alert alert-soft alert-info rounded-none">
				<div>
					<span>
						<Icons.Loading className="animate-spin" />{' '}
						{message ?? 'Loading...'}
					</span>
					{children}
				</div>
			</div>
		</div>
	);
}
