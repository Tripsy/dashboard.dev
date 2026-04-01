import {useModalStore} from "@/stores/window.store";
import {WindowInstance} from "@/components/window/window-instance.component";
import {WindowDock} from "@/components/window/window-dock.component";

export function WindowContainer() {
    const { stack } = useModalStore();

    const minimized = stack.filter((m) => m.minimized);
    const visible = stack.filter((m) => !m.minimized);

    return (
        <>
            {visible.map((current) => (
                <WindowInstance key={current.uid} current={current} />
            ))}
            {minimized.length > 0 && (
                <WindowDock modals={minimized} />
            )}
        </>
    );
}