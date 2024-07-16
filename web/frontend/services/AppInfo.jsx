import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { useAppBridge } from '@shopify/app-bridge-react';





export async function getSubStatus(){
    const fetch = useAuthenticatedFetch();
    const app = useAppBridge(); 
    try{
        const response = await fetch("/api/info", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
        const jsonResponse = await response.json();
        const status = jsonResponse?.data?.currentAppInstallation?.activeSubscriptions[0]?.status
        return status;
    }catch(err){
        console.error('getSubStatus error: ', error)
    }
}