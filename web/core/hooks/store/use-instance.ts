import { useContext } from "react"
import { StoreContext } from "@/lib/store-context"

export const useInstance = ()=>{
		const context = useContext(StoreContext)
		if (context === undefined) throw new Error("useInstance must be used within StoreProvider");
		return context.instance;
}