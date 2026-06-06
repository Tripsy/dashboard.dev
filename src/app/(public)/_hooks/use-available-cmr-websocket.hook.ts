import { useEffect, useRef, useState } from 'react';
import { Configuration } from '@/config/settings.config';
import type { CmrModel } from '@/models/cmr.model';
import type { WsStatus } from '@/types/web-socket.type';

const MAX_RETRIES = 5;

export function useAvailableCmrWebSocket() {
	const [entries, setEntries] = useState<CmrModel[]>([]);
	const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected');
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const retryCount = useRef(0);

	useEffect(() => {
		function connect() {
			if (retryCount.current >= MAX_RETRIES) {
				setWsStatus('terminated');

				console.error(`WebSocket gave up after ${MAX_RETRIES} retries`);

				return;
			}

			setWsStatus('connecting');

			const ws = new WebSocket(
				`${Configuration.get('remoteApi.wsUrl') as string}/cmr-available`,
			);
			wsRef.current = ws;

			ws.onopen = () => {
				retryCount.current = 0; // reset on successful connection
				setWsStatus('connected');
			};

			ws.onmessage = (event) => {
				try {
					const { event: name, data } = JSON.parse(event.data);

					if (name === 'cmr:available') {
						setEntries(data);
					}
				} catch {
					console.error('WS parse error', event.data);
				}
			};

			ws.onclose = () => {
				setWsStatus('disconnected');
				retryCount.current += 1;
				reconnectTimer.current = setTimeout(
					connect,
					Configuration.get('remoteApi.wsReconnectDelay') as number,
				);
			};

			ws.onerror = () => setWsStatus('error');
		}

		connect();

		return () => {
			reconnectTimer.current && clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
		};
	}, []);

	return { entries, wsStatus };
}
