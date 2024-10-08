import { Global } from "@emotion/react";
import { Decorator } from "@storybook/react";
import { globalStyles } from "../src/components/styles/GlobalStyles";
import { LogContextProvider } from "../src/context/LogContext";
import WithToastContext from "../src/test_utils/toast-decorator";
import { SectionsFeatureDiscoveryContextProvider } from "../src/context/SectionsFeatureDiscoveryContext";

export const decorators: Decorator[] = [
  (Story: () => JSX.Element) => (
    <>
      <Global styles={globalStyles} />
      <Story />
    </>
  ),
  (Story: () => JSX.Element) => (
    <LogContextProvider>
      <SectionsFeatureDiscoveryContextProvider>
        <Story />
      </SectionsFeatureDiscoveryContextProvider>
    </LogContextProvider>
  ),
  WithToastContext,
];
