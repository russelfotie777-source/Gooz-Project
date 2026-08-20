"use client";

import { useState } from "react";
import CompletePhoneModal from "@/components/CompletePhoneModal/CompletePhoneModal";
import DeleteAccountModal from "@/components/DeleteAccountModal/DeleteAccountModal";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LogoutConfirmModal from "@/components/LogoutConfirmModal/LogoutConfirmModal";
import TicketModal from "@/components/TicketModal/TicketModal";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { useProfileSession } from "./useProfileSession";
import styles from "./ProfileDesktop.module.css";

// Desktop account dashboard — no Figma node for this one (mobile-only design,
// see ProfilePage); the user asked for an original desktop layout inspired
// by common e-commerce account pages (sidebar nav + overview cards). Reached
// by clicking the account icon in the desktop Header (see Header.tsx's
// accountButton, now a LocaleLink to "/compte"). Shares session/logout/
// language logic with the mobile ProfilePage via useProfileSession.
export default function ProfileDesktop() {
  const dict = useDictionary();
  const { user, handleLogout, toggleLanguage, updateUser } = useProfileSession();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const TILES = [
    {
      icon: "/icon/profile/edit-location-alt.svg",
      title: dict.profile.deliveryAddress,
      subtitle: dict.profile.deliveryAddressSubtitle,
      href: "/adresses",
    },
    {
      icon: "/icon/profile/credit-card.svg",
      tilted: true,
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
  ];

  const SUPPORT_ITEMS = [
    {
      icon: "/icon/profile/support-agent.svg",
      label: dict.profile.contactUs,
      onClick: () => setTicketModalOpen(true),
    },
    { icon: "/icon/profile/quiz.svg", label: dict.profile.helpNeeds, href: "/aide" },
    { icon: "/icon/profile/security.svg", label: dict.profile.privacyPolicy, href: "/politique-confidentialite" },
    { icon: "/icon/profile/verified.svg", label: dict.profile.termsOfUse, href: "/conditions-utilisation" },
  ];

  const BENEFITS = [
    {
      icon: "/icon/profile/delivery-truck-bolt.svg",
      title: dict.profile.benefitOrders,
      desc: dict.profile.benefitOrdersDesc,
    },
    {
      icon: "/icon/profile/edit-location-alt.svg",
      title: dict.profile.benefitAddresses,
      desc: dict.profile.benefitAddressesDesc,
    },
    {
      icon: "/icon/profile/credit-card.svg",
      title: dict.profile.benefitFastCheckout,
      desc: dict.profile.benefitFastCheckoutDesc,
    },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{dict.profile.title}</h1>
          <p className={styles.subtitle}>{dict.profile.desktopSubtitle}</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {user ? (
              <>
                <div className={styles.sidebarUser}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/profile/avatar-photo.png" alt="" className={styles.sidebarAvatar} />
                  <div>
                    <p className={styles.sidebarUserName}>{user.name}</p>
                    <p className={styles.sidebarUserPhone}>{user.phone}</p>
                  </div>
                </div>

                <nav className={styles.sidebarNav} aria-label={dict.profile.overview}>
                  <span className={`${styles.sidebarNavItem} ${styles.sidebarNavItemActive}`}>
                    <OverviewIcon className={styles.sidebarNavIcon} />
                    {dict.profile.overview}
                  </span>
                  {TILES.map((tile) =>
                    tile.href ? (
                      <LocaleLink key={tile.title} href={tile.href} className={styles.sidebarNavItem}>
                        <img
                          src={tile.icon}
                          alt=""
                          className={`${styles.sidebarNavIcon} ${tile.tilted ? styles.iconTilted : ""}`}
                        />
                        {tile.title}
                      </LocaleLink>
                    ) : (
                      <button key={tile.title} type="button" className={styles.sidebarNavItem}>
                        <img
                          src={tile.icon}
                          alt=""
                          className={`${styles.sidebarNavIcon} ${tile.tilted ? styles.iconTilted : ""}`}
                        />
                        {tile.title}
                      </button>
                    )
                  )}
                  <button type="button" className={styles.sidebarNavItem} onClick={toggleLanguage}>
                    <img src="/icon/profile/g-translate.svg" alt="" className={styles.sidebarNavIcon} />
                    {dict.profile.language} · {dict.profile.languageName}
                  </button>
                </nav>

                <button type="button" className={styles.logoutButton} onClick={() => setLogoutModalOpen(true)}>
                  <LogoutIcon className={styles.logoutIcon} />
                  {dict.profile.logout}
                </button>

                <button
                  type="button"
                  className={styles.deleteAccountButton}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <DeleteIcon className={styles.logoutIcon} />
                  {dict.profile.deleteAccount}
                </button>
              </>
            ) : (
              <div className={styles.sidebarGuest}>
                <img src="/icon/profile/avatar-placeholder.svg" alt="" className={styles.sidebarGuestAvatar} />
                <p className={styles.sidebarUserName}>{dict.profile.loggedOutName}</p>
                <p className={styles.sidebarUserPhone}>{dict.profile.notConnected}</p>

                <LocaleLink href="/connexion" className={styles.sidebarGuestLoginButton}>
                  {dict.header.login}
                </LocaleLink>
                <LocaleLink href="/inscription" className={styles.sidebarGuestSignupButton}>
                  {dict.header.signup}
                </LocaleLink>

                <button type="button" className={styles.sidebarNavItem} onClick={toggleLanguage}>
                  <img src="/icon/profile/g-translate.svg" alt="" className={styles.sidebarNavIcon} />
                  {dict.profile.language} · {dict.profile.languageName}
                </button>
              </div>
            )}
          </aside>

          <section className={styles.content}>
            {user ? (
              <>
                <div className={styles.overviewCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/profile/avatar-photo.png" alt="" className={styles.overviewAvatar} />
                  <div className={styles.overviewInfo}>
                    <p className={styles.overviewName}>{user.name}</p>
                    <p className={styles.overviewPhone}>{user.phone}</p>
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

                <div className={styles.tilesGrid}>
                  {TILES.map((tile) => {
                    const tileContent = (
                      <>
                        <span className={styles.tileIconWrapper}>
                          <img
                            src={tile.icon}
                            alt=""
                            className={`${styles.tileIcon} ${tile.tilted ? styles.iconTilted : ""}`}
                          />
                        </span>
                        <div className={styles.tileText}>
                          <p className={styles.tileTitle}>{tile.title}</p>
                          <p className={styles.tileSubtitle}>{tile.subtitle}</p>
                        </div>
                        <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.tileChevron} />
                      </>
                    );

                    return tile.href ? (
                      <LocaleLink key={tile.title} href={tile.href} className={styles.tile}>
                        {tileContent}
                      </LocaleLink>
                    ) : (
                      <button key={tile.title} type="button" className={styles.tile}>
                        {tileContent}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>{dict.profile.preferences}</h2>
                  <button type="button" className={styles.row} onClick={toggleLanguage}>
                    <img src="/icon/profile/g-translate.svg" alt="" className={styles.rowIcon} />
                    <div className={styles.rowText}>
                      <p className={styles.rowTitle}>{dict.profile.language}</p>
                      <p className={styles.rowSubtitle}>{dict.profile.languageName}</p>
                    </div>
                    <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
                  </button>
                </div>

                <div className={`${styles.sectionCard} ${styles.sectionCardNoPad}`}>
                  <h2 className={styles.sectionTitle}>{dict.profile.support}</h2>
                  {SUPPORT_ITEMS.map((item) => {
                    const itemContent = (
                      <>
                        <img src={item.icon} alt="" className={styles.rowIcon} />
                        <div className={styles.rowText}>
                          <p className={styles.rowTitle}>{item.label}</p>
                        </div>
                        <img src="/icon/profile/arrow-forward-ios.svg" alt="" className={styles.chevron} />
                      </>
                    );

                    return item.href ? (
                      <LocaleLink key={item.label} href={item.href} className={styles.row}>
                        {itemContent}
                      </LocaleLink>
                    ) : (
                      <button key={item.label} type="button" className={styles.row} onClick={item.onClick}>
                        {itemContent}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={styles.guestPanel}>
                <h2 className={styles.guestTitle}>{dict.profile.guestTitle}</h2>
                <p className={styles.guestSubtitle}>{dict.profile.guestSubtitle}</p>
                <div className={styles.guestActions}>
                  <LocaleLink href="/connexion" className={styles.guestLoginButton}>
                    {dict.header.login}
                  </LocaleLink>
                  <LocaleLink href="/inscription" className={styles.guestSignupButton}>
                    {dict.header.signup}
                  </LocaleLink>
                </div>

                <div className={styles.benefitsGrid}>
                  {BENEFITS.map((benefit) => (
                    <div key={benefit.title} className={styles.benefitCard}>
                      <span className={styles.benefitIconWrapper}>
                        <img src={benefit.icon} alt="" className={styles.benefitIcon} />
                      </span>
                      <p className={styles.benefitTitle}>{benefit.title}</p>
                      <p className={styles.benefitDesc}>{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <TicketModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
      {user && (
        <EditProfileModal
          open={editModalOpen}
          user={user}
          onClose={() => setEditModalOpen(false)}
          onUpdated={updateUser}
        />
      )}
      <LogoutConfirmModal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          handleLogout();
        }}
      />
      <CompletePhoneModal user={user} onUpdated={updateUser} />
    </div>
  );
}

function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" style={{ transform: "scaleX(-1)" }}>
      <path
        d="M8 2H4.5A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18H8M13 14l4-4-4-4M17 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M8.5 9v5M11.5 9v5M5.5 5.5l.7 10a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4l.7-10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
