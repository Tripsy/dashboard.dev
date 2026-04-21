import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { requestRemoveAuthToken } from '@/services/account.service';
import type { AuthTokenType } from '@/types/auth.type';

interface AuthTokenDestroyModalProps {
	token: AuthTokenType;
	onClose: () => void;
	onSuccess: () => void;
	onError: () => void;
}

export const AuthTokenDestroyModal = ({
	token,
	onClose,
	onSuccess,
	onError,
}: AuthTokenDestroyModalProps) => {
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		if (!token) {
			return;
		}

		try {
			setLoading(true);

			await requestRemoveAuthToken(token.ident);

			onSuccess();
		} catch {
			onError();
		} finally {
			setLoading(false);
			onClose();
		}
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title="Destroy session"
			footer={
				<>
					<Button
						variant="error"
						size="sm"
						onClick={handleConfirm}
						disabled={loading}
					>
						{loading ? 'Deleting...' : 'Confirm'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={loading}
					>
						Cancel
					</Button>
				</>
			}
		>
			<p className="text-sm semi-bold">
				Are you sure you want to destroy the session?
			</p>
			<p className="font-mono text-xs wrap-break-word mt-2">
				{token.label}
			</p>
		</Modal>
	);
};
