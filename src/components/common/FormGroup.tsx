interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

const FormGroup = ({ children, className }: FormGroupProps) => {
    return (
        <div className={`${className ?? 'flex flex-col'} mb-4 gap-4`}>{children}</div>
    );
};

export default FormGroup;