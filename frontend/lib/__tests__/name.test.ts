import { describe, expect, test } from "vitest";
import { splitName } from "@/lib/name";

describe("splitName", () => {
  test("splits a two-word name into prenom/nom", () => {
    expect(splitName("Jean Dupont")).toEqual({ prenom: "Jean", nom: "Dupont" });
  });

  test("joins every word after the first back into nom for multi-word names", () => {
    expect(splitName("Jean Paul De La Croix")).toEqual({ prenom: "Jean", nom: "Paul De La Croix" });
  });

  test("a single-word name has no nom", () => {
    expect(splitName("Cher")).toEqual({ prenom: "Cher", nom: "" });
  });

  test("collapses stray whitespace between words", () => {
    expect(splitName("  Jean   Dupont  ")).toEqual({ prenom: "Jean", nom: "Dupont" });
  });
});
