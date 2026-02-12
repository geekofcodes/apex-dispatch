import { useState, useRef, useEffect } from 'react';

export default function Header({ user, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isDropdownOpen]);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'operator':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'viewer':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getRoleLabel = (role) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getUserInitial = () => {
        if (!user) return '?';
        return user.email.charAt(0).toUpperCase();
    };

    const getAvatarColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-600 text-white';
            case 'operator':
                return 'bg-blue-600 text-white';
            case 'viewer':
                return 'bg-gray-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 flex items-center px-8 z-10">
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">Operations Dashboard</h2>
                <p className="text-sm text-gray-500">Real-time order management</p>
            </div>

            {/* User Menu */}
            {user && (
                <div className="relative" ref={dropdownRef}>
                    {/* User Menu Button */}
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200"
                        aria-label="User menu"
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(user.role)}`}>
                            {getUserInitial()}
                        </div>

                        {/* Chevron Icon */}
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Panel */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-dropdown-open">
                            {/* User Info Section */}
                            <div className="px-4 py-3">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${getAvatarColor(user.role)}`}>
                                        {getUserInitial()}
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                            {user.email}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Role Badge */}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                            {/* Status */}
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2"></div>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    onLogout();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
