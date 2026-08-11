import {
    FaStore,
    FaBell,
    FaAngleDown,
    FaAngleUp,
    FaUser,
    FaAnglesLeft
} from 'react-icons/fa6'
import SidebarListMenu from './js/SidebarListMenu';
import { Link, NavLink } from 'react-router-dom';
import { useRef, useState } from 'react';
import gsap from "gsap";

export default function Sidebar({ collapsed, onToggle }) {

    const [openMenus, setOpenMenus] = useState(
        SidebarListMenu.map((_, i) => i)
    );

    const containerRefs = useRef([]);
    const itemRefs = useRef(
        SidebarListMenu.map((menu) => menu.items.map(() => null))
    );

    const toggleMenu = (index) => {
        const isOpen = openMenus.includes(index);
        const container = containerRefs.current[index];
        const items = itemRefs.current[index];

        if (!isOpen) {
            setOpenMenus((prev) => [...prev, index]);
            gsap.set(container, { height: 'auto' });
            const fullH = container.offsetHeight;
            gsap.fromTo(container,
                { height: 0 },
                { height: fullH, duration: 0.28, ease: 'power2.out' }
            );
            gsap.fromTo(items,
                { opacity: 0, y: -8 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.22,
                    ease: 'power2.out',
                    stagger: 0.06,
                    delay: 0.05
                }
            );
        } else {
            setOpenMenus((prev) => prev.filter((i) => i !== index));
            gsap.to(items, {
                opacity: 0,
                y: -5,
                duration: 0.1,
                ease: 'power2.in',
                stagger: { each: 0.04, from: 'end' },
                onComplete: () => {
                    gsap.to(container, { height: 0, duration: 0.12, ease: 'power2.in' });
                }
            });
        }
    };

    return (
        <aside
            className="fixed left-0 top-0 h-screen flex-col z-10 hidden lg:flex"
            style={{
                width: collapsed ? "5rem" : "17rem",
                backgroundColor: "var(--bg-card)",
                borderRight: "1px solid var(--border)",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Logo + bouton de repli à côté */}
            <div
                className="px-5 py-5 flex gap-4 items-center"
                style={{ justifyContent: collapsed ? "center" : "space-between" }}
            >
                {!collapsed && (
                    <img src="/logo/logo-1-vertical.png" className='w-40' alt="Haodygasikara" />
                )}
                <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Agrandir" : "Réduire"}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                    <FaAnglesLeft
                        className="text-sm"
                        style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
                    />
                </button>
            </div>

            <div>
                <hr style={{ borderColor: "var(--border)" }} />
            </div>

            <Link >
                <div
                    className='px-5 py-5 flex gap-4 items-center cursor-pointer transition-colors'
                    style={{
                        backgroundColor: "var(--brand-terre)",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--brand-terre-600)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--brand-terre)")}
                >
                    <div><FaStore className='text-xl' style={{ color: "#FFFFFF" }} /></div>
                    {!collapsed && (
                        <div>
                            <p className='text-xl font-bold' style={{ color: "#FFFFFF" }}>Creer un admin</p>
                        </div>
                    )}
                </div>
            </Link>

            <div className='my-7 px-5'>
                {SidebarListMenu.map((menu, index) => {
                    const isOpen = openMenus.includes(index);
                    return (
                        <div key={index}>
                            {!collapsed && (
                                <div
                                    className="inline-flex items-center gap-2 text-sm cursor-pointer transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                    onClick={() => toggleMenu(index)}
                                >
                                    <span>{menu.name}</span>
                                    {isOpen ? (
                                        <FaAngleUp className="text-xs" />
                                    ) : (
                                        <FaAngleDown className="text-xs" />
                                    )}
                                </div>
                            )}

                            <div
                                ref={(el) => (containerRefs.current[index] = el)}
                                style={{ overflow: 'hidden', height: collapsed ? 'auto' : undefined }}
                            >
                                {menu.items.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            className='flex m-1 items-center flex-col'
                                            ref={(el) => (itemRefs.current[index][i] = el)}
                                            key={i}
                                        >
                                            <NavLink
                                                to={item.link}
                                                end={item.link === "/admin/haodygasikara"}
                                                title={collapsed ? item.name : undefined}
                                                className="flex px-3 py-3 rounded-sm items-center gap-2 w-full transition-colors"
                                                style={({ isActive }) => ({
                                                    color: isActive ? "var(--brand-terre)" : "var(--text-secondary)",
                                                    fontWeight: isActive ? 600 : 400,
                                                    justifyContent: collapsed ? "center" : "flex-start",
                                                })}
                                            >
                                                <div>
                                                    <Icon className='text-md' />
                                                </div>
                                                {!collapsed && <div>{item.name}</div>}
                                            </NavLink>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className='py-5 px-5 bottom-0 absolute w-full flex flex-col'>
                <div
                    className='flex items-center gap-4 mb-4'
                    style={{
                        color: "var(--text-secondary)",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                >
                    <div>
                        <FaBell className='text-xl' />
                    </div>
                    {!collapsed && <div>Notifications</div>}
                </div>

                {!collapsed && (
                    <div>
                        <p style={{ color: "var(--text-muted)" }}>Account</p>
                    </div>
                )}

                <div
                    className='flex items-center my-2 gap-4 mb-4'
                    style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                    <div
                        className='w-10 h-10 rounded-full relative shrink-0'
                        style={{ backgroundColor: "var(--brand-terre)" }}
                    >
                        <div className='flex items-center justify-center w-full h-full' style={{ color: "#FFFFFF" }}>
                            <FaUser />
                        </div>
                    </div>
                    {!collapsed && <div style={{ color: "var(--text-primary)" }}>Login</div>}
                </div>
            </div>
        </aside>
    );
}