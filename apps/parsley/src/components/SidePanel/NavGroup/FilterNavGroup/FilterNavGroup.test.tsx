import { logContextWrapper } from "context/LogContext/test_utils";
import { RenderFakeToastContext as InitializeFakeToastContext } from "context/toast/__mocks__";
import {
  renderWithRouterMatch as render,
  screen,
  userEvent,
  within,
} from "test_utils";
import FilterNavGroup from ".";

const wrapper = logContextWrapper();

describe("filters", () => {
  vi.setConfig({ testTimeout: 10000 });
  const user = userEvent.setup();
  beforeEach(() => {
    InitializeFakeToastContext();
  });

  it("shows a message when no filters have been applied", () => {
    render(<FilterNavGroup {...props} />, { wrapper });
    expect(screen.getByDataCy("filters-default-message")).toBeInTheDocument();
  });

  it("filters should properly display based on the URL", () => {
    render(<FilterNavGroup {...props} />, {
      route: "?filters=100filter1,100filter2",
      wrapper,
    });
    expect(screen.getByText("filter1")).toBeInTheDocument();
    expect(screen.getByText("filter2")).toBeInTheDocument();
  });

  it("shows the number of filters in the header", () => {
    render(<FilterNavGroup {...props} />, {
      route: "?filters=100one,100two,100three,100four",
      wrapper,
    });
    const navGroupHeader = screen.getByDataCy("filters-nav-group-header");
    expect(within(navGroupHeader).getByText("4")).toBeInTheDocument();
  });

  it("editing filters should modify the URL correctly", async () => {
    const { router } = render(<FilterNavGroup {...props} />, {
      route: "?filters=100filter1,100filter2",
      wrapper,
    });
    // Edit the first filter.
    await user.click(screen.getAllByLabelText("Edit filter")[0]);
    await user.clear(screen.getAllByDataCy("edit-filter-name")[0]);
    await user.type(screen.getAllByDataCy("edit-filter-name")[0], "newFilter");
    const confirmButton = screen.getByRole("button", {
      name: "Apply",
    });
    await user.click(confirmButton);

    expect(router.state.location.search).toBe(
      "?filters=100newFilter,100filter2",
    );
    expect(screen.queryByText("filter1")).not.toBeInTheDocument();
    expect(screen.getByText("newFilter")).toBeInTheDocument();
    expect(screen.getByText("filter2")).toBeInTheDocument();
  });

  it("trying to edit a filter to a filter that already exists should do nothing", async () => {
    const { router } = render(<FilterNavGroup {...props} />, {
      route: "?filters=100filter1,100filter2",
      wrapper,
    });
    // Edit the first filter.
    await user.click(screen.getAllByLabelText("Edit filter")[0]);
    await user.clear(screen.getAllByDataCy("edit-filter-name")[0]);
    await user.type(screen.getAllByDataCy("edit-filter-name")[0], "filter2");
    const confirmButton = screen.getByRole("button", {
      name: "Apply",
    });
    await user.click(confirmButton);

    expect(router.state.location.search).toBe("?filters=100filter1,100filter2");
    expect(screen.getByText("filter1")).toBeInTheDocument();
    expect(screen.getByText("filter2")).toBeInTheDocument();
  });

  it("pressing the cancel button after editing a filter should do nothing", async () => {
    const { router } = render(<FilterNavGroup {...props} />, {
      route: "?filters=100filter1,100filter2",
      wrapper,
    });
    // Edit the first filter.
    await user.click(screen.getAllByLabelText("Edit filter")[0]);
    await user.clear(screen.getAllByDataCy("edit-filter-name")[0]);
    await user.type(screen.getAllByDataCy("edit-filter-name")[0], "newFilter");
    const cancelButton = screen.getByRole("button", {
      name: "Cancel",
    });
    await user.click(cancelButton);

    expect(router.state.location.search).toBe("?filters=100filter1,100filter2");
    expect(screen.getByText("filter1")).toBeInTheDocument();
    expect(screen.getByText("filter2")).toBeInTheDocument();
  });

  it("deleting filters should modify the URL correctly", async () => {
    const { router } = render(<FilterNavGroup {...props} />, {
      route: "?filters=100filter1,100filter2",
      wrapper,
    });
    // Delete the first filter.
    await user.click(screen.getAllByLabelText("Delete filter")[0]);
    expect(router.state.location.search).toBe("?filters=100filter2");
    expect(screen.queryByText("filter1")).not.toBeInTheDocument();
    expect(screen.getByText("filter2")).toBeInTheDocument();
  });

  it("deleting a filter should call clearExpandedLines if there are no longer any filters applied", async () => {
    const clearExpandedLines = vi.fn();
    const { router } = render(
      <FilterNavGroup {...props} clearExpandedLines={clearExpandedLines} />,
      {
        route: "?filters=100filter1",
        wrapper,
      },
    );
    await user.click(screen.getAllByLabelText("Delete filter")[0]);
    expect(router.state.location.search).toBe("");
    expect(clearExpandedLines).toHaveBeenCalledTimes(1);
  });
});

const props = {
  clearExpandedLines: vi.fn(),
};
