'use client';

import { registerDashboardDataSource } from '@/config/data-source.register';
import {useEffect} from "react";
import {useModalStore} from "@/stores/window.store";

// Module-level call — runs once when this client module loads, before any component renders
registerDashboardDataSource();

export function DataSourceRegistrar() {
	useEffect(() => {
		useModalStore.persist.rehydrate();
	}, []);

	return null;
}
