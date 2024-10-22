import { action, computed, makeObservable, observable, runInAction, set } from "mobx";
import {
  IFormattedInstanceConfiguration,
  IInstance,
  IInstanceAdmin,
  IInstanceConfig,
  IInstanceConfiguration,
  IInstanceInfo,
} from "@plane/types";
import { EInstanceStatus, TInstanceStatus } from "@/helpers/instance.helper";
import { InstanceService } from "@/services/instance.service";
import { CoreRootStore } from "./root.store";

export interface IInstanceStore {
  isLoading: boolean;
  error: any;
  instanceStatus?: TInstanceStatus;
  instance?: IInstance;
  config?: IInstanceConfig;
  instanceAdmins?: IInstanceAdmin[];
  instanceConfigurations?: IInstanceConfiguration[];
  // computed
  formattedConfig?: IFormattedInstanceConfiguration;
  // action
  hydrate: (data: IInstanceInfo) => void;
  fetchInstanceInfo: () => Promise<IInstanceInfo>;
  updateInstanceInfo: (data: Partial<IInstance>) => Promise<IInstance | undefined>;
  fetchInstanceAdmins: () => Promise<IInstanceAdmin[] | undefined>;
  fetchInstanceConfigurations: () => Promise<IInstanceConfiguration[] | undefined>;
  updateInstanceConfigurations: (data: Partial<IFormattedInstanceConfiguration>) => Promise<IInstanceConfiguration[]>;
}

export class InstanceStore implements IInstanceStore {
  isLoading: boolean = true;

  error: any = undefined;
  instanceStatus: TInstanceStatus | undefined = undefined;
  instance: IInstance | undefined = undefined;
  config: IInstanceConfig | undefined = undefined;
  instanceAdmins: IInstanceAdmin[] | undefined = undefined;
  instanceConfigurations: IInstanceConfiguration[] | undefined = undefined;

  instanceService: InstanceService;

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observable
      isLoading: observable.ref,
      error: observable.ref,
      instanceStatus: observable,
      instance: observable,
      instanceAdmins: observable,
      instanceConfigurations: observable,
      // computed
      formattedConfig: computed,
      // actions
      hydrate: action,
      fetchInstanceInfo: action,
      fetchInstanceAdmins: action,
      updateInstanceInfo: action,
      fetchInstanceConfigurations: action,
      updateInstanceConfigurations: action,
    });

    this.instanceService = new InstanceService();
  }

  hydrate = (data: IInstanceInfo) => {
    if (data) {
      this.instance = data.instance;
      this.config = data.config;
    }
  };

  /**
   * computed value for instance configurations data for forms.
   * @returns configurations in the form of {key, value} pair.
   */
  get formattedConfig() {
    if (!this.instanceConfigurations) return undefined;

    return this.instanceConfigurations.reduce((formData: IFormattedInstanceConfiguration, config) => {
      formData[config.key] = config.value;
      return formData;
    }, {} as IFormattedInstanceConfiguration);
  }

  /**
   * @description fetching instance configuration
   * @returns {IInstance} instance
   */
  fetchInstanceInfo = async () => {
    try {
      if (this.instance === undefined) this.isLoading = true;
      this.error = undefined;
      const instanceInfo = await this.instanceService.getInstanceInfo();
      // handling the new user popup toggle
      if (this.instance === undefined && !instanceInfo?.instance?.workspaces_exist)
        this.store.theme.toggleNewUserPopup();
      runInAction(() => {
        console.log("instanceInfo: ", instanceInfo);
        this.isLoading = false;
        this.instance = instanceInfo.instance;
        this.config = instanceInfo.config;
      });
      return instanceInfo;
    } catch (error) {
      console.error("Error fetching the instance info");
      this.isLoading = false;
      this.error = { message: "Failed to fetch the instance info" };
      this.instanceStatus = {
        status: EInstanceStatus.ERROR,
      };
      throw error;
    }
  };

  /**
   * @description updating instance information
   * @param {Partial<IInstance>} data
   * @returns void
   */
  updateInstanceInfo = async (data: Partial<IInstance>) => {
    try {
      const instanceResponse = await this.instanceService.updateInstanceInfo(data);
      if (instanceResponse) {
        runInAction(() => {
          if (this.instance) set(this.instance, "instance", instanceResponse);
        });
      }
      return instanceResponse;
    } catch (error) {
      console.error("Error updating the instance info");
      throw error;
    }
  };

  /**
   * @description fetching instance admins
   * @return {IInstanceAdmin[]} instanceAdmins
   */
  fetchInstanceAdmins = async () => {
    try {
      const instanceAdmins = await this.instanceService.getInstanceAdmins();
      if (instanceAdmins) runInAction(() => (this.instanceAdmins = instanceAdmins));
      return instanceAdmins;
    } catch (error) {
      console.error("Error fetching the instance admins");
      throw error;
    }
  };

  /**
   * @description fetching instance configurations
   * @return {IInstanceAdmin[]} instanceConfigurations
   */
  fetchInstanceConfigurations = async () => {
    try {
      const instanceConfigurations = await this.instanceService.getInstanceConfigurations();
      if (instanceConfigurations) runInAction(() => (this.instanceConfigurations = instanceConfigurations));
      return instanceConfigurations;
    } catch (error) {
      console.error("Error fetching the instance configurations");
      throw error;
    }
  };

  /**
   * @description updating instance configurations
   * @param data
   */
  updateInstanceConfigurations = async (data: Partial<IFormattedInstanceConfiguration>) => {
    try {
      const response = await this.instanceService.updateInstanceConfigurations(data);
      runInAction(() => {
        this.instanceConfigurations = this.instanceConfigurations?.map((config) => {
          const item = response.find((item) => item.key === config.key);
          if (item) return item;
          return config;
        });
      });
      return response;
    } catch (error) {
      console.error("Error updating the instance configurations");
      throw error;
    }
  };
}
