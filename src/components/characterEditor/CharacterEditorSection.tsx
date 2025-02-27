interface CharacterEditorSectionProps {
    children: React.ReactNode;
    title: string;
    containerClassNames?: string;
    headerClassNames?: string;
    headerIcon?: React.ReactNode; 
}

const CharacterEditorSection = ({ children, containerClassNames, headerClassNames, headerIcon, title}: CharacterEditorSectionProps) => {
    return (
        <section className={containerClassNames ?? 'border rounded-md mb-4 shadow-sm'}>
            {/* header */}
            <div className={headerClassNames ?? "flex flex-row items-center gap-2 p-4 bg-gray-200"}>
                {headerIcon ? (
                    <>{headerIcon}</>
                ) : (
                    <button className="h-[2.5em] w-[2.5em] border border-gray-200 bg-white rounded-full" title="Set the character's name, model provider, and voice settings">
                        <i className="fa-solid fa-id-card"></i>
                    </button>
                )}
                <span className='uppercase'>{title}</span>
            </div>

            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export default CharacterEditorSection;