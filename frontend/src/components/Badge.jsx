export default function Badge({ status }) {
    const styles = {
        CREATED: 'bg-blue-100 text-blue-700',
        ASSIGNED: 'bg-indigo-100 text-indigo-700',
        IN_TRANSIT: 'bg-purple-100 text-purple-700',
        DELIVERED: 'bg-green-100 text-green-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
}
