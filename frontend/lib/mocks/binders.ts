import { Binder } from "../types/binder";

export const binders: Binder[] = [
  { id: 1, name: "Base Set", size: "3x3", spineColor: "oklch(0.60 0.18 20)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.55 0.20 25)", cards: Array(180).fill(null) },
  { id: 2, name: "Jungle", size: "2x2", spineColor: "oklch(0.50 0.15 150)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.45 0.12 150)", cards: Array(180).fill(null) },
  { id: 3, name: "Fossil", size: "4x3", spineColor: "oklch(0.55 0.15 250)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.50 0.12 250)", cards: Array(180).fill(null) },
  { id: 4, name: "Team Rocket", size: "4x4", spineColor: "oklch(0.40 0.05 30)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.35 0.05 30)", cards: Array(180).fill(null) },
  { id: 5, name: "S&V Base", size: "3x3", spineColor: "oklch(0.45 0.15 250)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.40 0.12 250)", cards: Array(180).fill(null) },
  { id: 6, name: "Sword & Shield", size: "3x3", spineColor: "#b71c1c", spineTextColor: "#ffffff", coverType: "color", coverValue: "#ef5350", cards: Array(180).fill(null) },
  { id: 7, name: "Sun & Moon", size: "3x3", spineColor: "#ff9800", spineTextColor: "#ffffff", coverType: "color", coverValue: "#ffb74d", cards: Array(180).fill(null) },
  { id: 8, name: "XY Series", size: "3x3", spineColor: "#1a237e", spineTextColor: "#ffffff", coverType: "color", coverValue: "#3f51b5", cards: Array(180).fill(null) },
  { id: 9, name: "Black & White", size: "3x3", spineColor: "#212121", spineTextColor: "#ffffff", coverType: "color", coverValue: "#424242", cards: Array(180).fill(null) },
  { id: 10, name: "Promos", size: "3x3", spineColor: "#4caf50", spineTextColor: "#ffffff", coverType: "color", coverValue: "#81c784", cards: Array(180).fill(null) },
];
