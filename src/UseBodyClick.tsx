import { useEffect } from "react";

const useBodyClick = (callback: () => void, excludedRefs: React.RefObject<HTMLElement | null>[],stopper:boolean = true) => {
    useEffect(() => {
        if (!stopper) return;
        const handleClick = (event: MouseEvent) => {
            if (excludedRefs.some(ref => ref.current?.contains(event.target as Node))) {
                return; // Click happened inside one of the excluded elements, do nothing
            }
            console.log("Body clicked");
            callback();
        };

        document.body.addEventListener("click", handleClick);

        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, [callback, excludedRefs]);
};

export default useBodyClick;
