import {WindowConfig} from "@/stores/window.store";
import {WindowMinimizedInstance} from "@/components/window/window-minimized-instance.component";

export function WindowDock({ modals, }: { modals: WindowConfig[]; }) {
    return (
        <>
            {modals.map((current) => (
                <WindowMinimizedInstance key={current.uid} current={current} />
            ))}
        </>
    );
}