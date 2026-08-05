"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, CreditCard, Key, LogOut, Sun, Moon, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import styles from "./ProfileDropdown.module.css";

export function ProfileDropdown() {
  const { session, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      router.push("/login");
    }
  };

  const name = session?.user.name ?? "Super Admin";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
    
  const email = session?.user.email ?? "owner@airecruit.io";
  const role = "Platform Owner";

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.trigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.avatar}>
          {session?.user.avatar_url ? (
            <img src={session.user.avatar_url} alt={name} className={styles.avatarImage} />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
          <span className={styles.statusDot} />
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{name}</p>
          <p className={styles.userRole}>{role}</p>
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <p className={styles.headerName}>{name}</p>
              <p className={styles.headerEmail}>{email}</p>
            </div>
            <div className={styles.planBadge}>Pro Plan</div>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuGroup}>
            <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push("/profile"); }}>
              <User size={16} /> My Profile
            </button>
            <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push("/settings"); }}>
              <Settings size={16} /> Settings
            </button>
            <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push("/billing"); }}>
              <CreditCard size={16} /> Billing
            </button>
            <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push("/api-keys"); }}>
              <Key size={16} /> API Keys
            </button>
          </div>

          <div className={styles.divider} />
          
          <div className={styles.menuGroup}>
            <button 
              className={styles.menuItem} 
              onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setIsOpen(false); }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} 
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuGroup}>
            <button className={`${styles.menuItem} ${styles.logout}`} onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
