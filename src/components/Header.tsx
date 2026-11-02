import React from 'react';
import { HeartHandshake, Settings, Sunrise } from 'lucide-react';
interface HeaderProps { onOpenSupport: () => void; onOpenSettings: () => void; title?: string; subtitle?: string; }
export const Header: React.FC<HeaderProps> = ({ onOpenSupport, onOpenSettings, title, subtitle }) => <header className="app-header"><div className="header-inner"><div className="brand"><Sunrise size={29} strokeWidth={1.5}/><div><h1>{title || 'DAWN'}</h1><p>{subtitle || 'Rise. Focus. Become.'}</p></div></div><div className="header-actions"><button className="header-support" onClick={onOpenSupport}><HeartHandshake size={17}/><span>Support</span></button><button className="icon-button" onClick={onOpenSettings} aria-label="Settings"><Settings size={20}/></button></div></div></header>;
