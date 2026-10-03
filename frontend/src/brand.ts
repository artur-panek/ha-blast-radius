import { svg } from "lit";
import mark from "./brand.json";

export const brandMark = () => svg`
  <svg class="brand-mark" viewBox=${mark.viewBox} aria-hidden="true" focusable="false">
    <path fill="currentColor" d=${mark.rings}></path>
    <path class="radius" d=${mark.radius}></path>
  </svg>
`;
