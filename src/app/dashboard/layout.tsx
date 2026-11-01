import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex gap-6">
            <div className="font-bond text-6xl w-[250px] bg-yellow-500 h-screen">
                Sidebar
            </div>
            <div className="flex-1 bg-blue-500">{children}</div>
        </div>
    );
};

export default layout;