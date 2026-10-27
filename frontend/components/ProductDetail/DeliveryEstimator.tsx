"use client";

import { useEffect, useState } from "react";
import { getCities, getDeliveryEstimate, getNeighborhoods } from "@/lib/api";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { formatPrice } from "@/lib/pricing";
import type { City, Neighborhood } from "@/lib/types";
import styles from "./ProductDetail.module.css";

// Purely informational — the fee shown here never flows into the cart/
// checkout total, it's just a preview so the shopper can gauge delivery
// cost before buying. Fully self-contained on purpose: nothing above it
// needs to know the shopper's city/neighborhood/pickup choice.
export default function DeliveryEstimator() {
  const dict = useDictionary();
  const [cities, setCities] = useState<City[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [locationListsStatus, setLocationListsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [pickup, setPickup] = useState(false);

  // Fetched once, up front: the neighborhoods list stays tiny (a handful per
  // city), so filtering client-side on city change avoids an extra network
  // round-trip every time the user picks a city.
  function loadLocationLists() {
    setLocationListsStatus("loading");
    Promise.all([getCities(), getNeighborhoods()])
      .then(([citiesData, neighborhoodsData]) => {
        setCities(citiesData);
        setAllNeighborhoods(neighborhoodsData);
        setLocationListsStatus("ready");
      })
      // An empty [] here used to be indistinguishable from "there really are
      // no cities" — the shopper saw an empty dropdown either way, with no
      // way to tell a real gap in the data from a failed fetch worth retrying.
      .catch(() => setLocationListsStatus("error"));
  }

  useEffect(loadLocationLists, []);

  useEffect(() => {
    setNeighborhoodId("");
    setDeliveryFee(null);
    setDeliveryStatus("idle");
  }, [cityId]);

  const neighborhoods = cityId ? allNeighborhoods.filter((n) => n.city_id === Number(cityId)) : [];

  useEffect(() => {
    if (!neighborhoodId) {
      setDeliveryFee(null);
      setDeliveryStatus("idle");
      return;
    }

    setDeliveryStatus("loading");
    getDeliveryEstimate(Number(neighborhoodId))
      .then((estimate) => {
        setDeliveryFee(estimate.delivery_fee);
        setDeliveryStatus("idle");
      })
      .catch(() => {
        setDeliveryFee(null);
        setDeliveryStatus("error");
      });
  }, [neighborhoodId]);

  return (
    <div className={styles.deliveryBox}>
      <p className={styles.deliveryPrompt}>
        <img src="/icon/product-detail/location.svg" alt="" className={styles.locationIcon} />
        {dict.product.deliveryPrompt}
      </p>

      {locationListsStatus === "error" && (
        <p className={styles.locationListsError}>
          {dict.product.locationListsError}{" "}
          <button type="button" className={styles.locationListsRetry} onClick={loadLocationLists}>
            {dict.product.locationListsRetry}
          </button>
        </p>
      )}

      <label className={styles.selectField}>
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className={styles.select}>
          <option value="">{dict.product.selectCity}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
      </label>

      <label className={styles.selectField}>
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          disabled={!cityId}
          className={styles.select}
        >
          <option value="">{dict.product.selectNeighborhood}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <img src="/icon/product-detail/chevron-down.svg" alt="" className={styles.selectChevron} />
      </label>

      <div className={styles.deliveryCost}>
        <span>{dict.product.cost}</span>
        <span className={styles.deliveryCostValue}>
          {pickup
            ? formatPrice(0)
            : deliveryStatus === "loading"
              ? dict.product.calculating
              : deliveryStatus === "error"
                ? dict.product.unavailable
                : deliveryFee !== null
                  ? formatPrice(deliveryFee)
                  : dict.product.calculatedAtDelivery}
        </span>
      </div>

      <div className={styles.orDivider}>
        <span className={styles.orLine} />
        <span>{dict.product.or}</span>
        <span className={styles.orLine} />
      </div>

      <button
        type="button"
        className={`${styles.pickupButton} ${pickup ? styles.pickupButtonActive : ""}`}
        onClick={() => setPickup((v) => !v)}
      >
        <span className={styles.pickupLabel}>{dict.product.pickupAtStore}</span>
      </button>
    </div>
  );
}
