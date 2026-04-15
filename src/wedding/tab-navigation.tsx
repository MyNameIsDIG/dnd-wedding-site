
import { motion } from 'framer-motion';
import { Home, Image, HelpCircle, Mail, MapPin, Users } from 'lucide-react';

export type TabType = 'home' | 'gallery' | 'qa' | 'rsvp' | 'details' | 'manage-guests';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    secretUnlocked?: boolean;
}

const baseTabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'gallery' as const, label: 'Gallery', icon: Image },
    { id: 'qa' as const, label: 'Q&A', icon: HelpCircle },
    { id: 'rsvp' as const, label: 'RSVP', icon: Mail },
    { id: 'details' as const, label: 'Details', icon: MapPin },
];

const secretTab = { id: 'manage-guests' as const, label: 'Manage', icon: Users };

export function TabNavigation({ activeTab, onTabChange, secretUnlocked = false }: TabNavigationProps) {
    const tabs = secretUnlocked ? [...baseTabs, secretTab] : baseTabs;
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border safe-area-pb h-[71px] box-border p-2">
            <div className="flex items-center justify-around h-[55px]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative flex flex-col items-center justify-center min-w-[60px] py-1 px-3 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            aria-label={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <Icon className="w-5 h-5 relative z-10 translate-y-[5px]" />
                            <span className="text-[10px] mt-1 font-medium relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

