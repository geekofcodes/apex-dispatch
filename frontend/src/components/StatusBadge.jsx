export default function StatusBadge({ status }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'PARTIALLY_DELIVERED':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'FAILED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'PENDING':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'RECEIVED':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}
