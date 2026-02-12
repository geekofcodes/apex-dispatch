export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 fixed bottom-0 right-0 left-64 h-14 flex items-center px-8 z-10">
            <div className="flex items-center justify-between w-full">
                <div className="text-sm text-gray-600">
                    © 2026 ApexDispatch. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Version 1.0.0</span>
                    <span>•</span>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
                    <span>•</span>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
                </div>
            </div>
        </footer>
    );
}
