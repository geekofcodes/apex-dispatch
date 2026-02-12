export default function Card({ children, title, noHover = false }) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${noHover ? '' : 'lift-hover'}`}>
            {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
            {children}
        </div>
    );
}
