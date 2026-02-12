export default function Sidebar({ currentPage, onNavigate, userRole }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'operator', 'viewer'] },
        { id: 'orders', label: 'Orders', icon: '📦', roles: ['admin', 'operator', 'viewer'] },
        { id: 'create', label: 'Create Order', icon: '➕', roles: ['admin', 'operator'] },
        { id: 'events', label: 'Events', icon: '📋', roles: ['admin'] },
    ];

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-indigo-600">ApexDispatch</h1>
                <p className="text-sm text-gray-500 mt-1">Operations Dashboard</p>
            </div>
            <nav className="flex-1 p-4">
                {visibleMenuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${currentPage === item.id
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
