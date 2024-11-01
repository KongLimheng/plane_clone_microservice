import { done, start } from "nprogress";
import { AppProgressBar as AppProgressBarComponent } from "./AppProgressBar";
import withSuspense from "./withSuspense";

export interface NProgressOptions {
  minimum?: number;
  template?: string;
  easing?: string;
  speed?: number;
  trickle?: boolean;
  trickleSpeed?: number;
  showSpinner?: boolean;
  parent?: string;
  positionUsing?: string;
  barSelector?: string;
  spinnerSelector?: string;
}

export interface ProgressBarProps {
  color?: string;
  height?: string;
  options?: Partial<NProgressOptions>;
  shallowRouting?: boolean;
  disableSameURL?: boolean;
  startPosition?: number;
  delay?: number;
  stopDelay?: number;
  style?: string;
  nonce?: string;
  memo?: boolean;
  shouldCompareComplexProps?: boolean;
  targetPreprocessor?: (url: URL) => URL;
  disableAnchorClick?: boolean;
}

export interface RouterNProgressOptions {
  showProgressBar?: boolean;
  startPosition?: number;
  disableSameURL?: boolean;
}

export const startProgress = () => {
  start();
};

export const stopProgress = (force?: boolean) => {
  done(force);
};

const AppProgressBar = withSuspense<ProgressBarProps>(AppProgressBarComponent);
export { AppProgressBar };
