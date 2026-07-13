import { useCallback, useEffect, useRef, useState } from 'react';
import { Configuration } from '@/config/settings.config';
import type { CmrModel } from '@/models/cmr.model';
import type { WsStatus } from '@/types/web-socket.type';

const MAX_RETRIES = 5;

const WS_PATH = '/cmr-available';

function getWebSocketUrl(): string {
	const base = Configuration.get('remoteApi.wsUrl') as string;

	return `${base}${WS_PATH}`;
}

function getReconnectDelay(retry: number): number {
	const baseDelay =
		(Configuration.get('remoteApi.wsReconnectDelay') as number) || 1000;

	return Math.min(baseDelay * 2 ** (retry - 1), 30000);
}

export function useAvailableCmrWebSocket() {
	const [entries, setEntries] = useState<CmrModel[]>([]);
	const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const retryCount = useRef(0);
	const isMounted = useRef(true);

	const connect = useCallback(() => {
		if (!isMounted.current) {
			return;
		}

		if (retryCount.current >= MAX_RETRIES) {
			setWsStatus('terminated');
			setErrorMessage(
				'Unable to connect to real-time updates. Please refresh the page.',
			);

			console.error(`WebSocket gave up after ${MAX_RETRIES} retries`);
			return;
		}

		setWsStatus('connecting');
		setErrorMessage(null);

		try {
			const ws = new WebSocket(getWebSocketUrl());
			wsRef.current = ws;

			ws.onopen = () => {
				if (!isMounted.current) {
					return;
				}

				retryCount.current = 0;
				setWsStatus('connected');
				setErrorMessage(null);
			};

			ws.onmessage = (event) => {
				if (!isMounted.current) {
					return;
				}

				try {
					const { event: name, data } = JSON.parse(event.data);

					if (name === 'cmr:available') {
						setEntries(data);
					}
				} catch (err) {
					console.error('WS parse error', event.data, err);
				}
			};

			ws.onclose = (event) => {
				if (!isMounted.current) {
					return;
				}

				console.debug(
					`WebSocket closed: ${event.code} - ${event.reason}`,
				);

				setWsStatus('disconnected');

				if (event.code !== 1000) {
					retryCount.current += 1;
					const delay = getReconnectDelay(retryCount.current);

					console.debug(
						`Reconnecting in ${delay}ms (attempt ${retryCount.current}/${MAX_RETRIES})`,
					);

					reconnectTimer.current = setTimeout(
						() => connectRef.current(),
						delay,
					);
				}
			};

			ws.onerror = () => {
				if (!isMounted.current) {
					return;
				}

				// Browser intentionally provides no error details in onerror (security policy)
				// The onclose handler will fire next and handle reconnect
				console.debug(
					'WebSocket connection error — waiting for close event',
				);

				// Only update status if we haven't successfully connected yet
				if (wsStatus !== 'connected') {
					setWsStatus('error');
					setErrorMessage('Connection error. Retrying...');
				}
			};
		} catch (err) {
			console.error('Failed to create WebSocket:', err);

			setWsStatus('error');
			setErrorMessage('Failed to establish connection');
		}
	}, [wsStatus]);

	const connectRef = useRef(connect);

	useEffect(() => {
		connectRef.current = connect;
	}, [connect]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: empty deps, connect is stable and captured via ref below
	useEffect(() => {
		isMounted.current = true;
		connect();

		return () => {
			isMounted.current = false;

			if (reconnectTimer.current) {
				clearTimeout(reconnectTimer.current);
				reconnectTimer.current = null;
			}

			wsRef.current?.close(1000, 'Component unmounting');
			wsRef.current = null;
		};
	}, []);

	const manualReconnect = useCallback(() => {
		if (reconnectTimer.current) {
			clearTimeout(reconnectTimer.current);
			reconnectTimer.current = null;
		}

		if (wsRef.current) {
			wsRef.current.onclose = null; // Prevent auto-reconnect from firing
			wsRef.current.close(1000, 'Manual reconnect');
			wsRef.current = null;
		}

		retryCount.current = 0;
		connect();
	}, [connect]);

	return { entries, wsStatus, errorMessage, manualReconnect };
}
