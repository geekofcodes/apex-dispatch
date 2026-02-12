export default function Table({ children }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                {children}
            </table>
        </div>
    );
}

Table.Header = function TableHeader({ children }) {
    return (
        <thead className="bg-gray-50 border-b border-gray-200">
            {children}
        </thead>
    );
};

Table.Body = function TableBody({ children }) {
    return (
        <tbody className="bg-white divide-y divide-gray-100">
            {children}
        </tbody>
    );
};

Table.Row = function TableRow({ children, onClick }) {
    return (
        <tr
            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

Table.HeaderCell = function TableHeaderCell({ children }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {children}
        </th>
    );
};

Table.Cell = function TableCell({ children }) {
    return (
        <td className="px-6 py-4 text-sm text-gray-900">
            {children}
        </td>
    );
};
