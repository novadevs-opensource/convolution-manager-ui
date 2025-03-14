import { useEffect, useState } from "react";

interface ActionToolsBlockProps {
    children: React.ReactNode;
    className?: string;
}

const ActionToolsBlock = ({ children, className }: ActionToolsBlockProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [closeClass, setCloseClass] = useState<string>();

    const handleIsOpen = () => {
        setIsOpen(!isOpen);
    }

    useEffect(() => {
        if (!isOpen) {
            setCloseClass('translate-x-[235px]')
        } else {
            setCloseClass('-translate-x-[0px]')
        }
    }, [isOpen])

    return (
        <div>
            {/* Gear icon positioned with lower z-index */}
            <div onClick={handleIsOpen} className="md:hidden bg-white border cursor-pointer fixed px-3 py-2 md:right-6 right-2 rounded-lg top-[24%] z-[5]">
                {isOpen ? (
                    <span className="fa-solid fa-close text-xl px-[.15rem] inline-flex"></span>
                ) : (
                    <span className="fa-solid fa-gear text-xl px1 fa-spin inline-flex"></span>
                )}
            </div>
            
            {/* Main block with higher z-index and transition */}
            <div className={`${className ?? 'flex flex-col'} ${closeClass} p-4 border rounded-lg fixed bg-white shadow-xl md:right-6 right-2 md:bottom-[5%] md:top-[auto] top-[30%] z-[10] transition-transform ease-in-out duration-300`}>
                <div className="flex flex-row gap-2">
                    <span className="text-xl">Available controls</span>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ActionToolsBlock;