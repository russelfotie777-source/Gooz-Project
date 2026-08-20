"use client";

import { useState } from "react";
import DeleteAccountModal from "@/components/DeleteAccountModal/DeleteAccountModal";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import LogoutConfirmModal from "@/components/LogoutConfirmModal/LogoutConfirmModal";
import TicketModal from "@/components/TicketModal/TicketModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import type { User } from "@/lib/types";
import styles from "./ProfilePage.module.css";

interface ProfileLoggedInProps {
  user: User;
  onLogout: () => void;
  onToggleLanguage: () => void;
  onProfileUpdated: (user: User) => void;
}

export default function ProfileLoggedIn({ user, onLogout, onToggleLanguage, onProfileUpdated }: ProfileLoggedInProps) {
  const dict = useDictionary();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const ACCOUNT_ROWS = [
    {
      icon: "/icon/profile/edit-location-alt.svg",
      title: dict.profile.deliveryAddress,
      subtitle: dict.profile.deliveryAddressSubtitle,
      href: "/adresses",
    },
    {
      icon: "/icon/profile/credit-card.svg",
      iconClassName: "iconTilted",
      title: dict.profile.paymentHistory,
      subtitle: dict.profile.paymentHistorySubtitle,
      href: "/paiements",
    },
    {
      icon: "/icon/profile/delivery-truck-bolt.svg",
      title: dict.profile.orderHistory,
      subtitle: dict.profile.orderHistorySubtitle,
      href: "/commandes",
    },
    {
      icon: "/icon/profile/g-translate.svg",
      title: dict.profile.language,
      subtitle: dict.profile.languageName,
      onClick: onToggleLanguage,
    },
  ];

  const supportRows = [
    {
      icon: "/icon/profile/support-agent.svg",
      title: dict.profile.contactUs,
      onClick: () => setTicketModalOpen(true),
    },
    { icon: "/icon/profile/quiz.svg", title: dict.profile.helpNeeds, href: "/aide" },
    { icon: "/icon/profile/security.svg", title: dict.profile.privacyPolicy, href: "/politique-confidentialite" },
    { icon: "/icon/profile/verified.svg", title: dict.profile.termsOfUse, href: "/conditions-utilisation" },
    { icon: "/icon/profile/logout.svg", title: dict.profile.logout, onClick: () => setLogoutModalOpen(true) },
  ];

  return (
    <>
      <div className={styles.userCard}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon/profile/avatar-photo.png" alt="" className={styles.avatarPhoto} />
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userEmail}>{user.phone}</p>
        </div>
        <button
          type="button"
          className={styles.editButton}
          aria-label={dict.profile.editProfile}
          onClick={() => setEditModalOpen(true)}
        >
          <img src="/icon/profile/person-edit.svg" alt="" className={styles.editIcon} />
        </button>
      </div>

      <div className={styles.card}>
        {ACCOUNT_ROWS.map((row, index) => {
          const rowClassName = `${styles.row} ${row.onClick || row.href ? styles.rowButton : ""} ${
            index === ACCOUNT_ROWS.length - 1 ? styles.rowNoBorder : ""
          }`;
          const content = (
            <>
              <img
                src={row.icon}
                alt=""
                className={`${styles.rowIcon} ${row.iconClassName === "iconTilted" ? styles.rowIconTilted : ""}`}
              />
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{row.title}</p>
                <p className={styles.rowSubtitle}>{row.subtitle}</p>
              </div>
              <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
            </>
          );

          if (row.href) {
            return (
              <LocaleLink key={row.title} href={row.href} className={rowClassName}>
                {content}
              </LocaleLink>
            );
          }

          return row.onClick ? (
            <button key={row.title} type="button" className={rowClassName} onClick={row.onClick}>
              {content}
            </button>
          ) : (
            <div key={row.title} className={rowClassName}>
              {content}
            </div>
          );
        })}
      </div>

      <div className={styles.card}>
        {supportRows.map((row, index) => {
          const rowClassName = `${styles.row} ${styles.rowButton} ${
            index === supportRows.length - 1 ? styles.rowNoBorder : ""
          }`;
          const content = (
            <>
              <img src={row.icon} alt="" className={styles.rowIcon} />
              <div className={styles.rowText}>
                <p className={styles.rowTitleOnly}>{row.title}</p>
              </div>
              <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
            </>
          );

          if (row.href) {
            return (
              <LocaleLink key={row.title} href={row.href} className={rowClassName}>
                {content}
              </LocaleLink>
            );
          }

          return (
            <button key={row.title} type="button" className={rowClassName} onClick={row.onClick}>
              {content}
            </button>
          );
        })}
      </div>

      <div className={styles.card}>
        <button
          type="button"
          className={`${styles.row} ${styles.rowButton} ${styles.rowNoBorder}`}
          onClick={() => setDeleteModalOpen(true)}
        >
          <img src="/icon/cart/delete-red.svg" alt="" className={styles.rowIcon} />
          <div className={styles.rowText}>
            <p className={`${styles.rowTitleOnly} ${styles.rowTitleDanger}`}>{dict.profile.deleteAccount}</p>
          </div>
          <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
        </button>
      </div>

      <TicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
      <EditProfileModal
        open={editModalOpen}
        user={user}
        onClose={() => setEditModalOpen(false)}
        onUpdated={onProfileUpdated}
      />
      <LogoutConfirmModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          onLogout();
        }}
      />
    </>
  );
}
