import { set } from "lodash";
import { makeObservable, observable } from "mobx";
import { IUserAccount } from "@plane/types";
import { CoreRootStore } from "../root.store";

export interface IAccountStore {
  // observables
  isLoading: boolean;
  error: any | undefined;
  // model observables
  provider_account_id: string | undefined;
  provider: string | undefined;
}

export class AccountStore implements IAccountStore {
  isLoading: boolean = false;
  error: any | undefined = undefined;
  provider_account_id: string | undefined = undefined;
  provider: string | undefined = undefined;

  constructor(
    private store: CoreRootStore,
    private _account: IUserAccount
  ) {
    makeObservable(this, {
      isLoading: observable.ref,
      error: observable,
      provider_account_id: observable.ref,
      provider: observable.ref,
    });

    Object.entries(this._account).forEach(([key, value]) => {
      set(this, [key], value ?? undefined);
    });
  }
}
