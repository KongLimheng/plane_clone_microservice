import { set } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import {
  THomeDashboardResponse,
  TWidget,
  TWidgetFiltersFormData,
  TWidgetKeys,
  TWidgetStatsRequestParams,
  TWidgetStatsResponse,
} from "@plane/types";
import { DashboardService } from "@/services/dashboard.service";
import { CoreRootStore } from "./root.store";

export interface IDashboardStore {
  // error states
  widgetStatsError: { [workspaceSlug: string]: Record<string, Record<TWidgetKeys, any | null>> };
  // observables
  homeDashboardId: string | null;
  widgetDetails: { [workspaceSlug: string]: Record<string, TWidget[]> };
  // {
  //  workspaceSlug: {
  //    dashboardId: TWidget[]
  //   }
  // }
  widgetStats: { [workspaceSlug: string]: Record<string, Record<TWidgetKeys, TWidgetStatsResponse>> };
  //  {
  //    workspaceSlug: {
  //      dashboardId: {
  //        widgetKey: TWidgetStatsResponse;
  //        }
  //     }
  //  }
  // computed
  // homeDashboardWidgets: TWidget[] | undefined;
  // computed actions
  // getWidgetDetails: (workspaceSlug: string, dashboardId: string, widgetKey: TWidgetKeys) => TWidget | undefined;
  // getWidgetStats: <T>(workspaceSlug: string, dashboardId: string, widgetKey: TWidgetKeys) => T | undefined;
  // getWidgetStatsError: (workspaceSlug: string, dashboardId: string, widgetKey: TWidgetKeys) => any | null;
  // actions
  fetchHomeDashboardWidgets: (workspaceSlug: string) => Promise<THomeDashboardResponse>;
  // fetchWidgetStats: (
  //   workspaceSlug: string,
  //   dashboardId: string,
  //   params: TWidgetStatsRequestParams
  // ) => Promise<TWidgetStatsResponse>;
  // updateDashboardWidget: (
  //   workspaceSlug: string,
  //   dashboardId: string,
  //   widgetId: string,
  //   data: Partial<TWidget>
  // ) => Promise<any>;
  // updateDashboardWidgetFilters: (
  //   workspaceSlug: string,
  //   dashboardId: string,
  //   widgetId: string,
  //   data: TWidgetFiltersFormData
  // ) => Promise<any>;
}

export class DashboardStore implements IDashboardStore {
  // error states
  widgetStatsError: { [workspaceSlug: string]: Record<string, Record<TWidgetKeys, any>> } = {};
  // observables
  homeDashboardId: string | null = null;
  widgetDetails: { [workspaceSlug: string]: Record<string, TWidget[]> } = {};
  widgetStats: { [workspaceSlug: string]: Record<string, Record<TWidgetKeys, TWidgetStatsResponse>> } = {};
  // stores
  routerStore;
  // issueStore;
  // services
  dashboardService;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // error states
      widgetStatsError: observable,
      // observables
      homeDashboardId: observable.ref,
      widgetDetails: observable,
      //  widgetStats: observable,
      // computed
      //  homeDashboardWidgets: computed,
      // fetch actions
      fetchHomeDashboardWidgets: action,
      //  fetchWidgetStats: action,
      //  // update actions
      //  updateDashboardWidget: action,
      //  updateDashboardWidgetFilters: action,
    });

    // router store
    this.routerStore = _rootStore.router;
    // this.issueStore = _rootStore.issue.issues;
    // services
    this.dashboardService = new DashboardService();
  }

  /**
   * @description fetch home dashboard details and widgets
   * @param {string} workspaceSlug
   * @returns {Promise<THomeDashboardResponse>}
   */

  fetchHomeDashboardWidgets = async (workspaceSlug: string): Promise<THomeDashboardResponse> => {
    try {
      const res = await this.dashboardService.getHomeDashboardWidgets(workspaceSlug);

      runInAction(() => {
        this.homeDashboardId = res.dashboard.id;
        set(this.widgetDetails, [workspaceSlug, res.dashboard.id], res.widgets);
      });

      return res;
    } catch (error) {
      runInAction(() => {
        this.homeDashboardId = null;
      });
      throw error;
    }
  };
}
